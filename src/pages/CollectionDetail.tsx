import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "@/components/art/ProductImage";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/motion";
import NotFound from "./NotFound";

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const collection = useQuery(api.catalog.getCollection, slug ? { slug } : "skip");

  if (collection === undefined) {
    return (
      <div className="container pt-[140px]">
        <div className="h-24 w-2/3 animate-pulse-soft bg-white/[0.04]" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[4/5] animate-pulse-soft border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      </div>
    );
  }

  if (collection === null) return <NotFound />;

  return (
    <div className="pt-[68px]">
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-[0.32]">
          <ProductImage src={collection.coverImage} alt={collection.title} priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="container relative py-16 sm:py-24">
          <Reveal variant="fade">
            <Link
              to="/collections"
              className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40 transition-colors hover:text-white"
            >
              ← ALL COLLECTIONS
            </Link>
          </Reveal>
          <Reveal>
            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              {collection.name} {collection.tagline ? `· ${collection.tagline}` : ""}
            </p>
            <h1 className="mt-5 font-display text-[58px] leading-[0.84] tracking-mega text-white sm:text-[132px]">
              {collection.title}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-2xl text-[14px] leading-relaxed text-white/55">
              {collection.description}
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {collection.products.length} PIECES
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {collection.products.filter((p) => p.limited).length} NUMBERED
            </span>
          </Reveal>
        </div>
      </header>

      <section className="py-14 sm:py-20">
        <div className="container">
          {collection.products.length === 0 ? (
            <div className="border border-white/10 px-6 py-20 text-center">
              <p className="font-display text-2xl uppercase tracking-wide text-white">
                This chapter is not public yet
              </p>
              <p className="mt-3 text-[13px] text-white/45">
                Pieces from {collection.title} will appear here the moment the studio releases them.
              </p>
              <div className="mt-7">
                <Button asChild variant="outline" size="sm">
                  <Link to="/shop">
                    BROWSE THE ARCHIVE <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {collection.products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
