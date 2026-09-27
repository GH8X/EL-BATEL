import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);
  return touch;
}

/** Cursor-following magnetic wrapper. Disabled on touch + reduced motion. */
export function Magnetic({
  children,
  strength = 14,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const isTouch = useIsTouch();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.35 });

  const onMove = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      if (reduce || isTouch || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      x.set(relX * strength * 2);
      y.set(relY * strength);
    },
    [isTouch, reduce, strength, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.span>
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "fade" | "blur" | "scale" | "left";
  once?: boolean;
};

export function Reveal({ children, className, delay = 0, variant = "up", once = true }: RevealProps) {
  const reduce = useReducedMotion();
  const from = {
    up: { opacity: 0, y: 28 },
    fade: { opacity: 0 },
    blur: { opacity: 0, filter: "blur(14px)" },
    scale: { opacity: 0, scale: 0.96 },
    left: { opacity: 0, x: -32 },
  }[variant];
  const to = {
    up: { opacity: 1, y: 0 },
    fade: { opacity: 1 },
    blur: { opacity: 1, filter: "blur(0px)" },
    scale: { opacity: 1, scale: 1 },
    left: { opacity: 1, x: 0 },
  }[variant];

  return (
    <motion.div
      initial={reduce ? undefined : from}
      whileInView={reduce ? undefined : to}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.85, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Parallax layer: moves as the element travels through the viewport. */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Slow horizontal marquee used for editorial ticker bands. */
export function Marquee({
  items,
  className,
  separator = "✦",
}: {
  items: string[];
  className?: string;
  separator?: string;
}) {
  const row = [...items, ...items];
  return (
    <div className={cn("marquee-mask relative overflow-hidden py-4", className)}>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
              {item}
            </span>
            <span className="text-red-batel text-[9px]">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function useParallaxValue(progress: MotionValue<number>, from: number, to: number) {
  return useTransform(progress, [0, 1], [from, to]);
}

/** Splits a headline into lines that rise into place. */
export function LineReveal({
  text,
  className,
  delay = 0,
  as = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "div";
}) {
  const lines = text.split("\n");
  const Comp = motion[as];
  return (
    <Comp className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.95, ease: EASE, delay: delay + index * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

export { EASE };
