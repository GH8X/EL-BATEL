import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { serialNumber } from "@/lib/format";
import { useI18n } from "@/i18n";
import { EASE } from "./motion";

type SerialPlateProps = {
  serial?: string | null;
  editionSize?: number | null;
  status?: "available" | "reserved" | "sold" | null;
  label?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
  animate?: boolean;
  delay?: number;
};

const STATUS_KEY: Record<string, string> = {
  available: "status.available",
  reserved: "status.reserved",
  sold: "status.sold",
};

/**
 * The heart of the brand: a limited piece is defined by its number, so the
 * number gets the loudest treatment on the page — mono type, hairline frame
 * and a single red line that draws itself underneath.
 */
export function SerialPlate({
  serial,
  editionSize,
  status = "available",
  label,
  size = "md",
  align = "left",
  className,
  animate = true,
  delay = 0.1,
}: SerialPlateProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t("product.limitedEdition");
  const numberSizes = {
    sm: "text-[22px]",
    md: "text-[34px] sm:text-[42px]",
    lg: "text-[44px] sm:text-[62px]",
  } as const;

  const statusTone =
    status === "sold"
      ? "text-white/35"
      : status === "reserved"
        ? "text-white/60"
        : "text-white";

  return (
    <div
      className={cn(
        "relative border border-white/12 bg-black/50 px-5 py-4",
        align === "center" && "text-center",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 bg-red-batel" />
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/55">
          {resolvedLabel}
        </span>
      </div>

      {/* Serial numbers are language-independent: always LTR, always mono. */}
      <div dir="ltr" className={cn("mt-3 flex items-end gap-2 font-mono font-num", statusTone)}>
        <span className={cn("leading-none tracking-tight", numberSizes[size])}>
          {serialNumber(serial)}
        </span>
        {editionSize ? (
          <span className="pb-1 font-mono text-[13px] text-white/40">/ {editionSize}</span>
        ) : null}
      </div>

      <motion.div
        initial={animate ? { scaleX: 0 } : undefined}
        whileInView={animate ? { scaleX: 1 } : undefined}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1, ease: EASE, delay }}
        style={{ transformOrigin: align === "center" ? "center" : "left" }}
        className="mt-3 h-px w-full bg-red-batel"
      />

      {status ? (
        <div
          className={cn(
            "mt-2.5 font-mono text-[9px] uppercase tracking-[0.24em]",
            status === "available"
              ? "text-red-batel"
              : status === "reserved"
                ? "text-white/50"
                : "text-white/35",
          )}
        >
          {STATUS_KEY[status] ? t(STATUS_KEY[status]) : status.toUpperCase()}
        </div>
      ) : null}
    </div>
  );
}

/** Compact inline version used on product cards and in tables. */
export function SerialTag({
  serial,
  className,
  muted = false,
}: {
  serial?: string | null;
  className?: string;
  muted?: boolean;
}) {
  if (!serial) return null;
  return (
    <span
      dir="ltr"
      className={cn(
        "inline-flex items-center gap-2 font-mono font-num text-[10px] uppercase tracking-[0.2em]",
        muted ? "text-white/45" : "text-white",
        className,
      )}
    >
      <span className="h-1 w-1 bg-red-batel" />
      {serial}
    </span>
  );
}
