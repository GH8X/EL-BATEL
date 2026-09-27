import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { Dialog, SheetContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/art/ProductImage";
import { useCart } from "@/providers/CartProvider";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
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
    <Dialog open={drawerOpen} onOpenChange={(open) => (open ? undefined : closeDrawer())}>
      <SheetContent side="right" className="p-0">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              YOUR BAG
            </p>
            <p className="mt-1 font-display text-2xl uppercase tracking-tight text-white">
              {items.length} {items.length === 1 ? "PIECE" : "PIECES"}
            </p>
          </div>
          <DialogClose className="text-white/50 transition-colors hover:text-red-batel">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
              YOUR BAG IS EMPTY
            </span>
            <p className="text-[13px] leading-relaxed text-white/45">
              Numbered pieces move fast. The lowest serial in an edition is always the first to go.
            </p>
            <Button asChild variant="default" size="sm" onClick={closeDrawer}>
              <Link to="/shop">SHOP THE DROP</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4 border-b border-white/[0.07] px-5 py-4">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={closeDrawer}
                    className="h-24 w-20 shrink-0 overflow-hidden border border-white/10 bg-graphite"
                  >
                    <ProductImage src={item.image} alt={item.name} serial={item.serial} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={closeDrawer}
                        className="font-display text-[15px] uppercase leading-tight tracking-wide text-white transition-colors hover:text-red-batel"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="text-white/30 transition-colors hover:text-red-batel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                      {item.size ? `SIZE ${item.size}` : "ONE SIZE"}
                      {item.collectionName ? ` · ${item.collectionName}` : ""}
                    </p>
                    {item.serial ? (
                      <p className="mt-2 inline-flex items-center gap-2 border border-white/12 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white">
                        <span className="h-1 w-1 bg-red-batel" />
                        {item.serial}
                      </p>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-white/12">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          disabled={item.limited}
                          className="flex h-7 w-7 items-center justify-center text-white/60 transition-colors hover:text-white disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-[11px] text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          disabled={item.limited}
                          className="flex h-7 w-7 items-center justify-center text-white/60 transition-colors hover:text-white disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-mono text-[12px] text-white">
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 px-5 py-5">
              {remaining > 0 ? (
                <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                  {formatPrice(remaining, currency)} AWAY FROM FREE SHIPPING
                </p>
              ) : (
                <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-red-batel">
                  FREE SHIPPING UNLOCKED
                </p>
              )}
              <dl className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    SUBTOTAL
                  </dt>
                  <dd className="font-mono text-[12px] text-white">{formatPrice(subtotal, currency)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    SHIPPING
                  </dt>
                  <dd className="font-mono text-[12px] text-white">
                    {shipping === 0 ? "FREE" : formatPrice(shipping, currency)}
                  </dd>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-white">TOTAL</dt>
                  <dd className="font-display text-2xl text-white">{formatPrice(total, currency)}</dd>
                </div>
              </dl>
              <div className="mt-5 space-y-2.5">
                <Button asChild size="block" onClick={closeDrawer}>
                  <Link to="/checkout">CHECKOUT</Link>
                </Button>
                <Button asChild variant="ghost" size="block" onClick={closeDrawer}>
                  <Link to="/shop">CONTINUE SHOPPING</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Dialog>
  );
}
