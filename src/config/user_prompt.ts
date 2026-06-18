import type { ScoringInput, ScoringResult } from "../backend/scoring";

const VERDICT_SECTION_INSTRUCTIONS: Record<string, string> = {
  "BUY": `\
Name the CATEGORY of tooling that fits (for example: "AI-assisted document processing platform"). \
Write a numbered buying checklist of must-have capabilities. Base every item on the user's specific inputs. \
Never name a product or vendor.`,

  "BUILD": `\
Write a minimal architecture sketch. 4 to 6 bullet points covering: data pipeline, model type or approach, \
integration points, and monitoring. Be practical. Skip theory.`,

  "HYBRID": `\
Write a minimal architecture sketch. 4 to 6 bullet points covering: which core capability to buy off-the-shelf, \
which edges need custom work, integration points, and monitoring. Be practical. Skip theory.`,

  "DON'T": `\
Base your explanation on the stated reason for the DON'T verdict and the actual scores. \
Never reference internal codes or letters.
If the stated reason is that the workflow is physical: explain that software AI cannot directly perform \
physical actions or manipulate physical objects. Do NOT suggest that increasing volume, budget, labor cost, \
task duration, or automation potential would change the verdict. You may note that robotics, warehouse \
automation, operational redesign, or evaluating adjacent digital sub-processes are separate opportunities \
outside the scope of a software-AI assessment.
Otherwise: list 2 to 3 specific, directional changes that would flip this verdict. Do not invent numeric \
thresholds. Say what direction things need to move: tasks taking longer, higher volume, cleaner data, \
less judgment required. No generic advice.`,
};

const GATE_PLAIN: Record<string, string> = {
  G1: "volume is too low (fewer than 10 per month) for automation to be economic",
  G2: "automation potential is too low — the time savings, volume, and labor value do not add up to a clear return",
  G3: "data quality is insufficient and automation potential is not high enough to compensate for it",
  G4: "this is a physical workflow, and software AI cannot perform physical actions or manipulate physical objects",
};

function fmt(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
}

export function buildUserMessage(input: ScoringInput, result: ScoringResult): string {
  const flagNote = result.humanReviewFlag
    ? `\n- humanReviewFlag TRUE: human review of AI outputs is required — address in reasoning and risks.`
    : "";
  const gateNote = result.firedGate
    ? `\n- Reason this workflow was declined: ${GATE_PLAIN[result.firedGate] ?? "the scores were below the minimum thresholds for automation"}`
    : "";

  let roiBlock: string;
  if (result.roi) {
    const r = result.roi;
    const payoffLabel =
      r.payoffCategory === "fast"     ? "Likely fast payoff" :
      r.payoffCategory === "moderate" ? "Moderate payoff timeline" :
                                        "Slow payoff, multi-year";
    roiBlock = `Value at stake (labor cost involved at stated volume):\n- Annual labor value: roughly ${fmt(r.annualLaborValueLow)} to ${fmt(r.annualLaborValueHigh)} per year (mid: ${fmt(r.annualLaborValueMid)})\n- Payoff timeline: ${payoffLabel} (qualitative, not computed from division)\n- Note: this is the labor cost at stake, not a precise ROI.`;
  } else {
    roiBlock = `Value at stake: null (verdict is DON'T — explain why automation does not make sense here)`;
  }

  return `\
Workflow: ${input.workflowDescription}

VERDICT (do not change): ${result.verdict}
Confidence: ${result.confidence}

Composite scores:
- AutomationPotential: ${result.automationPotential}/100
- AISuitability:       ${result.aiSuitability}/100
- RiskComplexity:      ${result.riskComplexity}/100
- Feasibility:         ${result.feasibility}/100
${gateNote}${flagNote}

Inputs:
- Volume: ${input.volume.toLocaleString()}/month | Time: ${input.timePerRun} | Labor: $${input.laborCost}/hr
- Error impact: ${input.errorImpact} | Repeatability: ${input.repeatability} | Judgment: ${input.judgment}
- Workflow nature: ${input.workflowNature} | Data: ${input.dataReadiness}
- Sensitivity: ${input.sensitivity} | Integration: ${input.integration}
- Eng capacity: ${input.engCapacity} | Budget: ${input.budget} | Timeline: ${input.timeline}

${roiBlock}

verdictSection instruction:
${VERDICT_SECTION_INSTRUCTIONS[result.verdict]}

Produce the JSON explanation now.`;
}
