import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n";

// The entry sequence belongs to the first load only — a language switch
// remounts the router, and it must not replay the loader every time.
let loaderPlayed = false;

export function BrandLoader() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(() => !loaderPlayed);

  useEffect(() => {
    if (loaderPlayed) return;
    loaderPlayed = true;
    const timer = window.setTimeout(() => setVisible(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
        >
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, letterSpacing: "0em" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[13vw] leading-none tracking-tight text-white sm:text-[64px]"
          >
            EL BATEL
          </motion.h1>
          <div className="mt-6 w-[180px] sm:w-[240px]">
            <div className="elb-loader-bar" />
          </div>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.32em] text-white/35">
            {t("loader.entering")}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Slim red progress line pinned to the top of the viewport. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent">
      <div
        className="h-full bg-red-batel transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
