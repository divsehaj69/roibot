import type { ScoringInput } from "./scoring";

// Uses btoa/atob — works in both browser and Node.js (Node 16+).
// URL-safe base64: replace +→- /→_ and strip trailing =

function toBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(base64)));
}

export function encodeInputs(input: ScoringInput): string {
  return toBase64Url(JSON.stringify(input));
}

const VOLUME_BAND_MIDPOINTS: Record<string, number> = {
  "<10":        5,
  "10-99":     50,
  "100-999":  500,
  "1000-9999": 5000,
  "10000+":   15000,
};

export function decodeInputs(encoded: string): ScoringInput | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    // Migrate old VolumeRange strings to numbers
    if (typeof parsed.volume === "string") {
      parsed.volume = VOLUME_BAND_MIDPOINTS[parsed.volume] ?? 100;
    }
    return parsed as ScoringInput;
  } catch {
    return null;
  }
}
