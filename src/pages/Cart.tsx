import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/art/ProductImage";
import { Reveal } from "@/components/site/motion";
import { useCart } from "@/providers/CartProvider";
import { formatPrice } from "@/lib/format";

export default function Cart() {
  const {
    items,
    remove,
    setQuantity,
    subtotal,
    shipping,
    total,
    currency,
    freeShippingThreshold,
  } = useCart();

  const remaining = freeShippingThreshold - subtotal;

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container py-14 sm:py-20">
          <Reveal>
            <span className="eyebrow">YOUR BAG</span>
            <h1 className="mt-5 font-display text-[52px] leading-[0.84] tracking-mega text-white sm:text-[112px]">
              THE BAG
            </h1>
          </Reveal>
        </div>
      </header>

      <section className="py-12 sm:py-16">
        <div className="container">
          {items.length === 0 ? (
            <div className="border border-white/10 px-6 py-24 text-center">
              <p className="font-display text-[32px] uppercase tracking-wide text-white sm:text-[44px]">
                Nothing held yet
              </p>
              <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-white/45">
                Numbered pieces are held for 45 minutes once they are in your bag. The lowest serial
                in an edition always goes first.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link to="/shop">SHOP THE DROP</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/limited-drops">LIMITED DROPS</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
              <div>
                <div className="hidden border-b border-white/10 pb-3 sm:grid sm:grid-cols-[110px_1fr_auto_auto] sm:gap-6">
                  {["PIECE", "DETAILS", "QUANTITY", "TOTAL"].map((heading) => (
                    <span
                      key={heading}
                      className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 last:text-right"
                    >
                      {heading}
                    </span>
                  ))}
                </div>

                {items.map((item) => (
                  <div
                    key={item.key}
                    className="grid gap-5 border-b border-white/[0.08] py-6 sm:grid-cols-[110px_1fr_auto_auto] sm:items-center sm:gap-6"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="h-32 w-24 overflow-hidden border border-white/10 bg-graphite"
                    >
                      <ProductImage src={item.image} alt={item.name} serial={item.serial} />
                    </Link>

                    <div>
                      <Link
                        to={`/product/${item.slug}`}
                        className="font-display text-[18px] uppercase tracking-wide text-white transition-colors hover:text-red-batel"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                        {item.size ? `SIZE ${item.size}` : "ONE SIZE"}
                        {item.collectionName ? ` · ${item.collectionName}` : ""}
                      </p>
                      {item.serial ? (
                        <p className="mt-2 inline-flex items-center gap-2 border border-white/12 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white">
                          <span className="h-1 w-1 bg-red-batel" />
                          HELD: {item.serial}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-red-batel"
                      >
                        <X className="h-3 w-3" /> REMOVE
                      </button>
                    </div>

                    <div className="flex items-center border border-white/12">
                      <button
                        type="button"
                        aria-label="Decrease"
                        disabled={item.limited}
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-white/60 transition-colors hover:text-white disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center font-mono text-[12px] text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase"
                        disabled={item.limited}
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-white/60 transition-colors hover:text-white disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="font-mono text-[13px] text-white sm:text-right">
                      {formatPrice(item.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}

                <div className="mt-6">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/shop">← CONTINUE SHOPPING</Link>
                  </Button>
                </div>
              </div>

              <aside className="lg:sticky lg:top-[110px] lg:self-start">
                <div className="border border-white/12 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                    ORDER SUMMARY
                  </p>
                  <dl className="mt-6 space-y-3.5">
                    <Row label="SUBTOTAL" value={formatPrice(subtotal, currency)} />
                    <Row
                      label="SHIPPING"
                      value={shipping === 0 ? "FREE" : formatPrice(shipping, currency)}
                    />
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-end justify-between">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-white">
                          TOTAL
                        </dt>
                        <dd className="font-display text-[30px] leading-none text-white">
                          {formatPrice(total, currency)}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  {remaining > 0 ? (
                    <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                      ADD {formatPrice(remaining, currency)} FOR FREE SHIPPING
                    </p>
                  ) : (
                    <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-red-batel">
                      FREE SHIPPING UNLOCKED
                    </p>
                  )}

                  <div className="mt-6 space-y-2.5">
                    <Button asChild size="block">
                      <Link to="/checkout">CHECKOUT</Link>
                    </Button>
                    <Button asChild variant="ghost" size="block">
                      <Link to="/shop">CONTINUE SHOPPING</Link>
                    </Button>
                  </div>

                  <p className="mt-5 text-[11px] leading-relaxed text-white/35">
                    Numbers held in your bag are released automatically after 45 minutes so nobody
                    sits on a serial.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</dt>
      <dd className="font-mono text-[12px] text-white">{value}</dd>
    </div>
  );
}
