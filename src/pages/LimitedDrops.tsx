import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "@/components/art/ProductImage";
import { SerialPlate } from "@/components/site/SerialPlate";
import { Countdown } from "@/components/site/Countdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { Reveal, Magnetic, Parallax } from "@/components/site/motion";
import { formatPrice } from "@/lib/format";

const DropScene = lazy(() => import("@/components/three/DropScene"));

function Availability({ available, total }: { available: number; total: number | null }) {
  const pct = total && total > 0 ? Math.min(100, ((total - available) / total) * 100) : 0;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
        <span>{available} LEFT</span>
        <span>{total ? `${total} PIECES` : "OPEN RUN"}</span>
      </div>
      <div className="mt-2 h-[3px] w-full bg-white/10">
        <div className="h-full bg-red-batel transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function LimitedDrops() {
  const drop = useQuery(api.catalog.getDrop, {});
  const limited = useQuery(api.catalog.listProducts, { filter: "limited" });
  const [open, setOpen] = useState(true);
  // Which numbered run the visitor is looking at — the box reacts to it.
  const [emphasis, setEmphasis] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const dropDate = drop?.dropDate ?? null;

  // WebGL loads after the first paint so the header never blocks on three.js.
  useEffect(() => {
    const idle = window.requestIdleCallback?.(() => setSceneReady(true));
    const timer = window.setTimeout(() => setSceneReady(true), 900);
    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!dropDate) return;
    const tick = () => setOpen(Date.now() >= dropDate);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [dropDate]);

  return (
    <div className="pt-[68px]">
      <header className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="pointer-events-none absolute -left-20 top-10 h-[360px] w-[360px] rounded-full bg-red-batel/10 blur-[130px]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block">
          {sceneReady ? (
            <Suspense fallback={null}>
              <DropScene emphasis={emphasis} className="h-full w-full" />
            </Suspense>
          ) : null}
        </div>
        <div className="container relative py-16 sm:py-24">
          <div className="lg:max-w-[56%]">
            <Reveal>
              <span className="eyebrow">EL BATEL · LIMITED DROP</span>
              <h1 className="mt-5 font-display text-[58px] leading-[0.84] tracking-mega text-white sm:text-[128px]">
                THE DROP
              </h1>
              <p className="mt-7 max-w-xl text-[14px] leading-relaxed text-white/50">
                One release. One number per piece. When the count reaches zero the edition closes
                and never returns — that is the whole point.
              </p>
            </Reveal>
          </div>
        </div>
      </header>

      {drop?.card ? (
        <section className="border-b border-white/10 py-14 sm:py-20">
          <div className="container grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
                <Parallax distance={28} className="h-full">
                  <ProductImage
                    src={drop.card.images[0]}
                    alt={drop.card.name}
                    serial={drop.card.lowestSerial}
                  />
                </Parallax>
                <div className="absolute right-4 top-4">
                  <Badge variant={open ? "accent" : "outline"}>
                    {open ? "LIVE NOW" : "OPENS SOON"}
                  </Badge>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display text-[40px] leading-[0.88] tracking-tight text-white sm:text-[64px]">
                {drop.card.name}
              </h2>
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                  EDITION SIZE · {drop.card.editionSize ?? "OPEN"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                  AVAILABLE · {drop.card.available}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                  {formatPrice(drop.card.price)}
                </span>
              </div>

              {dropDate ? (
                <div className="mt-8">
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                    DROP DATE · {new Date(dropDate).toUTCString().slice(0, 22).toUpperCase()}
                  </p>
                  <Countdown target={dropDate} />
                </div>
              ) : null}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <SerialPlate
                  serial={drop.card.lowestSerial}
                  editionSize={drop.card.editionSize}
                  status={drop.card.available > 0 ? "available" : "sold"}
                  label="NEXT SERIAL"
                  size="sm"
                />
                <div className="flex flex-col justify-between border border-white/10 p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                    STATUS
                  </p>
                  <p className="mt-2 font-display text-[26px] uppercase tracking-wide text-white">
                    {open ? "OPEN" : "LOCKED"}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/45">
                    {open
                      ? "Serial numbers are being assigned in order."
                      : "Serials unlock the moment the countdown ends."}
                  </p>
                </div>
              </div>

              <div className="mt-9">
                <Magnetic strength={10}>
                  <Button asChild size="lg" variant={open ? "accent" : "outline"}>
                    <Link to={open ? `/product/${drop.card.slug}` : "/shop"}>
                      {open ? "ENTER THE DROP" : "BROWSE THE ARCHIVE"}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="py-14 sm:py-20">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <Reveal>
              <span className="eyebrow">NUMBERED EDITIONS</span>
              <h2 className="mt-4 font-display text-[36px] leading-none tracking-tight text-white sm:text-[54px]">
                IN CIRCULATION
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                {limited?.length ?? 0} NUMBERED RUNS
              </span>
            </Reveal>
          </div>

          <div className="mt-12 space-y-px">
            {(limited ?? []).map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index * 0.05, 0.25)}>
                <Link
                  to={`/product/${product.slug}`}
                  onMouseEnter={() => setEmphasis(true)}
                  onMouseLeave={() => setEmphasis(false)}
                  className="group grid items-center gap-6 border border-white/[0.08] p-5 transition-colors duration-500 hover:border-white/20 sm:grid-cols-[120px_1fr_auto] sm:p-6"
                >
                  <div className="h-28 w-24 overflow-hidden border border-white/10 bg-graphite">
                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      serial={product.lowestSerial}
                    />
                  </div>
                  <div>
                    <p className="font-display text-[22px] uppercase tracking-wide text-white sm:text-[30px]">
                      {product.name}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                      {product.collection?.title ?? product.category} ·{" "}
                      {product.editionSize ? `${product.editionSize} PIECES` : "LIMITED"}
                    </p>
                    <Availability available={product.available} total={product.editionSize} />
                  </div>
                  <div className="flex items-center gap-5">
                    <SerialPlate
                      serial={product.lowestSerial}
                      editionSize={product.editionSize}
                      status={product.available > 0 ? "available" : "sold"}
                      label="NEXT"
                      size="sm"
                      animate={false}
                      className="hidden w-40 sm:block"
                    />
                    <ArrowUpRight className="h-5 w-5 text-white/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-red-batel" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
