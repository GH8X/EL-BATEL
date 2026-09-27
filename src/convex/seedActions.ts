"use node";

import { randomBytes, scryptSync } from "node:crypto";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const DEFAULT_ADMIN_EMAIL = "admin@elbatel.com";
const DEFAULT_ADMIN_PASSWORD = "elbatel-drop-001";

/**
 * Bootstraps the store: creates/refreshes the studio admin account, then seeds
 * collections, products, editions, serial numbers and all editable content.
 *
 * Run with:  bun convex run seedActions:run '{"reset":true}'
 */
export const run = action({
  args: {
    reset: v.optional(v.boolean()),
    adminEmail: v.optional(v.string()),
    adminPassword: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    skipped: boolean;
    collections: number;
    products: number;
    admin: string;
    adminEmail: string;
    note: string;
  }> => {
    const email = (args.adminEmail ?? process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
    const password = args.adminPassword ?? process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
    const salt = randomBytes(16).toString("hex");
    const passwordHash = scryptSync(password, salt, 64).toString("hex");

    const ownerUserId = await ctx.runMutation(internal.authInternal.upsertUser, {
      email,
      passwordHash,
      salt,
      name: "Studio Admin",
      admin: true,
      adminRole: "owner",
    });

    const result = await ctx.runMutation(internal.seed.seedAll, {
      adminEmail: email,
      ownerUserId,
      reset: args.reset ?? false,
    });

    return {
      skipped: result.skipped ?? false,
      collections: result.collections ?? 0,
      products: result.products ?? 0,
      admin: result.admin ?? email,
      adminEmail: email,
      note: result.skipped
        ? "Store already seeded — pass reset:true to rebuild the catalogue."
        : "Seeded. Sign in at /auth with the admin account.",
    };
  },
});
