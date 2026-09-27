import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ArrowUpRight, Check, Minus, Plus, Truck } from "lucide-react";
import { ProductImage } from "@/components/art/ProductImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { SerialPlate } from "@/components/site/SerialPlate";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal, EASE } from "@/components/site/motion";
import { Countdown } from "@/components/site/Countdown";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/providers/CartProvider";
import NotFound from "./NotFound";

type FlyState = { id: number; from: { x: number; y: number } } | null;

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const product = useQuery(api.catalog.getProduct, id ? { slug: id } : "skip");
  const settings = useQuery(api.catalog.getSettings, {});
  const { add, itemKey, items, count } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [serialId, setSerialId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [fly, setFly] = useState<FlyState>(null);
  const imageWrap = useRef<HTMLDivElement>(null);

  const availableSerials = useMemo(
    () => (product?.serials ?? []).filter((s) => s.status === "available"),
    [product],
  );

  useEffect(() => {
    setActiveImage(0);
    setSerialId(null);
    setSize(null);
    setAdded(false);
  }, [id]);

  useEffect(() => {
    if (!size && product?.sizes.length) setSize(product.sizes[0]);
  }, [product, size]);

  // A drop that has not opened yet cannot be bought.
  const dropLocked = Boolean(product?.dropDate && product.dropDate > Date.now());
  const soldOut = product ? (product.limited ? product.stats.available : product.quantity) <= 0 : true;
  const inCart = product ? items.some((item) => item.key === itemKey(product.id, size)) : false;

  if (product === undefined) {
    return (
      <div className="container pt-[120px]">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse-soft border border-white/10 bg-white/[0.03]" />
          <div className="space-y-4 pt-6">
            <div className="h-4 w-1/3 animate-pulse-soft bg-white/[0.05]" />
            <div className="h-12 w-3/4 animate-pulse-soft bg-white/[0.05]" />
            <div className="h-24 w-full animate-pulse-soft bg-white/[0.03]" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) return <NotFound />;

  const handleAdd = async () => {
    if (!size && product.sizes.length > 1) {
      toast.error("Select a size first");
      return;
    }
    setBusy(true);
    try {
      const rect = imageWrap.current?.getBoundingClientRect();
      if (rect) {
        setFly({ id: Date.now(), from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 } });
      }
      const item = await add({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        collectionName: product.collection?.name ?? null,
        price: product.price,
        size,
        image: product.images[0] ?? null,
        limited: product.limited,
        serialId: (serialId as Id<"serial_numbers"> | null) ?? null,
      });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
      toast.success(item?.serial ? `${product.name} · ${item.serial} held in your bag` : "Added to your bag");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add this piece");
    } finally {
      setBusy(false);
    }
  };

  const images = product.images.length > 0 ? product.images : [""];

  return (
    <div className="pt-[68px]">
      <div className="border-b border-white/10">
        <div className="container flex items-center gap-3 py-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
          <Link to="/shop" className="transition-colors hover:text-white">
            SHOP
          </Link>
          <span>/</span>
          {product.collection ? (
            <>
              <Link
                to={`/collections/${product.collection.slug}`}
                className="transition-colors hover:text-white"
              >
                {product.collection.title}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="text-white/60">{product.name}</span>
        </div>
      </div>

      <section className="bg-black py-10 sm:py-14">
        <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* gallery */}
          <div>
            <div
              ref={imageWrap}
              className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-graphite"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute inset-0"
                >
                  <ProductImage
                    src={images[activeImage]}
                    alt={`${product.name} view ${activeImage + 1}`}
                    serial={product.stats.lowestAvailable}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {product.limited ? <Badge variant="accent">LIMITED EDITION</Badge> : null}
                {product.isNew ? <Badge variant="default">NEW DROP</Badge> : null}
              </div>
            </div>

            <div className="mt-3 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onMouseEnter={() => setActiveImage(index)}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "h-24 w-20 overflow-hidden border transition-all duration-300",
                    activeImage === index
                      ? "border-red-batel"
                      : "border-white/10 opacity-60 hover:opacity-100",
                  )}
                >
                  <ProductImage src={image} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* details */}
          <div>
            <Reveal variant="fade">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                {product.collection ? `${product.collection.name} · ${product.collection.title}` : product.category}
              </p>
            </Reveal>
            <Reveal>
              <h1 className="mt-4 font-display text-[40px] leading-[0.88] tracking-tight text-white sm:text-[62px]">
                {product.name}
              </h1>
            </Reveal>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <span className="font-mono text-[18px] text-white">{formatPrice(product.price)}</span>
              {product.compareAtPrice ? (
                <span className="font-mono text-[13px] text-white/30 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
              {product.limited ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-batel">
                  {product.stats.available} OF {product.edition?.total ?? "—"} AVAILABLE
                </span>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {product.quantity} IN STOCK
                </span>
              )}
            </div>

            {product.limited ? (
              <SerialPlate
                className="mt-7"
                serial={product.stats.lowestAvailable}
                editionSize={product.edition?.total ?? null}
                status={soldOut ? "sold" : "available"}
                label={product.edition?.name ?? "LIMITED EDITION"}
              />
            ) : null}

            {dropLocked && product.dropDate ? (
              <div className="mt-6 border border-red-batel/40 bg-red-batel/[0.06] p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-red-batel">
                  DROP LOCKED — OPENS IN
                </p>
                <div className="mt-4">
                  <Countdown target={product.dropDate} compact />
                </div>
              </div>
            ) : null}

            {product.limited && availableSerials.length > 0 && !dropLocked ? (
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">
                    PICK YOUR NUMBER
                  </p>
                  <button
                    type="button"
                    onClick={() => setSerialId(null)}
                    className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-red-batel"
                  >
                    AUTO ({availableSerials[0]?.serial})
                  </button>
                </div>
                <div className="mt-3 grid max-h-40 grid-cols-3 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-4">
                  {availableSerials.slice(0, 120).map((serial) => (
                    <button
                      key={serial.id}
                      type="button"
                      onClick={() => setSerialId(serial.id)}
                      className={cn(
                        "border px-2 py-2 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors",
                        serialId === serial.id
                          ? "border-red-batel bg-red-batel/10 text-white"
                          : "border-white/12 text-white/50 hover:border-white/35 hover:text-white",
                      )}
                    >
                      {serial.serial}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">SIZE</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={cn(
                      "min-w-[52px] border px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
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

            <div className="mt-8 space-y-3">
              <motion.div animate={added ? { scale: [1, 0.98, 1] } : {}} transition={{ duration: 0.4 }}>
                <Button
                  size="block"
                  variant={added ? "accent" : "default"}
                  disabled={busy || soldOut || dropLocked}
                  onClick={() => void handleAdd()}
                  className="relative overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {added ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" /> ADDED TO BAG
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.25 }}
                      >
                        {soldOut
                          ? "SOLD OUT — EDITION CLOSED"
                          : dropLocked
                            ? "DROP NOT OPEN YET"
                            : busy
                              ? "RESERVING YOUR NUMBER…"
                              : inCart
                                ? "ADD ANOTHER SIZE"
                                : "ADD TO CART"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <div className="flex items-start gap-3 border border-white/10 px-4 py-3.5">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <p className="text-[12px] leading-relaxed text-white/45">
                  {settings?.settings?.shippingInfo ??
                    "Shipped worldwide from the studio within 3–5 working days."}
                </p>
              </div>
            </div>

            {/* facts */}
            <dl className="mt-9 divide-y divide-white/10 border-y border-white/10">
              {[
                { label: "COLLECTION", value: product.collection?.title ?? product.category },
                { label: "EDITION", value: product.edition ? `${product.edition.name} · ${product.edition.total} PIECES` : "OPEN RUN" },
                { label: "MATERIAL", value: product.material ?? "—" },
                { label: "COLOUR", value: product.color ?? "—" },
                { label: "CARE", value: product.care ?? "—" },
                {
                  label: "SERIALS IN CIRCULATION",
                  value: product.limited
                    ? `${product.stats.sold} SOLD · ${product.stats.available} AVAILABLE`
                    : "NOT NUMBERED",
                },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 py-3.5 sm:grid-cols-[200px_1fr]">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                    {row.label}
                  </dt>
                  <dd className="text-[13px] text-white/70">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-14 sm:py-20">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <span className="eyebrow">ABOUT THIS PIECE</span>
            <p className="mt-5 text-[15px] leading-relaxed text-white/60">{product.description}</p>
            {product.story ? (
              <p className="mt-5 border-l border-red-batel pl-5 text-[14px] leading-relaxed text-white/45">
                {product.story}
              </p>
            ) : null}
          </Reveal>
          <Reveal delay={0.1}>
            {product.edition ? (
              <div className="border border-white/10 p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                  EDITION RECORD
                </p>
                <div className="mt-5 grid grid-cols-2 gap-5">
                  <Record label="EDITION" value={product.edition.name} />
                  <Record label="TOTAL" value={`${product.edition.total} PIECES`} />
                  <Record label="PREFIX" value={product.edition.prefix} />
                  <Record label="NEXT SERIAL" value={product.stats.lowestAvailable ?? "SOLD OUT"} />
                  <Record label="RESERVED" value={String(product.stats.reserved)} />
                  <Record label="PLACED" value={String(product.stats.sold)} />
                </div>
              </div>
            ) : (
              <div className="border border-white/10 p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                  ARCHIVE NOTE
                </p>
                <p className="mt-4 text-[13px] leading-relaxed text-white/50">
                  This piece is part of an open run. Numbered editions of the same cut are released
                  through the LIMITED collection.
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {product.related.length > 0 ? (
        <section className="border-t border-white/10 py-16 sm:py-20">
          <div className="container">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-[32px] leading-none tracking-tight text-white sm:text-[44px]">
                FROM THE SAME CHAPTER
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/shop">
                  ALL PIECES <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {product.related.map((related, index) => (
                <ProductCard key={related.id} product={related} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* fly-to-cart token */}
      <AnimatePresence>
        {fly ? (
          <motion.div
            key={fly.id}
            initial={{ x: fly.from.x, y: fly.from.y, scale: 1, opacity: 0.9 }}
            animate={{
              x: window.innerWidth - 92,
              y: 30,
              scale: 0.18,
              opacity: 0.1,
              rotate: 260,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
            onAnimationComplete={() => setFly(null)}
            className="pointer-events-none fixed left-0 top-0 z-[70] h-20 w-16 overflow-hidden border border-red-batel bg-black"
          >
            <ProductImage src={images[0]} alt="" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {count > 0 && added ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none fixed bottom-6 right-6 z-[65] border border-red-batel bg-black px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white"
        >
          {count} IN BAG
        </motion.div>
      ) : null}
    </div>
  );
}

function Record({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/35">{label}</p>
      <p className="mt-2 font-mono text-[12px] leading-snug text-white">{value}</p>
    </div>
  );
}
