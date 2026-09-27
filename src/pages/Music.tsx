import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { platformIcon } from "@/components/site/PlatformIcons";
import { Marquee, Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui/button";

export default function Music() {
  const data = useQuery(api.catalog.getHome, {});
  const music = data?.music ?? [];
  const socials = data?.socials ?? [];

  const youtube = music.find((entry) => entry.platform === "youtube");
  const spotify = music.find((entry) => entry.platform === "spotify");
  const others = music.filter((entry) => entry.platform !== "youtube" && entry.platform !== "spotify");

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container py-16 sm:py-24">
          <Reveal>
            <span className="eyebrow">EL BATEL · MUSIC</span>
            <h1 className="mt-5 font-display text-[58px] leading-[0.84] tracking-mega text-white sm:text-[136px]">
              LISTEN
            </h1>
            <p className="mt-7 max-w-xl text-[14px] leading-relaxed text-white/50">
              The wardrobe follows the sound. Stream the catalogue on the platforms below.
            </p>
          </Reveal>
        </div>
      </header>

      <Marquee
        items={["WATCH ON YOUTUBE", "LISTEN ON SPOTIFY", "OFFICIAL CHANNELS"]}
        className="border-b border-white/10 bg-black"
      />

      <section className="py-14 sm:py-20">
        <div className="container grid gap-6 lg:grid-cols-2">
          {[youtube, spotify].filter(Boolean).map((entry, index) => {
            const item = entry!;
            return (
              <Reveal key={item.id} delay={index * 0.1}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex h-full flex-col justify-between overflow-hidden border border-white/[0.1] bg-white/[0.015] p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/25 hover:bg-white/[0.03] sm:p-10"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-16 w-16 items-center justify-center bg-white text-black transition-transform duration-500 group-hover:scale-110">
                      {platformIcon(item.platform, { className: "h-8 w-8" })}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">
                      {item.platform === "youtube" ? "YOUTUBE" : "SPOTIFY"}
                    </span>
                  </div>

                  <div className="mt-14">
                    <p className="font-display text-[34px] uppercase leading-none tracking-wide text-white sm:text-[48px]">
                      {item.platform === "youtube" ? "WATCH" : "LISTEN"}
                    </p>
                    <p className="mt-4 text-[14px] leading-relaxed text-white/50">{item.subtitle}</p>
                    <div className="mt-8 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-red-batel">
                      <span className="h-px w-8 bg-red-batel transition-all duration-500 group-hover:w-14" />
                      {item.title}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>

        {others.length > 0 ? (
          <div className="container mt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {others.map((item) => (
                <Reveal key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-5 border border-white/[0.1] p-6 transition-colors hover:border-white/25"
                  >
                    <span className="flex h-12 w-12 items-center justify-center border border-white/15 text-white/70 transition-colors group-hover:border-red-batel group-hover:text-white">
                      {platformIcon(item.platform, { className: "h-5 w-5" })}
                    </span>
                    <div>
                      <p className="font-display text-[20px] uppercase tracking-wide text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[12px] text-white/45">{item.subtitle}</p>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className="container">
          <Reveal>
            <span className="eyebrow">FOLLOW EL BATEL</span>
          </Reveal>
          <div className="mt-8 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {socials.map((social, index) => (
              <Reveal key={social.id} delay={Math.min(index * 0.05, 0.2)}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-6 border border-white/[0.08] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
                >
                  <span className="text-white/60 transition-colors group-hover:text-red-batel">
                    {platformIcon(social.platform, { className: "h-6 w-6" })}
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                      {social.label}
                    </p>
                    <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                      {social.handle ?? ""}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-16 text-center sm:py-20">
        <div className="container">
          <h2 className="font-display text-[40px] leading-none tracking-tight text-white sm:text-[72px]">
            THE SOUND HAS A WARDROBE
          </h2>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link to="/shop">SHOP THE DROP</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
