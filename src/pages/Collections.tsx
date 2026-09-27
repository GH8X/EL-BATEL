import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "@/components/art/ProductImage";
import { Reveal, Parallax } from "@/components/site/motion";

export default function Collections() {
  const collections = useQuery(api.catalog.listCollections, {});

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container py-14 sm:py-20">
          <Reveal>
            <span className="eyebrow">EL BATEL · COLLECTIONS</span>
            <h1 className="mt-5 font-display text-[52px] leading-[0.84] tracking-mega text-white sm:text-[104px]">
              CHAPTERS
            </h1>
            <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-white/50">
              Every chapter is written around one idea, cut once, and closed when the last piece
              leaves the studio.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="bg-black">
        {collections === undefined
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b border-white/10">
                <div className="container grid gap-8 py-16 lg:grid-cols-2">
                  <div className="h-64 animate-pulse-soft bg-white/[0.03]" />
                  <div className="space-y-4">
                    <div className="h-3 w-1/4 animate-pulse-soft bg-white/[0.05]" />
                    <div className="h-16 w-2/3 animate-pulse-soft bg-white/[0.05]" />
                  </div>
                </div>
              </div>
            ))
          : collections.map((collection, index) => (
              <section key={collection.id} className="border-b border-white/10">
                <Link
                  to={`/collections/${collection.slug}`}
                  className="group container grid items-center gap-8 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:py-20"
                >
                  <div
                    className={`relative aspect-[4/5] overflow-hidden border border-white/10 ${
                      index % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    <Parallax distance={26} className="h-full">
                      <ProductImage src={collection.coverImage} alt={collection.title} />
                    </Parallax>
                    <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
                      {collection.name}
                    </span>
                  </div>

                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                      {collection.tagline ?? "EL BATEL"}
                    </span>
                    <h2 className="mt-4 font-display text-[54px] leading-[0.84] tracking-tight text-white transition-colors duration-500 group-hover:text-white sm:text-[96px]">
                      {collection.title}
                    </h2>
                    <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-white/50">
                      {collection.description}
                    </p>
                    <div className="mt-8 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 transition-colors group-hover:text-red-batel">
                      <span className="h-px w-8 bg-red-batel transition-all duration-500 group-hover:w-14" />
                      EXPLORE COLLECTION
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </section>
            ))}
      </div>
    </div>
  );
}
