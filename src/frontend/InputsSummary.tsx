import type { ScoringInput } from "../backend/scoring";

const TIME_LABELS: Record<string, string> = {
  "<2min": "< 2 min", "2-10min": "2–10 min", "10-30min": "10–30 min",
  "30-60min": "30–60 min", "60+min": "60+ min",
};
const BUDGET_LABELS: Record<string, string> = {
  Micro: "Budget: Micro", Small: "Budget: Small", Medium: "Budget: Medium", Large: "Budget: Large",
};
const TIMELINE_LABELS: Record<string, string> = {
  Immediate: "Timeline: Immediate", "1month": "Timeline: 1 month",
  "3months": "Timeline: 3 months", Flexible: "Timeline: Flexible",
};

export default function InputsSummary({ input }: { input: ScoringInput }) {
  const chips = [
    `${input.volume.toLocaleString()}/mo`,
    TIME_LABELS[input.timePerRun]  ?? input.timePerRun,
    `$${input.laborCost}/hr`,
    input.workflowNature,
    input.dataReadiness,
    input.sensitivity,
    BUDGET_LABELS[input.budget]    ?? input.budget,
    TIMELINE_LABELS[input.timeline] ?? input.timeline,
  ];

  return (
    <div style={{
      borderRadius: "0.75rem", border: "1px solid #e5e7eb",
      background: "#f9fafb", padding: "0.875rem 1.25rem",
    }}>
      <p style={{ margin: "0 0 0.4rem", fontSize: "0.65rem", fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>
        Workflow assessed
      </p>
      {input.workflowDescription && (
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#374151", lineHeight: 1.5 }}>
          {input.workflowDescription}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {chips.map(chip => (
          <span key={chip} style={{
            padding: "0.2rem 0.625rem", borderRadius: "9999px",
            background: "#fff", border: "1px solid #e5e7eb",
            fontSize: "0.7rem", color: "#6b7280", fontWeight: 500, whiteSpace: "nowrap",
          }}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
