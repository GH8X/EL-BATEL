import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useI18n } from "@/i18n";
import { platformIcon } from "./PlatformIcons";
import { Reveal } from "./motion";

export function Footer() {
  const { t, lang } = useI18n();
  const data = useQuery(api.catalog.getSettings, { lang });
  const settings = data?.settings;
  const socials = data?.socials ?? [];

  const shopLinks = [
    { label: t("footer.shopAll"), to: "/shop" },
    { label: t("nav.limited"), to: "/limited-drops" },
    { label: t("nav.collections"), to: "/collections" },
    { label: t("nav.cart"), to: "/cart" },
  ];

  const brandLinks = [
    { label: t("nav.music"), to: "/music" },
    { label: t("footer.aboutBrand"), to: "/about" },
    { label: t("nav.contact"), to: "/contact" },
    { label: t("nav.myOrders"), to: "/account" },
  ];

  const legalLinks = [
    { label: t("footer.privacy"), to: "/legal/privacy" },
    { label: t("footer.termsConditions"), to: "/legal/terms" },
    { label: t("footer.shipping"), to: "/legal/shipping" },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="container py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <Reveal>
            <Link
              to="/"
              className="font-latin font-display text-[52px] leading-[0.85] tracking-tight text-white sm:text-[72px]"
            >
              EL BATEL
            </Link>
            <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-white/45">
              {settings?.footerText ?? t("footer.numbered")}
            </p>
            <div className="mt-7 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-10 w-10 items-center justify-center border border-white/12 text-white/60 transition-all duration-300 hover:border-red-batel hover:text-white"
                >
                  {platformIcon(social.platform, { className: "h-4 w-4" })}
                </a>
              ))}
            </div>
          </Reveal>

          <FooterColumn title={t("nav.shop")} links={shopLinks} />
          <FooterColumn title={t("footer.col.brand")} links={brandLinks} />

          <Reveal delay={0.1}>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              {t("footer.col.studio")}
            </h4>
            <ul className="mt-5 space-y-3 text-[13px] text-white/60">
              {settings?.contactEmail ? (
                <li>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    dir="ltr"
                    className="font-num transition-colors hover:text-red-batel"
                  >
                    {settings.contactEmail}
                  </a>
                </li>
              ) : null}
              {settings?.whatsapp ? (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-red-batel"
                  >
                    {t("contact.whatsapp")}
                  </a>
                </li>
              ) : null}
              <li className="max-w-xs pt-2 text-[12px] leading-relaxed text-white/40">
                {settings?.shippingInfo}
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
            © {new Date().getFullYear()} {t("footer.rightsLine")}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-red-batel"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <Reveal delay={0.05}>
      <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">{title}</h4>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="group inline-flex items-center gap-2 text-[13px] text-white/60 transition-colors hover:text-white"
            >
              <span className="h-px w-0 bg-red-batel transition-all duration-300 group-hover:w-4" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
