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

export function decodeInputs(encoded: string): ScoringInput | null {
  try {
    return JSON.parse(fromBase64Url(encoded)) as ScoringInput;
  } catch {
    return null;
  }
}
