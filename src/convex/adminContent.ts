import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

/** Everything the admin dashboard needs to prefill its content forms. */
export const adminContent = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const home = await ctx.db
      .query("homepage_content")
      .withIndex("by_key", (q) => q.eq("key", "home"))
      .first();
    const about = await ctx.db
      .query("about_content")
      .withIndex("by_key", (q) => q.eq("key", "about"))
      .first();
    const settings = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();
    const socials = (await ctx.db.query("social_links").collect()).sort(
      (a, b) => a.order - b.order,
    );
    const music = (await ctx.db.query("music_links").collect()).sort((a, b) => a.order - b.order);
    const messages = await ctx.db.query("contact_messages").collect();
    return {
      home,
      about,
      settings,
      socials,
      music,
      messages: messages.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50),
    };
  },
});

export const updateHomepage = mutation({
  args: {
    token: v.string(),
    eyebrow: v.optional(v.string()),
    heroTitle: v.optional(v.string()),
    heroSubtitle: v.optional(v.string()),
    ctaPrimaryLabel: v.optional(v.string()),
    ctaPrimaryHref: v.optional(v.string()),
    ctaSecondaryLabel: v.optional(v.string()),
    ctaSecondaryHref: v.optional(v.string()),
    heroImage: v.optional(v.union(v.string(), v.null())),
    heroVideoUrl: v.optional(v.union(v.string(), v.null())),
    brandStatement: v.optional(v.string()),
    brandSubstatement: v.optional(v.string()),
    sectionFeaturedTitle: v.optional(v.string()),
    sectionDropTitle: v.optional(v.string()),
    sectionMusicTitle: v.optional(v.string()),
    /* translations */
    eyebrow_fr: v.optional(v.string()),
    eyebrow_ar: v.optional(v.string()),
    heroTitle_fr: v.optional(v.string()),
    heroTitle_ar: v.optional(v.string()),
    heroSubtitle_fr: v.optional(v.string()),
    heroSubtitle_ar: v.optional(v.string()),
    ctaPrimaryLabel_fr: v.optional(v.string()),
    ctaPrimaryLabel_ar: v.optional(v.string()),
    ctaSecondaryLabel_fr: v.optional(v.string()),
    ctaSecondaryLabel_ar: v.optional(v.string()),
    brandStatement_fr: v.optional(v.string()),
    brandStatement_ar: v.optional(v.string()),
    brandSubstatement_fr: v.optional(v.string()),
    brandSubstatement_ar: v.optional(v.string()),
    sectionFeaturedTitle_fr: v.optional(v.string()),
    sectionFeaturedTitle_ar: v.optional(v.string()),
    sectionDropTitle_fr: v.optional(v.string()),
    sectionDropTitle_ar: v.optional(v.string()),
    sectionMusicTitle_fr: v.optional(v.string()),
    sectionMusicTitle_ar: v.optional(v.string()),
    featuredProductIds: v.optional(v.array(v.id("products"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const existing = await ctx.db
      .query("homepage_content")
      .withIndex("by_key", (q) => q.eq("key", "home"))
      .first();
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const key of [
      "eyebrow",
      "heroTitle",
      "heroSubtitle",
      "ctaPrimaryLabel",
      "ctaPrimaryHref",
      "ctaSecondaryLabel",
      "ctaSecondaryHref",
      "brandStatement",
      "brandSubstatement",
      "sectionFeaturedTitle",
      "sectionDropTitle",
      "sectionMusicTitle",
      "eyebrow_fr",
      "eyebrow_ar",
      "heroTitle_fr",
      "heroTitle_ar",
      "heroSubtitle_fr",
      "heroSubtitle_ar",
      "ctaPrimaryLabel_fr",
      "ctaPrimaryLabel_ar",
      "ctaSecondaryLabel_fr",
      "ctaSecondaryLabel_ar",
      "brandStatement_fr",
      "brandStatement_ar",
      "brandSubstatement_fr",
      "brandSubstatement_ar",
      "sectionFeaturedTitle_fr",
      "sectionFeaturedTitle_ar",
      "sectionDropTitle_fr",
      "sectionDropTitle_ar",
      "sectionMusicTitle_fr",
      "sectionMusicTitle_ar",
    ] as const) {
      const value = args[key];
      if (value !== undefined) patch[key] = value;
    }
    if (args.heroImage !== undefined) {
      patch.heroImage = args.heroImage === null ? undefined : args.heroImage;
    }
    if (args.heroVideoUrl !== undefined) {
      patch.heroVideoUrl = args.heroVideoUrl === null ? undefined : args.heroVideoUrl;
    }
    if (args.featuredProductIds !== undefined) patch.featuredProductIds = args.featuredProductIds;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true };
    }
    await ctx.db.insert("homepage_content", {
      key: "home",
      eyebrow: args.eyebrow ?? "EL BATEL",
      heroTitle: args.heroTitle ?? "WEAR THE CULTURE",
      heroSubtitle: args.heroSubtitle ?? "",
      ctaPrimaryLabel: args.ctaPrimaryLabel ?? "SHOP THE DROP",
      ctaPrimaryHref: args.ctaPrimaryHref ?? "/shop",
      ctaSecondaryLabel: args.ctaSecondaryLabel ?? "EXPLORE EL BATEL",
      ctaSecondaryHref: args.ctaSecondaryHref ?? "/collections",
      brandStatement: args.brandStatement ?? "",
      brandSubstatement: args.brandSubstatement ?? "",
      featuredProductIds: args.featuredProductIds ?? [],
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const updateAbout = mutation({
  args: {
    token: v.string(),
    title: v.optional(v.string()),
    intro: v.optional(v.string()),
    body: v.optional(v.string()),
    statement: v.optional(v.string()),
    title_fr: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    intro_fr: v.optional(v.string()),
    intro_ar: v.optional(v.string()),
    body_fr: v.optional(v.string()),
    body_ar: v.optional(v.string()),
    statement_fr: v.optional(v.string()),
    statement_ar: v.optional(v.string()),
    image: v.optional(v.union(v.string(), v.null())),
    signature: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const existing = await ctx.db
      .query("about_content")
      .withIndex("by_key", (q) => q.eq("key", "about"))
      .first();
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const key of [
      "title",
      "intro",
      "body",
      "statement",
      "title_fr",
      "title_ar",
      "intro_fr",
      "intro_ar",
      "body_fr",
      "body_ar",
      "statement_fr",
      "statement_ar",
    ] as const) {
      const value = args[key];
      if (value !== undefined) patch[key] = value;
    }
    if (args.image !== undefined) patch.image = args.image === null ? undefined : args.image;
    if (args.signature !== undefined) {
      patch.signature = args.signature === null ? undefined : args.signature;
    }
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true };
    }
    await ctx.db.insert("about_content", {
      key: "about",
      title: args.title ?? "EL BATEL",
      intro: args.intro ?? "",
      body: args.body ?? "",
      statement: args.statement ?? "",
      image: args.image ?? undefined,
      signature: args.signature ?? undefined,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const updateSettings = mutation({
  args: {
    token: v.string(),
    logoText: v.optional(v.string()),
    logoImage: v.optional(v.union(v.string(), v.null())),
    faviconUrl: v.optional(v.union(v.string(), v.null())),
    contactEmail: v.optional(v.string()),
    whatsapp: v.optional(v.union(v.string(), v.null())),
    shippingInfo: v.optional(v.string()),
    shippingInfo_fr: v.optional(v.string()),
    shippingInfo_ar: v.optional(v.string()),
    shippingFlatRate: v.optional(v.number()),
    freeShippingThreshold: v.optional(v.number()),
    currency: v.optional(v.string()),
    footerText: v.optional(v.string()),
    footerText_fr: v.optional(v.string()),
    footerText_ar: v.optional(v.string()),
    announcement: v.optional(v.union(v.string(), v.null())),
    announcement_fr: v.optional(v.string()),
    announcement_ar: v.optional(v.string()),
    announcementActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const existing = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const key of [
      "logoText",
      "contactEmail",
      "shippingInfo",
      "shippingInfo_fr",
      "shippingInfo_ar",
      "shippingFlatRate",
      "freeShippingThreshold",
      "currency",
      "footerText",
      "footerText_fr",
      "footerText_ar",
      "announcement_fr",
      "announcement_ar",
      "announcementActive",
    ] as const) {
      const value = args[key];
      if (value !== undefined) patch[key] = value;
    }
    for (const key of ["logoImage", "faviconUrl", "whatsapp", "announcement"] as const) {
      const value = args[key];
      if (value !== undefined) patch[key] = value === null ? undefined : value;
    }
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true };
    }
    await ctx.db.insert("site_settings", {
      key: "site",
      logoText: args.logoText ?? "EL BATEL",
      logoImage: args.logoImage ?? undefined,
      faviconUrl: args.faviconUrl ?? undefined,
      contactEmail: args.contactEmail ?? "hello@elbatel.com",
      whatsapp: args.whatsapp ?? undefined,
      shippingInfo: args.shippingInfo ?? "",
      shippingFlatRate: args.shippingFlatRate ?? 900,
      freeShippingThreshold: args.freeShippingThreshold ?? 20000,
      currency: args.currency ?? "EUR",
      footerText: args.footerText ?? "",
      announcement: args.announcement ?? undefined,
      announcementActive: args.announcementActive ?? false,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const upsertSocialLink = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("social_links")),
    platform: v.string(),
    label: v.string(),
    url: v.string(),
    handle: v.optional(v.string()),
    order: v.number(),
    visible: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const payload = {
      platform: args.platform,
      label: args.label,
      url: args.url,
      handle: args.handle,
      order: args.order,
      visible: args.visible,
    };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return { id: args.id };
    }
    const id = await ctx.db.insert("social_links", payload);
    return { id };
  },
});

export const deleteSocialLink = mutation({
  args: { token: v.string(), id: v.id("social_links") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const upsertMusicLink = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("music_links")),
    platform: v.union(v.literal("youtube"), v.literal("spotify")),
    title: v.string(),
    subtitle: v.optional(v.string()),
    title_fr: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    subtitle_fr: v.optional(v.string()),
    subtitle_ar: v.optional(v.string()),
    url: v.string(),
    order: v.number(),
    visible: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const payload = {
      platform: args.platform,
      title: args.title,
      subtitle: args.subtitle,
      title_fr: args.title_fr,
      title_ar: args.title_ar,
      subtitle_fr: args.subtitle_fr,
      subtitle_ar: args.subtitle_ar,
      url: args.url,
      order: args.order,
      visible: args.visible,
      updatedAt: Date.now(),
    };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return { id: args.id };
    }
    const id = await ctx.db.insert("music_links", payload);
    return { id };
  },
});

export const deleteMusicLink = mutation({
  args: { token: v.string(), id: v.id("music_links") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

/** Public contact form. */
export const sendMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim() || !args.message.trim()) throw new Error("Please fill in every field");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(args.email.trim())) {
      throw new Error("Enter a valid email address");
    }
    await ctx.db.insert("contact_messages", {
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      subject: args.subject,
      message: args.message.trim(),
      createdAt: Date.now(),
      handled: false,
    });
    return { ok: true };
  },
});

export const markMessageHandled = mutation({
  args: { token: v.string(), id: v.id("contact_messages"), handled: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { handled: args.handled });
    return { ok: true };
  },
});
