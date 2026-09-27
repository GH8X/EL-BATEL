import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlertTriangle, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SerialPlate } from "@/components/site/SerialPlate";
import { Reveal } from "@/components/site/motion";
import { ProductImage } from "@/components/art/ProductImage";
import { useCart } from "@/providers/CartProvider";
import { formatPrice } from "@/lib/format";
import { clearPendingOrder } from "@/lib/pendingOrder";

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
    image: string | null;
    serial: string | null;
  }[];
};

type State =
  | { kind: "verifying" }
  | { kind: "paid"; order: OrderSummary }
  | { kind: "unpaid"; order: OrderSummary | null }
  | { kind: "error"; message: string };

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const confirmCheckout = useAction(api.payments.confirmCheckout);
  const { clear } = useCart();
  const [state, setState] = useState<State>({ kind: "verifying" });
  const started = useRef(false);

  const sessionId = params.get("session_id");
  const orderNumber = params.get("order");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!sessionId) {
      setState({
        kind: "error",
        message:
          "This confirmation link is missing its Stripe session. Open your account to see the order.",
      });
      return;
    }

    void confirmCheckout({ sessionId })
      .then((result) => {
        if (result.paid && result.order) {
          // The bag is only emptied once the payment is confirmed.
          clear();
          clearPendingOrder();
          window.scrollTo({ top: 0 });
          setState({ kind: "paid", order: result.order as OrderSummary });
          return;
        }
        setState({ kind: "unpaid", order: (result.order as OrderSummary) ?? null });
      })
      .catch((error: unknown) => {
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Could not verify the payment",
        });
      });
  }, [confirmCheckout, sessionId, clear]);

  if (state.kind === "verifying") {
    return (
      <div className="pt-[68px]">
        <section className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-red-batel" />
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            CONFIRMING PAYMENT WITH STRIPE
          </p>
          <p className="mt-3 font-display text-[28px] uppercase tracking-wide text-white/80 sm:text-[40px]">
            {orderNumber ?? "HOLD TIGHT"}
          </p>
        </section>
      </div>
    );
  }

  if (state.kind === "error" || state.kind === "unpaid") {
    const order = state.kind === "unpaid" ? state.order : null;
    return (
      <div className="pt-[68px]">
        <section className="border-b border-white/10 bg-black py-16 sm:py-24">
          <div className="container max-w-3xl">
            <Reveal>
              <span className="flex h-12 w-12 items-center justify-center border border-white/20 text-white/60">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <p className="eyebrow mt-7">PAYMENT NOT COMPLETED</p>
              <h1 className="mt-5 font-display text-[44px] leading-[0.86] tracking-tight text-white sm:text-[72px]">
                THE NUMBER IS STILL FREE
              </h1>
              <p className="mt-6 text-[14px] leading-relaxed text-white/55">
                {state.kind === "error"
                  ? state.message
                  : `Order ${order?.orderNumber ?? orderNumber ?? ""} has not been paid, so no serial was committed. Your bag is untouched — you can pay again from the checkout.`}
              </p>
            </Reveal>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/checkout">BACK TO CHECKOUT</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/limited-drops">SEE THE DROP</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { order } = state;
  const serials = order.items.filter((item) => item.serial);

  return (
    <div className="pt-[68px]">
      <section className="relative overflow-hidden border-b border-white/10 bg-black py-16 sm:py-24">
        <div className="pointer-events-none absolute -right-24 top-0 h-[380px] w-[380px] rounded-full bg-red-batel/10 blur-[130px]" />
        <div className="container relative">
          <Reveal>
            <span className="flex h-12 w-12 items-center justify-center border border-red-batel text-red-batel">
              <Check className="h-5 w-5" />
            </span>
            <p className="eyebrow mt-7">PAYMENT RECEIVED · ORDER {order.orderNumber}</p>
            <h1 className="mt-5 font-display text-[48px] leading-[0.84] tracking-tight text-white sm:text-[104px]">
              YOUR NUMBER
              <br />
              IS YOURS
            </h1>
            <p className="mt-7 max-w-xl text-[14px] leading-relaxed text-white/55">
              {formatPrice(order.total, order.currency)} paid. Every numbered piece in this order is
              now registered to {order.email} and will never be cut again.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="eyebrow">REGISTERED SERIALS</span>
            </Reveal>
            {serials.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {serials.map((item, index) => (
                  <SerialPlate
                    key={item.serial}
                    serial={item.serial}
                    status="sold"
                    label={item.productName}
                    delay={0.1 + index * 0.08}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 border border-white/12 p-6 text-[13px] leading-relaxed text-white/50">
                This order carries no numbered piece — the studio ships it from open stock. Numbered
                editions live in the LIMITED collection.
              </p>
            )}

            <div className="mt-10">
              <span className="eyebrow">YOUR ORDER</span>
              <div className="mt-6 border border-white/12">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productName}-${index}`}
                    className="flex gap-4 border-b border-white/[0.07] px-5 py-4 last:border-b-0"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                      <ProductImage src={item.image} alt={item.productName} serial={item.serial} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[14px] uppercase tracking-wide text-white">
                        {item.productName}
                      </p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                        {item.size ? `SIZE ${item.size}` : "ONE SIZE"} · QTY {item.quantity}
                      </p>
                      {item.serial ? (
                        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-red-batel">
                          {item.serial}
                        </p>
                      ) : null}
                    </div>
                    <span className="font-mono text-[11px] text-white/80">
                      {formatPrice(item.unitPrice * item.quantity, order.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-[110px] lg:self-start">
            <div className="border border-white/12 p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                ORDER RECORD
              </p>
              <dl className="mt-6 space-y-4">
                {[
                  { label: "ORDER", value: order.orderNumber },
                  { label: "STATUS", value: order.status.toUpperCase() },
                  { label: "PAYMENT", value: order.paymentStatus.toUpperCase() },
                  { label: "PROVIDER", value: order.paymentProvider?.toUpperCase() ?? "—" },
                  { label: "PAYMENT REF", value: order.paymentRef ?? "—" },
                  { label: "EMAIL", value: order.email },
                  { label: "SHIPS TO", value: `${order.city}, ${order.country}` },
                  {
                    label: "PLACED",
                    value: new Date(order.createdAt).toUTCString().slice(0, 16).toUpperCase(),
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                      {row.label}
                    </dt>
                    <dd className="truncate text-right font-mono text-[11px] text-white/80">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    SUBTOTAL
                  </span>
                  <span className="font-mono text-[12px] text-white">
                    {formatPrice(order.subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    SHIPPING
                  </span>
                  <span className="font-mono text-[12px] text-white">
                    {order.shipping === 0 ? "FREE" : formatPrice(order.shipping, order.currency)}
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-white/10 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white">
                    PAID
                  </span>
                  <span className="font-display text-[26px] leading-none text-white">
                    {formatPrice(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/account">
                  VIEW MY ORDERS <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/shop">BACK TO THE ARCHIVE</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
