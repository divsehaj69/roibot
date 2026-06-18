export interface Explanation {
  reasoning:      string;
  roi:            string;
  risks:          string[];
  verdictSection: string;
}

export function isValidExplanation(val: unknown): val is Explanation {
  if (typeof val !== "object" || val === null) return false;
  const v = val as Record<string, unknown>;
  return (
    typeof v.reasoning      === "string" &&
    typeof v.roi            === "string" &&
    Array.isArray(v.risks)  &&
    v.risks.length          >= 3         &&
    v.risks.every((r: unknown) => typeof r === "string") &&
    typeof v.verdictSection === "string"
  );
}

// ── Review flags ──────────────────────────────────────────────────────────────
// Flags come from a separate description-analysis path and never affect scoring.

export type FlagSeverity = "info" | "warning" | "strong-warning";

export interface ReviewFlag {
  severity: FlagSeverity;
  field:    string;   // which input to revisit (e.g. "sensitivity")
  message:  string;   // plain English — never contains a suggested replacement value
}

export function isValidReviewFlags(val: unknown): val is ReviewFlag[] {
  if (!Array.isArray(val)) return false;
  return val.every(f => {
    if (typeof f !== "object" || f === null) return false;
    const flag = f as Record<string, unknown>;
    return (
      ["info", "warning", "strong-warning"].includes(flag.severity as string) &&
      typeof flag.field   === "string" &&
      typeof flag.message === "string"
    );
  });
}
