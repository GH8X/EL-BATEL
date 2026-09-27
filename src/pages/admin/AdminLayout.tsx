import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart3,
  Boxes,
  Layers,
  Hash,
  ShoppingCart,
  LayoutTemplate,
  Music4,
  UserSquare2,
  Share2,
  Settings2,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/serials", label: "Serial numbers", icon: Hash },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
  { to: "/admin/music", label: "Music", icon: Music4 },
  { to: "/admin/about", label: "About", icon: UserSquare2 },
  { to: "/admin/socials", label: "Social links", icon: Share2 },
  { to: "/admin/settings", label: "Site settings", icon: Settings2 },
];

export default function AdminLayout() {
  const { user, signOut, token } = useAuth();
  const location = useLocation();
  const stats = useQuery(api.orders.adminStats, token ? { token } : "skip");

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-[248px] shrink-0 border-r border-white/10 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-white/10 px-6 py-6">
              <Link to="/" className="font-display text-[22px] tracking-tight text-white">
                EL BATEL
              </Link>
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">
                STUDIO DASHBOARD
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-4">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                      isActive
                        ? "bg-white/[0.04] text-white"
                        : "text-white/45 hover:bg-white/[0.02] hover:text-white/80",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <motion.span
                          layoutId="admin-nav"
                          className="absolute inset-y-1.5 left-0 w-px bg-red-batel"
                        />
                      ) : null}
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-white/10 px-5 py-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                SIGNED IN AS
              </p>
              <p className="mt-2 truncate font-mono text-[11px] text-white">{user?.email}</p>
              <div className="mt-4 space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/" className="flex items-center gap-2">
                    VIEW SITE <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => void signOut()}
                >
                  <LogOut className="h-3.5 w-3.5" /> SIGN OUT
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-4">
                <Link to="/" className="font-display text-[18px] tracking-tight text-white lg:hidden">
                  EL BATEL
                </Link>
                <p className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-white/35 lg:block">
                  {location.pathname.replace("/admin", "").replace("/", "") || "OVERVIEW"}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <MiniStat label="ORDERS" value={stats ? String(stats.totalOrders) : "—"} />
                <MiniStat label="OPEN" value={stats ? String(stats.openOrders) : "—"} />
                <MiniStat label="SERIALS LEFT" value={stats ? String(stats.availablePieces) : "—"} />
              </div>
            </div>

            {/* mobile nav */}
            <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2.5 lg:hidden">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "whitespace-nowrap border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                      isActive
                        ? "border-red-batel text-white"
                        : "border-white/12 text-white/45 hover:border-white/30 hover:text-white",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-5 py-7 sm:px-7 sm:py-9"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden sm:block">
      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/35">{label}</p>
      <p className="mt-1 font-mono text-[12px] text-white">{value}</p>
    </div>
  );
}
