import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ProductCard as ProductCardData } from "@/convex/catalog";
import { ProductImage } from "@/components/art/ProductImage";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/providers/CartProvider";
import { SerialPlate } from "./SerialPlate";
import { EASE } from "./motion";

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const primary = product.images[0];
  const secondary = product.images[1] ?? product.images[0];
  const soldOut = product.available <= 0;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: EASE, delay: Math.min(index * 0.05, 0.3) }}
        className="group relative"
      >
        <Link to={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-graphite">
            <div className="absolute inset-0 transition-transform duration-700 ease-editorial group-hover:scale-[1.06]">
              <ProductImage src={primary} alt={product.name} serial={product.lowestSerial} />
            </div>
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                product.images.length > 1 ? "" : "hidden",
              )}
            >
              <ProductImage src={secondary} alt={`${product.name} alternate view`} />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-red-batel transition-transform duration-700 group-hover:scale-x-100" />

            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {product.limited ? <Badge variant="accent">LIMITED</Badge> : null}
              {product.isNew && !product.limited ? <Badge variant="default">NEW DROP</Badge> : null}
              {soldOut ? <Badge variant="muted">SOLD OUT</Badge> : null}
            </div>

            {product.limited && product.lowestSerial ? (
              <div className="absolute bottom-3 left-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 border border-white/15 bg-black/80 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white backdrop-blur">
                  <span className="h-1 w-1 bg-red-batel" />
                  NEXT {product.lowestSerial}
                </span>
              </div>
            ) : null}
          </div>
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/product/${product.slug}`}
              className="block truncate font-display text-[17px] uppercase tracking-wide text-white transition-colors hover:text-red-batel sm:text-[19px]"
            >
              {product.name}
            </Link>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
              {product.collection?.title ?? product.category}
              {product.editionSize ? ` · EDITION OF ${product.editionSize}` : ""}
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
              {product.limited
                ? `${product.available} OF ${product.editionSize ?? "—"} AVAILABLE`
                : `${product.available} IN STOCK`}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[12px] text-white">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="inline-flex items-center gap-2 border border-white/12 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/60 transition-colors hover:border-white/40 hover:text-white"
          >
            <Eye className="h-3 w-3" /> QUICK VIEW
          </button>
          <Link
            to={`/product/${product.slug}`}
            className="inline-flex items-center gap-2 border border-transparent px-2 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-red-batel"
          >
            <Plus className="h-3 w-3" /> SELECT SIZE
          </Link>
        </div>
      </motion.article>

      <QuickView
        product={product}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />
    </>
  );
}

function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: ProductCardData;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [busy, setBusy] = useState(false);
  const soldOut = product.available <= 0;

  const handleAdd = async () => {
    setBusy(true);
    try {
      const item = await add({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        collectionName: product.collection?.name ?? null,
        price: product.price,
        size,
        image: product.images[0] ?? null,
        limited: product.limited,
      });
      if (item?.serial) {
        toast.success(`${product.name} held — ${item.serial}`);
      } else {
        toast.success(`${product.name} added to your bag`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add this piece");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-[4/5] border-b border-white/10 sm:border-b-0 sm:border-r">
            <ProductImage src={product.images[0]} alt={product.name} serial={product.lowestSerial} />
          </div>
          <div className="flex flex-col p-6">
            <DialogTitle className="font-display text-[22px] tracking-wide text-white">
              {product.name}
            </DialogTitle>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
              {product.collection?.name ?? product.category}
            </p>
            <p className="mt-4 font-mono text-lg text-white">{formatPrice(product.price)}</p>

            {product.limited ? (
              <SerialPlate
                className="mt-5"
                serial={product.lowestSerial}
                editionSize={product.editionSize}
                status={soldOut ? "sold" : "available"}
                animate={false}
                size="sm"
              />
            ) : null}

            <div className="mt-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">SIZE</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={cn(
                      "min-w-[46px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                      size === option
                        ? "border-red-batel bg-red-batel/10 text-white"
                        : "border-white/15 text-white/55 hover:border-white/40 hover:text-white",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-2.5 pt-6">
              <Button size="block" disabled={busy || soldOut} onClick={() => void handleAdd()}>
                {soldOut ? "SOLD OUT" : busy ? "RESERVING…" : "ADD TO CART"}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="block" asChild>
                  <Link to={`/product/${product.slug}`}>VIEW FULL PIECE</Link>
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
