import { score, ScoringInput, Verdict } from "./scoring";

interface TestCase {
  name:        string;
  input:       ScoringInput;
  expect:      Verdict | Verdict[];  // accept any of these verdicts
  expectFlag?: boolean;
  expectGate?: string;
}

const cases: TestCase[] = [
  {
    name: "Candle shop",
    // AP = 0.25×20 + 0.20×10 + 0.20×20 + 0.20×45 + 0.15×20 = 5+2+4+9+3 = 23 → G2 fires
    input: {
      workflowDescription: "candle shop order confirmation emails",
      volume:        50,
      timePerRun:    "<2min",
      laborCost:     "<20",
      errorImpact:   "Low",
      repeatability: "Somewhat",
      judgment:      "Low",
      workflowNature: "Communication",
      dataReadiness: "Ready",
      sensitivity:   "Internal",
      integration:   "Standalone",
      engCapacity:   "None",
      budget:        "Micro",
      timeline:      "Flexible",
    },
    expect:     "DON'T",
    expectGate: "G2",
  },
  {
    name: "Priya store",
    // AP=60, Suit=98, Risk=30, Feas=51 → BUY (default, Risk too low for HYBRID)
    input: {
      workflowDescription: "retail customer support ticket routing",
      volume:        5000,
      timePerRun:    "2-10min",
      laborCost:     "20-50",
      errorImpact:   "Medium",
      repeatability: "Standardized",
      judgment:      "Low",
      workflowNature: "Communication",
      dataReadiness: "Ready",
      sensitivity:   "Internal",
      integration:   "Few",
      engCapacity:   "Limited",
      budget:        "Small",
      timeline:      "1month",
    },
    expect: ["BUY", "HYBRID"],
  },
  {
    name: "Healthcare",
    // AP=77, Suit=73, Risk=79, Feas=77 — spec as written routes to BUILD or HYBRID
    input: {
      workflowDescription: "healthcare prior-authorisation review",
      volume:        500,
      timePerRun:    "30-60min",
      laborCost:     "50-100",
      errorImpact:   "Critical",
      repeatability: "Standardized",
      judgment:      "High",
      workflowNature: "Knowledge",
      dataReadiness: "Ready",
      sensitivity:   "Regulated",
      integration:   "Many",
      engCapacity:   "Moderate",
      budget:        "Medium",
      timeline:      "3months",
    },
    expect:     "HYBRID",
    expectFlag: true,
  },
  {
    name: "Physical workflow",
    // AP=66 → G4 threshold is <60, so G4 does NOT fire under current spec
    // workflowNature=Physical → Suit=50, too low for BUILD/HYBRID → BUY
    input: {
      workflowDescription: "warehouse pick-and-pack physical routing",
      volume:        5000,
      timePerRun:    "10-30min",
      laborCost:     "20-50",
      errorImpact:   "Medium",
      repeatability: "Standardized",
      judgment:      "Moderate",
      workflowNature: "Physical",
      dataReadiness: "Ready",
      sensitivity:   "Internal",
      integration:   "Standalone",
      engCapacity:   "Moderate",
      budget:        "Medium",
      timeline:      "Flexible",
    },
    expect: "DON'T",
  },
];

let passed = 0;
let failed = 0;

for (const tc of cases) {
  const r = score(tc.input);

  const verdictOk = Array.isArray(tc.expect)
    ? tc.expect.includes(r.verdict)
    : r.verdict === tc.expect;
  const flagOk    = tc.expectFlag ? r.humanReviewFlag === true : true;
  const gateOk    = tc.expectGate ? r.firedGate === tc.expectGate : true;
  const ok        = verdictOk && flagOk && gateOk;

  if (ok) passed++; else failed++;

  const status = ok ? "PASS" : "FAIL";
  const expectStr = Array.isArray(tc.expect) ? tc.expect.join(" or ") : tc.expect;

  console.log(`[${status}] ${tc.name}`);
  console.log(
    `       AP=${r.automationPotential} Suit=${r.aiSuitability} Risk=${r.riskComplexity} Feas=${r.feasibility}` +
    ` | gate=${r.firedGate ?? "none"} flag=${r.humanReviewFlag}`
  );
  if (!ok) {
    console.log(`       expected ${expectStr}${tc.expectFlag ? "+flag" : ""}${tc.expectGate ? ` gate=${tc.expectGate}` : ""}`);
    console.log(`       got      ${r.verdict}${r.humanReviewFlag ? "+flag" : ""} gate=${r.firedGate ?? "none"}`);
  }
  console.log();
}

console.log(`${passed}/${cases.length} passed`);
if (failed > 0) process.exit(1);
