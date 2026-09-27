import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/motion";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Hoodies", "T-Shirts", "Pants", "Accessories"] as const;
const FILTERS = [
  { key: "all", label: "All pieces" },
  { key: "limited", label: "Limited editions" },
  { key: "new", label: "New drops" },
  { key: "featured", label: "Featured" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = (params.get("category") ?? "All") as (typeof CATEGORIES)[number];
  const filter = (params.get("filter") ?? "all") as FilterKey;
  const [search, setSearch] = useState("");

  const products = useQuery(api.catalog.listProducts, {
    category: category === "All" ? undefined : category,
    filter,
    search: search.trim().length > 1 ? search.trim() : undefined,
  });

  const summary = useQuery(api.catalog.shopSummary, {});

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === "All" || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const heading = useMemo(() => {
    if (filter === "limited") return "LIMITED EDITIONS";
    if (filter === "new") return "NEW DROPS";
    if (filter === "featured") return "FEATURED PIECES";
    if (category !== "All") return category.toUpperCase();
    return "THE FULL ARCHIVE";
  }, [filter, category]);

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container py-14 sm:py-20">
          <Reveal>
            <span className="eyebrow">SHOP · EL BATEL</span>
            <h1 className="mt-5 font-display text-[46px] leading-[0.86] tracking-tight text-white sm:text-[86px]">
              {heading}
            </h1>
          </Reveal>
          <Reveal delay={0.1} className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Meta label="PIECES" value={String(products?.length ?? 0)} />
            <Meta label="AVAILABLE UNITS" value={String(summary?.availablePieces ?? 0)} />
            <Meta label="PIECES PLACED" value={String(summary?.soldPieces ?? 0)} />
            <Meta label="LIMITED EDITIONS" value={String(summary?.limitedEditions ?? 0)} />
          </Reveal>
        </div>
      </header>

      <div className="sticky top-[68px] z-30 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => update("category", item)}
                className={cn(
                  "relative whitespace-nowrap px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                  category === item ? "text-white" : "text-white/40 hover:text-white/80",
                )}
              >
                {item}
                {category === item ? (
                  <span className="absolute inset-x-3 bottom-0 h-px bg-red-batel" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => update("filter", item.key)}
                  className={cn(
                    "whitespace-nowrap border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                    filter === item.key
                      ? "border-red-batel bg-red-batel/10 text-white"
                      : "border-white/12 text-white/45 hover:border-white/30 hover:text-white",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="SEARCH…"
              className="h-9 w-full border border-white/12 bg-black px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white placeholder:text-white/25 focus:border-red-batel focus:outline-none sm:w-40"
            />
          </div>
        </div>
      </div>

      <section className="bg-black py-12 sm:py-16">
        <div className="container">
          {products === undefined ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse-soft">
                  <div className="aspect-[4/5] border border-white/10 bg-white/[0.03]" />
                  <div className="mt-4 h-3 w-2/3 bg-white/[0.05]" />
                  <div className="mt-2 h-2 w-1/3 bg-white/[0.04]" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-white/10 px-6 py-20 text-center">
              <p className="font-display text-2xl uppercase tracking-wide text-white">
                Nothing in this cut yet
              </p>
              <p className="mt-3 text-[13px] text-white/45">
                Try another category, or check the limited editions.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">{label}</span>
      <span className="ml-3 font-mono text-[12px] text-white">{value}</span>
    </div>
  );
}
