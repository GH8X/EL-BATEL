import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/motion";

export function AdminHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <Reveal variant="fade">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[32px] leading-none tracking-tight text-white sm:text-[46px]">
            {title}
          </h1>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
      </div>
    </Reveal>
  );
}

export function Panel({
  title,
  description,
  children,
  actions,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-white/10 bg-white/[0.014]", className)}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 text-[12px] leading-relaxed text-white/40">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="relative border border-white/10 p-5">
      {accent ? <span className="absolute left-0 top-0 h-full w-px bg-red-batel" /> : null}
      <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-4 font-display text-[34px] leading-none tracking-tight text-white">{value}</p>
      {hint ? (
        <p className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">{hint}</p>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-[11px] leading-relaxed text-white/35">{hint}</p> : null}
    </div>
  );
}
