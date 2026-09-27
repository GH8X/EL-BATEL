import { cn } from "@/lib/utils";

type IconProps = { className?: string; knockout?: string };

/** YouTube player mark (rounded screen + play triangle). */
export function YouTubeIcon({ className, knockout = "#000" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <rect x="1.4" y="4.6" width="21.2" height="14.8" rx="4.6" fill="currentColor" />
      <path d="M10.2 8.7 15.9 12l-5.7 3.3V8.7Z" fill={knockout} />
    </svg>
  );
}

/** Spotify mark (circle + three sound bars). */
export function SpotifyIcon({ className, knockout = "#000" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <g stroke={knockout} strokeLinecap="round" fill="none">
        <path d="M6.6 9.6c3.4-1 7.3-.7 10.7 1.1" strokeWidth="1.9" />
        <path d="M7.4 12.7c2.8-.8 6-.6 8.9.9" strokeWidth="1.6" />
        <path d="M8.2 15.5c2.3-.6 4.8-.4 7.1.8" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

/** Instagram mark built from primitives so it stays crisp at any size. */
export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <rect
        x="2.4"
        y="2.4"
        width="19.2"
        height="19.2"
        rx="5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.3" cy="6.7" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97a8.9 8.9 0 0 1-1.62-.93c-.01 2.92.01 5.84-.02 8.75a7.3 7.3 0 0 1-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21a7.4 7.4 0 0 1-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96a7.3 7.3 0 0 1 6.15-1.72c.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37a3.3 3.3 0 0 0-1.36 1.75c-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z"
      />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.8 7.8L22.6 22h-6.9l-4.5-6.2L5.7 22H2.6l7.1-8.1L1.7 2h6.9l4.3 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z"
      />
    </svg>
  );
}

function GenericIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.4 12h17.2M12 2.6c2.6 3 2.6 15.8 0 18.8M12 2.6c-2.6 3-2.6 15.8 0 18.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function platformIcon(platform: string, props: IconProps = {}) {
  switch (platform.toLowerCase()) {
    case "youtube":
      return <YouTubeIcon {...props} />;
    case "spotify":
      return <SpotifyIcon {...props} />;
    case "instagram":
      return <InstagramIcon {...props} />;
    case "tiktok":
      return <TikTokIcon {...props} />;
    case "x":
    case "twitter":
      return <XIcon {...props} />;
    default:
      return <GenericIcon {...props} />;
  }
}
