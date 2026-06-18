import {
  VOLUME_GATE_MIN,
  VOLUME_FACTOR,
  VOLUME_BREAKPOINTS,
  TIME_FACTOR,
  WORTH_IT_GATES,
  CONSTRAINT_POINTS,
  DATA_MESSY_BONUS,
  NEEDS_CUSTOM_CAP,
  GRID,
  CONFIDENCE,
} from "./scoring.config";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimePerRun = "QUICK" | "MODERATE" | "LONG";
export type ErrorCost  = "LOW"   | "MEDIUM"   | "HIGH";
export type DataReady  = "READY" | "MESSY"    | "UNSURE";
export type Constraint = "NONE"  | "PRIVACY"  | "TIMELINE" | "NO_ENG" | "REGULATION";
export type Budget     = "MICRO" | "SMALL"    | "MID"      | "LARGE";
export type Verdict    = "DON'T" | "BUY"      | "BUILD"    | "HYBRID";
export type Confidence = "High"  | "Medium"   | "Low";

export interface ScoringInput {
  useCase:    string;
  volume:     number;
  timePerRun: TimePerRun;
  errorCost:  ErrorCost;
  dataReady:  DataReady;
  constraint: Constraint;
  budget:     Budget;
}

export interface ScoringResult {
  verdict:         Verdict;
  confidence:      Confidence;
  worthIt:         number;
  needsCustom:     number;
  cannotBuild:     boolean;
  firedGate:       "VOLUME" | "LOW_VALUE" | "DATA" | null;
  humanReviewFlag: boolean;
  messyWarning:    boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function volumeFactor(volume: number): number {
  if (volume < VOLUME_BREAKPOINTS.UNDER_100) return VOLUME_FACTOR.UNDER_100;
  if (volume < VOLUME_BREAKPOINTS.MID)       return VOLUME_FACTOR.MID;
  if (volume < VOLUME_BREAKPOINTS.HIGH)      return VOLUME_FACTOR.HIGH;
  return VOLUME_FACTOR.VERY_HIGH;
}

function confidenceLevel(
  worthIt: number,
  needsCustom: number,
  verdict: Verdict,
): Confidence {
  let minDist: number;

  if (verdict === "DON'T") {
    const toFloor = WORTH_IT_GATES.LOW_VALUE_MIN - worthIt;
    const toData  = WORTH_IT_GATES.DATA_GATE_MIN - worthIt;
    minDist = Math.min(
      toFloor > 0 ? toFloor : Infinity,
      toData  > 0 ? toData  : Infinity,
    );
    if (!isFinite(minDist)) minDist = worthIt;
  } else {
    minDist = Math.min(
      worthIt - WORTH_IT_GATES.LOW_VALUE_MIN,
      Math.abs(worthIt    - GRID.WORTH_IT_HIGH),
      Math.abs(needsCustom - GRID.NEEDS_CUSTOM_LOW),
      Math.abs(needsCustom - GRID.NEEDS_CUSTOM_HIGH),
    );
  }

  if (minDist >= CONFIDENCE.HIGH_MIN)   return "High";
  if (minDist >= CONFIDENCE.MEDIUM_MIN) return "Medium";
  return "Low";
}

// ── Main scoring function ─────────────────────────────────────────────────────

export function score(input: ScoringInput): ScoringResult {
  const isMessy = input.dataReady === "MESSY" || input.dataReady === "UNSURE";

  // Step 1 — Volume gate
  if (input.volume < VOLUME_GATE_MIN) {
    return {
      verdict: "DON'T", confidence: "High",
      worthIt: 0, needsCustom: 0, cannotBuild: false,
      firedGate: "VOLUME", humanReviewFlag: false, messyWarning: false,
    };
  }

  // Step 2 — WorthIt
  const worthIt = Math.round(TIME_FACTOR[input.timePerRun] * volumeFactor(input.volume));

  // Step 3 — Low-value gate
  if (worthIt < WORTH_IT_GATES.LOW_VALUE_MIN) {
    return {
      verdict: "DON'T", confidence: confidenceLevel(worthIt, 0, "DON'T"),
      worthIt, needsCustom: 0, cannotBuild: false,
      firedGate: "LOW_VALUE", humanReviewFlag: false, messyWarning: false,
    };
  }

  // Step 4 — Data gate
  if (isMessy && worthIt < WORTH_IT_GATES.DATA_GATE_MIN) {
    return {
      verdict: "DON'T", confidence: confidenceLevel(worthIt, 0, "DON'T"),
      worthIt, needsCustom: 0, cannotBuild: false,
      firedGate: "DATA", humanReviewFlag: false, messyWarning: false,
    };
  }

  // Step 5 — NeedsCustom (messy bonus only applies when data gate didn't fire)
  const needsCustom = Math.min(
    CONSTRAINT_POINTS[input.constraint] + (isMessy ? DATA_MESSY_BONUS : 0),
    NEEDS_CUSTOM_CAP,
  );

  // Step 6 — Grid
  const highWorth  = worthIt     >= GRID.WORTH_IT_HIGH;
  const lowCustom  = needsCustom <  GRID.NEEDS_CUSTOM_LOW;
  const highCustom = needsCustom >= GRID.NEEDS_CUSTOM_HIGH;

  let verdict: Verdict;
  if (lowCustom) {
    verdict = "BUY";
  } else if (highCustom) {
    verdict = highWorth ? "BUILD" : "HYBRID";
  } else {
    verdict = "HYBRID";
  }

  // Step 7 — Feasibility gate (single downgrade only)
  const cannotBuild =
    input.budget     === "MICRO"    ||
    input.constraint === "NO_ENG"   ||
    input.constraint === "TIMELINE";

  if      (verdict === "BUILD"  && cannotBuild) verdict = "HYBRID";
  else if (verdict === "HYBRID" && cannotBuild) verdict = "BUY";

  // Step 8 — Error-cost overlay
  const humanReviewFlag = input.errorCost === "HIGH";

  // Messy warning: data is problematic but didn't trigger a DON'T
  const messyWarning = isMessy;

  return {
    verdict,
    confidence: confidenceLevel(worthIt, needsCustom, verdict),
    worthIt,
    needsCustom,
    cannotBuild,
    firedGate: null,
    humanReviewFlag,
    messyWarning,
  };
}
