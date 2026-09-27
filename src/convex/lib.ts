import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function formatSerial(prefix: string, number: number, padding = 4): string {
  return `${prefix.toUpperCase()}-${String(number).padStart(padding, "0")}`;
}

export function makeOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `ELB-${stamp}${rand}`;
}

export function makeToken(): string {
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += Math.random().toString(36).slice(2, 12);
  }
  return out;
}

/** Resolve the signed-in user from a session token (null when anonymous). */
export async function resolveUser(
  ctx: QueryCtx | MutationCtx,
  token: string | undefined | null,
): Promise<Doc<"users"> | null> {
  if (!token) return null;
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
  if (!session) return null;
  if (session.expiresAt < Date.now()) return null;
  return await ctx.db.get(session.userId);
}

export type AdminCheck = {
  user: Doc<"users">;
  admin: Doc<"admin_users">;
};

export async function isAdminUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"admin_users"> | null> {
  const direct = await ctx.db
    .query("admin_users")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (direct) return direct;
  return null;
}

/**
 * Throws unless the token belongs to a session whose user is on the admin
 * allow-list. Every admin write in this app funnels through here.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  token: string | undefined | null,
): Promise<AdminCheck> {
  const user = await resolveUser(ctx, token);
  if (!user) throw new Error("Not authenticated");
  const admin = await isAdminUser(ctx, user._id);
  if (!admin && user.role !== "admin") throw new Error("Not authorised");
  return {
    user,
    admin:
      admin ??
      ({
        _id: user._id,
        _creationTime: user.createdAt,
        userId: user._id,
        email: user.email,
        role: "owner",
        createdAt: user.createdAt,
      } as unknown as Doc<"admin_users">),
  };
}

/** True when the caller may read admin data (used by queries, returns bool). */
export async function canAdmin(
  ctx: QueryCtx | MutationCtx,
  token: string | undefined | null,
): Promise<boolean> {
  const user = await resolveUser(ctx, token);
  if (!user) return false;
  if (user.role === "admin") return true;
  return (await isAdminUser(ctx, user._id)) !== null;
}

export function serialFromDoc(doc: Doc<"serial_numbers">) {
  return {
    id: doc._id,
    serial: doc.serial,
    productId: doc.productId,
    editionId: doc.editionId,
    status: doc.status,
    orderId: doc.orderId,
    ownerLabel: doc.ownerLabel,
    reservedAt: doc.reservedAt,
    soldAt: doc.soldAt,
    createdAt: doc.createdAt,
  };
}
