import type { ScoringResult, Verdict } from "../backend/scoring";
import { PALETTE, VERDICT_LABELS, VERDICT_SUBTEXT } from "./shared";

const CONFIDENCE_CHIP: Record<string, React.CSSProperties> = {
  High:   { background: "#111827", color: "#fff" },
  Medium: { background: "#e5e7eb", color: "#374151" },
  Low:    { background: "#fef3c7", color: "#92400e" },
};

function fallbackReasoning(verdict: Verdict, gate: string | null): string {
  if (gate === "G1") return "This workflow occurs too infrequently to justify any automation investment.";
  if (gate === "G2") return "The automation potential score is too low. The time savings and volume do not add up to a clear ROI.";
  if (gate === "G3") return "The data quality is insufficient to support reliable AI automation at this scale.";
  if (gate === "G4") return "This is primarily a physical workflow. Software AI cannot meaningfully automate it.";
  if (verdict === "BUY")   return "This recommendation is driven by high workflow suitability for off-the-shelf AI tools and manageable risk and complexity.";
  if (verdict === "BUILD") return "This recommendation is driven by high automation potential and suitability, combined with the need for custom fit that off-the-shelf tools cannot provide.";
  if (verdict === "HYBRID")return "This recommendation is driven by a workflow that fits AI well but has enough complexity or risk to require customization beyond what a standard tool provides.";
  return "The scoring engine evaluated this workflow and reached this verdict based on the inputs provided.";
}

interface Props {
  result:    ScoringResult;
  reasoning: string | null;
}

export default function HeroCard({ result, reasoning }: Props) {
  const p = PALETTE[result.verdict];

  return (
    <div style={{
      borderRadius: "1rem", border: `2px solid ${p.border}`,
      background: p.bg, padding: "2rem",
    }}>
      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <span style={{
          borderRadius: "9999px", padding: "0.25rem 0.875rem",
          fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          background: p.badge, color: p.badgeText,
        }}>
          {result.verdict}
        </span>
        <span style={{
          borderRadius: "9999px", padding: "0.2rem 0.75rem",
          fontSize: "0.7rem", fontWeight: 600,
          ...CONFIDENCE_CHIP[result.confidence],
        }}>
          {result.confidence} confidence
        </span>
      </div>

      {/* Headline */}
      <p style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: p.label, margin: 0, lineHeight: 1.1 }}>
        {VERDICT_LABELS[result.verdict]}
      </p>
      <p style={{ marginTop: "0.3rem", fontSize: "0.875rem", color: "#6b7280", marginBottom: 0 }}>
        {VERDICT_SUBTEXT[result.verdict]}
      </p>

      {/* Summary paragraph */}
      <p style={{
        marginTop: "1.25rem", fontSize: "0.9rem", color: "#374151",
        lineHeight: 1.7, marginBottom: 0,
        paddingTop: "1.25rem", borderTop: `1px solid ${p.border}`,
      }}>
        {reasoning ?? fallbackReasoning(result.verdict, result.firedGate)}
      </p>

      {/* Payoff outlook */}
      {result.roi && (
        <div style={{
          marginTop: "1.25rem", paddingTop: "1rem", borderTop: `1px solid ${p.border}`,
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>
            Payoff outlook
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: p.label }}>
            {result.roi.payoffCategory === "fast"     ? "Likely fast payoff" :
             result.roi.payoffCategory === "moderate" ? "Moderate payoff timeline" :
                                                        "Slow payoff, multi-year"}
          </span>
        </div>
      )}
    </div>
  );
}
