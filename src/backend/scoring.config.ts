// All weights, subscores, and thresholds for the v2 scoring engine.
// Edit ONLY this file to adjust scoring behaviour.

export const VOLUME_SCORES: Record<string, number> = {
  "<10":        0,
  "10-99":     20,
  "100-999":   50,
  "1000-9999": 80,
  "10000+":   100,
};

export const TIME_SCORES: Record<string, number> = {
  "<2min":    10,
  "2-10min":  35,
  "10-30min": 65,
  "30-60min": 90,
  "60+min":  100,
};

export const LABOR_SCORES: Record<string, number> = {
  "<20":    20,
  "20-50":  45,
  "50-100": 75,
  "100+":  100,
};

export const ERROR_SCORES: Record<string, number> = {
  Low:      20,
  Medium:   55,
  High:     80,
  Critical: 100,
};

export const REPEATABILITY_SCORES: Record<string, number> = {
  AdHoc:        10,
  Somewhat:     45,
  Standardized: 80,
  Highly:      100,
};

export const JUDGMENT_SCORES: Record<string, number> = {
  Critical: 10,
  High:     35,
  Moderate: 70,
  Low:     100,
};

export const JUDGMENT_RISK_SCORES: Record<string, number> = {
  Critical: 100,
  High:      70,
  Moderate:  35,
  Low:       10,
};

export const NATURE_SCORES: Record<string, number> = {
  Physical:       0,
  Mixed:         30,
  DigitalOps:    70,
  DataProc:      85,
  Knowledge:     90,
  Communication: 95,
};

export const DATA_SCORES: Record<string, number> = {
  Ready:   100,
  Partial:  65,
  Messy:    30,
  Unknown:  15,
};

export const SENSITIVITY_SCORES: Record<string, number> = {
  Public:       100,
  Internal:      70,
  Confidential:  40,
  Regulated:     10,
};

export const INTEGRATION_SCORES: Record<string, number> = {
  Standalone: 100,
  Few:         75,
  Many:        40,
  Enterprise:  15,
};

export const ENG_CAPACITY_SCORES: Record<string, number> = {
  Strong:   100,
  Moderate:  70,
  Limited:   35,
  None:      10,
};

export const BUDGET_SCORES: Record<string, number> = {
  Large:  100,
  Medium:  70,
  Small:   40,
  Micro:   15,
};

export const TIMELINE_SCORES: Record<string, number> = {
  Flexible:   100,
  "3months":   75,
  "1month":    40,
  Immediate:   10,
};

// ── Composite score weights ───────────────────────────────────────────────────

export const POTENTIAL_WEIGHTS = {
  volume:        0.25,
  timePerRun:    0.20,
  laborCost:     0.20,
  repeatability: 0.20,
  errorImpact:   0.15,
};

export const SUITABILITY_WEIGHTS = {
  workflowNature: 0.40,
  judgment:       0.35,
  dataReadiness:  0.25,
};

export const RISK_WEIGHTS = {
  sensitivityRisk: 0.30,
  integrationRisk: 0.30,
  errorImpact:     0.20,
  judgmentRisk:    0.20,
};

export const FEASIBILITY_WEIGHTS = {
  budget:        0.30,
  engCapacity:   0.30,
  timeline:      0.20,
  dataReadiness: 0.20,
};

// ── Gates ─────────────────────────────────────────────────────────────────────

export const GATE_POTENTIAL_MIN          = 35;
export const GATE_DATA_POTENTIAL_MIN_DATA = 50;
export const GATE_DATA_POTENTIAL_MIN_AP   = 65;
export const GATE_PHYSICAL_AP_MIN        = 70;

// ── Decision matrix thresholds ────────────────────────────────────────────────

export const BUILD_AP_MIN   = 65;
export const BUILD_SUIT_MIN = 75;

export const HYBRID1_AP_MAX   = 64;
export const HYBRID1_SUIT_MIN = 60;
export const HYBRID1_RISK_MAX = 45;

export const HYBRID2_AP_MIN   = 65;
export const HYBRID2_RISK_MIN = 46;
export const HYBRID2_RISK_MAX = 80;

// ── Feasibility downgrade sets ────────────────────────────────────────────────

export const DOWNGRADE_BUDGETS   = new Set(["Micro", "Small"]);
export const DOWNGRADE_ENG       = new Set(["None", "Limited"]);
export const DOWNGRADE_TIMELINES = new Set(["Immediate", "1month"]);

// ── Confidence ────────────────────────────────────────────────────────────────

export const CONFIDENCE = {
  HIGH_MIN:   16,
  MEDIUM_MIN:  6,
};

// ── ROI representative values ─────────────────────────────────────────────────
// These are approximate midpoints for bands where users cannot know exact values.
// Volume is NOT here — it is entered as a real number by the user.
// TIME_HOURS and LABOR_RATES remain as representative values for their bands.

export const TIME_HOURS: Record<string, number> = {
  "<2min":    0.025,   // ~1.5 min representative
  "2-10min":  0.1,     // ~6 min representative
  "10-30min": 0.33,    // ~20 min representative
  "30-60min": 0.75,    // ~45 min representative
  "60+min":   1.25,    // ~75 min representative
};

export const LABOR_RATES: Record<string, number> = {
  "<20":    15,    // representative for < $20/hr band
  "20-50":  35,    // representative for $20–50/hr band
  "50-100": 75,    // representative for $50–100/hr band
  "100+":  125,    // representative for $100+/hr band
};

// ±spread applied to the annual labor value to produce the low/high range
export const ROI_RANGE_PCT = 0.25;
