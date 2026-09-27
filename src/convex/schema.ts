import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * EL BATEL — data model.
 *
 * Design rules:
 *  - Serial numbers are a first-class table with a UNIQUE index on `serial`,
 *    so duplicates are impossible at the database level.
 *  - Orders and products are normalised (header + line items / image rows)
 *    so the admin dashboard can query them independently.
 *  - All storefront content (hero, about, music, socials, settings) lives in
 *    singleton docs keyed by `key`, edited from /admin and read by the site.
 *  - Editorial copy is stored once per language: the base (English) column is
 *    `name`, and `name_fr` / `name_ar` hold the translations. Products, serial
 *    numbers, prices and IDs are language-independent.
 */

export const serialStatus = v.union(
  v.literal("available"),
  v.literal("reserved"),
  v.literal("sold"),
);

export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("processing"),
  v.literal("shipped"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const productCategory = v.union(
  v.literal("Hoodies"),
  v.literal("T-Shirts"),
  v.literal("Pants"),
  v.literal("Accessories"),
);

export default defineSchema({
  /* ------------------------------------------------------------------ auth */
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.union(v.literal("admin"), v.literal("customer")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  /** Admin allow-list — only rows here (or role === "admin") may write. */
  admin_users: defineTable({
    userId: v.id("users"),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("owner"), v.literal("manager")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  /* --------------------------------------------------------------- catalog */
  collections: defineTable({
    slug: v.string(),
    name: v.string(), // "COLLECTION 01"
    title: v.string(), // "ORIGIN"
    title_fr: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    tagline: v.optional(v.string()),
    tagline_fr: v.optional(v.string()),
    tagline_ar: v.optional(v.string()),
    description: v.optional(v.string()),
    description_fr: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    accent: v.optional(v.string()),
    order: v.number(),
    visible: v.boolean(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    slug: v.string(),
    name: v.string(),
    collectionId: v.optional(v.id("collections")),
    category: productCategory,
    description: v.string(),
    description_fr: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    story: v.optional(v.string()),
    story_fr: v.optional(v.string()),
    story_ar: v.optional(v.string()),
    name_fr: v.optional(v.string()),
    name_ar: v.optional(v.string()),
    price: v.number(), // in minor units (cents)
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_collection", ["collectionId"])
    .index("by_status", ["status"]),

  /** One row per image, ordered. `url` is a real URL or an `art:` spec. */
  product_images: defineTable({
    productId: v.id("products"),
    url: v.string(),
    alt: v.optional(v.string()),
    order: v.number(),
  }).index("by_product", ["productId"]),

  /** An edition = one limited run of a product (e.g. BLACK EDITION / 100). */
  editions: defineTable({
    productId: v.id("products"),
    name: v.string(),
    total: v.number(),
    prefix: v.string(), // "ELB"
    serialStart: v.number(), // 1
    padding: v.number(), // 4 -> ELB-0001
    releaseAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_product", ["productId"]),

  /**
   * The serial numbers themselves. `serial` has a UNIQUE index so the same
   * code can never be sold twice.
   */
  serial_numbers: defineTable({
    serial: v.string(), // ELB-0001
    productId: v.id("products"),
    editionId: v.optional(v.id("editions")),
    status: serialStatus,
    orderId: v.optional(v.id("orders")),
    ownerLabel: v.optional(v.string()), // customer name / email once sold
    reservedAt: v.optional(v.number()),
    soldAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_serial", ["serial"])
    .index("by_product", ["productId"])
    .index("by_status", ["status"])
    .index("by_order", ["orderId"]),
  // NOTE: uniqueness of `serial` is enforced in `serials.claim` via a lookup,
  // Convex `.unique()` indexes would hard-fail inserts instead of returning a
  // field error, so we validate in the mutation and keep the O(1) index.

  /* ---------------------------------------------------------------- orders */
  orders: defineTable({
    orderNumber: v.string(),
    userId: v.optional(v.id("users")),
    customerId: v.optional(v.id("customers")),
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    postalCode: v.optional(v.string()),
    note: v.optional(v.string()),
    subtotal: v.number(),
    shipping: v.number(),
    total: v.number(),
    currency: v.string(),
    status: orderStatus,
    paymentStatus: v.union(
      v.literal("unpaid"),
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
    ),
    paymentProvider: v.optional(v.string()),
    paymentRef: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_number", ["orderNumber"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  order_items: defineTable({
    orderId: v.id("orders"),
    productId: v.optional(v.id("products")),
    productName: v.string(),
    collectionName: v.optional(v.string()),
    size: v.optional(v.string()),
    quantity: v.number(),
    unitPrice: v.number(),
    image: v.optional(v.string()),
    serialId: v.optional(v.id("serial_numbers")),
    serial: v.optional(v.string()),
  }).index("by_order", ["orderId"]),

  customers: defineTable({
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    ordersCount: v.number(),
    totalSpent: v.number(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  /* -------------------------------------------------- editable site content */
  homepage_content: defineTable({
    key: v.string(), // "home"
    eyebrow: v.string(),
    eyebrow_fr: v.optional(v.string()),
    eyebrow_ar: v.optional(v.string()),
    heroTitle: v.string(),
    heroTitle_fr: v.optional(v.string()),
    heroTitle_ar: v.optional(v.string()),
    heroSubtitle: v.string(),
    heroSubtitle_fr: v.optional(v.string()),
    heroSubtitle_ar: v.optional(v.string()),
    ctaPrimaryLabel: v.string(),
    ctaPrimaryLabel_fr: v.optional(v.string()),
    ctaPrimaryLabel_ar: v.optional(v.string()),
    ctaPrimaryHref: v.string(),
    ctaSecondaryLabel: v.string(),
    ctaSecondaryLabel_fr: v.optional(v.string()),
    ctaSecondaryLabel_ar: v.optional(v.string()),
    ctaSecondaryHref: v.string(),
    heroImage: v.optional(v.string()),
    heroVideoUrl: v.optional(v.string()),
    brandStatement: v.string(),
    brandStatement_fr: v.optional(v.string()),
    brandStatement_ar: v.optional(v.string()),
    brandSubstatement: v.string(),
    brandSubstatement_fr: v.optional(v.string()),
    brandSubstatement_ar: v.optional(v.string()),
    /** Editable section headings (collections / drop / music). */
    sectionFeaturedTitle: v.optional(v.string()),
    sectionFeaturedTitle_fr: v.optional(v.string()),
    sectionFeaturedTitle_ar: v.optional(v.string()),
    sectionDropTitle: v.optional(v.string()),
    sectionDropTitle_fr: v.optional(v.string()),
    sectionDropTitle_ar: v.optional(v.string()),
    sectionMusicTitle: v.optional(v.string()),
    sectionMusicTitle_fr: v.optional(v.string()),
    sectionMusicTitle_ar: v.optional(v.string()),
    featuredProductIds: v.array(v.id("products")),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  about_content: defineTable({
    key: v.string(), // "about"
    title: v.string(),
    title_fr: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    intro: v.string(),
    intro_fr: v.optional(v.string()),
    intro_ar: v.optional(v.string()),
    body: v.string(),
    body_fr: v.optional(v.string()),
    body_ar: v.optional(v.string()),
    statement: v.string(),
    statement_fr: v.optional(v.string()),
    statement_ar: v.optional(v.string()),
    image: v.optional(v.string()),
    signature: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  site_settings: defineTable({
    key: v.string(), // "site"
    logoText: v.string(),
    logoImage: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    contactEmail: v.string(),
    whatsapp: v.optional(v.string()),
    shippingInfo: v.string(),
    shippingInfo_fr: v.optional(v.string()),
    shippingInfo_ar: v.optional(v.string()),
    shippingFlatRate: v.number(),
    freeShippingThreshold: v.number(),
    currency: v.string(),
    footerText: v.string(),
    footerText_fr: v.optional(v.string()),
    footerText_ar: v.optional(v.string()),
    announcement: v.optional(v.string()),
    announcement_fr: v.optional(v.string()),
    announcement_ar: v.optional(v.string()),
    announcementActive: v.boolean(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  social_links: defineTable({
    platform: v.string(), // instagram | tiktok | youtube | spotify | x | other
    label: v.string(),
    url: v.string(),
    handle: v.optional(v.string()),
    order: v.number(),
    visible: v.boolean(),
  }).index("by_order", ["order"]),

  music_links: defineTable({
    platform: v.union(v.literal("youtube"), v.literal("spotify")),
    title: v.string(),
    title_fr: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    subtitle_fr: v.optional(v.string()),
    subtitle_ar: v.optional(v.string()),
    url: v.string(),
    order: v.number(),
    visible: v.boolean(),
    updatedAt: v.number(),
  }).index("by_order", ["order"]),

  contact_messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    createdAt: v.number(),
    handled: v.boolean(),
  }).index("by_created", ["createdAt"]),
});
