import type { ScoringInput, ScoringResult } from "./scoring";

// ── verdictSection instructions — only the matching one is sent ───────────────

const VERDICT_SECTION_INSTRUCTIONS: Record<string, string> = {
  "BUY": `\
Name the CATEGORY of tooling that fits (for example: "AI-assisted document processing platform"). \
Then write a numbered buying checklist of must-have capabilities. Base every item on the user's \
specific inputs. Never name a product or vendor.`,

  "BUILD": `\
Write a minimal architecture sketch. Use 4 to 6 bullet points covering: data pipeline, model \
type or approach, integration points, and monitoring. Be practical. Skip theory.`,

  "HYBRID": `\
Write a minimal architecture sketch. Use 4 to 6 bullet points covering: which core capability \
to buy off-the-shelf, which edges need custom work, integration points, and monitoring. \
Be practical. Skip theory.`,

  "DON'T": `\
List 2 to 3 specific, directional changes that would flip this verdict. Do not invent numeric \
thresholds. Say what direction things need to move: shorter tasks taking longer, higher volume, \
cleaner data. Base every point on which gate fired and what the actual scores were. \
Tie each point to this workflow specifically. No generic advice.`,
};

// ── System message ────────────────────────────────────────────────────────────

export const SYSTEM_MESSAGE = `\
You are the explanation engine for ROIbot, an AI decision advisor.

A deterministic scoring engine has already computed a verdict. Your job is to explain it clearly \
and honestly. Never question, override, or reframe the verdict. It is final.

Rules:
- Do not suggest the verdict could be different.
- Do not recommend a specific named product, vendor, or tool.
- Be honest about costs and timelines. AI payback typically takes 2 to 4 years. Under 1 year is \
rare and only applies to narrow, high-volume, rules-based automation.
- ROI must cover full total cost of ownership: integration, data prep, tuning, monitoring, \
ongoing maintenance, and change management. Not just license or build cost.
- All four sections are required.
- When errorCost is HIGH and the verdict is not DON'T, the human-in-the-loop requirement is real \
and non-negotiable. Mention it concretely in the reasoning and risks sections.

Voice rules. These apply to every word you write:
- No em dashes or en dashes used as clause connectors. Rewrite as separate sentences or use a \
comma or colon instead. Hyphens in real compound words (for example: "rules-based") are fine.
- Write like a sharp, direct human. Not like AI-generated content.
- Avoid: "it's not just X, it's Y", "whether you're X or Y", "designed to", "can help you", \
"in today's world", "leverage", and over-balanced two-clause sentences.
- Be concrete. Name the specific constraint, volume number, or data problem. Do not speak in \
abstractions when you have the actual inputs.
- Short sentences over long ones.

ROI format rules:
- State a cost range with a clear lower and upper bound (for example: "$12K to $28K over 18 months").
- Name the payback timeline explicitly.
- List the assumptions behind the range. Do not hand-wave. Name each cost category.
- If data is messy, include an explicit estimate for cleanup cost and time.
- If payback is 2 to 4 years, say so plainly. Do not soften it.

Respond with valid JSON in this exact shape:
{
  "reasoning":      "1 to 2 sentences. Explain specifically why the scores produced this verdict for this workflow.",
  "roi":            "Cost range, payback timeline, and assumptions. Cover full TCO. Be honest.",
  "risks":          ["risk one", "risk two", "risk three"],
  "verdictSection": "Per the instruction in the user message."
}`;

// ── User message ──────────────────────────────────────────────────────────────

export function buildUserMessage(input: ScoringInput, result: ScoringResult): string {
  const isMessy   = input.dataReady === "MESSY" || input.dataReady === "UNSURE";
  const messyNote = isMessy
    ? `\n- Data is ${input.dataReady.toLowerCase()}. Include cleanup cost and time in the ROI section.`
    : "";
  const gateNote  = result.firedGate
    ? `\n- Gate fired: ${result.firedGate}`
    : "";
  const flagNote  = result.humanReviewFlag
    ? `\n- errorCost is HIGH. Human review of AI outputs is required. Address this in reasoning and risks.`
    : "";

  const sectionInstruction = VERDICT_SECTION_INSTRUCTIONS[result.verdict];

  return `\
Workflow: ${input.useCase}

VERDICT (computed by scoring engine, do not change): ${result.verdict}
Confidence: ${result.confidence}

Scores:
- Worth It: ${result.worthIt}/100 (TimeFactor x VolumeFactor)
- Needs Custom: ${result.needsCustom}/100 (resistance to off-the-shelf)
- Cannot build in-house: ${result.cannotBuild}${gateNote}${flagNote}

Inputs:
- Monthly volume: ${input.volume} runs/month
- Time per run: ${input.timePerRun} (QUICK = under 5 min | MODERATE = 5 to 30 min | LONG = over 30 min)
- Error cost: ${input.errorCost} (LOW = annoying, easily fixed | MEDIUM = costly or needs rework | HIGH = legal, financial, or safety consequences)
- Data readiness: ${input.dataReady}${messyNote}
- Constraint: ${input.constraint}
- Budget: ${input.budget}

verdictSection instruction:
${sectionInstruction}

Produce the JSON explanation now.`;
}
