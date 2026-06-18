import type { ScoringResult } from "../backend/scoring";
import { SectionCard, SectionTitle, ScoreBar, PALETTE } from "./shared";

export default function Scorecard({ result }: { result: ScoringResult }) {
  const p = PALETTE[result.verdict];

  return (
    <SectionCard>
      <SectionTitle>Scorecard</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        <ScoreBar label="Automation Potential"  value={result.automationPotential} color={p.bar} />
        <ScoreBar label="AI Suitability"         value={result.aiSuitability}       color={p.bar} />
        <ScoreBar label="Risk & Complexity"       value={result.riskComplexity}      color={p.bar} />
        <ScoreBar label="Feasibility"             value={result.feasibility}         color={p.bar} />
      </div>
      <p style={{ margin: "0.875rem 0 0", fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1.5 }}>
        Automation Potential and AI Suitability drive the BUILD/HYBRID/BUY decision. Risk above 70 triggers human-review. Feasibility applies a single downgrade if budget, engineering capacity, or timeline are constrained.
      </p>
    </SectionCard>
  );
}
