import type { Verdict } from "../backend/scoring";
import { SectionCard, SectionTitle } from "./shared";

const STEPS: Record<Verdict, string[]> = {
  "DON'T": [
    "Set a reassessment date in 6 to 12 months — track the one metric (volume, task length, or data quality) that would flip this verdict.",
    "Document the reason for this decision. Future teams will revisit it; they need the original reasoning.",
    "Redirect this budget to higher-potential workflows identified through the same process.",
  ],
  "BUY": [
    "List the specific capabilities this workflow requires — do not let a vendor define scope for you.",
    "Shortlist 2 to 3 tools that fit and run a time-limited pilot (30 days maximum) with a defined success threshold.",
    "Assign one person to own vendor management from day one — it gets complicated fast.",
    "Verify data privacy and compliance requirements before signing anything.",
  ],
  "BUILD": [
    "Define the minimum viable scope: what must the first version do? Defer everything else to v2.",
    "Audit your training or context data before writing a line of code — quality determines ceiling.",
    "Set up monitoring and output validation before go-live, not after.",
    "Budget explicitly for ongoing maintenance. AI systems drift — plan quarterly reviews from the start.",
  ],
  "HYBRID": [
    "Choose the core platform first. Validate that it handles 80% of the workflow before scoping the custom layer.",
    "Keep the custom layer narrow. Every custom component you add increases long-term maintenance.",
    "Clarify ownership: which parts are vendor-managed and which are in-house? Write it down.",
    "Phase 1 is the platform buy. Phase 2 is the custom build. Do not run them in parallel.",
  ],
};

export default function NextSteps({ verdict }: { verdict: Verdict }) {
  const steps = STEPS[verdict];

  return (
    <SectionCard>
      <SectionTitle>Next steps</SectionTitle>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {steps.map((step, i) => (
          <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <span style={{
              flexShrink: 0, width: "1.5rem", height: "1.5rem", borderRadius: "9999px",
              background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", marginTop: "0.1rem",
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>{step}</span>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
