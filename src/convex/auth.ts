import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { canAdmin, resolveUser } from "./lib";

/**
 * Current session lookup. The client sends its session token explicitly so the
 * admin dashboard can render permissions without trusting anything local.
 */
export const me = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await resolveUser(ctx, args.token);
    if (!user) return null;
    return {
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      isAdmin: await canAdmin(ctx, args.token),
    };
  },
});

export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) await ctx.db.delete(session._id);
    return { ok: true };
  },
});
