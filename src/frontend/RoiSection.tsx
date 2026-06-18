import type { ScoringInput, ScoringResult } from "../backend/scoring";
import { TIME_HOURS, LABOR_RATES } from "../backend/scoring.config";
import { SectionCard, SectionTitle, PALETTE } from "./shared";

function fmtMoney(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `$${n}`;
}

const PAYOFF_LABEL: Record<string, string> = {
  fast:     "Likely fast payoff",
  moderate: "Moderate payoff timeline",
  slow:     "Slow payoff, multi-year",
};

export default function RoiSection({ result, input }: { result: ScoringResult; input: ScoringInput }) {
  const p = PALETTE[result.verdict];

  if (!result.roi) {
    return (
      <SectionCard>
        <SectionTitle>Value at stake</SectionTitle>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
          Not applicable. The verdict is DON&apos;T — automation potential does not support a case for investment at this stage.
        </p>
      </SectionCard>
    );
  }

  const roi       = result.roi;
  const hrsPerRun = TIME_HOURS[input.timePerRun] ?? 0;
  const laborRate = LABOR_RATES[input.laborCost] ?? 0;
  const timeLabel = hrsPerRun < 1 ? `${Math.round(hrsPerRun * 60)} min` : `${hrsPerRun} hr`;

  return (
    <SectionCard>
      <SectionTitle>Value at stake</SectionTitle>

      {/* Annual labor value range */}
      <div style={{
        borderRadius: "0.75rem", border: `1.5px solid ${p.border}`,
        background: p.bg, padding: "1rem 1.25rem", marginBottom: "1rem",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem",
      }}>
        <div>
          <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>Low estimate</p>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: p.label, letterSpacing: "-0.02em" }}>{fmtMoney(roi.annualLaborValueLow)}</p>
        </div>
        <div>
          <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>Mid estimate</p>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: p.label, letterSpacing: "-0.02em" }}>{fmtMoney(roi.annualLaborValueMid)}</p>
        </div>
        <div>
          <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>High estimate</p>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: p.label, letterSpacing: "-0.02em" }}>{fmtMoney(roi.annualLaborValueHigh)}</p>
        </div>
      </div>
      <p style={{ margin: "-0.5rem 0 1rem", fontSize: "0.72rem", color: "#9ca3af" }}>
        Annual labor cost at stake. This is not a payback calculation.
      </p>

      {/* Payoff category */}
      <div style={{
        marginBottom: "1rem", padding: "0.625rem 1rem",
        borderRadius: "0.5rem", background: "#f9fafb", border: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", gap: "0.75rem",
      }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>Payoff outlook</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>{PAYOFF_LABEL[roi.payoffCategory]}</span>
      </div>

      {/* Assumptions table */}
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}>
        How this is calculated
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {[
          ["Volume (exact)",        `${input.volume.toLocaleString()} runs/month`],
          ["Time per run",          `${timeLabel} (representative for "${input.timePerRun}" band)`],
          ["Labor rate",            `$${laborRate}/hr (representative for "$${input.laborCost}/hr" band)`],
          ["Annual labor value",    `${input.volume.toLocaleString()} × ${timeLabel} × $${laborRate}/hr × 12 months`],
          ["Range",                 `±25% on the mid estimate`],
        ].map(([label, value]) => (
          <div key={label as string} style={{
            display: "flex", justifyContent: "space-between", gap: "1rem",
            fontSize: "0.8rem", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.3rem",
          }}>
            <span style={{ color: "#6b7280", flexShrink: 0 }}>{label}</span>
            <span style={{ color: "#374151", fontWeight: 500, textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: "0.75rem 0 0", fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1.5 }}>
        This represents the labor cost involved in the workflow at stated volume, not a precise ROI or payback figure. Implementation costs, adoption rate, and maintenance are not included.
      </p>
    </SectionCard>
  );
}
