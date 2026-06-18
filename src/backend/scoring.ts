import {
  VOLUME_SCORES, TIME_SCORES, LABOR_SCORES, ERROR_SCORES, REPEATABILITY_SCORES,
  JUDGMENT_SCORES, JUDGMENT_RISK_SCORES, NATURE_SCORES, DATA_SCORES,
  SENSITIVITY_SCORES, INTEGRATION_SCORES, ENG_CAPACITY_SCORES, BUDGET_SCORES, TIMELINE_SCORES,
  POTENTIAL_WEIGHTS, SUITABILITY_WEIGHTS, RISK_WEIGHTS, FEASIBILITY_WEIGHTS,
  GATE_POTENTIAL_MIN, GATE_DATA_POTENTIAL_MIN_DATA, GATE_DATA_POTENTIAL_MIN_AP, GATE_PHYSICAL_AP_MIN,
  BUILD_AP_MIN, BUILD_SUIT_MIN,
  HYBRID1_AP_MAX, HYBRID1_SUIT_MIN, HYBRID1_RISK_MAX,
  HYBRID2_AP_MIN, HYBRID2_RISK_MIN, HYBRID2_RISK_MAX,
  DOWNGRADE_BUDGETS, DOWNGRADE_ENG, DOWNGRADE_TIMELINES,
  CONFIDENCE, TIME_HOURS, LABOR_RATES, ROI_RANGE_PCT,
} from "./scoring.config";

// ── Types ─────────────────────────────────────────────────────────────────────

export type VolumeRange    = "<10" | "10-99" | "100-999" | "1000-9999" | "10000+";
export type TimePerRun     = "<2min" | "2-10min" | "10-30min" | "30-60min" | "60+min";
export type LaborCost      = "<20" | "20-50" | "50-100" | "100+";
export type ErrorImpact    = "Low" | "Medium" | "High" | "Critical";
export type Repeatability  = "AdHoc" | "Somewhat" | "Standardized" | "Highly";
export type Judgment       = "Critical" | "High" | "Moderate" | "Low";
export type WorkflowNature = "Physical" | "Mixed" | "DigitalOps" | "DataProc" | "Knowledge" | "Communication";
export type DataReadiness  = "Ready" | "Partial" | "Messy" | "Unknown";
export type Sensitivity    = "Public" | "Internal" | "Confidential" | "Regulated";
export type Integration    = "Standalone" | "Few" | "Many" | "Enterprise";
export type EngCapacity    = "None" | "Limited" | "Moderate" | "Strong";
export type Budget         = "Micro" | "Small" | "Medium" | "Large";
export type Timeline       = "Immediate" | "1month" | "3months" | "Flexible";
export type Verdict        = "DON'T" | "BUY" | "BUILD" | "HYBRID";
export type Confidence     = "High" | "Medium" | "Low";
export type Gate           = "G1" | "G2" | "G3" | "G4" | null;

export function volumeToBand(n: number): VolumeRange {
  if (n < 10)    return "<10";
  if (n < 100)   return "10-99";
  if (n < 1000)  return "100-999";
  if (n < 10000) return "1000-9999";
  return "10000+";
}

export interface ScoringInput {
  workflowDescription: string;
  volume:              number;
  timePerRun:          TimePerRun;
  laborCost:           LaborCost;
  errorImpact:         ErrorImpact;
  repeatability:       Repeatability;
  judgment:            Judgment;
  workflowNature:      WorkflowNature;
  dataReadiness:       DataReadiness;
  sensitivity:         Sensitivity;
  integration:         Integration;
  engCapacity:         EngCapacity;
  budget:              Budget;
  timeline:            Timeline;
}

export interface RoiEstimate {
  annualLaborValueLow:  number;
  annualLaborValueMid:  number;
  annualLaborValueHigh: number;
  payoffCategory:       "fast" | "moderate" | "slow";
}

export interface ScoringResult {
  verdict:             Verdict;
  confidence:          Confidence;
  automationPotential: number;
  aiSuitability:       number;
  riskComplexity:      number;
  feasibility:         number;
  firedGate:           Gate;
  humanReviewFlag:     boolean;
  roi:                 RoiEstimate | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function w(map: Record<string, number>, key: string): number {
  return map[key] ?? 0;
}

function computeConfidence(ap: number, suit: number, risk: number, feas: number, verdict: Verdict): Confidence {
  const boundaries: number[] = [];
  if (verdict === "DON'T") {
    boundaries.push(GATE_POTENTIAL_MIN - ap, GATE_DATA_POTENTIAL_MIN_AP - ap, GATE_PHYSICAL_AP_MIN - ap);
  } else {
    boundaries.push(
      ap - GATE_POTENTIAL_MIN,
      Math.abs(ap - BUILD_AP_MIN),
      Math.abs(suit - BUILD_SUIT_MIN),
      Math.abs(suit - HYBRID1_SUIT_MIN),
      Math.abs(risk - HYBRID1_RISK_MAX),
      Math.abs(risk - HYBRID2_RISK_MIN),
      Math.abs(risk - HYBRID2_RISK_MAX),
    );
  }
  const minDist = Math.min(...boundaries.filter(d => d >= 0));
  if (minDist >= CONFIDENCE.HIGH_MIN)   return "High";
  if (minDist >= CONFIDENCE.MEDIUM_MIN) return "Medium";
  return "Low";
}

function computeRoi(
  input:           ScoringInput,
  verdict:         Verdict,
  humanReviewFlag: boolean,
): RoiEstimate | null {
  if (verdict === "DON'T") return null;

  const hrsPerRun   = TIME_HOURS[input.timePerRun] ?? 0;
  const laborRate   = LABOR_RATES[input.laborCost] ?? 0;
  const annualLabor = input.volume * hrsPerRun * laborRate * 12;

  const payoffCategory: RoiEstimate["payoffCategory"] =
    (verdict === "BUILD" || humanReviewFlag) ? "slow" :
    verdict === "HYBRID" ? "moderate" : "fast";

  return {
    annualLaborValueLow:  Math.round(annualLabor * (1 - ROI_RANGE_PCT)),
    annualLaborValueMid:  Math.round(annualLabor),
    annualLaborValueHigh: Math.round(annualLabor * (1 + ROI_RANGE_PCT)),
    payoffCategory,
  };
}

// ── Main scoring function ─────────────────────────────────────────────────────

export function score(input: ScoringInput): ScoringResult {
  const volScore    = w(VOLUME_SCORES,        volumeToBand(input.volume));
  const timeScore   = w(TIME_SCORES,          input.timePerRun);
  const laborScore  = w(LABOR_SCORES,         input.laborCost);
  const errorScore  = w(ERROR_SCORES,         input.errorImpact);
  const repScore    = w(REPEATABILITY_SCORES, input.repeatability);
  const judgScore   = w(JUDGMENT_SCORES,      input.judgment);
  const judgRisk    = w(JUDGMENT_RISK_SCORES, input.judgment);
  const natureScore = w(NATURE_SCORES,        input.workflowNature);
  const dataScore   = w(DATA_SCORES,          input.dataReadiness);
  const sensScore   = w(SENSITIVITY_SCORES,   input.sensitivity);
  const integScore  = w(INTEGRATION_SCORES,   input.integration);
  const engScore    = w(ENG_CAPACITY_SCORES,  input.engCapacity);
  const budScore    = w(BUDGET_SCORES,        input.budget);
  const tlScore     = w(TIMELINE_SCORES,      input.timeline);

  const sensRisk  = 100 - sensScore;
  const integRisk = 100 - integScore;

  const ap = Math.round(
    POTENTIAL_WEIGHTS.volume        * volScore   +
    POTENTIAL_WEIGHTS.timePerRun    * timeScore  +
    POTENTIAL_WEIGHTS.laborCost     * laborScore +
    POTENTIAL_WEIGHTS.repeatability * repScore   +
    POTENTIAL_WEIGHTS.errorImpact   * errorScore
  );

  const suit = Math.round(
    SUITABILITY_WEIGHTS.workflowNature * natureScore +
    SUITABILITY_WEIGHTS.judgment       * judgScore   +
    SUITABILITY_WEIGHTS.dataReadiness  * dataScore
  );

  const risk = Math.round(
    RISK_WEIGHTS.sensitivityRisk * sensRisk   +
    RISK_WEIGHTS.integrationRisk * integRisk  +
    RISK_WEIGHTS.errorImpact     * errorScore +
    RISK_WEIGHTS.judgmentRisk    * judgRisk
  );

  const feas = Math.round(
    FEASIBILITY_WEIGHTS.budget        * budScore  +
    FEASIBILITY_WEIGHTS.engCapacity   * engScore  +
    FEASIBILITY_WEIGHTS.timeline      * tlScore   +
    FEASIBILITY_WEIGHTS.dataReadiness * dataScore
  );

  // G1
  if (input.volume < 10) {
    return { verdict: "DON'T", confidence: "High", automationPotential: ap, aiSuitability: suit, riskComplexity: risk, feasibility: feas, firedGate: "G1", humanReviewFlag: false, roi: null };
  }

  // G2
  if (ap < GATE_POTENTIAL_MIN) {
    return { verdict: "DON'T", confidence: computeConfidence(ap, suit, risk, feas, "DON'T"), automationPotential: ap, aiSuitability: suit, riskComplexity: risk, feasibility: feas, firedGate: "G2", humanReviewFlag: false, roi: null };
  }

  // G3
  if (dataScore < GATE_DATA_POTENTIAL_MIN_DATA && ap < GATE_DATA_POTENTIAL_MIN_AP) {
    return { verdict: "DON'T", confidence: computeConfidence(ap, suit, risk, feas, "DON'T"), automationPotential: ap, aiSuitability: suit, riskComplexity: risk, feasibility: feas, firedGate: "G3", humanReviewFlag: false, roi: null };
  }

  // G4 — software AI cannot automate physical work, regardless of automation potential.
  // Mixed workflows are unaffected; their digital components remain in scope.
  if (input.workflowNature === "Physical") {
    return { verdict: "DON'T", confidence: computeConfidence(ap, suit, risk, feas, "DON'T"), automationPotential: ap, aiSuitability: suit, riskComplexity: risk, feasibility: feas, firedGate: "G4", humanReviewFlag: false, roi: null };
  }

  // Order of operations (do not reorder):
  //   (1) primary verdict from matrix
  //   (2) R2: BUILD -> HYBRID if risk > 80
  //   (3) feasibility downgrade
  //   (4) R1: BUY -> HYBRID if risk > 80

  // (1) Primary verdict from matrix
  let verdict: Verdict;
  if (ap >= BUILD_AP_MIN && suit >= BUILD_SUIT_MIN) {
    verdict = "BUILD";
  } else if (
    (ap <= HYBRID1_AP_MAX && suit >= HYBRID1_SUIT_MIN && risk <= HYBRID1_RISK_MAX) ||
    (ap >= HYBRID2_AP_MIN && risk >= HYBRID2_RISK_MIN && risk <= HYBRID2_RISK_MAX)
  ) {
    verdict = "HYBRID";
  } else {
    verdict = "BUY";
  }

  // (2) R2: prevent high-risk custom-build recommendations
  if (verdict === "BUILD" && risk > 80) {
    verdict = "HYBRID";
  }

  // (3) Feasibility downgrade
  const feasibilityWeak =
    DOWNGRADE_BUDGETS.has(input.budget) ||
    DOWNGRADE_ENG.has(input.engCapacity) ||
    DOWNGRADE_TIMELINES.has(input.timeline);

  if (feasibilityWeak) {
    if      (verdict === "BUILD")  verdict = "HYBRID";
    else if (verdict === "HYBRID") verdict = "BUY";
  }

  // (4) R1: prevent extremely high-risk workflows from receiving BUY
  if (verdict === "BUY" && risk > 80) {
    verdict = "HYBRID";
  }

  const humanReviewFlag =
    input.errorImpact === "High"     ||
    input.errorImpact === "Critical" ||
    input.sensitivity === "Regulated" ||
    input.judgment    === "Critical"  ||
    risk > 70;

  return {
    verdict,
    confidence:          computeConfidence(ap, suit, risk, feas, verdict),
    automationPotential: ap,
    aiSuitability:       suit,
    riskComplexity:      risk,
    feasibility:         feas,
    firedGate:           null,
    humanReviewFlag,
    roi:                 computeRoi(input, verdict, humanReviewFlag),
  };
}
