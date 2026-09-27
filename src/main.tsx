import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { LanguageProvider, pageKeyForPath, useI18n } from "@/i18n";
import { Toaster } from "@/components/ui/toaster";
import { BrandLoader } from "@/components/site/Loader";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (!convexUrl) {
  // Surfaced in the preview instead of a blank screen when Convex is missing.
  // eslint-disable-next-line no-console
  console.error("VITE_CONVEX_URL is not set — run `bun convex dev --once` to configure it.");
}

const client = new ConvexReactClient(convexUrl ?? "http://127.0.0.1:3210");

/**
 * Keeps the SEO page key in step with the route. Mounted inside the router so
 * it can read the (language-stripped) location.
 */
function RouteMeta() {
  const { pathname } = useLocation();
  const { setPage, setMeta } = useI18n();

  useEffect(() => {
    setPage(pageKeyForPath(pathname));
    setMeta({});
  }, [pathname, setPage, setMeta]);

  return null;
}

/**
 * The router is keyed by language: a language change remounts it with the new
 * basename, so every existing `/shop`-style link resolves to `/fr/shop`,
 * `/ar/shop` … without touching a single route definition.
 */
function RouterShell() {
  const { lang } = useI18n();
  const basename = lang === "en" ? undefined : `/${lang}`;

  return (
    <BrowserRouter key={lang} basename={basename}>
      <RouteMeta />
      <BrandLoader />
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={client}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <RouterShell />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ConvexProvider>
  </StrictMode>,
);
