import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight, Boxes, Hash, ShoppingCart, Sparkles } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { AdminHeader, Panel, StatCard } from "./ui";
import { formatDate, formatPrice } from "@/lib/format";

export default function Dashboard() {
  const { token } = useAuth();
  const stats = useQuery(api.orders.adminStats, token ? { token } : "skip");
  const summary = useQuery(api.catalog.shopSummary, {});
  const settings = useQuery(api.catalog.getSettings, {});
  const currency = settings?.settings?.currency ?? "EUR";

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="OVERVIEW"
        title="THE STUDIO TODAY"
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/products">
                <Boxes className="h-3.5 w-3.5" /> MANAGE PRODUCTS
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/serials">
                <Hash className="h-3.5 w-3.5" /> SERIAL NUMBERS
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="TOTAL ORDERS"
          value={stats ? String(stats.totalOrders) : "—"}
          hint={stats ? `${stats.openOrders} still open` : undefined}
          accent
        />
        <StatCard
          label="REVENUE (PAID)"
          value={stats ? formatPrice(stats.revenue, currency) : "—"}
          hint="orders marked paid or fulfilled"
        />
        <StatCard
          label="PRODUCTS"
          value={stats ? String(stats.products) : "—"}
          hint={stats ? `${stats.activeProducts} live on the site` : undefined}
        />
        <StatCard
          label="AVAILABLE PIECES"
          value={stats ? String(stats.availablePieces) : "—"}
          hint={summary ? `${summary.availablePieces} units claimable` : undefined}
        />
        <StatCard
          label="PIECES PLACED"
          value={stats ? String(stats.soldPieces) : "—"}
          hint={stats ? `${stats.reservedPieces} held in carts` : undefined}
        />
        <StatCard
          label="LIMITED EDITIONS"
          value={stats ? String(stats.limitedEditions) : "—"}
          hint="numbered runs in the archive"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel
          title="RECENT ORDERS"
          description="The last pieces that left the studio with a serial attached."
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/orders">
                ALL ORDERS <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          {stats === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse-soft bg-white/[0.03]" />
              ))}
            </div>
          ) : stats.recent.length === 0 ? (
            <p className="py-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
              NO ORDERS YET
            </p>
          ) : (
            <div className="space-y-px">
              {stats.recent.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] py-3.5 last:border-b-0"
                >
                  <div>
                    <p className="font-mono text-[12px] tracking-[0.1em] text-white">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                      {order.fullName} · {order.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                      {formatDate(order.createdAt)}
                    </span>
                    <Badge variant={order.paymentStatus === "paid" ? "accent" : "outline"}>
                      {order.status}
                    </Badge>
                    <span className="font-mono text-[12px] text-white">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="QUICK ACTIONS">
            <div className="space-y-2.5">
              {[
                { label: "Create a product", to: "/admin/products", icon: Boxes },
                { label: "Generate serials", to: "/admin/serials", icon: Hash },
                { label: "Review orders", to: "/admin/orders", icon: ShoppingCart },
                { label: "Edit homepage", to: "/admin/homepage", icon: Sparkles },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="group flex items-center justify-between border border-white/10 px-4 py-3.5 transition-colors hover:border-white/30"
                >
                  <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 group-hover:text-white">
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-batel" />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="STORE HEALTH">
            <ul className="space-y-3.5">
              <HealthRow
                label="Live products"
                value={String(stats?.activeProducts ?? 0)}
                ok={(stats?.activeProducts ?? 0) > 0}
              />
              <HealthRow
                label="Pieces available"
                value={String(stats?.availablePieces ?? 0)}
                ok={(stats?.availablePieces ?? 0) > 0}
              />
              <HealthRow
                label="Sold-out editions"
                value={String(summary?.soldOut ?? 0)}
                ok
              />
              <HealthRow
                label="Carts holding numbers"
                value={String(stats?.reservedPieces ?? 0)}
                ok
              />
            </ul>
            {stats && stats.totalOrders === 0 ? (
              <p className="mt-5 border border-white/10 px-4 py-3 text-[12px] leading-relaxed text-white/45">
                No orders yet. Place a test order on the storefront to watch serials move from
                AVAILABLE to SOLD.
              </p>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function HealthRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{label}</span>
      <span className="flex items-center gap-2.5">
        <span className="font-mono text-[12px] text-white">{value}</span>
        <span className={`h-1.5 w-1.5 ${ok ? "bg-red-batel" : "bg-white/20"}`} />
      </span>
    </li>
  );
}
