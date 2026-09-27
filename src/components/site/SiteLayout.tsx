import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AnnouncementBar, Nav } from "./Nav";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { ScrollProgress } from "./Loader";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Kept outside React so it survives the router remount that a language switch
// performs — switching language must not throw the visitor back to the top.
let lastScrolledPath: string | null = null;

export function SiteLayout() {
  const location = useLocation();
  const data = useQuery(api.catalog.getSettings, {});

  // Route changes start at the top of the page — like a lookbook spread.
  useEffect(() => {
    if (lastScrolledPath === location.pathname) return;
    lastScrolledPath = location.pathname;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  // Admin-managed favicon.
  useEffect(() => {
    const url = data?.settings?.faviconUrl;
    if (!url) return;
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (link) link.href = url;
  }, [data?.settings?.faviconUrl]);

  return (
    <div className="relative min-h-screen bg-black">
      <ScrollProgress />
      <AnnouncementBar />
      <Nav />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
    </div>
  );
}
