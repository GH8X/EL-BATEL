import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { countdownParts, pad2 } from "@/lib/format";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type CountdownProps = {
  target: number;
  className?: string;
  onComplete?: () => void;
  compact?: boolean;
};

export function Countdown({ target, className, onComplete, compact = false }: CountdownProps) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = useMemo(() => countdownParts(target), [target, now]);

  useEffect(() => {
    if (parts.done) onComplete?.();
  }, [parts.done, onComplete]);

  const cells: { label: string; value: number }[] = [
    { label: t("countdown.days"), value: parts.days },
    { label: t("countdown.hours"), value: parts.hours },
    { label: t("countdown.minutes"), value: parts.minutes },
    { label: t("countdown.seconds"), value: parts.seconds },
  ];

  if (parts.done) {
    return (
      <div className={cn("font-mono text-[11px] uppercase tracking-[0.3em] text-red-batel", className)}>
        {t("countdown.open")}
      </div>
    );
  }

  return (
    <div className={cn("flex items-stretch gap-px", className)}>
      {cells.map((cell, index) => (
        <div key={cell.label} className="flex items-stretch">
          <div
            className={cn(
              "relative flex min-w-[68px] flex-col items-center justify-center border border-white/12 bg-black/50",
              compact ? "min-w-[54px] px-2 py-2" : "px-3 py-3.5 sm:min-w-[86px] sm:px-5",
            )}
          >
            <motion.span
              key={`${cell.label}-${cell.value}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "font-mono tabular-nums text-white",
                compact ? "text-lg" : "text-2xl sm:text-4xl",
              )}
            >
              {pad2(cell.value)}
            </motion.span>
            <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.24em] text-white/40">
              {cell.label}
            </span>
          </div>
          {index < cells.length - 1 ? (
            <div className="flex w-2 items-center justify-center font-mono text-white/25">:</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
