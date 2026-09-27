import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { SESSION_TTL_MS, makeToken } from "./lib";

export const userForEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const userForToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    return await ctx.db.get(session.userId);
  },
});

export const createUserAndSession = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    name: v.optional(v.string()),
    fingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("An account with that email already exists");

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
      salt: args.salt,
      role: "customer",
      createdAt: now,
    });
    const token = makeToken();
    await ctx.db.insert("sessions", {
      userId,
      token,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });
    return { token, email: args.email, name: args.name, role: "customer" as const };
  },
});

export const createSession = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const token = makeToken();
    await ctx.db.insert("sessions", {
      userId: args.userId,
      token,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });
    return { token };
  },
});

export const deleteSession = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});

export const setPassword = internalMutation({
  args: { userId: v.id("users"), passwordHash: v.string(), salt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      passwordHash: args.passwordHash,
      salt: args.salt,
    });
  },
});

/** Used by the seed script to create the first admin / demo customer. */
export const upsertUser = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    name: v.optional(v.string()),
    admin: v.boolean(),
    adminRole: v.optional(v.union(v.literal("owner"), v.literal("manager"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (user) {
      await ctx.db.patch(user._id, {
        passwordHash: args.passwordHash,
        salt: args.salt,
        name: args.name,
        role: args.admin ? "admin" : "customer",
      });
    } else {
      const id = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        passwordHash: args.passwordHash,
        salt: args.salt,
        role: args.admin ? "admin" : "customer",
        createdAt: now,
      });
      user = await ctx.db.get(id);
    }
    if (!user) throw new Error("Failed to create user");
    if (args.admin) {
      const existing = await ctx.db
        .query("admin_users")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { role: args.adminRole ?? "owner" });
      } else {
        await ctx.db.insert("admin_users", {
          userId: user._id,
          email: args.email,
          name: args.name,
          role: args.adminRole ?? "owner",
          createdAt: now,
        });
      }
    }
    return user._id;
  },
});
