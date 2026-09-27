import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

/* ------------------------------------------------------------------ helpers */

/** The three languages the storefront speaks. */
export type Lang = "en" | "fr" | "ar";

export const langArg = v.optional(
  v.union(v.literal("en"), v.literal("fr"), v.literal("ar")),
);

/**
 * Pick the visitor's language for a piece of editorial copy. Anything not
 * translated yet falls back to the English column, so a half-filled catalogue
 * still renders correctly.
 */
export function pick(
  lang: Lang | undefined,
  base: string,
  fr?: string | null,
  ar?: string | null,
): string {
  const value = lang === "ar" ? ar : lang === "fr" ? fr : base;
  return value && value.trim() ? value : base;
}

export function pickOptional(
  lang: Lang | undefined,
  base?: string | null,
  fr?: string | null,
  ar?: string | null,
): string | null {
  const value = lang === "ar" ? ar : lang === "fr" ? fr : base;
  if (value && value.trim()) return value;
  return base && base.trim() ? base : null;
}

/** `art:` specs pass through; uploaded files are resolved to a storage URL. */
export async function resolveImageUrl(ctx: QueryCtx, url: string): Promise<string> {
  if (url.startsWith("storage:")) {
    const id = url.slice("storage:".length);
    return (await ctx.storage.getUrl(id as Id<"_storage">)) ?? "";
  }
  return url;
}

export async function imagesFor(ctx: QueryCtx, productId: Id<"products">) {
  const rows = await ctx.db
    .query("product_images")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  return await Promise.all(
    rows.sort((a, b) => a.order - b.order).map((r) => resolveImageUrl(ctx, r.url)),
  );
}

export async function serialStatsFor(ctx: QueryCtx, productId: Id<"products">) {
  const rows = await ctx.db
    .query("serial_numbers")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  const available = rows.filter((r) => r.status === "available");
  available.sort((a, b) => a.serial.localeCompare(b.serial));
  return {
    total: rows.length,
    available: available.length,
    reserved: rows.filter((r) => r.status === "reserved").length,
    sold: rows.filter((r) => r.status === "sold").length,
    lowestAvailable: available[0]?.serial ?? null,
    lowestAvailableId: available[0]?._id ?? null,
  };
}

/** Editorial copy resolved for one language. */
export type ProductText = {
  name: string;
  description: string;
  story: string | null;
  material: string | null;
  color: string | null;
  care: string | null;
};

type ProductBundle = {
  product: Doc<"products">;
  text: ProductText;
  images: string[];
  collection: { id: Id<"collections">; name: string; title: string; slug: string } | null;
  edition: { id: Id<"editions">; name: string; total: number; prefix: string } | null;
  stats: Awaited<ReturnType<typeof serialStatsFor>>;
};

async function bundle(
  ctx: QueryCtx,
  product: Doc<"products">,
  lang?: Lang,
): Promise<ProductBundle> {
  const [images, collection, edition, stats] = await Promise.all([
    imagesFor(ctx, product._id),
    product.collectionId ? ctx.db.get(product.collectionId) : Promise.resolve(null),
    ctx.db
      .query("editions")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .first(),
    serialStatsFor(ctx, product._id),
  ]);
  return {
    product,
    text: {
      name: pick(lang, product.name, product.name_fr, product.name_ar),
      description: pick(lang, product.description, product.description_fr, product.description_ar),
      story: pickOptional(lang, product.story, product.story_fr, product.story_ar),
      material: pickOptional(lang, product.material, product.material_fr, product.material_ar),
      color: pickOptional(lang, product.color, product.color_fr, product.color_ar),
      care: pickOptional(lang, product.care, product.care_fr, product.care_ar),
    },
    images,
    collection: collection
      ? {
          id: collection._id,
          name: collection.name,
          title: pick(lang, collection.title, collection.title_fr, collection.title_ar),
          slug: collection.slug,
        }
      : null,
    edition: edition
      ? { id: edition._id, name: edition.name, total: edition.total, prefix: edition.prefix }
      : null,
    stats,
  };
}

function toCard(b: ProductBundle) {
  const p = b.product;
  return {
    id: p._id,
    slug: p.slug,
    name: b.text.name,
    category: p.category,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    sizes: p.sizes,
    quantity: p.quantity,
    limited: p.limited,
    featured: p.featured,
    isNew: p.isNew,
    dropDate: p.dropDate ?? null,
    colors: b.text.color,
    images: b.images,
    collection: b.collection,
    edition: b.edition,
    available: p.limited ? b.stats.available : p.quantity,
    editionSize: b.edition?.total ?? null,
    lowestSerial: b.stats.lowestAvailable,
  };
}

export type ProductCard = ReturnType<typeof toCard>;

/* ------------------------------------------------------------------ catalog */

export const listCollections = query({
  args: { includeHidden: v.optional(v.boolean()), lang: langArg },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("collections").collect();
    return rows
      .filter((r) => args.includeHidden || r.visible)
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        id: c._id,
        slug: c.slug,
        name: c.name,
        title: pick(args.lang, c.title, c.title_fr, c.title_ar),
        tagline: pickOptional(args.lang, c.tagline, c.tagline_fr, c.tagline_ar),
        description: pickOptional(args.lang, c.description, c.description_fr, c.description_ar),
        coverImage: c.coverImage ?? null,
        visible: c.visible,
        order: c.order,
      }));
  },
});

export type CollectionSummary = {
  id: Id<"collections">;
  slug: string;
  name: string;
  title: string;
  tagline: string | null;
  description: string | null;
  coverImage: string | null;
  visible: boolean;
  order: number;
};

export const getCollection = query({
  args: { slug: v.string(), lang: langArg },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query("collections")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!collection) return null;
    const products = await ctx.db
      .query("products")
      .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
      .collect();
    const active = products.filter((p) => p.status === "active");
    const bundles = await Promise.all(active.map((p) => bundle(ctx, p, args.lang)));
    return {
      id: collection._id,
      slug: collection.slug,
      name: collection.name,
      title: pick(args.lang, collection.title, collection.title_fr, collection.title_ar),
      tagline: pickOptional(args.lang, collection.tagline, collection.tagline_fr, collection.tagline_ar),
      description: pickOptional(
        args.lang,
        collection.description,
        collection.description_fr,
        collection.description_ar,
      ),
      coverImage: collection.coverImage ?? null,
      visible: collection.visible,
      order: collection.order,
      products: bundles.map(toCard),
    };
  },
});

export const listProducts = query({
  args: {
    category: v.optional(v.string()),
    collectionSlug: v.optional(v.string()),
    filter: v.optional(
      v.union(v.literal("all"), v.literal("limited"), v.literal("new"), v.literal("featured")),
    ),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    lang: langArg,
  },
  handler: async (ctx, args) => {
    let rows = await ctx.db.query("products").collect();
    rows = rows.filter((p) => p.status === "active");

    if (args.category && args.category !== "all") {
      rows = rows.filter((p) => p.category === args.category);
    }
    if (args.collectionSlug) {
      const collection = await ctx.db
        .query("collections")
        .withIndex("by_slug", (q) => q.eq("slug", args.collectionSlug as string))
        .first();
      rows = collection ? rows.filter((p) => p.collectionId === collection._id) : [];
    }
    if (args.filter === "limited") rows = rows.filter((p) => p.limited);
    if (args.filter === "new") rows = rows.filter((p) => p.isNew);
    if (args.filter === "featured") rows = rows.filter((p) => p.featured);
    if (args.search) {
      const needle = args.search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle),
      );
    }
    rows.sort((a, b) => b.createdAt - a.createdAt);
    if (args.limit) rows = rows.slice(0, args.limit);

    const bundles = await Promise.all(rows.map((p) => bundle(ctx, p, args.lang)));
    return bundles.map(toCard);
  },
});

export const getProduct = query({
  args: { slug: v.string(), lang: langArg },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!product || product.status !== "active") return null;
    const b = await bundle(ctx, product, args.lang);
    const serials = await ctx.db
      .query("serial_numbers")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    serials.sort((a, b2) => a.serial.localeCompare(b2.serial));
    const related = (await ctx.db.query("products").withIndex("by_collection", (q) =>
      product.collectionId
        ? q.eq("collectionId", product.collectionId)
        : q.eq("collectionId", undefined as never),
    )
      .collect())
      .filter((p) => p._id !== product._id && p.status === "active")
      .slice(0, 3);
    const relatedBundles = await Promise.all(related.map((p) => bundle(ctx, p, args.lang)));

    return {
      id: product._id,
      slug: product.slug,
      name: b.text.name,
      category: product.category,
      description: b.text.description,
      story: b.text.story,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? null,
      sizes: product.sizes,
      quantity: product.quantity,
      material: b.text.material,
      color: b.text.color,
      care: b.text.care,
      limited: product.limited,
      isNew: product.isNew,
      featured: product.featured,
      dropDate: product.dropDate ?? null,
      images: b.images,
      collection: b.collection,
      edition: b.edition,
      stats: b.stats,
      serials: serials.map((s) => ({
        id: s._id,
        serial: s.serial,
        status: s.status,
      })),
      related: relatedBundles.map(toCard),
    };
  },
});

export const getDrop = query({
  args: { lang: langArg },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const now = Date.now();
    const upcoming = products
      .filter((p) => p.status === "active" && p.dropDate && p.dropDate > now)
      .sort((a, b) => (a.dropDate ?? 0) - (b.dropDate ?? 0));
    const target = upcoming[0];
    if (!target) {
      const limited = products.filter((p) => p.status === "active" && p.limited);
      limited.sort((a, b) => b.createdAt - a.createdAt);
      const fallback = limited[0];
      if (!fallback) return null;
      const b = await bundle(ctx, fallback, args.lang);
      return { card: toCard(b), dropDate: null as number | null, active: true };
    }
    const b = await bundle(ctx, target, args.lang);
    return { card: toCard(b), dropDate: target.dropDate ?? null, active: false };
  },
});

/* --------------------------------------------------------- editable content */

export const getHome = query({
  args: { lang: langArg },
  handler: async (ctx, args) => {
    const lang = args.lang;
    const home =
      (await ctx.db
        .query("homepage_content")
        .withIndex("by_key", (q) => q.eq("key", "home"))
        .first()) ?? null;
    const settings =
      (await ctx.db
        .query("site_settings")
        .withIndex("by_key", (q) => q.eq("key", "site"))
        .first()) ?? null;
    const about =
      (await ctx.db
        .query("about_content")
        .withIndex("by_key", (q) => q.eq("key", "about"))
        .first()) ?? null;
    const socials = (await ctx.db.query("social_links").collect())
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order);
    const music = (await ctx.db.query("music_links").collect())
      .filter((m) => m.visible)
      .sort((a, b) => a.order - b.order);
    const collections = (await ctx.db.query("collections").collect())
      .filter((c) => c.visible)
      .sort((a, b) => a.order - b.order);

    const featuredIds = home?.featuredProductIds ?? [];
    const featuredDocs = (await Promise.all(featuredIds.map((id) => ctx.db.get(id)))).filter(
      (p): p is Doc<"products"> => !!p && p.status === "active",
    );
    let featured = (await Promise.all(featuredDocs.map((p) => bundle(ctx, p, lang)))).map(toCard);
    if (featured.length === 0) {
      const latest = (await ctx.db.query("products").collect())
        .filter((p) => p.status === "active")
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4);
      featured = (await Promise.all(latest.map((p) => bundle(ctx, p, lang)))).map(toCard);
    }

    const newest = (await ctx.db.query("products").collect())
      .filter((p) => p.status === "active" && p.isNew)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);
    const newestCards = (await Promise.all(newest.map((p) => bundle(ctx, p, lang)))).map(toCard);

    return {
      home: home
        ? {
            eyebrow: pick(lang, home.eyebrow, home.eyebrow_fr, home.eyebrow_ar),
            heroTitle: pick(lang, home.heroTitle, home.heroTitle_fr, home.heroTitle_ar),
            heroSubtitle: pick(lang, home.heroSubtitle, home.heroSubtitle_fr, home.heroSubtitle_ar),
            ctaPrimaryLabel: pick(
              lang,
              home.ctaPrimaryLabel,
              home.ctaPrimaryLabel_fr,
              home.ctaPrimaryLabel_ar,
            ),
            ctaPrimaryHref: home.ctaPrimaryHref,
            ctaSecondaryLabel: pick(
              lang,
              home.ctaSecondaryLabel,
              home.ctaSecondaryLabel_fr,
              home.ctaSecondaryLabel_ar,
            ),
            ctaSecondaryHref: home.ctaSecondaryHref,
            heroImage: home.heroImage ?? null,
            heroVideoUrl: home.heroVideoUrl ?? null,
            brandStatement: pick(
              lang,
              home.brandStatement,
              home.brandStatement_fr,
              home.brandStatement_ar,
            ),
            brandSubstatement: pick(
              lang,
              home.brandSubstatement,
              home.brandSubstatement_fr,
              home.brandSubstatement_ar,
            ),
            sectionFeaturedTitle: pick(
              lang,
              home.sectionFeaturedTitle ?? "PIECES IN CIRCULATION",
              home.sectionFeaturedTitle_fr,
              home.sectionFeaturedTitle_ar,
            ),
            sectionDropTitle: pick(
              lang,
              home.sectionDropTitle ?? "THE DROP",
              home.sectionDropTitle_fr,
              home.sectionDropTitle_ar,
            ),
            sectionMusicTitle: pick(
              lang,
              home.sectionMusicTitle ?? "THE SOUND BEHIND THE ARCHIVE",
              home.sectionMusicTitle_fr,
              home.sectionMusicTitle_ar,
            ),
          }
        : null,
      settings: settings
        ? {
            logoText: settings.logoText,
            logoImage: settings.logoImage ?? null,
            contactEmail: settings.contactEmail,
            whatsapp: settings.whatsapp ?? null,
            shippingInfo: pick(
              lang,
              settings.shippingInfo,
              settings.shippingInfo_fr,
              settings.shippingInfo_ar,
            ),
            shippingFlatRate: settings.shippingFlatRate,
            freeShippingThreshold: settings.freeShippingThreshold,
            currency: settings.currency,
            footerText: pick(lang, settings.footerText, settings.footerText_fr, settings.footerText_ar),
            announcement: settings.announcement
              ? pick(lang, settings.announcement, settings.announcement_fr, settings.announcement_ar)
              : null,
            announcementActive: settings.announcementActive,
            faviconUrl: settings.faviconUrl ?? null,
          }
        : null,
      about: about
        ? {
            title: about.title,
            intro: pick(lang, about.intro, about.intro_fr, about.intro_ar),
            body: pick(lang, about.body, about.body_fr, about.body_ar),
            statement: pick(lang, about.statement, about.statement_fr, about.statement_ar),
            image: about.image ?? null,
            signature: about.signature ?? null,
          }
        : null,
      socials: socials.map((s) => ({
        id: s._id,
        platform: s.platform,
        label: s.label,
        url: s.url,
        handle: s.handle ?? null,
      })),
      music: music.map((m) => ({
        id: m._id,
        platform: m.platform,
        title: pick(lang, m.title, m.title_fr, m.title_ar),
        subtitle: pickOptional(lang, m.subtitle, m.subtitle_fr, m.subtitle_ar),
        url: m.url,
      })),
      collections: collections.map((c) => ({
        id: c._id,
        slug: c.slug,
        name: c.name,
        title: pick(lang, c.title, c.title_fr, c.title_ar),
        tagline: pickOptional(lang, c.tagline, c.tagline_fr, c.tagline_ar),
        coverImage: c.coverImage ?? null,
      })),
      featured,
      newest: newestCards,
    };
  },
});

export const getSettings = query({
  args: { lang: langArg },
  handler: async (ctx, args) => {
    const lang = args.lang;
    const settings = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();
    const socials = (await ctx.db.query("social_links").collect())
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order);
    return {
      settings: settings
        ? {
            logoText: settings.logoText,
            logoImage: settings.logoImage ?? null,
            faviconUrl: settings.faviconUrl ?? null,
            contactEmail: settings.contactEmail,
            whatsapp: settings.whatsapp ?? null,
            shippingInfo: pick(
              lang,
              settings.shippingInfo,
              settings.shippingInfo_fr,
              settings.shippingInfo_ar,
            ),
            shippingFlatRate: settings.shippingFlatRate,
            freeShippingThreshold: settings.freeShippingThreshold,
            currency: settings.currency,
            footerText: pick(lang, settings.footerText, settings.footerText_fr, settings.footerText_ar),
            announcement: settings.announcement
              ? pick(lang, settings.announcement, settings.announcement_fr, settings.announcement_ar)
              : null,
            announcementActive: settings.announcementActive,
          }
        : null,
      socials: socials.map((s) => ({
        id: s._id,
        platform: s.platform,
        label: s.label,
        url: s.url,
        handle: s.handle ?? null,
      })),
    };
  },
});

/** Lightweight cross-sell used by the cart drawer. */
export const shopSummary = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const active = products.filter((p) => p.status === "active");
    const limited = active.filter((p) => p.limited);
    let soldOut = 0;
    let availablePieces = 0;
    let soldPieces = 0;
    for (const product of active) {
      const stats = await serialStatsFor(ctx, product._id);
      availablePieces += product.limited ? stats.available : product.quantity;
      soldPieces += stats.sold;
      if (product.limited && stats.available === 0) soldOut += 1;
    }
    return {
      products: active.length,
      limitedEditions: limited.length,
      availablePieces,
      soldPieces,
      soldOut,
    };
  },
});
