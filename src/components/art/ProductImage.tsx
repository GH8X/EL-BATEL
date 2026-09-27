import { cn } from "@/lib/utils";
import { TONE_COLORS, isArtSpec, parseArt, type ArtSpec } from "@/lib/art";

type GarmentArtProps = {
  spec: string;
  serial?: string | null;
  className?: string;
};

const VIEWBOX = "0 0 800 1000";

/** Garment silhouettes, drawn once and reused with different tone/prints. */
function garmentPaths(spec: ArtSpec) {
  switch (spec.kind) {
    case "tee":
      return [
        "M 296 168 C 340 140 460 140 504 168 L 648 216 L 736 384 L 606 436 L 572 348 L 572 884 C 500 906 300 906 228 884 L 228 348 L 194 436 L 64 384 L 152 216 Z",
      ];
    case "hoodie":
      return [
        "M 286 190 C 300 96 500 96 514 190 C 540 200 566 212 580 224 L 668 268 L 748 436 L 618 486 L 588 396 L 588 890 C 512 912 288 912 212 890 L 212 396 L 182 486 L 52 436 L 132 268 L 220 224 C 234 212 260 200 286 190 Z",
      ];
    case "pants":
      return [
        "M 250 250 L 236 906 L 384 906 L 400 566 L 416 906 L 564 906 L 550 250 Z",
      ];
    case "cap":
      return [
        "M 226 556 C 226 366 574 366 574 556 L 574 592 L 226 592 Z",
        "M 206 592 L 594 592 C 646 620 664 664 650 700 L 520 654 L 206 654 Z",
      ];
    case "beanie":
      return [
        "M 246 640 C 246 380 554 380 554 640 L 554 700 L 246 700 Z",
      ];
    case "bag":
      return ["M 236 366 L 564 366 L 596 876 L 204 876 Z"];
    default:
      return ["M 296 168 C 340 140 460 140 504 168 L 648 216 L 736 384 L 606 436 L 572 348 L 572 884 C 500 906 300 906 228 884 L 228 348 L 194 436 L 64 384 L 152 216 Z"];
  }
}

function Wordmark({
  x,
  y,
  size,
  fill,
  text = "EL BATEL",
  opacity = 1,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  text?: string;
  opacity?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      opacity={opacity}
      textAnchor="middle"
      fontFamily="Anton, Impact, sans-serif"
      fontSize={size}
      letterSpacing={size * 0.02}
    >
      {text}
    </text>
  );
}

function WovenLabel({ serial, tone, x = 400, y = 820 }: { serial?: string | null; tone: string; x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-96} y={-30} width={192} height={60} fill="#0A0A0A" stroke={tone} strokeWidth={1} />
      <text
        x={0}
        y={-6}
        fill="#F5F3EF"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={13}
        letterSpacing={3}
      >
        EL BATEL
      </text>
      <text
        x={0}
        y={16}
        fill="#E10600"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={12}
        letterSpacing={1.5}
      >
        {serial ?? "LIMITED"}
      </text>
    </g>
  );
}

function DetailView({ spec, serial }: { spec: ArtSpec; serial?: string | null }) {
  const c = TONE_COLORS[spec.tone];
  return (
    <g>
      <rect x={0} y={0} width={800} height={1000} fill={c.base} />
      <rect x={0} y={0} width={800} height={1000} fill="url(#fabricShade)" />
      <g stroke={c.stitch} strokeWidth={1.4} fill="none" strokeDasharray="9 8">
        <path d="M 120 120 L 680 120 L 680 880 L 120 880 Z" />
        <path d="M 168 168 L 632 168 L 632 832 L 168 832 Z" opacity={0.5} />
      </g>
      <g stroke={c.stitch} strokeWidth={1} opacity={0.6}>
        <path d="M 120 500 L 680 500" strokeDasharray="4 10" />
      </g>
      <g transform="translate(400 470) rotate(-4)">
        <rect x={-230} y={-120} width={460} height={240} fill="#0A0A0A" stroke="rgba(255,255,255,0.18)" />
        <rect x={-230} y={-120} width={6} height={240} fill="#E10600" />
        <text
          x={-190}
          y={-42}
          fill="#F5F3EF"
          fontFamily="Anton, sans-serif"
          fontSize={64}
          letterSpacing={1}
        >
          EL BATEL
        </text>
        <text
          x={-188}
          y={8}
          fill="rgba(255,255,255,0.55)"
          fontFamily="JetBrains Mono, monospace"
          fontSize={16}
          letterSpacing={6}
        >
          LIMITED EDITION
        </text>
        <text
          x={-188}
          y={62}
          fill="#FFFFFF"
          fontFamily="JetBrains Mono, monospace"
          fontSize={44}
          letterSpacing={2}
        >
          {serial ?? "ELB-0000"}
        </text>
        <rect x={-188} y={78} width={300} height={2} fill="#E10600" />
      </g>
      <circle cx={640} cy={250} r={17} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={6} />
      <circle cx={640} cy={250} r={26} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
    </g>
  );
}

export function GarmentArt({ spec, serial, className }: GarmentArtProps) {
  const parsed = parseArt(spec);
  const c = TONE_COLORS[parsed.tone];
  const uid = spec.replace(/[^a-z0-9]/gi, "");
  const paths = garmentPaths(parsed);
  const isLight = parsed.tone === "bone";
  const clipId = `clip-${uid}-${serial ?? "n"}`;

  return (
    <svg
      viewBox={VIEWBOX}
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${parsed.kind} ${parsed.tone} ${parsed.view}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`fabric-${uid}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="42%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.shade} />
        </linearGradient>
        <linearGradient id={`fold-${uid}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="45%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
        </linearGradient>
        <radialGradient id={`spot-${uid}`} cx="0.62" cy="0.22" r="0.72">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="fabricShade" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
          <stop offset="70%" stopColor="rgba(0,0,0,0.35)" />
        </linearGradient>
        <radialGradient id={`redglow-${uid}`} cx="0.86" cy="0.94" r="0.55">
          <stop offset="0%" stopColor="rgba(225,6,0,0.42)" />
          <stop offset="100%" stopColor="rgba(225,6,0,0)" />
        </radialGradient>
        <pattern id={`dots-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="0.9" fill={isLight ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.10)"} />
        </pattern>
        <clipPath id={clipId}>
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
      </defs>

      {/* studio backdrop */}
      <rect width={800} height={1000} fill="#060606" />
      <rect width={800} height={1000} fill={`url(#spot-${uid})`} />
      <rect width={800} height={1000} fill={`url(#redglow-${uid})`} />
      <g opacity={0.5} stroke="rgba(255,255,255,0.05)" strokeWidth={1}>
        <path d="M 0 250 L 800 250" />
        <path d="M 0 750 L 800 750" />
        <path d="M 266 0 L 266 1000" />
        <path d="M 533 0 L 533 1000" />
      </g>

      {parsed.view === "detail" ? (
        <DetailView spec={parsed} serial={serial} />
      ) : (
        <g>
          {/* garment body */}
          <g>
            {paths.map((d, i) => (
              <path key={`fill-${i}`} d={d} fill={`url(#fabric-${uid})`} stroke="rgba(255,255,255,0.10)" strokeWidth={1.5} />
            ))}
            <g clipPath={`url(#${clipId})`}>
              <rect width={800} height={1000} fill={`url(#dots-${uid})`} />
              <rect width={800} height={1000} fill={`url(#fold-${uid})`} />
            </g>
          </g>

          {/* construction detail */}
          {parsed.kind === "tee" && (
            <g fill="none" stroke={c.stitch} strokeWidth={1.4}>
              <path d="M 296 168 C 340 214 460 214 504 168" />
              <path d="M 228 350 L 194 436" strokeDasharray="7 7" />
              <path d="M 572 350 L 606 436" strokeDasharray="7 7" />
              <path d="M 232 878 L 568 878" strokeDasharray="9 9" />
            </g>
          )}

          {parsed.kind === "hoodie" && (
            <g fill="none" stroke={c.stitch} strokeWidth={1.4}>
              <path d="M 314 200 C 330 268 470 268 486 200" />
              <path d="M 286 190 C 300 118 500 118 514 190" opacity={0.7} />
              <path d="M 330 300 L 336 420" strokeWidth={3} stroke={c.print} opacity={0.5} />
              <path d="M 470 300 L 464 420" strokeWidth={3} stroke={c.print} opacity={0.5} />
              <circle cx={336} cy={430} r={7} fill="#8a8a8a" stroke="none" />
              <circle cx={464} cy={430} r={7} fill="#8a8a8a" stroke="none" />
              <path d="M 236 640 L 564 640" strokeDasharray="8 8" />
              <path d="M 216 862 L 584 862" strokeDasharray="9 9" />
              <path d="M 212 396 L 182 486" strokeDasharray="7 7" />
              <path d="M 588 396 L 618 486" strokeDasharray="7 7" />
            </g>
          )}

          {parsed.kind === "pants" && (
            <g stroke={c.stitch} strokeWidth={1.4} fill="none">
              <path d="M 250 250 L 550 250 L 550 320 L 250 320 Z" />
              <path d="M 400 320 L 400 566" />
              <path d="M 258 900 L 366 900" strokeDasharray="8 8" />
              <path d="M 434 900 L 542 900" strokeDasharray="8 8" />
              <path d="M 300 340 L 296 470" strokeDasharray="6 8" opacity={0.8} />
              <path d="M 500 340 L 504 470" strokeDasharray="6 8" opacity={0.8} />
            </g>
          )}

          {parsed.kind === "cap" && (
            <g stroke={c.stitch} strokeWidth={1.4} fill="none">
              <path d="M 400 372 L 400 556" />
              <path d="M 300 396 L 296 560" opacity={0.7} />
              <path d="M 500 396 L 504 560" opacity={0.7} />
              <path d="M 226 592 L 574 592" strokeDasharray="7 7" />
              <circle cx={400} cy={382} r={9} fill="#9a9a9a" stroke="none" />
            </g>
          )}

          {parsed.kind === "beanie" && (
            <g stroke={c.stitch} strokeWidth={1.4} fill="none">
              <path d="M 246 640 L 554 640" strokeDasharray="7 7" />
              {Array.from({ length: 14 }).map((_, i) => (
                <path key={i} d={`M ${268 + i * 20} 652 L ${268 + i * 20} 698`} opacity={0.55} />
              ))}
            </g>
          )}

          {parsed.kind === "bag" && (
            <g stroke={c.stitch} strokeWidth={1.6} fill="none">
              <path d="M 300 368 C 300 240 500 240 500 368" />
              <path d="M 236 400 L 564 400" strokeDasharray="8 8" />
              <path d="M 216 850 L 584 850" strokeDasharray="8 8" />
            </g>
          )}

          {/* prints */}
          <g>
            {parsed.view === "front" && (
              <>
                {parsed.kind !== "pants" && parsed.kind !== "cap" && parsed.kind !== "beanie" && parsed.kind !== "bag" && (
                  <>
                    <Wordmark x={400} y={520} size={74} fill={c.print} />
                    <rect x={286} y={548} width={228} height={3} fill="#E10600" />
                    <text
                      x={400}
                      y={606}
                      fill={c.print}
                      opacity={0.62}
                      textAnchor="middle"
                      fontFamily="JetBrains Mono, monospace"
                      fontSize={19}
                      letterSpacing={7}
                    >
                      WEAR THE CULTURE
                    </text>
                  </>
                )}
                {parsed.kind === "cap" && <Wordmark x={400} y={510} size={62} fill={c.print} />}
                {parsed.kind === "beanie" && <Wordmark x={400} y={580} size={54} fill={c.print} />}
                {parsed.kind === "bag" && (
                  <>
                    <Wordmark x={400} y={620} size={68} fill={c.print} />
                    <rect x={300} y={646} width={200} height={3} fill="#E10600" />
                  </>
                )}
                {parsed.kind === "pants" && (
                  <>
                    <text
                      x={400}
                      y={560}
                      fill={c.print}
                      textAnchor="middle"
                      fontFamily="Anton, sans-serif"
                      fontSize={46}
                      opacity={0.92}
                    >
                      EL BATEL
                    </text>
                    <rect x={330} y={578} width={140} height={3} fill="#E10600" />
                  </>
                )}
              </>
            )}

            {parsed.view === "back" && (
              <>
                <Wordmark x={400} y={430} size={96} fill={c.print} opacity={0.94} />
                <rect x={198} y={462} width={404} height={3} fill="#E10600" />
                <text
                  x={400}
                  y={540}
                  fill={c.print}
                  opacity={0.5}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={22}
                  letterSpacing={12}
                >
                  NUMBERED EDITION
                </text>
                <rect
                  x={330}
                  y={640}
                  width={140}
                  height={48}
                  fill="none"
                  stroke={c.stitch}
                  strokeDasharray="6 6"
                />
                <text
                  x={400}
                  y={671}
                  fill={c.print}
                  opacity={0.7}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={17}
                  letterSpacing={4}
                >
                  {serial ?? "ELB-0000"}
                </text>
              </>
            )}

            {parsed.kind !== "cap" && parsed.kind !== "beanie" && (
              <WovenLabel
                serial={serial}
                tone={c.stitch}
                y={parsed.kind === "bag" ? 760 : parsed.kind === "pants" ? 760 : 812}
                x={parsed.kind === "bag" ? 400 : 400}
              />
            )}
          </g>
        </g>
      )}
    </svg>
  );
}

type ProductImageProps = {
  src: string | null | undefined;
  alt?: string;
  serial?: string | null;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/**
 * Renders either a real uploaded photo (`http…` / a Convex storage URL) or one
 * of the generated EL BATEL garment artworks (`art:kind:tone:view`).
 */
export function ProductImage({
  src,
  alt,
  serial,
  className,
  imgClassName,
  priority = false,
}: ProductImageProps) {
  if (!src) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-graphite", className)}>
        <span className="eyebrow">NO IMAGE</span>
      </div>
    );
  }
  if (isArtSpec(src)) {
    return (
      <div className={cn("h-full w-full", className)}>
        <GarmentArt spec={src} serial={serial} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? "EL BATEL piece"}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn("h-full w-full object-cover", imgClassName, className)}
    />
  );
}
