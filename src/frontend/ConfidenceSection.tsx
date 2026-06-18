import type { Confidence } from "../backend/scoring";
import { SectionCard, SectionTitle } from "./shared";

const CONFIDENCE_EXPLANATION: Record<Confidence, string> = {
  High:   "The inputs landed clearly within one outcome zone. The composite scores are well away from every decision boundary. A minor change to any single input would not shift the verdict.",
  Medium: "One or more scores landed within 15 points of a decision boundary. A meaningful change to volume, task duration, data quality, or integration complexity could shift the verdict.",
  Low:    "The workflow sits close to a threshold. The direction is correct, but the recommendation is marginal. Gather more precise inputs on volume, data readiness, and integration scope before committing.",
};

const CONFIDENCE_CHIP: Record<Confidence, React.CSSProperties> = {
  High:   { background: "#111827", color: "#fff" },
  Medium: { background: "#e5e7eb", color: "#374151" },
  Low:    { background: "#fef3c7", color: "#92400e" },
};

interface Props {
  confidence:     Confidence;
  reviewFlagCount: number;
}

export default function ConfidenceSection({ confidence, reviewFlagCount }: Props) {
  return (
    <SectionCard>
      <SectionTitle>Confidence in this verdict</SectionTitle>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <span style={{
          borderRadius: "9999px", padding: "0.25rem 0.875rem",
          fontSize: "0.8rem", fontWeight: 700, ...CONFIDENCE_CHIP[confidence],
        }}>
          {confidence} confidence
        </span>
        {reviewFlagCount > 0 && (
          <span style={{
            borderRadius: "9999px", padding: "0.25rem 0.875rem",
            fontSize: "0.8rem", fontWeight: 700,
            background: "#fff1f2", color: "#be123c", border: "1.5px solid #fecdd3",
          }}>
            {reviewFlagCount} review {reviewFlagCount === 1 ? "flag" : "flags"}
          </span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", lineHeight: 1.65 }}>
        {CONFIDENCE_EXPLANATION[confidence]}
      </p>
      {reviewFlagCount > 0 && (
        <p style={{ margin: "0.625rem 0 0", fontSize: "0.78rem", color: "#9ca3af", lineHeight: 1.5 }}>
          Review flags are separate from confidence. Confidence measures how far the scores sit from decision boundaries. Flags highlight possible mismatches between the description and the structured inputs you provided.
        </p>
      )}
    </SectionCard>
  );
}
