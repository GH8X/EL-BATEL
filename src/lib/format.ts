/**
 * Formatting helpers. The active locale is set by the language provider, so
 * amounts keep the currency and value they always had — only grouping and date
 * presentation follow the visitor's language. Serial numbers never change.
 */

let priceLocale = "en-GB";

export function setPriceLocale(locale: string) {
  priceLocale = locale;
}

export function currentLocale(): string {
  return priceLocale;
}

export function formatPrice(minor: number, currency = "EUR"): string {
  const value = (minor ?? 0) / 100;
  const symbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£", DZD: "DA" };
  const symbol = symbols[currency] ?? "";
  const formatted = value.toLocaleString(priceLocale, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currency}`;
}

/** "ELB-0047" -> "#0047" for the editorial serial display. */
export function serialNumber(serial: string | null | undefined): string {
  if (!serial) return "—";
  const parts = serial.split("-");
  return `#${parts[parts.length - 1]}`;
}

export function serialPrefix(serial: string | null | undefined): string {
  if (!serial) return "ELB";
  const parts = serial.split("-");
  return parts.length > 1 ? parts.slice(0, -1).join("-") : "ELB";
}

export function formatDate(value: number, withTime = false): string {
  const date = new Date(value);
  return date.toLocaleDateString(priceLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatDateTime(value: number): string {
  return formatDate(value, true);
}

export function countdownParts(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

export function pad2(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

export function statusLabel(status: string): string {
  return status.toUpperCase();
}
