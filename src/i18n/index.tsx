import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DICTIONARIES } from "./dictionary";
import { setPriceLocale } from "@/lib/format";

/**
 * Keys added after the first dictionary pass (footer columns, countdown).
 * English and French carry them inline; Arabic is topped up here so the three
 * languages stay in step — without this, Arabic would fall back to English.
 */
const AR_ADDITIONS: Record<string, string> = {
  "footer.shopAll": "كل المتجر",
  "footer.aboutBrand": "عن EL BATEL",
  "footer.termsConditions": "الشروط والأحكام",
  "footer.col.brand": "العلامة",
  "footer.col.studio": "الاستوديو",
  "footer.rightsLine": "EL BATEL — جميع الحقوق محفوظة.",
  "countdown.open": "الإصدار مفتوح",
};

Object.assign(DICTIONARIES.ar as unknown as Record<string, string>, AR_ADDITIONS);

/**
 * EL BATEL — language system.
 *
 * - URL carries the language: `/fr/...`, `/ar/...`; English is unprefixed and
 *   `/en/...` is accepted as an alias.
 * - The choice is remembered in localStorage and restored on the next visit.
 * - Arabic switches the document to `dir="rtl"` and swaps in the Arabic type
 *   stack; the switch happens behind a short fade so the flip is never visible.
 * - Nothing here touches prices, serial numbers, IDs, media or the 3D scenes.
 */

export const LANGS = ["en", "fr", "ar"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export const LANG_STORAGE_KEY = "elbatel.lang";

export type Dir = "ltr" | "rtl";

export const LANG_META: Record<
  Lang,
  { short: string; name: string; native: string; dir: Dir; htmlLang: string; locale: string; ogLocale: string }
> = {
  en: {
    short: "EN",
    name: "English",
    native: "English",
    dir: "ltr",
    htmlLang: "en",
    locale: "en-GB",
    ogLocale: "en_GB",
  },
  fr: {
    short: "FR",
    name: "French",
    native: "Français",
    dir: "ltr",
    htmlLang: "fr",
    locale: "fr-FR",
    ogLocale: "fr_FR",
  },
  ar: {
    short: "AR",
    name: "Arabic",
    native: "العربية",
    dir: "rtl",
    htmlLang: "ar",
    locale: "ar-DZ-u-nu-latn",
    ogLocale: "ar_DZ",
  },
};

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

export function dirFor(lang: Lang): Dir {
  return LANG_META[lang].dir;
}

/** The language encoded in a pathname, if any. */
export function langFromPath(pathname: string): Lang | null {
  const segment = pathname.split("/")[1]?.toLowerCase();
  return isLang(segment) ? segment : null;
}

/** Path without its language prefix, always starting with `/`. */
export function stripLangPrefix(pathname: string): string {
  const lang = langFromPath(pathname);
  if (!lang) return pathname.startsWith("/") ? pathname : `/${pathname}`;
  const rest = pathname.slice(lang.length + 1);
  return rest.startsWith("/") ? rest : `/${rest}`;
}

/** Path with the language prefix applied (English stays unprefixed). */
export function withLangPrefix(lang: Lang, pathname: string): string {
  const clean = stripLangPrefix(pathname);
  if (lang === DEFAULT_LANG) return clean === "/" ? "/" : clean.replace(/\/+$/, "");
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

function storedLang(): Lang | null {
  try {
    const value = localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the starting language and canonicalise the URL to match it before
 * the first render — a returning Arabic visitor lands straight on `/ar/...`.
 */
export function resolveInitialLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const fromPath = langFromPath(window.location.pathname);
  const lang = fromPath ?? storedLang() ?? DEFAULT_LANG;
  const canonical = withLangPrefix(lang, window.location.pathname);
  if (canonical !== window.location.pathname) {
    window.history.replaceState(
      null,
      "",
      `${canonical}${window.location.search}${window.location.hash}`,
    );
  }
  return lang;
}

type I18nValue = {
  lang: Lang;
  dir: Dir;
  isRtl: boolean;
  locale: string;
  /** True while the fade that covers a language swap is running. */
  switching: boolean;
  setLang: (next: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Page key used for per-language SEO metadata (e.g. "shop"). */
  page: string;
  setPage: (page: string) => void;
  /** Per-page SEO override, set by pages with dynamic content. */
  meta: { title?: string; description?: string };
  setMeta: (meta: { title?: string; description?: string }) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => resolveInitialLang());
  const [switching, setSwitching] = useState(false);
  const [page, setPage] = useState("home");
  const [meta, setMetaState] = useState<{ title?: string; description?: string }>({});
  const mounted = useRef(false);

  const dir = dirFor(lang);
  const locale = LANG_META[lang].locale;

  /* Keep the URL and the stored preference in step with the language. */
  useEffect(() => {
    const pathname = window.location.pathname;
    const inUrl = langFromPath(pathname);
    const canonical = withLangPrefix(lang, pathname);
    if (inUrl !== lang || canonical !== pathname) {
      window.history.replaceState(null, "", `${canonical}${window.location.search}${window.location.hash}`);
    }
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* private mode — the URL still carries the language */
    }
    setPriceLocale(locale);
    mounted.current = true;
  }, [lang, locale]);

  /* Document language, direction, font hooks and the swap fade. */
  useEffect(() => {
    const root = document.documentElement;
    root.lang = LANG_META[lang].htmlLang;
    root.dir = dir;
    root.dataset.lang = lang;
    document.body.dataset.lang = lang;
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.classList.toggle("lang-switching", switching);
  }, [switching]);

  /* Per-language titles, descriptions and Open Graph tags. */
  useEffect(() => {
    const dict = DICTIONARIES[lang];
    const title = meta.title ?? dict[`seo.${page}.title`] ?? dict["seo.home.title"];
    const description =
      meta.description ?? dict[`seo.${page}.description`] ?? dict["seo.home.description"];

    document.title = title;
    const setMetaTag = (selector: string, attr: "name" | "property", key: string, content: string) => {
      let tag = document.head.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMetaTag('meta[name="description"]', "name", "description", description);
    setMetaTag('meta[property="og:title"]', "property", "og:title", title);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:locale"]', "property", "og:locale", LANG_META[lang].ogLocale);
    setMetaTag('meta[property="og:type"]', "property", "og:type", "website");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${withLangPrefix(lang, window.location.pathname)}`;

    // hreflang alternates so each language has a discoverable URL.
    for (const other of LANGS) {
      const selector = `link[rel="alternate"][hreflang="${other}"]`;
      let alternate = document.head.querySelector<HTMLLinkElement>(selector);
      if (!alternate) {
        alternate = document.createElement("link");
        alternate.rel = "alternate";
        alternate.hreflang = other;
        document.head.appendChild(alternate);
      }
      alternate.href = `${window.location.origin}${withLangPrefix(other, window.location.pathname)}`;
    }
  }, [lang, page, meta]);

  /* Fade out → swap language + direction + URL → fade in. */
  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const apply = () => {
        const url = `${withLangPrefix(next, window.location.pathname)}${window.location.search}${window.location.hash}`;
        window.history.replaceState(null, "", url);
        setLangState(next);
        window.setTimeout(() => setSwitching(false), 40);
      };

      setSwitching(true);
      if (reduce) apply();
      else window.setTimeout(apply, 200);
    },
    [lang],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = DICTIONARIES[lang];
      const value = dict[key] ?? DICTIONARIES[DEFAULT_LANG][key];
      if (value === undefined) return key;
      return interpolate(value, vars);
    },
    [lang],
  );

  const setMeta = useCallback((next: { title?: string; description?: string }) => {
    setMetaState((current) =>
      current.title === next.title && current.description === next.description ? current : next,
    );
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir,
      isRtl: dir === "rtl",
      locale,
      switching,
      setLang,
      t,
      page,
      setPage,
      meta,
      setMeta,
    }),
    [lang, dir, locale, switching, setLang, t, page, meta, setMeta],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}

/** Shorthand for components that only need the translator. */
export function useT() {
  return useI18n().t;
}

/** Route → SEO page key. Used by the router-level metadata bridge. */
const PAGE_BY_ROUTE: { test: RegExp; page: string }[] = [
  { test: /^\/$/, page: "home" },
  { test: /^\/shop/, page: "shop" },
  { test: /^\/product\//, page: "shop" },
  { test: /^\/collections/, page: "collections" },
  { test: /^\/limited-drops/, page: "limited" },
  { test: /^\/about/, page: "about" },
  { test: /^\/music/, page: "music" },
  { test: /^\/contact/, page: "contact" },
  { test: /^\/cart/, page: "cart" },
  { test: /^\/checkout/, page: "checkout" },
];

export function pageKeyForPath(pathname: string): string {
  const clean = stripLangPrefix(pathname);
  for (const entry of PAGE_BY_ROUTE) {
    if (entry.test.test(clean)) return entry.page;
  }
  return "home";
}
