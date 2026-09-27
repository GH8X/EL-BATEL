import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

/** A hold on a serial while a piece sits in someone's cart. */
export const RESERVATION_TTL_MS = 1000 * 60 * 45;

/**
 * How long a checkout may hold a number while the buyer pays. Past this the
 * hold is considered abandoned and the number goes back into the drop.
 */
export const PAYMENT_WINDOW_MS = 1000 * 60 * 30;

export async function releaseStaleReservations(
  ctx: MutationCtx,
  productId: Id<"products">,
) {
  const rows = await ctx.db
    .query("serial_numbers")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  const now = Date.now();
  const cartCutoff = now - RESERVATION_TTL_MS;
  const paymentCutoff = now - PAYMENT_WINDOW_MS;

  for (const row of rows) {
    if (row.status !== "reserved" || !row.reservedAt) continue;

    // Held by an order awaiting payment: only release once that window closes,
    // so a shopper standing on the payment page never loses their number.
    if (row.orderId) {
      if (row.reservedAt < paymentCutoff) {
        await ctx.db.patch(row._id, {
          status: "available",
          reservedAt: undefined,
          orderId: undefined,
          ownerLabel: undefined,
        });
      }
      continue;
    }

    if (row.reservedAt < cartCutoff) {
      await ctx.db.patch(row._id, { status: "available", reservedAt: undefined });
    }
  }
}

/**
 * Reserve the lowest available serial for a product. Called when a limited
 * piece enters a cart, so two shoppers can never hold the same number.
 */
export const reserveForCart = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (!product.limited) return { serialId: null, serial: null };

    await releaseStaleReservations(ctx, args.productId);

    const rows = await ctx.db
      .query("serial_numbers")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    const available = rows
      .filter((r) => r.status === "available")
      .sort((a, b) => a.serial.localeCompare(b.serial));
    const next = available[0];
    if (!next) throw new Error("This edition is sold out");

    await ctx.db.patch(next._id, { status: "reserved", reservedAt: Date.now() });
    return { serialId: next._id, serial: next.serial };
  },
});

/** Reserve one specific number, chosen by the collector on the product page. */
export const reserveSerial = mutation({
  args: { serialId: v.id("serial_numbers") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.serialId);
    if (!row) throw new Error("Serial not found");
    await releaseStaleReservations(ctx, row.productId);
    const fresh = await ctx.db.get(args.serialId);
    if (!fresh || fresh.status !== "available") {
      throw new Error(`${row.serial} has just been taken — choose another number`);
    }
    await ctx.db.patch(args.serialId, { status: "reserved", reservedAt: Date.now() });
    return { serialId: fresh._id, serial: fresh.serial };
  },
});

/** Give a serial back when it is removed from the cart. */
export const release = mutation({
  args: { serialId: v.id("serial_numbers") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.serialId);
    if (!row) return { ok: true };
    if (row.status !== "reserved") return { ok: true };
    await ctx.db.patch(args.serialId, { status: "available", reservedAt: undefined });
    return { ok: true };
  },
});

/** Live availability for a product page (drives the "pieces left" meter). */
export const availability = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("serial_numbers")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    rows.sort((a, b) => a.serial.localeCompare(b.serial));
    return {
      total: rows.length,
      available: rows.filter((r) => r.status === "available").length,
      reserved: rows.filter((r) => r.status === "reserved").length,
      sold: rows.filter((r) => r.status === "sold").length,
      nextSerial: rows.find((r) => r.status === "available")?.serial ?? null,
      serials: rows.map((r) => ({ id: r._id, serial: r.serial, status: r.status })),
    };
  },
});

/* ------------------------------------------------------------------ admin */

export const adminListSerials = query({
  args: {
    token: v.string(),
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("available"), v.literal("reserved"), v.literal("sold"))),
    productId: v.optional(v.id("products")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    let rows = await ctx.db.query("serial_numbers").collect();
    if (args.productId) rows = rows.filter((r) => r.productId === args.productId);
    if (args.status) rows = rows.filter((r) => r.status === args.status);
    if (args.search) {
      const needle = args.search.trim().toUpperCase();
      rows = rows.filter((r) => r.serial.toUpperCase().includes(needle));
    }
    rows.sort((a, b) => a.serial.localeCompare(b.serial));
    const limited = args.limit ?? 200;
    const slice = rows.slice(0, limited);

    const products = new Map<string, string>();
    const editions = new Map<string, string>();
    const orders = new Map<string, string>();
    const entries = await Promise.all(
      slice.map(async (row) => {
        if (!products.has(row.productId)) {
          const product = await ctx.db.get(row.productId);
          products.set(row.productId, product?.name ?? "—");
        }
        if (row.editionId && !editions.has(row.editionId)) {
          const edition = await ctx.db.get(row.editionId);
          editions.set(row.editionId, edition?.name ?? "—");
        }
        if (row.orderId && !orders.has(row.orderId)) {
          const order = await ctx.db.get(row.orderId);
          orders.set(row.orderId, order?.orderNumber ?? "—");
        }
        return {
          id: row._id,
          serial: row.serial,
          status: row.status,
          productId: row.productId,
          productName: products.get(row.productId) ?? "—",
          editionName: row.editionId ? (editions.get(row.editionId) ?? "—") : "—",
          orderNumber: row.orderId ? (orders.get(row.orderId) ?? "—") : null,
          orderId: row.orderId ?? null,
          ownerLabel: row.ownerLabel ?? null,
          createdAt: row.createdAt,
          reservedAt: row.reservedAt ?? null,
          soldAt: row.soldAt ?? null,
        };
      }),
    );
    return { rows: entries, total: rows.length };
  },
});

export const updateSerial = mutation({
  args: {
    token: v.string(),
    serialId: v.id("serial_numbers"),
    serial: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("available"), v.literal("reserved"), v.literal("sold")),
    ),
    ownerLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const row = await ctx.db.get(args.serialId);
    if (!row) throw new Error("Serial not found");

    if (args.serial) {
      const next = args.serial.trim().toUpperCase();
      if (!/^[A-Z0-9-]{3,24}$/.test(next)) {
        throw new Error("Serial must be 3-24 characters (letters, numbers, dashes)");
      }
      const clash = await ctx.db
        .query("serial_numbers")
        .withIndex("by_serial", (q) => q.eq("serial", next))
        .first();
      if (clash && clash._id !== args.serialId) {
        throw new Error(`Serial ${next} already exists — serials must be unique`);
      }
      await ctx.db.patch(args.serialId, { serial: next });
    }
    if (args.status) {
      const patch: Record<string, unknown> = { status: args.status };
      if (args.status === "sold") {
        patch.soldAt = Date.now();
        patch.reservedAt = undefined;
      } else if (args.status === "reserved") {
        patch.reservedAt = Date.now();
        patch.soldAt = undefined;
      } else {
        patch.reservedAt = undefined;
        patch.soldAt = undefined;
        patch.orderId = undefined;
        patch.ownerLabel = undefined;
      }
      await ctx.db.patch(args.serialId, patch);
    }
    if (args.ownerLabel !== undefined) {
      await ctx.db.patch(args.serialId, { ownerLabel: args.ownerLabel });
    }
    return { ok: true };
  },
});

export const deleteSerial = mutation({
  args: { token: v.string(), serialId: v.id("serial_numbers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const row = await ctx.db.get(args.serialId);
    if (!row) return { ok: true };
    if (row.status === "sold") throw new Error("Cannot delete a sold serial");
    await ctx.db.delete(args.serialId);
    return { ok: true };
  },
});

/**
 * Generate serials for a product edition. Skips anything that already exists
 * so the operation is safe to re-run and can never create duplicates.
 */
export const generateSerials = mutation({
  args: {
    token: v.string(),
    productId: v.id("products"),
    editionName: v.optional(v.string()),
    prefix: v.string(),
    start: v.number(),
    total: v.number(),
    padding: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    const prefix = args.prefix.trim().toUpperCase() || "ELB";
    const padding = args.padding ?? 4;
    const total = Math.min(Math.max(Math.round(args.total), 1), 5000);
    const start = Math.max(Math.round(args.start), 1);

    let edition = await ctx.db
      .query("editions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .first();
    if (!edition) {
      const editionId = await ctx.db.insert("editions", {
        productId: args.productId,
        name: args.editionName?.trim() || `${product.name} — LIMITED EDITION`,
        total,
        prefix,
        serialStart: start,
        padding,
        createdAt: Date.now(),
      });
      edition = await ctx.db.get(editionId);
    } else {
      await ctx.db.patch(edition._id, {
        total: Math.max(edition.total, total),
        prefix,
        serialStart: start,
        padding,
        name: args.editionName?.trim() || edition.name,
      });
      edition = await ctx.db.get(edition._id);
    }
    if (!edition) throw new Error("Could not create edition");

    let created = 0;
    const skipped: string[] = [];
    for (let i = 0; i < total; i += 1) {
      const serial = `${prefix}-${String(start + i).padStart(padding, "0")}`;
      const existing = await ctx.db
        .query("serial_numbers")
        .withIndex("by_serial", (q) => q.eq("serial", serial))
        .first();
      if (existing) {
        skipped.push(serial);
        continue;
      }
      await ctx.db.insert("serial_numbers", {
        serial,
        productId: args.productId,
        editionId: edition._id,
        status: "available",
        createdAt: Date.now(),
      });
      created += 1;
    }
    await ctx.db.patch(args.productId, {
      limited: true,
      updatedAt: Date.now(),
    });
    return { created, skipped: skipped.length, editionId: edition._id, total: edition.total };
  },
});
