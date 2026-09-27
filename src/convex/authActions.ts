"use node";

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function newSalt(): string {
  return randomBytes(16).toString("hex");
}

/** Anonymous fingerprint used for rate-limit style bookkeeping. */
function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export const signUp = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ token: string; email: string; name?: string; role: "admin" | "customer" }> => {
    const email = args.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address");
    if (args.password.length < 8) throw new Error("Password must be at least 8 characters");
    const salt = newSalt();
    const passwordHash = hashPassword(args.password, salt);
    const res = await ctx.runMutation(internal.authInternal.createUserAndSession, {
      email,
      passwordHash,
      salt,
      name: args.name,
      fingerprint: digest(email + salt),
    });
    return res;
  },
});

export const signIn = action({
  args: { email: v.string(), password: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ token: string; email: string; name?: string; role: "admin" | "customer" }> => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.runQuery(internal.authInternal.userForEmail, { email });
    if (!user) throw new Error("Invalid email or password");
    const candidate = hashPassword(args.password, user.salt);
    if (!safeEqual(candidate, user.passwordHash)) throw new Error("Invalid email or password");
    const session = await ctx.runMutation(internal.authInternal.createSession, {
      userId: user._id,
    });
    return { token: session.token, email: user.email, name: user.name, role: user.role };
  },
});

export const changePassword = action({
  args: { token: v.string(), currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    if (args.newPassword.length < 8) throw new Error("Password must be at least 8 characters");
    const user = await ctx.runQuery(internal.authInternal.userForToken, { token: args.token });
    if (!user) throw new Error("Not authenticated");
    const candidate = hashPassword(args.currentPassword, user.salt);
    if (!safeEqual(candidate, user.passwordHash)) throw new Error("Current password is incorrect");
    const salt = newSalt();
    await ctx.runMutation(internal.authInternal.setPassword, {
      userId: user._id,
      passwordHash: hashPassword(args.newPassword, salt),
      salt,
    });
    return { ok: true };
  },
});
