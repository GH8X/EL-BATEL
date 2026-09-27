import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "@/components/art/ProductImage";
import { Button } from "@/components/ui/button";
import { LineReveal, Marquee, Parallax, Reveal } from "@/components/site/motion";
import { SerialPlate } from "@/components/site/SerialPlate";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

export default function About() {
  const data = useQuery(api.catalog.getHome, {});
  const about = data?.about;

  const paragraphs = (about?.body ?? "").split("\n").filter((line) => line.trim().length > 0);

  return (
    <div className="pt-[68px]">
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-[0.28]">
          <ProductImage src={about?.image ?? "art:hoodie:black:front"} alt="EL BATEL studio" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
        <div className="container relative py-20 sm:py-32">
          <Reveal variant="fade">
            <span className="eyebrow">ABOUT</span>
          </Reveal>
          <Reveal>
            <h1 className="mt-6 font-display text-[64px] leading-[0.82] tracking-mega text-white sm:text-[160px]">
              {about?.title ?? "EL BATEL"}
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-white/60">
              {about?.intro ??
                "EL BATEL is the artist, the sound, and the wardrobe. The clothing is the part of the work you can carry with you."}
            </p>
          </Reveal>
        </div>
      </header>

      <Marquee
        items={["NOT JUST CLOTHES", "A PIECE OF THE CULTURE", "NUMBERED", "RELEASED ONCE"]}
        className="border-b border-white/10 bg-black"
      />

      <section className="relative border-b border-white/10 py-16 sm:py-24">
        <div className="container grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {paragraphs.map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.08} className="mb-7">
                <p className="max-w-xl text-[15px] leading-[1.85] text-white/60">{paragraph}</p>
              </Reveal>
            ))}

            <Reveal delay={0.2} className="mt-10">
              <div className="border-l border-red-batel pl-6">
                <p className="font-display text-[28px] leading-[0.95] tracking-tight text-white sm:text-[40px]">
                  {(about?.statement ?? "NOT JUST CLOTHES. A PIECE OF THE CULTURE.").replace(
                    ". ",
                    ".\n",
                  )}
                </p>
                {about?.signature ? (
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                    — {about.signature}
                  </p>
                ) : null}
              </div>
            </Reveal>
          </div>

          <div className="space-y-6">
            <Parallax distance={40}>
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
                <ProductImage src={about?.image ?? "art:hoodie:black:back"} alt="EL BATEL editorial" />
              </div>
            </Parallax>
            <div className="relative h-[280px] overflow-hidden border border-white/10 bg-black">
              <Suspense fallback={null}>
                <HeroScene className="absolute inset-0 h-full w-full" />
              </Suspense>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                  THE COLLECTOR TAG · EVERY NUMBERED PIECE CARRIES ONE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container grid gap-10 sm:grid-cols-3">
          {[
            {
              title: "THE STUDIO SYSTEM",
              copy: "Each limited piece is numbered when the run closes, then registered against the order it leaves with.",
            },
            {
              title: "BLACK, WHITE, ONE RED LINE",
              copy: "The palette stays quiet so the red can mean something: a serial, a stitch, a closed edition.",
            },
            {
              title: "NEVER REPEATED",
              copy: "When an edition reaches its final number, the pattern is retired. No restocks, no reprints.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <span className="font-mono text-[10px] text-red-batel">0{index + 1}</span>
              <h3 className="mt-4 font-display text-[22px] uppercase tracking-wide text-white sm:text-[26px]">
                {item.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/45">{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <LineReveal
            as="h2"
            text={"WEAR THE\nCULTURE."}
            className="font-display text-[52px] leading-[0.84] tracking-mega text-white sm:text-[118px]"
          />
          <Reveal delay={0.15}>
            <SerialPlate
              serial="ELB-0001"
              editionSize={100}
              status="available"
              label="FIRST PIECE OF THE ARCHIVE"
              size="lg"
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/shop">SHOP THE ARCHIVE</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/music">
                  HEAR EL BATEL <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
