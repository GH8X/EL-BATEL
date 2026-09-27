"use node";

import Stripe from "stripe";
import { action } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Stripe hosted checkout.
 *
 * Flow: the storefront creates the order first (our mutation is the only thing
 * allowed to price the cart, validate serial holds and commit inventory), then
 * this action opens a Stripe Checkout Session for that exact total. The buyer
 * pays on Stripe's page and comes back to /checkout/success, where the session
 * is verified against the Stripe API before the order is marked paid.
 */

const lineItem = v.object({
  productId: v.id("products"),
  size: v.optional(v.string()),
  quantity: v.number(),
  serialId: v.optional(v.id("serial_numbers")),
});

/**
 * Explicit shapes for the cross-function calls below. Convex infers handler
 * types through the generated `api`, so declaring them here keeps the action
 * from depending on its own inferred type.
 */
type InvoiceLine = { name: string; unitPrice: number; quantity: number; serial: string | null };

type PlacedOrder = {
  orderId: Id<"orders">;
  orderNumber: string;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  lines: InvoiceLine[];
};

type OrderSummary = {
  orderNumber: string;
  email: string;
  fullName: string;
  address: string;
  city: string;
  country: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentProvider: string | null;
  paymentRef: string | null;
  createdAt: number;
  items: {
    productName: string;
    size: string | null;
    quantity: number;
    unitPrice: number;
    serial: string | null;
  }[];
};

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Card payments are not configured yet — add STRIPE_SECRET_KEY in Settings → Environment.",
    );
  }
  return new Stripe(key);
}

/** Lets the storefront know whether to offer card payment or the invoice path. */
export const status = action({
  args: {},
  handler: async (): Promise<{ configured: boolean }> => ({
    configured: Boolean(process.env.STRIPE_SECRET_KEY),
  }),
});

export const startCheckout = action({
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
    /** Where to send the buyer back to, e.g. https://elbatel.com */
    origin: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ url: string; orderId: Id<"orders">; orderNumber: string; sessionId: string }> => {
    const stripe = stripeClient();
    const { origin, ...orderArgs } = args;

    // 1. The order is created and inventory is committed on the server first —
    //    Stripe is never told a price the store has not agreed to.
    const order = (await ctx.runMutation(api.orders.checkout, orderArgs)) as PlacedOrder;

    const base = origin.replace(/\/+$/, "");
    const currency = order.currency.toLowerCase();

    // 2. One hosted Checkout Session for the order total.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      client_reference_id: order.orderNumber,
      metadata: { orderId: order.orderId, orderNumber: order.orderNumber },
      line_items: order.lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency,
          unit_amount: line.unitPrice,
          product_data: {
            name: line.name,
            ...(line.serial ? { description: `Serial ${line.serial}` } : {}),
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: order.shipping, currency },
            display_name: order.shipping === 0 ? "Studio shipping — free" : "Tracked worldwide shipping",
          },
        },
      ],
      success_url: `${base}/checkout/success?order=${encodeURIComponent(order.orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout?cancelled=1&order=${encodeURIComponent(order.orderNumber)}`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");

    // 3. Record the session against the order so it can be reconciled later.
    await ctx.runMutation(internal.paymentsInternal.attachSession, {
      orderId: order.orderId,
      sessionId: session.id,
    });

    return {
      url: session.url,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      sessionId: session.id,
    };
  },
});

/**
 * Verify a returned Checkout Session against Stripe and settle the order.
 * Safe to call repeatedly: an already-paid order is returned untouched.
 */
export const confirmCheckout = action({
  args: { sessionId: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ paid: boolean; order: OrderSummary | null }> => {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(args.sessionId);

    const orderId = session.metadata?.orderId;
    if (!orderId) throw new Error("This payment session is not linked to an EL BATEL order");

    const settled = session.payment_status === "paid" || session.payment_status === "no_payment_required";

    if (settled) {
      const intent =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      await ctx.runMutation(internal.paymentsInternal.markPaid, {
        orderId: orderId as Id<"orders">,
        paymentRef: intent ?? args.sessionId,
      });
    }

    const order = (await ctx.runQuery(internal.paymentsInternal.confirmation, {
      orderId: orderId as Id<"orders">,
    })) as OrderSummary | null;

    return { paid: settled, order };
  },
});
