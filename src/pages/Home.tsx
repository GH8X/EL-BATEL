import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { ProductCard } from "@/components/site/ProductCard";
import { HeroCta } from "@/components/site/Nav";
import { Countdown } from "@/components/site/Countdown";
import { SerialPlate } from "@/components/site/SerialPlate";
import { platformIcon } from "@/components/site/PlatformIcons";
import { EASE, LineReveal, Magnetic, Marquee, Parallax, Reveal } from "@/components/site/motion";
import { ProductImage } from "@/components/art/ProductImage";
import { formatPrice } from "@/lib/format";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

function Hero() {
  const data = useQuery(api.catalog.getHome, {});
  const [engaged, setEngaged] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 220]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSceneReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const home = data?.home;
  const settings = data?.settings;

  return (
    <section
      ref={ref}
      className="grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 pt-32 sm:pb-20"
    >
      <div className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.5]" />
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[420px] w-[420px] rounded-full bg-red-batel/[0.11] blur-[130px]" />
      <motion.div style={{ y: sceneY }} className="absolute inset-0">
        {sceneReady ? (
          <Suspense fallback={null}>
            <HeroScene engaged={engaged} className="absolute inset-0 h-full w-full" />
          </Suspense>
        ) : null}
      </motion.div>

      {home?.heroImage ? (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22]">
          <ProductImage src={home.heroImage} alt="EL BATEL editorial" />
        </div>
      ) : null}

      <div className="container relative z-10">
        <motion.div style={{ y: titleY, opacity: titleOpacity }}>
          <Reveal variant="fade">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-red-batel" />
              <span className="eyebrow">{home?.eyebrow ?? "NUMBERED PIECES · LIMITED RUNS"}</span>
            </div>
          </Reveal>

          <h1 className="mt-6 font-display leading-[0.82] tracking-mega">
            <span className="block text-[16vw] text-white sm:text-[112px] lg:text-[136px]">
              EL BATEL
            </span>
            <span className="block text-[16vw] text-outline sm:text-[112px] lg:text-[136px]">
              {home?.heroTitle ?? "WEAR THE CULTURE."}
            </span>
          </h1>

          <Reveal delay={0.15} className="mt-7 max-w-xl">
            <p className="text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
              {home?.heroSubtitle ??
                "Every piece is designed by EL BATEL, released once, and numbered."}
            </p>
          </Reveal>

          <Reveal delay={0.25} className="mt-9 flex flex-wrap items-center gap-3">
            <HeroCta
              label={home?.ctaPrimaryLabel ?? "SHOP THE DROP"}
              to={home?.ctaPrimaryHref ?? "/shop"}
              onEngage={setEngaged}
            />
            <HeroCta
              label={home?.ctaSecondaryLabel ?? "EXPLORE EL BATEL"}
              to={home?.ctaSecondaryHref ?? "/collections"}
              onEngage={setEngaged}
              variant="outline"
            />
          </Reveal>
        </motion.div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Stat label="PIECES IN ARCHIVE" value={String(data?.featured.length ?? 0) + "+"} />
            <Stat label="EDITION MODEL" value="NUMBERED" />
            <Stat label="SHIPS" value="WORLDWIDE" />
          </div>
          <a
            href="#archive"
            className="group hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40 transition-colors hover:text-white sm:flex"
          >
            SCROLL THE ARCHIVE
            <span className="transition-transform duration-500 group-hover:translate-y-1">↓</span>
          </a>
        </div>
      </div>

      {settings?.announcementActive ? null : <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">{label}</p>
      <p className="mt-1 font-mono text-[12px] tracking-[0.1em] text-white">{value}</p>
    </div>
  );
}

function FeaturedArchive() {
  const data = useQuery(api.catalog.getHome, {});
  const products = data?.featured ?? [];

  return (
    <section id="archive" className="relative border-t border-white/10 bg-black py-20 sm:py-28">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-red-batel" />
              <span className="eyebrow">THE ARCHIVE</span>
            </div>
            <h2 className="mt-4 font-display text-[42px] leading-[0.86] tracking-tight text-white sm:text-[64px]">
              PIECES IN CIRCULATION
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Button asChild variant="outline" size="sm">
              <Link to="/shop">
                VIEW EVERY PIECE <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatementSection() {
  const data = useQuery(api.catalog.getHome, {});
  const home = data?.home;
  const statement = home?.brandStatement ?? "NOT JUST CLOTHES.\nA PIECE OF THE CULTURE.";

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-red-batel/10 blur-[140px]" />
      <div className="container relative">
        <Reveal variant="fade">
          <span className="eyebrow">STATEMENT</span>
        </Reveal>
        <LineReveal
          as="h2"
          text={statement}
          className="mt-6 font-display text-[40px] leading-[0.9] tracking-tight text-white sm:text-[80px] lg:text-[96px]"
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={0.1}>
            <p className="max-w-xl text-[14px] leading-relaxed text-white/50">
              {home?.brandSubstatement ??
                "Designed in the studio, released to the people who were there first."}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { step: "01", title: "NUMBERED", copy: "Each piece gets a serial when the run closes." },
                { step: "02", title: "REGISTERED", copy: "The number is linked to the owner's order." },
                { step: "03", title: "CLOSED", copy: "When the edition ends, it is never cut again." },
              ].map((item) => (
                <div key={item.step} className="border border-white/10 p-5">
                  <span className="font-mono text-[10px] text-red-batel">{item.step}</span>
                  <p className="mt-3 font-display text-[18px] uppercase tracking-wide text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/45">{item.copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DropSection() {
  const drop = useQuery(api.catalog.getDrop, {});
  const [open, setOpen] = useState(false);
  const card = drop?.card;
  const dropDate = drop?.dropDate ?? null;

  useEffect(() => {
    if (!dropDate) return;
    const id = window.setInterval(() => setOpen(Date.now() >= dropDate), 1000);
    setOpen(Date.now() >= dropDate);
    return () => window.clearInterval(id);
  }, [dropDate]);

  if (!card) return null;

  return (
    <section className="relative border-b border-white/10 bg-black py-20 sm:py-28">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="relative aspect-[4/5] border border-white/10">
              <Parallax distance={30} className="h-full">
                <ProductImage src={card.images[0]} alt={card.name} serial={card.lowestSerial} />
              </Parallax>
              <div className="absolute right-4 top-4">
                <Badge variant="accent">{open ? "DROP LIVE" : "DROP LOCKED"}</Badge>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="eyebrow">THE DROP</span>
            <h2 className="mt-4 font-display text-[42px] leading-[0.88] tracking-tight text-white sm:text-[68px]">
              {card.name}
            </h2>
            <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-white/50">
              {card.editionSize
                ? `${card.editionSize} pieces. Numbered, released once, closed forever.`
                : "A single release, numbered from the first piece."}
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <SerialPlate
                serial={card.lowestSerial}
                editionSize={card.editionSize}
                status={card.available > 0 ? "available" : "sold"}
                label="NEXT SERIAL IN LINE"
                size="sm"
              />
              <div className="grid grid-cols-2 gap-px">
                <Metric label="EDITION SIZE" value={card.editionSize ? String(card.editionSize) : "OPEN"} />
                <Metric label="AVAILABLE" value={String(card.available)} />
                <Metric label="PRICE" value={formatPrice(card.price)} />
                <Metric label="STATUS" value={open ? "LIVE" : "LOCKED"} />
              </div>
            </div>

            {dropDate ? (
              <div className="mt-8">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                  RELEASE DATE · {new Date(dropDate).toUTCString().slice(0, 16).toUpperCase()}
                </p>
                <Countdown target={dropDate} />
              </div>
            ) : null}

            <div className="mt-9">
              <Magnetic strength={8}>
                <Button asChild size="lg" variant={open ? "accent" : "outline"}>
                  <Link to={open ? `/product/${card.slug}` : "/limited-drops"}>
                    {open ? "ENTER THE DROP" : "VIEW DROP DETAILS"} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 px-4 py-3">
      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/35">{label}</p>
      <p className="mt-1.5 font-mono text-[13px] text-white">{value}</p>
    </div>
  );
}

function CollectionsPreview() {
  const data = useQuery(api.catalog.getHome, {});
  const collections = data?.collections ?? [];

  return (
    <section className="relative border-b border-white/10 bg-black py-20 sm:py-28">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="eyebrow">COLLECTIONS</span>
            <h2 className="mt-4 font-display text-[42px] leading-[0.88] tracking-tight text-white sm:text-[64px]">
              THREE CHAPTERS
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Button asChild variant="ghost" size="sm">
              <Link to="/collections">
                ALL COLLECTIONS <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 space-y-px">
          {collections.map((collection, index) => (
            <Reveal key={collection.id} delay={index * 0.06}>
              <Link
                to={`/collections/${collection.slug}`}
                className="group relative grid items-center gap-6 border border-white/[0.08] px-5 py-8 transition-colors duration-500 hover:border-white/20 sm:grid-cols-[auto_1fr_auto_auto] sm:px-8"
              >
                <span className="font-mono text-[11px] text-white/35 transition-colors group-hover:text-red-batel">
                  {collection.name}
                </span>
                <span className="font-display text-[36px] uppercase leading-none tracking-tight text-white sm:text-[54px]">
                  {collection.title}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {collection.tagline ?? ""}
                </span>
                <span className="hidden h-16 w-16 overflow-hidden border border-white/10 sm:block">
                  <ProductImage src={collection.coverImage} alt={collection.title} />
                </span>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-red-batel transition-transform duration-700 group-hover:scale-x-100" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MusicPreview() {
  const data = useQuery(api.catalog.getHome, {});
  const music = data?.music ?? [];

  return (
    <section className="relative border-b border-white/10 bg-black py-20 sm:py-28">
      <div className="container">
        <Reveal>
          <span className="eyebrow">MUSIC</span>
          <h2 className="mt-4 font-display text-[42px] leading-[0.88] tracking-tight text-white sm:text-[64px]">
            THE SOUND BEHIND THE ARCHIVE
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {music.map((entry, index) => (
            <Reveal key={entry.id} delay={index * 0.08}>
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-full flex-col justify-between border border-white/[0.1] bg-white/[0.015] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-white text-black transition-transform duration-500 group-hover:scale-105">
                    {platformIcon(entry.platform, { className: "h-6 w-6" })}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-red-batel" />
                </div>
                <div className="mt-10">
                  <p className="font-display text-[24px] uppercase tracking-wide text-white sm:text-[30px]">
                    {entry.title}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/45">
                    {entry.subtitle ?? ""}
                  </p>
                </div>
                <span className="mt-6 h-px w-full origin-left scale-x-0 bg-red-batel transition-transform duration-700 group-hover:scale-x-100" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-black py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.5] hairline-grid" />
      <div className="container relative text-center">
        <Reveal variant="blur">
          <p className="eyebrow">THE NEXT RELEASE IS NUMBERED</p>
        </Reveal>
        <LineReveal
          as="h2"
          text={"OWN THE\nNUMBER"}
          className="mx-auto mt-6 max-w-4xl font-display text-[56px] leading-[0.85] tracking-mega text-white sm:text-[120px]"
        />
        <Reveal delay={0.2} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic strength={12}>
            <Button asChild size="lg">
              <Link to="/shop">SHOP NOW</Link>
            </Button>
          </Magnetic>
          <Magnetic strength={12}>
            <Button asChild size="lg" variant="outline">
              <Link to="/limited-drops">LIMITED DROPS</Link>
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee
        items={[
          "LIMITED EDITIONS",
          "UNIQUE SERIAL NUMBERS",
          "BLACK / WHITE / RED",
          "SHIPS WORLDWIDE",
          "DESIGNED BY EL BATEL",
        ]}
        className="border-y border-white/10 bg-black"
      />
      <FeaturedArchive />
      <StatementSection />
      <DropSection />
      <CollectionsPreview />
      <MusicPreview />
      <FinalCta />
    </>
  );
}
