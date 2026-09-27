import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { formatSerial } from "./lib";
import { applyTranslations } from "./translations";

type SeedProduct = {
  name: string;
  collectionSlug: string;
  category: "Hoodies" | "T-Shirts" | "Pants" | "Accessories";
  description: string;
  story?: string;
  price: number;
  compareAtPrice?: number;
  sizes: string[];
  quantity: number;
  material: string;
  color: string;
  care: string;
  limited: boolean;
  featured: boolean;
  isNew: boolean;
  dropInDays?: number;
  images: string[];
  edition?: { name: string; total: number; prefix: string; start: number; sold: number };
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "EL BATEL — BLACK EDITION",
    collectionSlug: "limited",
    category: "Hoodies",
    description:
      "The piece the archive is built around. Heavyweight black fleece, boxed silhouette, tonal embroidery on the chest and the edition number printed on the inside of the placket. One hundred pieces exist and the run is closed forever once the last number leaves the studio.",
    story:
      "Cut for the stage and the street. The shoulder is dropped, the body is boxed, the cuffs hold their shape after years of wear.",
    price: 24500,
    compareAtPrice: 29000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    quantity: 100,
    material: "480 gsm brushed cotton fleece, 100% cotton",
    color: "Deep black",
    care: "Machine wash cold, inside out. Do not tumble dry. Cool iron on reverse.",
    limited: true,
    featured: true,
    isNew: true,
    images: ["art:hoodie:black:front", "art:hoodie:black:back", "art:hoodie:black:detail"],
    edition: { name: "BLACK EDITION", total: 100, prefix: "ELB", start: 1, sold: 46 },
  },
  {
    name: "CULTURE HOODIE 001",
    collectionSlug: "origin",
    category: "Hoodies",
    description:
      "The first shape EL BATEL ever put his name on. Garment-dyed fleece with a washed-out finish, ribbed hem and a woven tag stitched into the side seam.",
    price: 14900,
    sizes: ["S", "M", "L", "XL"],
    quantity: 24,
    material: "420 gsm garment-dyed cotton fleece",
    color: "Washed black",
    care: "Machine wash cold with like colours. Line dry.",
    limited: false,
    featured: true,
    isNew: false,
    images: ["art:hoodie:charcoal:front", "art:hoodie:charcoal:back"],
  },
  {
    name: "BLACKOUT OVERSIZED HOODIE",
    collectionSlug: "blackout",
    category: "Hoodies",
    description:
      "Lights-off monochrome. Reflective EL BATEL wordmark across the back that only shows when it catches light — matte in daylight, silver under a flash.",
    price: 17900,
    sizes: ["M", "L", "XL", "XXL"],
    quantity: 150,
    material: "460 gsm loopback cotton with reflective transfer print",
    color: "True black",
    care: "Wash inside out at 30°C. Do not iron the print.",
    limited: false,
    featured: true,
    isNew: true,
    images: ["art:hoodie:black:back", "art:hoodie:black:front"],
  },
  {
    name: "WEAR THE CULTURE TEE",
    collectionSlug: "origin",
    category: "T-Shirts",
    description:
      "The statement piece. Boxy fit, 240 gsm cotton, screen-printed by hand so no two prints land exactly the same way.",
    price: 6500,
    sizes: ["S", "M", "L", "XL", "XXL"],
    quantity: 60,
    material: "240 gsm combed cotton jersey",
    color: "Off-white",
    care: "Machine wash cold. Hang dry. Print stays sharp.",
    limited: false,
    featured: true,
    isNew: false,
    images: ["art:tee:bone:front", "art:tee:bone:back"],
  },
  {
    name: "EL BATEL MONOGRAM TEE",
    collectionSlug: "blackout",
    category: "T-Shirts",
    description:
      "Tonal monogram blown up across the chest, small serialised label at the hem. Black on black, readable only up close.",
    price: 6900,
    sizes: ["S", "M", "L", "XL"],
    quantity: 40,
    material: "250 gsm compact cotton jersey",
    color: "Black",
    care: "Machine wash cold, inside out.",
    limited: false,
    featured: false,
    isNew: true,
    images: ["art:tee:black:front", "art:tee:black:detail"],
  },
  {
    name: "NUMBERED TEE — COLLECTOR RUN",
    collectionSlug: "limited",
    category: "T-Shirts",
    description:
      "One hundred tees, one hundred numbers. The edition number is printed into the hem label and matches the number on your certificate card.",
    price: 8900,
    sizes: ["S", "M", "L", "XL"],
    quantity: 100,
    material: "260 gsm heavyweight cotton jersey",
    color: "Bone",
    care: "Cold wash. Do not bleach.",
    limited: true,
    featured: false,
    isNew: true,
    images: ["art:tee:bone:detail", "art:tee:bone:front"],
    edition: { name: "COLLECTOR RUN", total: 100, prefix: "ELB", start: 1, sold: 71 },
  },
  {
    name: "UNDERGROUND CARGO PANT",
    collectionSlug: "blackout",
    category: "Pants",
    description:
      "Wide-leg cargo in dry cotton twill. Six pockets, hidden webbing strap, adjustable hem toggles.",
    price: 18900,
    sizes: ["28", "30", "32", "34", "36"],
    quantity: 30,
    material: "Dry cotton twill, deadstock hardware",
    color: "Black",
    care: "Machine wash cold. Do not tumble dry.",
    limited: false,
    featured: false,
    isNew: true,
    images: ["art:pants:black:front", "art:pants:black:detail"],
  },
  {
    name: "STUDIO TRACK PANT",
    collectionSlug: "origin",
    category: "Pants",
    description:
      "The pant he records in. Elastic waist, tapered leg, side tape with the EL BATEL lettering running the length of the seam.",
    price: 15900,
    sizes: ["S", "M", "L", "XL"],
    quantity: 22,
    material: "Recycled polyester blend interlock",
    color: "Black / off-white tape",
    care: "Wash at 30°C. Keep away from velcro.",
    limited: false,
    featured: false,
    isNew: false,
    images: ["art:pants:charcoal:front"],
  },
  {
    name: "EL BATEL TAG CAP",
    collectionSlug: "origin",
    category: "Accessories",
    description:
      "Six-panel cap with a laser-cut metal tag on the front and the wordmark embroidered at the back.",
    price: 4900,
    sizes: ["One size"],
    quantity: 45,
    material: "Brushed cotton twill, metal tag",
    color: "Black",
    care: "Spot clean only.",
    limited: false,
    featured: false,
    isNew: false,
    images: ["art:cap:black:front", "art:cap:black:detail"],
  },
  {
    name: "COLLECTOR TOTE — NUMBERED",
    collectionSlug: "limited",
    category: "Accessories",
    description:
      "Heavy canvas tote, studio-grade, number printed next to the handle. Fifty pieces.",
    price: 5900,
    sizes: ["One size"],
    quantity: 50,
    material: "18 oz cotton canvas",
    color: "Bone",
    care: "Hand wash.",
    limited: true,
    featured: false,
    isNew: false,
    images: ["art:bag:bone:front"],
    edition: { name: "NUMBERED TOTE", total: 50, prefix: "ELB", start: 1, sold: 33 },
  },
  {
    name: "EL BATEL — DROP 002",
    collectionSlug: "limited",
    category: "Hoodies",
    description:
      "The next release. Eighty pieces, released one time only, numbered from 0001. Nobody gets a second chance at this one.",
    price: 26500,
    sizes: ["S", "M", "L", "XL", "XXL"],
    quantity: 80,
    material: "500 gsm brushed fleece",
    color: "Black with red stitch detail",
    care: "Machine wash cold, inside out.",
    limited: true,
    featured: true,
    isNew: false,
    dropInDays: 2.4,
    images: ["art:hoodie:black:detail", "art:hoodie:black:front"],
    edition: { name: "DROP 002", total: 80, prefix: "ELB", start: 1, sold: 0 },
  },
  {
    name: "ARCHIVE BEANIE",
    collectionSlug: "blackout",
    category: "Accessories",
    description: "Ribbed beanie with a woven archive label. Cut short so it sits clean.",
    price: 3900,
    sizes: ["One size"],
    quantity: 70,
    material: "Lambswool blend rib",
    color: "Black",
    care: "Hand wash cold.",
    limited: false,
    featured: false,
    isNew: false,
    images: ["art:beanie:black:front"],
  },
];

const COLLECTIONS = [
  {
    slug: "origin",
    name: "COLLECTION 01",
    title: "ORIGIN",
    tagline: "WHERE IT STARTED",
    description:
      "The foundation shapes — the hoodie, the tee, the track pant. Everything else in the archive is a reaction to these.",
    coverImage: "art:hoodie:charcoal:front",
    order: 1,
  },
  {
    slug: "blackout",
    name: "COLLECTION 02",
    title: "BLACKOUT",
    tagline: "MONOCHROME ONLY",
    description:
      "Black on black. Reflective prints, tonal embroidery, hardware that disappears in the dark.",
    coverImage: "art:hoodie:black:back",
    order: 2,
  },
  {
    slug: "limited",
    name: "COLLECTION 03",
    title: "LIMITED",
    tagline: "NUMBERED · NEVER REPEATED",
    description:
      "Numbered editions. Each piece carries its own serial, registered to its owner, closed forever when the run ends.",
    coverImage: "art:tee:bone:detail",
    order: 3,
  },
];

export const seedAll = internalMutation({
  args: {
    adminEmail: v.string(),
    adminName: v.optional(v.string()),
    ownerUserId: v.id("users"),
    reset: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (args.reset) {
      for (const table of [
        "order_items",
        "orders",
        "serial_numbers",
        "editions",
        "product_images",
        "products",
        "collections",
        "customers",
        "homepage_content",
        "about_content",
        "site_settings",
        "social_links",
        "music_links",
        "contact_messages",
      ] as const) {
        for (const row of await ctx.db.query(table).collect()) {
          await ctx.db.delete(row._id);
        }
      }
    } else {
      const existing = await ctx.db.query("products").first();
      if (existing) return { skipped: true };
    }

    const collectionIds: Record<string, string> = {};
    for (const collection of COLLECTIONS) {
      const id = await ctx.db.insert("collections", {
        slug: collection.slug,
        name: collection.name,
        title: collection.title,
        tagline: collection.tagline,
        description: collection.description,
        coverImage: collection.coverImage,
        order: collection.order,
        visible: true,
        createdAt: now,
      });
      collectionIds[collection.slug] = id;
    }

    const productIds: Record<string, string> = {};

    for (const item of PRODUCTS) {
      const slug = item.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      const productId = await ctx.db.insert("products", {
        slug,
        name: item.name,
        collectionId: collectionIds[item.collectionSlug] as Id<"collections">,
        category: item.category,
        description: item.description,
        story: item.story,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        sizes: item.sizes,
        quantity: item.quantity,
        material: item.material,
        color: item.color,
        care: item.care,
        limited: item.limited,
        featured: item.featured,
        isNew: item.isNew,
        status: "active",
        dropDate: item.dropInDays ? now + item.dropInDays * 24 * 60 * 60 * 1000 : undefined,
        createdAt: now,
        updatedAt: now,
      });
      productIds[item.name] = productId;

      let order = 0;
      for (const url of item.images) {
        await ctx.db.insert("product_images", { productId, url, order });
        order += 1;
      }

      if (item.limited && item.edition) {
        const editionId = await ctx.db.insert("editions", {
          productId,
          name: item.edition.name,
          total: item.edition.total,
          prefix: item.edition.prefix,
          serialStart: item.edition.start,
          padding: 4,
          releaseAt: item.dropInDays ? now + item.dropInDays * 24 * 60 * 60 * 1000 : undefined,
          createdAt: now,
        });
        for (let i = 0; i < item.edition.total; i += 1) {
          const number = item.edition.start + i;
          const isSold = i < item.edition.sold;
          await ctx.db.insert("serial_numbers", {
            serial: formatSerial(item.edition.prefix, number, 4),
            productId,
            editionId,
            status: isSold ? "sold" : "available",
            ownerLabel: isSold ? "ARCHIVE · PREVIOUS OWNER" : undefined,
            soldAt: isSold ? now - (item.edition.total - i) * 3600_000 : undefined,
            createdAt: now,
          });
        }
      }
    }

    /* ------------------------------------------------------------- content */
    await ctx.db.insert("homepage_content", {
      key: "home",
      eyebrow: "NUMBERED PIECES · LIMITED RUNS",
      heroTitle: "WEAR THE CULTURE.",
      heroSubtitle:
        "Every piece is designed by EL BATEL, released once, and numbered. When an edition closes, it never comes back.",
      ctaPrimaryLabel: "SHOP THE DROP",
      ctaPrimaryHref: "/shop",
      ctaSecondaryLabel: "EXPLORE EL BATEL",
      ctaSecondaryHref: "/collections",
      brandStatement: "NOT JUST CLOTHES.\nA PIECE OF THE CULTURE.",
      brandSubstatement:
        "Designed in the studio, released to the people who were there first. Each limited piece carries its own serial number — a record of who wore it.",
      featuredProductIds: [
        productIds["EL BATEL — BLACK EDITION"],
        productIds["BLACKOUT OVERSIZED HOODIE"],
        productIds["WEAR THE CULTURE TEE"],
        productIds["EL BATEL — DROP 002"],
      ].filter(Boolean) as Id<"products">[],
      updatedAt: now,
    });

    await ctx.db.insert("about_content", {
      key: "about",
      title: "EL BATEL",
      intro:
        "EL BATEL is the artist, the sound, and the wardrobe. The clothing is the part of the work you can carry with you.",
      body:
        "The clothes carry the artist's identity, his culture, his style and his creative vision. Colours stay close to black and white because that is how the work is built — loud in the detail, quiet everywhere else. Red appears only where it matters: the serial number, the stitch, the line under a name.\n\nEvery limited piece is numbered by hand when the run closes. The number is registered, the run ends, and that exact garment is never cut again. Own the piece and you own the number that goes with it.",
      statement: "NOT JUST CLOTHES. A PIECE OF THE CULTURE.",
      image: "art:hoodie:black:front",
      signature: "EL BATEL",
      updatedAt: now,
    });

    await ctx.db.insert("site_settings", {
      key: "site",
      logoText: "EL BATEL",
      logoImage: undefined,
      faviconUrl: undefined,
      contactEmail: "studio@elbatel.com",
      whatsapp: "+213 000 000 000",
      shippingInfo:
        "Shipped worldwide from the studio within 3–5 working days. Tracked delivery on every order. Numbered pieces ship in a sealed collector box with the edition card.",
      shippingFlatRate: 1200,
      freeShippingThreshold: 25000,
      currency: "EUR",
      footerText:
        "EL BATEL — numbered streetwear from the studio. Designed and released in limited runs.",
      announcement: "DROP 002 — 80 PIECES · REGISTER FOR EARLY ACCESS",
      announcementActive: true,
      updatedAt: now,
    });

    const socials = [
      { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/", handle: "EL BATEL", order: 1 },
      { platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/", handle: "EL BATEL", order: 2 },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/results?search_query=EL+BATEL", handle: "EL BATEL", order: 3 },
      { platform: "spotify", label: "Spotify", url: "https://open.spotify.com/search/EL%20BATEL", handle: "EL BATEL", order: 4 },
    ];
    for (const social of socials) {
      await ctx.db.insert("social_links", { ...social, visible: true });
    }

    await ctx.db.insert("music_links", {
      platform: "youtube",
      title: "WATCH ON YOUTUBE",
      subtitle: "Official videos, visualisers and studio footage.",
      url: "https://www.youtube.com/results?search_query=EL+BATEL",
      order: 1,
      visible: true,
      updatedAt: now,
    });
    await ctx.db.insert("music_links", {
      platform: "spotify",
      title: "LISTEN ON SPOTIFY",
      subtitle: "The full catalogue, playlists and features.",
      url: "https://open.spotify.com/search/EL%20BATEL",
      order: 2,
      visible: true,
      updatedAt: now,
    });

    /* ------------------------------------------------------ demo orders */
    const demoOrders: {
      email: string;
      fullName: string;
      city: string;
      country: string;
      status: "paid" | "shipped" | "completed" | "processing";
      paymentStatus: "paid" | "unpaid";
      product: string;
      size: string;
      withSerial: boolean;
    }[] = [
      {
        email: "client.one@elbatel.com",
        fullName: "Nadir B.",
        city: "Algiers",
        country: "DZ",
        status: "completed",
        paymentStatus: "paid",
        product: "EL BATEL — BLACK EDITION",
        size: "L",
        withSerial: true,
      },
      {
        email: "client.two@elbatel.com",
        fullName: "Yanis K.",
        city: "Paris",
        country: "FR",
        status: "shipped",
        paymentStatus: "paid",
        product: "BLACKOUT OVERSIZED HOODIE",
        size: "M",
        withSerial: false,
      },
      {
        email: "client.three@elbatel.com",
        fullName: "Sara M.",
        city: "Oran",
        country: "DZ",
        status: "processing",
        paymentStatus: "paid",
        product: "NUMBERED TEE — COLLECTOR RUN",
        size: "S",
        withSerial: true,
      },
    ];

    let index = 0;
    for (const demo of demoOrders) {
      const productId = productIds[demo.product];
      if (!productId) continue;
      const product = await ctx.db.get(productId as Id<"products">);
      if (!product) continue;
      index += 1;
      const subtotal = product.price;
      const shipping = subtotal >= 25000 ? 0 : 1200;
      const createdAt = now - index * 86_400_000 * 2;

      let customer = await ctx.db
        .query("customers")
        .withIndex("by_email", (q) => q.eq("email", demo.email))
        .first();
      if (!customer) {
        const customerId = await ctx.db.insert("customers", {
          email: demo.email,
          fullName: demo.fullName,
          ordersCount: 1,
          totalSpent: subtotal + shipping,
          createdAt,
        });
        customer = await ctx.db.get(customerId);
      }

      const orderId = await ctx.db.insert("orders", {
        orderNumber: `ELB-DEMO${index}`,
        customerId: customer?._id,
        email: demo.email,
        fullName: demo.fullName,
        phone: "+213 555 000 000",
        address: "12 Rue des Studios",
        city: demo.city,
        country: demo.country,
        postalCode: "16000",
        subtotal,
        shipping,
        total: subtotal + shipping,
        currency: "EUR",
        status: demo.status,
        paymentStatus: demo.paymentStatus,
        paymentProvider: "stripe",
        paymentRef: `demo_${index}`,
        createdAt,
        updatedAt: createdAt,
      });

      let serialId: string | undefined;
      let serial: string | undefined;
      if (demo.withSerial) {
        const available = (
          await ctx.db
            .query("serial_numbers")
            .withIndex("by_product", (q) => q.eq("productId", productId as Id<"products">))
            .collect()
        ).find((s) => s.status === "available");
        if (available) {
          serialId = available._id;
          serial = available.serial;
          await ctx.db.patch(available._id, {
            status: "sold",
            orderId,
            ownerLabel: `${demo.fullName} · ${demo.email}`,
            soldAt: createdAt,
            reservedAt: undefined,
          });
        }
      }

      const seeded = PRODUCTS.find((p) => p.name === demo.product);
      await ctx.db.insert("order_items", {
        orderId,
        productId: productId as Id<"products">,
        productName: product.name,
        collectionName: COLLECTIONS.find((c) => c.slug === seeded?.collectionSlug)?.name,
        size: demo.size,
        quantity: 1,
        unitPrice: product.price,
        image: seeded?.images[0],
        serialId: serialId as Id<"serial_numbers"> | undefined,
        serial,
      });
    }

    // Every piece of editorial copy above is seeded in English; the FR/AR
    // columns come from the shared translation map so both are always in step.
    await applyTranslations(ctx);

    return {
      skipped: false,
      collections: Object.keys(collectionIds).length,
      products: Object.keys(productIds).length,
      admin: args.adminEmail,
    };
  },
});
