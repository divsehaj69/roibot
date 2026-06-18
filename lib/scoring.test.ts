import { score, ScoringInput, Verdict } from "./scoring";

interface TestCase {
  name:        string;
  input:       ScoringInput;
  expected:    Verdict;
  expectFlag?: boolean;
}

const cases: TestCase[] = [
  {
    name: "Candle shop",
    input: {
      useCase:    "candle shop order routing",
      volume:     80,
      timePerRun: "QUICK",
      errorCost:  "LOW",
      dataReady:  "READY",
      constraint: "NONE",
      budget:     "MICRO",
    },
    expected:    "DON'T",
    // WorthIt = 30 × 0.4 = 12, low-value gate fires (12 < 35)
  },
  {
    name: "Priya store",
    input: {
      useCase:    "retail store inventory",
      volume:     3000,
      timePerRun: "MODERATE",
      errorCost:  "LOW",
      dataReady:  "READY",
      constraint: "NONE",
      budget:     "SMALL",
    },
    expected:    "BUY",
    // WorthIt = 65 × 0.9 = 58.5 → 59, NeedsCustom = 25 (<40) → BUY
  },
  {
    name: "Healthcare",
    input: {
      useCase:    "healthcare records processing",
      volume:     400,
      timePerRun: "LONG",
      errorCost:  "HIGH",
      dataReady:  "READY",
      constraint: "REGULATION",
      budget:     "MID",
    },
    expected:    "BUILD",
    expectFlag:  true,
    // WorthIt = 100 × 0.7 = 70, NeedsCustom = 80 → BUILD, humanReviewFlag
  },
  {
    name: "Healthcare-micro",
    input: {
      useCase:    "healthcare records processing",
      volume:     400,
      timePerRun: "LONG",
      errorCost:  "HIGH",
      dataReady:  "READY",
      constraint: "REGULATION",
      budget:     "MICRO",
    },
    expected:    "HYBRID",
    expectFlag:  true,
    // Same as above but MICRO → cannotBuild → BUILD downgraded to HYBRID, humanReviewFlag
  },
];

let passed = 0;
let failed = 0;

for (const tc of cases) {
  const r   = score(tc.input);
  const verdictOk = r.verdict === tc.expected;
  const flagOk    = tc.expectFlag ? r.humanReviewFlag === true : true;
  const ok        = verdictOk && flagOk;

  if (ok) passed++; else failed++;

  const flagStr   = r.humanReviewFlag ? " [human-review]" : "";
  const gateStr   = r.firedGate       ? ` gate=${r.firedGate}` : "";
  const status    = ok ? "PASS" : "FAIL";

  const detail = ok
    ? `WorthIt=${r.worthIt} NeedsCustom=${r.needsCustom}${gateStr} conf=${r.confidence}${flagStr}`
    : `expected ${tc.expected}${tc.expectFlag ? "+flag" : ""}, got ${r.verdict}${r.humanReviewFlag ? "+flag" : ""} (WorthIt=${r.worthIt} NeedsCustom=${r.needsCustom}${gateStr})`;

  console.log(`[${status}] ${tc.name} — ${detail}`);
}

console.log(`\n${passed}/${cases.length} passed`);
if (failed > 0) process.exit(1);
