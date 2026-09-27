export type GarmentKind = "hoodie" | "tee" | "pants" | "cap" | "beanie" | "bag";
export type GarmentTone = "black" | "charcoal" | "bone" | "red";
export type GarmentView = "front" | "back" | "detail";

export type ArtSpec = {
  kind: GarmentKind;
  tone: GarmentTone;
  view: GarmentView;
};

const KINDS: GarmentKind[] = ["hoodie", "tee", "pants", "cap", "beanie", "bag"];
const TONES: GarmentTone[] = ["black", "charcoal", "bone", "red"];
const VIEWS: GarmentView[] = ["front", "back", "detail"];

export function isArtSpec(value: string): boolean {
  return value.startsWith("art:");
}

/** "art:hoodie:black:front" -> { kind, tone, view } */
export function parseArt(spec: string): ArtSpec {
  const parts = spec.split(":");
  const kind = KINDS.includes(parts[1] as GarmentKind) ? (parts[1] as GarmentKind) : "hoodie";
  const tone = TONES.includes(parts[2] as GarmentTone) ? (parts[2] as GarmentTone) : "black";
  const view = VIEWS.includes(parts[3] as GarmentView) ? (parts[3] as GarmentView) : "front";
  return { kind, tone, view };
}

export function buildArt(kind: GarmentKind, tone: GarmentTone = "black", view: GarmentView = "front") {
  return `art:${kind}:${tone}:${view}`;
}

/** Human label for a product image slot, used as alt text. */
export function artLabel(spec: string): string {
  const { kind, tone, view } = parseArt(spec);
  const names: Record<GarmentKind, string> = {
    hoodie: "Hoodie",
    tee: "T-shirt",
    pants: "Pants",
    cap: "Cap",
    beanie: "Beanie",
    bag: "Tote bag",
  };
  const tones: Record<GarmentTone, string> = {
    black: "black",
    charcoal: "charcoal",
    bone: "bone",
    red: "red",
  };
  const views: Record<GarmentView, string> = { front: "front", back: "back", detail: "detail" };
  return `EL BATEL ${names[kind]} — ${tones[tone]} — ${views[view]}`;
}

export const TONE_COLORS: Record<
  GarmentTone,
  { base: string; shade: string; light: string; print: string; stitch: string }
> = {
  black: {
    base: "#101010",
    shade: "#050505",
    light: "#242424",
    print: "#EDEAE4",
    stitch: "rgba(255,255,255,0.22)",
  },
  charcoal: {
    base: "#1c1c1c",
    shade: "#0c0c0c",
    light: "#333333",
    print: "#F2EFE9",
    stitch: "rgba(255,255,255,0.24)",
  },
  bone: {
    base: "#E6E2DA",
    shade: "#BFBAB0",
    light: "#FBF9F5",
    print: "#0A0A0A",
    stitch: "rgba(0,0,0,0.28)",
  },
  red: {
    base: "#8E0700",
    shade: "#5A0400",
    light: "#E10600",
    print: "#0A0A0A",
    stitch: "rgba(255,255,255,0.3)",
  },
};
