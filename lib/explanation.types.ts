export interface Explanation {
  reasoning:      string;
  roi:            string;
  risks:          [string, string, string];
  verdictSection: string;
}

export function isValidExplanation(val: unknown): val is Explanation {
  if (typeof val !== "object" || val === null) return false;
  const v = val as Record<string, unknown>;
  return (
    typeof v.reasoning      === "string" &&
    typeof v.roi            === "string" &&
    Array.isArray(v.risks)  &&
    v.risks.length          === 3        &&
    v.risks.every((r: unknown) => typeof r === "string") &&
    typeof v.verdictSection === "string"
  );
}
