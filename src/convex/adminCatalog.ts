import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireAdmin, slugify } from "./lib";
import { serialStatsFor } from "./catalog";

const productCategory = v.union(
  v.literal("Hoodies"),
  v.literal("T-Shirts"),
  v.literal("Pants"),
  v.literal("Accessories"),
);

async function uniqueSlug(ctx: MutationCtx, name: string, currentId?: Id<"products">) {
  const base = slugify(name) || `piece-${Date.now().toString(36)}`;
  let candidate = base;
  let n = 2;
  for (;;) {
    const clash = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .first();
    if (!clash || clash._id === currentId) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

async function writeImages(ctx: MutationCtx, productId: Id<"products">, images: string[]) {
  const existing = await ctx.db
    .query("product_images")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  for (const row of existing) await ctx.db.delete(row._id);
  let order = 0;
  for (const url of images.map((i) => i.trim()).filter(Boolean)) {
    await ctx.db.insert("product_images", { productId, url, order });
    order += 1;
  }
}

/* ---------------------------------------------------------------- uploads */

export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.storage.generateUploadUrl();
  },
});

/* --------------------------------------------------------------- products */

export const adminListProducts = query({
  args: { token: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    let products = await ctx.db.query("products").collect();
    if (args.search) {
      const needle = args.search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(needle));
    }
    products.sort((a, b) => b.createdAt - a.createdAt);
    return await Promise.all(
      products.map(async (p) => {
        const images = await ctx.db
          .query("product_images")
          .withIndex("by_product", (q) => q.eq("productId", p._id))
          .collect();
        const edition = await ctx.db
          .query("editions")
          .withIndex("by_product", (q) => q.eq("productId", p._id))
          .first();
        const stats = await serialStatsFor(ctx, p._id);
        const collection = p.collectionId ? await ctx.db.get(p.collectionId) : null;
        return {
          id: p._id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          description: p.description,
          story: p.story ?? null,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          sizes: p.sizes,
          quantity: p.quantity,
          material: p.material ?? null,
          color: p.color ?? null,
          care: p.care ?? null,
          limited: p.limited,
          featured: p.featured,
          isNew: p.isNew,
          status: p.status,
          dropDate: p.dropDate ?? null,
          collectionId: p.collectionId ?? null,
          collectionName: collection?.name ?? null,
          images: images.sort((a, b) => a.order - b.order).map((i) => i.url),
          edition: edition
            ? {
                id: edition._id,
                name: edition.name,
                total: edition.total,
                prefix: edition.prefix,
                serialStart: edition.serialStart,
                padding: edition.padding,
              }
            : null,
          serials: stats,
        };
      }),
    );
  },
});

export const createProduct = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    name_fr: v.optional(v.string()),
    name_ar: v.optional(v.string()),
    collectionId: v.optional(v.id("collections")),
    category: productCategory,
    description: v.string(),
    description_fr: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    story: v.optional(v.string()),
    story_fr: v.optional(v.string()),
    story_ar: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    sizes: v.array(v.string()),
    quantity: v.number(),
    material: v.optional(v.string()),
    material_fr: v.optional(v.string()),
    material_ar: v.optional(v.string()),
    color: v.optional(v.string()),
    color_fr: v.optional(v.string()),
    color_ar: v.optional(v.string()),
    care: v.optional(v.string()),
    care_fr: v.optional(v.string()),
    care_ar: v.optional(v.string()),
    limited: v.boolean(),
    featured: v.boolean(),
    isNew: v.boolean(),
    status: v.union(v.literal("draft"), v.literal("active")),
    dropDate: v.optional(v.number()),
    images: v.array(v.string()),
    editionName: v.optional(v.string()),
    editionTotal: v.optional(v.number()),
    serialPrefix: v.optional(v.string()),
    serialStart: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.name);
    const productId = await ctx.db.insert("products", {
      slug,
      name: args.name.trim(),
      name_fr: args.name_fr,
      name_ar: args.name_ar,
      collectionId: args.collectionId,
      category: args.category,
      description: args.description,
      description_fr: args.description_fr,
      description_ar: args.description_ar,
      story: args.story,
      story_fr: args.story_fr,
      story_ar: args.story_ar,
      price: Math.max(0, Math.round(args.price)),
      compareAtPrice: args.compareAtPrice,
      sizes: args.sizes,
      quantity: Math.max(0, Math.round(args.quantity)),
      material: args.material,
      material_fr: args.material_fr,
      material_ar: args.material_ar,
      color: args.color,
      color_fr: args.color_fr,
      color_ar: args.color_ar,
      care: args.care,
      care_fr: args.care_fr,
      care_ar: args.care_ar,
      limited: args.limited,
      featured: args.featured,
      isNew: args.isNew,
      status: args.status,
      dropDate: args.dropDate,
      createdAt: now,
      updatedAt: now,
    });
    await writeImages(ctx, productId, args.images);

    if (args.limited) {
      const total = Math.max(1, Math.round(args.editionTotal ?? args.quantity ?? 1));
      const prefix = (args.serialPrefix ?? "ELB").trim().toUpperCase() || "ELB";
      const editionId = await ctx.db.insert("editions", {
        productId,
        name: args.editionName?.trim() || `${args.name.trim()} — LIMITED EDITION`,
        total,
        prefix,
        serialStart: Math.max(1, Math.round(args.serialStart ?? 1)),
        padding: 4,
        createdAt: now,
      });
      const start = Math.max(1, Math.round(args.serialStart ?? 1));
      for (let i = 0; i < total; i += 1) {
        const serial = `${prefix}-${String(start + i).padStart(4, "0")}`;
        const clash = await ctx.db
          .query("serial_numbers")
          .withIndex("by_serial", (q) => q.eq("serial", serial))
          .first();
        if (clash) continue;
        await ctx.db.insert("serial_numbers", {
          serial,
          productId,
          editionId,
          status: "available",
          createdAt: now,
        });
      }
    }
    return { productId, slug };
  },
});

export const updateProduct = mutation({
  args: {
    token: v.string(),
    productId: v.id("products"),
    name: v.optional(v.string()),
    name_fr: v.optional(v.string()),
    name_ar: v.optional(v.string()),
    collectionId: v.optional(v.union(v.id("collections"), v.null())),
    category: v.optional(productCategory),
    description: v.optional(v.string()),
    description_fr: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    story: v.optional(v.string()),
    story_fr: v.optional(v.string()),
    story_ar: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.union(v.number(), v.null())),
    sizes: v.optional(v.array(v.string())),
    quantity: v.optional(v.number()),
    material: v.optional(v.string()),
    material_fr: v.optional(v.string()),
    material_ar: v.optional(v.string()),
    color: v.optional(v.string()),
    color_fr: v.optional(v.string()),
    color_ar: v.optional(v.string()),
    care: v.optional(v.string()),
    care_fr: v.optional(v.string()),
    care_ar: v.optional(v.string()),
    limited: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"))),
    dropDate: v.optional(v.union(v.number(), v.null())),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      patch.name = args.name.trim();
      patch.slug = await uniqueSlug(ctx, args.name, args.productId);
    }
    if (args.collectionId !== undefined) {
      patch.collectionId = args.collectionId === null ? undefined : args.collectionId;
    }
    if (args.category !== undefined) patch.category = args.category;
    if (args.description !== undefined) patch.description = args.description;
    if (args.description_fr !== undefined) patch.description_fr = args.description_fr;
    if (args.description_ar !== undefined) patch.description_ar = args.description_ar;
    if (args.story !== undefined) patch.story = args.story;
    if (args.story_fr !== undefined) patch.story_fr = args.story_fr;
    if (args.story_ar !== undefined) patch.story_ar = args.story_ar;
    if (args.name_fr !== undefined) patch.name_fr = args.name_fr;
    if (args.name_ar !== undefined) patch.name_ar = args.name_ar;
    if (args.price !== undefined) patch.price = Math.max(0, Math.round(args.price));
    if (args.compareAtPrice !== undefined) {
      patch.compareAtPrice = args.compareAtPrice === null ? undefined : args.compareAtPrice;
    }
    if (args.sizes !== undefined) patch.sizes = args.sizes;
    if (args.quantity !== undefined) patch.quantity = Math.max(0, Math.round(args.quantity));
    if (args.material !== undefined) patch.material = args.material;
    if (args.material_fr !== undefined) patch.material_fr = args.material_fr;
    if (args.material_ar !== undefined) patch.material_ar = args.material_ar;
    if (args.color !== undefined) patch.color = args.color;
    if (args.color_fr !== undefined) patch.color_fr = args.color_fr;
    if (args.color_ar !== undefined) patch.color_ar = args.color_ar;
    if (args.care !== undefined) patch.care = args.care;
    if (args.care_fr !== undefined) patch.care_fr = args.care_fr;
    if (args.care_ar !== undefined) patch.care_ar = args.care_ar;
    if (args.limited !== undefined) patch.limited = args.limited;
    if (args.featured !== undefined) patch.featured = args.featured;
    if (args.isNew !== undefined) patch.isNew = args.isNew;
    if (args.status !== undefined) patch.status = args.status;
    if (args.dropDate !== undefined) {
      patch.dropDate = args.dropDate === null ? undefined : args.dropDate;
    }
    await ctx.db.patch(args.productId, patch);
    if (args.images) await writeImages(ctx, args.productId, args.images);
    return { ok: true };
  },
});

export const deleteProduct = mutation({
  args: { token: v.string(), productId: v.id("products"), force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const serials = await ctx.db
      .query("serial_numbers")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    const sold = serials.filter((s) => s.status === "sold");
    if (sold.length > 0 && !args.force) {
      throw new Error(
        `${sold.length} serial number(s) of this piece are already sold. Archive it instead (set status to draft).`,
      );
    }
    for (const row of await ctx.db
      .query("product_images")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db
      .query("editions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of serials) await ctx.db.delete(row._id);
    await ctx.db.delete(args.productId);
    return { ok: true };
  },
});

/* ------------------------------------------------------------ collections */

export const adminListCollections = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const rows = await ctx.db.query("collections").collect();
    rows.sort((a, b) => a.order - b.order);
    return await Promise.all(
      rows.map(async (c) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_collection", (q) => q.eq("collectionId", c._id))
          .collect();
        return {
          id: c._id,
          slug: c.slug,
          name: c.name,
          title: c.title,
          tagline: c.tagline ?? null,
          description: c.description ?? null,
          coverImage: c.coverImage ?? null,
          visible: c.visible,
          order: c.order,
          productCount: products.length,
        };
      }),
    );
  },
});

export const upsertCollection = mutation({
  args: {
    token: v.string(),
    collectionId: v.optional(v.id("collections")),
    name: v.string(),
    title: v.string(),
    title_fr: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    tagline: v.optional(v.string()),
    tagline_fr: v.optional(v.string()),
    tagline_ar: v.optional(v.string()),
    description: v.optional(v.string()),
    description_fr: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    visible: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    if (args.collectionId) {
      const patch: Record<string, unknown> = {
        name: args.name.trim(),
        title: args.title.trim(),
        title_fr: args.title_fr,
        title_ar: args.title_ar,
        tagline: args.tagline,
        tagline_fr: args.tagline_fr,
        tagline_ar: args.tagline_ar,
        description: args.description,
        description_fr: args.description_fr,
        description_ar: args.description_ar,
        coverImage: args.coverImage,
        visible: args.visible,
        order: args.order,
      };
      await ctx.db.patch(args.collectionId, patch);
      return { collectionId: args.collectionId };
    }
    let slug = slugify(args.title || args.name) || `collection-${Date.now().toString(36)}`;
    let n = 2;
    for (;;) {
      const clash = await ctx.db
        .query("collections")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!clash) break;
      slug = `${slugify(args.title || args.name)}-${n}`;
      n += 1;
    }
    const collectionId = await ctx.db.insert("collections", {
      slug,
      name: args.name.trim(),
      title: args.title.trim(),
      title_fr: args.title_fr,
      title_ar: args.title_ar,
      tagline: args.tagline,
      tagline_fr: args.tagline_fr,
      tagline_ar: args.tagline_ar,
      description: args.description,
      description_fr: args.description_fr,
      description_ar: args.description_ar,
      coverImage: args.coverImage,
      order: args.order,
      visible: args.visible,
      createdAt: Date.now(),
    });
    return { collectionId };
  },
});

export const deleteCollection = mutation({
  args: { token: v.string(), collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const products = await ctx.db
      .query("products")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.collectionId))
      .collect();
    for (const product of products) {
      await ctx.db.patch(product._id, { collectionId: undefined, updatedAt: Date.now() });
    }
    await ctx.db.delete(args.collectionId);
    return { ok: true };
  },
});
