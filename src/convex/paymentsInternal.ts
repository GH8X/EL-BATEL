import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

/**
 * Payment bookkeeping lives here so `orders` stays free of provider details.
 *
 * The rule the whole store runs on: a numbered piece is only SOLD once it has
 * been paid for. Until then the serial is held against the order (status:
 * `reserved`) so two collectors can never be sold the same number, and an
 * abandoned checkout can put its number back into the drop.
 */

/** Commit every serial on an order to its owner. Safe to call twice. */
export async function commitOrderSerials(
  ctx: MutationCtx,
  orderId: Id<"orders">,
  now = Date.now(),
) {
  const items = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();

  let committed = 0;
  for (const item of items) {
    if (!item.serialId) continue;
    const serial = await ctx.db.get(item.serialId);
    if (!serial) continue;
    if (serial.status === "sold" && serial.orderId === orderId) continue;
    await ctx.db.patch(item.serialId, {
      status: "sold",
      orderId,
      soldAt: now,
      reservedAt: undefined,
    });
    committed += 1;
  }
  return committed;
}

/** Give an unpaid order's held numbers back to the drop. */
export async function releaseOrderSerials(ctx: MutationCtx, orderId: Id<"orders">) {
  const items = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();

  let released = 0;
  for (const item of items) {
    if (!item.serialId) continue;
    const serial = await ctx.db.get(item.serialId);
    if (!serial || serial.status === "sold" || serial.orderId !== orderId) continue;
    await ctx.db.patch(item.serialId, {
      status: "available",
      orderId: undefined,
      ownerLabel: undefined,
      reservedAt: undefined,
      soldAt: undefined,
    });
    released += 1;
  }
  return released;
}

async function summary(ctx: QueryCtx, orderId: Id<"orders">) {
  const order = await ctx.db.get(orderId);
  if (!order) return null;
  const items = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();

  return {
    orderId: order._id,
    orderNumber: order.orderNumber,
    email: order.email,
    fullName: order.fullName,
    phone: order.phone ?? null,
    address: order.address,
    city: order.city,
    country: order.country,
    postalCode: order.postalCode ?? null,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentProvider: order.paymentProvider ?? null,
    paymentRef: order.paymentRef ?? null,
    createdAt: order.createdAt,
    items: items.map((item) => ({
      productName: item.productName,
      collectionName: item.collectionName ?? null,
      size: item.size ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      image: item.image ?? null,
      serial: item.serial ?? null,
    })),
  };
}

/** Register the Stripe session on the order it belongs to. */
export const attachSession = internalMutation({
  args: { orderId: v.id("orders"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return { ok: false };
    // Never overwrite a settled payment.
    if (order.paymentStatus === "paid") return { ok: true };
    await ctx.db.patch(args.orderId, {
      paymentProvider: "stripe",
      paymentRef: args.sessionId,
      paymentStatus: "pending",
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

/** The single place an order becomes paid. Idempotent. */
export const markPaid = internalMutation({
  args: { orderId: v.id("orders"), paymentRef: v.optional(v.string()) },
  handler: async (
    ctx,
    args,
  ): Promise<{ ok: boolean; alreadyPaid: boolean; orderNumber: string | null; committed: number }> => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return { ok: false, alreadyPaid: false, orderNumber: null, committed: 0 };
    if (order.paymentStatus === "paid") {
      return { ok: true, alreadyPaid: true, orderNumber: order.orderNumber, committed: 0 };
    }

    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      status: order.status === "cancelled" ? order.status : "paid",
      paymentStatus: "paid",
      paymentProvider: order.paymentProvider ?? "stripe",
      paymentRef: args.paymentRef ?? order.paymentRef,
      updatedAt: now,
    });
    const committed = await commitOrderSerials(ctx, args.orderId, now);
    return { ok: true, alreadyPaid: false, orderNumber: order.orderNumber, committed };
  },
});

export const confirmation = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => await summary(ctx, args.orderId),
});

export const orderForNumber = internalQuery({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();
    if (!order) return null;
    return await summary(ctx, order._id);
  },
});
