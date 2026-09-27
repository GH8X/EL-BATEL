import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { makeOrderNumber, requireAdmin, resolveUser } from "./lib";
import { commitOrderSerials, releaseOrderSerials } from "./paymentsInternal";
import { PAYMENT_WINDOW_MS } from "./serials";

const lineItem = v.object({
  productId: v.id("products"),
  size: v.optional(v.string()),
  quantity: v.number(),
  serialId: v.optional(v.id("serial_numbers")),
});

/** Default shipping rules; the admin-editable values override these. */
const DEFAULT_SHIPPING = 900;
const DEFAULT_FREE_THRESHOLD = 20000;

export const checkout = mutation({
  args: {
    token: v.optional(v.string()),
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    postalCode: v.optional(v.string()),
    note: v.optional(v.string()),
    items: v.array(lineItem),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) throw new Error("Your cart is empty");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(args.email.trim())) {
      throw new Error("Enter a valid email address");
    }
    const settings = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();
    const shippingRate = settings?.shippingFlatRate ?? DEFAULT_SHIPPING;
    const freeThreshold = settings?.freeShippingThreshold ?? DEFAULT_FREE_THRESHOLD;
    const currency = settings?.currency ?? "EUR";
    const user = await resolveUser(ctx, args.token);

    const lines: {
      productId: (typeof args.items)[number]["productId"];
      productName: string;
      collectionName?: string;
      size?: string;
      quantity: number;
      unitPrice: number;
      image?: string;
      serialId?: (typeof args.items)[number]["serialId"];
      serial?: string;
    }[] = [];

    let subtotal = 0;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || product.status !== "active") {
        throw new Error("A product in your cart is no longer available");
      }
      const quantity = Math.max(1, Math.min(Math.round(item.quantity), 10));
      let collectionName: string | undefined;
      if (product.collectionId) {
        const collection = await ctx.db.get(product.collectionId);
        collectionName = collection?.name;
      }
      const image = (
        await ctx.db
          .query("product_images")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect()
      ).sort((a, b) => a.order - b.order)[0]?.url;

      let serial: string | undefined;
      let serialId = item.serialId;
      if (product.limited) {
        // Limited pieces must carry exactly one reserved serial.
        if (quantity !== 1) throw new Error("Limited pieces are one per order");
        const reserved = serialId ? await ctx.db.get(serialId) : null;
        if (!reserved || reserved.productId !== product._id || reserved.status === "sold") {
          throw new Error(`${product.name} — your reserved piece expired, please re-add it`);
        }
        // A number inside another shopper's live checkout window is off limits.
        const heldByLiveCheckout =
          Boolean(reserved.orderId) &&
          reserved.reservedAt !== undefined &&
          reserved.reservedAt > Date.now() - PAYMENT_WINDOW_MS;
        if (heldByLiveCheckout) {
          throw new Error(`${reserved.serial} is in another checkout right now — choose another number`);
        }
        serial = reserved.serial;
      } else {
        if (product.quantity < quantity) {
          throw new Error(`${product.name} is low on stock`);
        }
        serialId = undefined;
      }

      subtotal += product.price * quantity;
      lines.push({
        productId: product._id,
        productName: product.name,
        collectionName,
        size: item.size,
        quantity,
        unitPrice: product.price,
        image,
        serialId,
        serial,
      });
    }

    const shipping = subtotal >= freeThreshold ? 0 : shippingRate;
    const orderNumber = makeOrderNumber();
    const now = Date.now();

    // Customer record (keyed by email) — used for the admin customer view.
    const email = args.email.trim().toLowerCase();
    let customer = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (customer) {
      await ctx.db.patch(customer._id, {
        fullName: args.fullName,
        phone: args.phone,
        userId: user?._id,
        ordersCount: customer.ordersCount + 1,
        totalSpent: customer.totalSpent + subtotal + shipping,
      });
    } else {
      const customerId = await ctx.db.insert("customers", {
        email,
        fullName: args.fullName,
        phone: args.phone,
        userId: user?._id,
        ordersCount: 1,
        totalSpent: subtotal + shipping,
        createdAt: now,
      });
      customer = await ctx.db.get(customerId);
    }

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId: user?._id,
      customerId: customer?._id,
      email,
      fullName: args.fullName,
      phone: args.phone,
      address: args.address,
      city: args.city,
      country: args.country,
      postalCode: args.postalCode,
      note: args.note,
      subtotal,
      shipping,
      total: subtotal + shipping,
      currency,
      status: "pending",
      paymentStatus: "unpaid",
      paymentProvider: undefined,
      paymentRef: undefined,
      createdAt: now,
      updatedAt: now,
    });

    for (const line of lines) {
      await ctx.db.insert("order_items", {
        orderId,
        productId: line.productId,
        productName: line.productName,
        collectionName: line.collectionName,
        size: line.size,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        image: line.image,
        serialId: line.serialId,
        serial: line.serial,
      });

      if (line.serialId) {
        // Held against this order from now on: nobody else can buy it, but it is
        // only marked SOLD once the payment settles (see paymentsInternal).
        await ctx.db.patch(line.serialId, {
          status: "reserved",
          orderId,
          ownerLabel: `${args.fullName} · ${email}`,
          reservedAt: now,
          soldAt: undefined,
        });
      } else {
        const product = await ctx.db.get(line.productId);
        if (product) {
          await ctx.db.patch(product._id, {
            quantity: Math.max(0, product.quantity - line.quantity),
            updatedAt: now,
          });
        }
      }
    }

    return {
      orderId,
      orderNumber,
      email,
      subtotal,
      shipping,
      total: subtotal + shipping,
      currency,
      // Shape the payment provider needs to build invoice line items.
      lines: lines.map((line) => ({
        name: line.productName,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        serial: line.serial ?? null,
      })),
    };
  },
});

/**
 * Called when a buyer returns from a payment page without paying: the order is
 * cancelled and its held numbers go back into the drop. Requires both the
 * order number and the email it was placed with.
 */
export const releaseUnpaid = mutation({
  args: { orderNumber: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_number", (q) => q.eq("orderNumber", args.orderNumber.trim()))
      .first();
    if (!order) return { ok: false, reason: "not-found" as const };
    if (order.email !== args.email.trim().toLowerCase()) return { ok: false, reason: "not-found" as const };
    if (order.paymentStatus === "paid") return { ok: false, reason: "paid" as const };
    if (order.status !== "pending") return { ok: true, reason: "settled" as const };

    const released = await releaseOrderSerials(ctx, order._id);
    await ctx.db.patch(order._id, { status: "cancelled", updatedAt: Date.now() });
    return { ok: true, reason: "released" as const, released };
  },
});

export const byNumber = query({
  args: { orderNumber: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();
    if (!order) return null;
    if (order.email !== args.email.trim().toLowerCase()) return null;
    return await hydrate(ctx, order);
  },
});

async function hydrate(ctx: QueryCtx, order: Doc<"orders">) {
  const items = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q) => q.eq("orderId", order._id))
    .collect();
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    email: order.email,
    fullName: order.fullName,
    phone: order.phone ?? null,
    address: order.address,
    city: order.city,
    country: order.country,
    postalCode: order.postalCode ?? null,
    note: order.note ?? null,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: items.map((i) => ({
      id: i._id,
      productName: i.productName,
      collectionName: i.collectionName ?? null,
      size: i.size ?? null,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      image: i.image ?? null,
      serial: i.serial ?? null,
    })),
  };
}

export const mine = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await resolveUser(ctx, args.token);
    if (!user) return [];
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    orders.sort((a, b) => b.createdAt - a.createdAt);
    return await Promise.all(orders.map((o) => hydrate(ctx, o)));
  },
});

/* ------------------------------------------------------------------ admin */

export const adminList = query({
  args: {
    token: v.string(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    let orders = await ctx.db.query("orders").collect();
    if (args.status) orders = orders.filter((o) => o.status === args.status);
    if (args.search) {
      const needle = args.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(needle) ||
          o.email.toLowerCase().includes(needle) ||
          o.fullName.toLowerCase().includes(needle),
      );
    }
    orders.sort((a, b) => b.createdAt - a.createdAt);
    const slice = orders.slice(0, args.limit ?? 60);
    return await Promise.all(slice.map((o) => hydrate(ctx, o)));
  },
});

export const setStatus = mutation({
  args: {
    token: v.string(),
    orderId: v.id("orders"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    paymentStatus: v.optional(
      v.union(v.literal("unpaid"), v.literal("pending"), v.literal("paid"), v.literal("refunded")),
    ),
    paymentProvider: v.optional(v.string()),
    paymentRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status) patch.status = args.status;
    if (args.paymentStatus) patch.paymentStatus = args.paymentStatus;
    if (args.paymentProvider !== undefined) patch.paymentProvider = args.paymentProvider;
    if (args.paymentRef !== undefined) patch.paymentRef = args.paymentRef;
    await ctx.db.patch(args.orderId, patch);

    // Cancelling an order returns its serial numbers to the drop.
    if (args.status === "cancelled") {
      await releaseOrderSerials(ctx, args.orderId);
    }

    // Marking an order paid by hand commits its numbers to the owner.
    if (args.paymentStatus === "paid" && args.status !== "cancelled") {
      await commitOrderSerials(ctx, args.orderId);
      if (order.status !== "paid") {
        await ctx.db.patch(args.orderId, { status: "paid", updatedAt: Date.now() });
      }
    }
    return { ok: true };
  },
});

export const adminStats = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const orders = await ctx.db.query("orders").collect();
    const products = await ctx.db.query("products").collect();
    const editions = await ctx.db.query("editions").collect();
    const serials = await ctx.db.query("serial_numbers").collect();

    const paidOrders = orders.filter((o) => o.status !== "cancelled");
    const revenueOrders = paidOrders.filter(
      (o) =>
        o.paymentStatus === "paid" ||
        ["paid", "processing", "shipped", "completed"].includes(o.status),
    );
    const revenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);

    return {
      totalOrders: orders.length,
      openOrders: orders.filter((o) => ["pending", "paid", "processing"].includes(o.status)).length,
      revenue,
      products: products.length,
      activeProducts: products.filter((p) => p.status === "active").length,
      availablePieces: serials.filter((s) => s.status === "available").length,
      reservedPieces: serials.filter((s) => s.status === "reserved").length,
      soldPieces: serials.filter((s) => s.status === "sold").length,
      limitedEditions: editions.length,
      currencies: Array.from(new Set(paidOrders.map((o) => o.currency))),
      recent: paidOrders
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6)
        .map((o) => ({
          id: o._id,
          orderNumber: o.orderNumber,
          fullName: o.fullName,
          email: o.email,
          total: o.total,
          currency: o.currency,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
          itemCount: 0,
        })),
    };
  },
});
