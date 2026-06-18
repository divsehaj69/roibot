import type { ScoringInput, ScoringResult, Gate } from "../backend/scoring";
import { SectionCard, SectionTitle, Bullet } from "./shared";
import { PALETTE } from "./shared";
import {
  GATE_POTENTIAL_MIN, BUILD_AP_MIN, BUILD_SUIT_MIN,
  HYBRID1_RISK_MAX, HYBRID2_RISK_MIN, HYBRID2_RISK_MAX,
} from "../backend/scoring.config";

function getFlipConditions(input: ScoringInput, result: ScoringResult): string[] {
  const { verdict, automationPotential: ap, aiSuitability: suit, riskComplexity: risk, firedGate } = result;

  if (verdict === "DON'T") {
    return flipFromDont(ap, risk, firedGate, input);
  }
  if (verdict === "BUY") {
    const items: string[] = [];
    if (ap < BUILD_AP_MIN) items.push(`Automation Potential is ${ap}/100 (needs ${BUILD_AP_MIN} for a HYBRID or BUILD path). Increasing volume, task duration, or labor cost would close the gap.`);
    if (risk < HYBRID2_RISK_MIN) items.push(`Risk & Complexity is ${risk}/100 (needs ${HYBRID2_RISK_MIN}–${HYBRID2_RISK_MAX} to trigger HYBRID). More integration dependencies or regulated data would shift this.`);
    if (suit < BUILD_SUIT_MIN) items.push(`AI Suitability is ${suit}/100 (needs ${BUILD_SUIT_MIN} for BUILD). Less judgment-intensive work or cleaner data would improve this score.`);
    return items.slice(0, 3);
  }
  if (verdict === "HYBRID") {
    const items: string[] = [];
    if (suit < BUILD_SUIT_MIN) items.push(`AI Suitability is ${suit}/100. Reaching ${BUILD_SUIT_MIN} would make BUILD viable if budget and engineering capacity are in place.`);
    if (risk > HYBRID2_RISK_MAX) items.push(`Risk & Complexity is ${risk}/100. Reducing it below ${HYBRID2_RISK_MAX} (simpler integrations, less sensitive data) would narrow the recommendation to BUY.`);
    items.push("Reduced engineering capacity or a smaller budget would trigger a downgrade to BUY.");
    return items.slice(0, 3);
  }
  if (verdict === "BUILD") {
    return [
      `AI Suitability is ${suit}/100. A drop below ${BUILD_SUIT_MIN} (more judgment-intensive work, worse data quality) would push this to HYBRID.`,
      "Micro or Small budget, or no engineering capacity, would trigger a feasibility downgrade to HYBRID.",
    ];
  }
  return [];
}

function flipFromDont(ap: number, risk: number, gate: Gate, input: ScoringInput): string[] {
  if (gate === "G1") {
    return ["Volume needs to reach at least 10 instances per month to clear the minimum threshold."];
  }
  if (gate === "G2") {
    const gap = GATE_POTENTIAL_MIN - ap;
    return [
      `Automation Potential is ${ap}/100 and needs ${GATE_POTENTIAL_MIN} to pass. Higher volume, longer task duration, or a higher labor rate would add the ${gap} points needed.`,
      input.repeatability === "AdHoc" || input.repeatability === "Somewhat"
        ? "Standardizing this workflow would lift the repeatability score and contribute meaningfully."
        : "The single biggest lever is increasing how often this workflow runs or how long each instance takes.",
    ];
  }
  if (gate === "G3") {
    return [
      "Data preparation is the prerequisite. Clean, structured data removes this gate entirely.",
      "Alternatively, reaching 1,000+ monthly volume would carry enough automation potential to pass even with incomplete data.",
    ];
  }
  if (gate === "G4") {
    return [
      "The blocking factor is workflow nature, not economics. Software AI is not the right automation category for a physical workflow. Higher volume, higher labor cost, longer task duration, or a larger budget would not change this.",
      "Robotics, warehouse automation, or operational redesign are separate paths outside the scope of a software-AI assessment.",
      "If this workflow has digital sub-processes such as record-keeping, scheduling, or reporting, those could be separated out and evaluated on their own.",
    ];
  }
  return ["Improving volume, task duration, data quality, or workflow standardization would be the most direct path to a different verdict."];
}

export default function WhatWouldChange({ input, result }: { input: ScoringInput; result: ScoringResult }) {
  const conditions = getFlipConditions(input, result);
  const p = PALETTE[result.verdict];

  return (
    <SectionCard>
      <SectionTitle>The verdict would change if</SectionTitle>
      <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {conditions.map((c, i) => (
          <Bullet key={i} color={p.dot}>{c}</Bullet>
        ))}
      </ul>
    </SectionCard>
  );
}
