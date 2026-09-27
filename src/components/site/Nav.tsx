import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Menu, Search, ShoppingBag, User, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/art/ProductImage";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  SheetContent,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Magnetic, EASE } from "./motion";

const NAV_LINKS = [
  { key: "nav.shop", to: "/shop" },
  { key: "nav.collections", to: "/collections" },
  { key: "nav.limited", to: "/limited-drops" },
  { key: "nav.music", to: "/music" },
  { key: "nav.about", to: "/about" },
];

export function AnnouncementBar() {
  const { t, lang } = useI18n();
  const data = useQuery(api.catalog.getSettings, { lang });
  const [hidden, setHidden] = useState(false);
  const settings = data?.settings;
  if (!settings?.announcementActive || !settings.announcement || hidden) return null;

  return (
    <div className="relative z-[45] flex items-center justify-center gap-3 bg-red-batel px-4 py-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white sm:text-[10px]">
        {settings.announcement}
      </span>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label={t("nav.dismiss")}
        className="absolute end-3 text-white/80 transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, lang } = useI18n();
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const results = useQuery(
    api.catalog.listProducts,
    term.trim().length > 1 ? { search: term.trim(), limit: 6, lang } : "skip",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogTitle className="sr-only">{t("nav.search")}</DialogTitle>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="h-4 w-4 text-white/40" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("nav.searchPlaceholder")}
            className="w-full bg-transparent font-mono text-[12px] uppercase tracking-[0.2em] text-white placeholder:text-white/25 focus:outline-none"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {term.trim().length <= 1 ? (
            <p className="px-5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
              {t("nav.searchHint")}
            </p>
          ) : results === undefined ? (
            <p className="px-5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
              {t("nav.searching")}
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
              {t("nav.noResults")}
            </p>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setTerm("");
                  navigate(`/product/${product.slug}`);
                }}
                className="flex w-full items-center gap-4 border-b border-white/[0.06] px-5 py-3.5 text-start transition-colors hover:bg-white/[0.04]"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                  <ProductImage src={product.images[0]} alt={product.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15px] uppercase tracking-wide text-white">
                    {product.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                    {product.collection?.title ?? product.category}
                    {product.editionSize ? ` · ${t("nav.editionOf", { size: product.editionSize })}` : ""}
                  </p>
                </div>
                <span className="font-num font-mono text-[11px] text-white/70" dir="ltr">
                  {formatPrice(product.price)}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-full max-h-none border-white/10 bg-black">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <span className="font-latin font-display text-2xl tracking-tight text-white">EL BATEL</span>
          <DialogClose className="text-white/60 transition-colors hover:text-red-batel">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8">
          {NAV_LINKS.map((link, index) => (
            <motion.button
              key={link.to}
              type="button"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.06 * index }}
              onClick={() => {
                onOpenChange(false);
                navigate(link.to);
              }}
              className="group flex items-baseline justify-between border-b border-white/[0.08] py-5 text-start"
            >
              <span className="font-display text-[42px] uppercase leading-none tracking-tight text-white transition-colors group-hover:text-red-batel sm:text-[56px]">
                {t(link.key)}
              </span>
              <span className="font-num font-mono text-[10px] text-white/30">
                0{index + 1}
              </span>
            </motion.button>
          ))}

          <div className="mt-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/30">
              {t("lang.label")}
            </p>
            <LanguageSwitcher className="mt-3" />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/cart"
              onClick={() => onOpenChange(false)}
              className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50 hover:text-white"
            >
              {t("nav.cart")}
            </Link>
            <Link
              to="/contact"
              onClick={() => onOpenChange(false)}
              className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50 hover:text-white"
            >
              {t("nav.contact")}
            </Link>
          </div>
        </div>
      </SheetContent>
    </Dialog>
  );
}

export function Nav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut, isAuthenticated } = useAuth();
  const { count, openDrawer } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled;

  const accountLabel = useMemo(() => user?.name || user?.email || t("nav.account"), [user, t]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          transparent
            ? "border-b border-transparent bg-transparent"
            : "border-b border-white/10 bg-black/85 backdrop-blur-xl",
        )}
      >
        <div className="container flex h-[68px] items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="font-latin font-display text-[22px] leading-none tracking-tight text-white transition-colors group-hover:text-red-batel sm:text-[26px]">
              EL BATEL
            </span>
            <span className="hidden h-1.5 w-1.5 bg-red-batel transition-transform duration-300 group-hover:scale-150 sm:block" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="nav-link"
                data-active={location.pathname.startsWith(link.to) ? "true" : "false"}
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageSwitcher className="hidden lg:inline-flex" />

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("nav.search")}
              className="flex h-10 w-10 items-center justify-center text-white/70 transition-colors hover:text-red-batel"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t("nav.account")}
                  className="flex h-10 w-10 items-center justify-center text-white/70 transition-colors hover:text-red-batel"
                >
                  <User className="h-[18px] w-[18px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>{accountLabel}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin ? (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5" /> {t("nav.studioDashboard")}
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem asChild>
                      <Link to="/account">{t("nav.myOrders")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/cart">{t("nav.cart")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => void signOut()}>{t("nav.signOut")}</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>{t("nav.signInForHistory")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/auth">{t("nav.signIn")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth?mode=signup">{t("nav.createAccount")}</Link>
                    </DropdownMenuItem>
                    {isAdmin ? null : (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">{t("nav.studioAccess")}</Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={openDrawer}
              aria-label={t("nav.cart")}
              className="relative flex h-10 w-10 items-center justify-center text-white/70 transition-colors hover:text-red-batel"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 ? (
                <span className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center bg-red-batel px-1 font-num font-mono text-[9px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("nav.menu")}
              className="flex h-10 w-10 items-center justify-center text-white/80 transition-colors hover:text-red-batel lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

/** Large text CTA used on the landing hero. */
export function HeroCta({
  label,
  to,
  onEngage,
  variant = "solid",
}: {
  label: string;
  to: string;
  onEngage?: (engaged: boolean) => void;
  variant?: "solid" | "outline";
}) {
  return (
    <Magnetic strength={10}>
      <Link
        to={to}
        onMouseEnter={() => onEngage?.(true)}
        onMouseLeave={() => onEngage?.(false)}
        className={cn(
          "group relative inline-flex h-14 items-center gap-3 overflow-hidden border px-8 font-mono text-[11px] uppercase tracking-[0.24em] transition-all duration-500",
          variant === "solid"
            ? "border-white bg-white text-black hover:border-red-batel hover:bg-red-batel hover:text-white"
            : "border-white/25 bg-transparent text-white hover:border-white",
        )}
      >
        <span className="relative z-10">{label}</span>
        <span className="dir-icon relative z-10 transition-transform duration-500 group-hover:translate-x-1">
          →
        </span>
        {variant === "outline" ? (
          <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-red-batel transition-transform duration-500 group-hover:scale-x-100" />
        ) : null}
      </Link>
    </Magnetic>
  );
}
