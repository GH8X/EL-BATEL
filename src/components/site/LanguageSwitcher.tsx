import { Fragment } from "react";
import { LANGS, LANG_META, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * EN | FR | AR — discreet segmented control used in the navigation, the mobile
 * menu and the admin header. Kept LTR so the language codes always read in the
 * same order, whatever the document direction is.
 */
export function LanguageSwitcher({
  className,
  separator = true,
}: {
  className?: string;
  separator?: boolean;
}) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      dir="ltr"
      role="group"
      aria-label={t("lang.switch")}
      className={cn("lang-switcher gap-0.5", className)}
    >
      {LANGS.map((code, index) => (
        <Fragment key={code}>
          {separator && index > 0 ? (
            <span aria-hidden className="mx-1 h-3 w-px bg-white/15" />
          ) : null}
          <button
            type="button"
            onClick={() => setLang(code)}
            data-active={lang === code ? "true" : "false"}
            aria-current={lang === code ? "true" : undefined}
            aria-label={LANG_META[code].native}
            className="lang-option"
          >
            {LANG_META[code].short}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
