# ROIbot Scoring Spec — v2

> **Principle:** Math decides the verdict. The LLM only explains it.

## Overview

14 inputs → 4 composite scores → hard gates → decision matrix → optional feasibility downgrade → final verdict.

All weights, subscores, and thresholds live in `lib/scoring.config.ts`. Edit only that file to tune behaviour.

---

## Inputs (14)

| # | Name | Type | Options |
|---|------|------|---------|
| 1 | workflowDescription | string | free text |
| 2 | volume | VolumeRange | `<10` / `10-99` / `100-999` / `1000-9999` / `10000+` |
| 3 | timePerRun | TimePerRun | `<2min` / `2-10min` / `10-30min` / `30-60min` / `60+min` |
| 4 | laborCost | LaborCost | `<20` / `20-50` / `50-100` / `100+` ($/hr) |
| 5 | errorImpact | ErrorImpact | `Low` / `Medium` / `High` / `Critical` |
| 6 | repeatability | Repeatability | `AdHoc` / `Somewhat` / `Standardized` / `Highly` |
| 7 | judgment | Judgment | `Critical` / `High` / `Moderate` / `Low` |
| 8 | workflowNature | WorkflowNature | `Physical` / `Mixed` / `DigitalOps` / `DataProc` / `Knowledge` / `Communication` |
| 9 | dataReadiness | DataReadiness | `Ready` / `Partial` / `Messy` / `Unknown` |
| 10 | sensitivity | Sensitivity | `Public` / `Internal` / `Confidential` / `Regulated` |
| 11 | integration | Integration | `Standalone` / `Few` / `Many` / `Enterprise` |
| 12 | engCapacity | EngCapacity | `None` / `Limited` / `Moderate` / `Strong` |
| 13 | budget | Budget | `Micro` / `Small` / `Medium` / `Large` |
| 14 | timeline | Timeline | `Immediate` / `1month` / `3months` / `Flexible` |

---

## Input Subscores

```
VOLUME_SCORES:        <10→0  | 10-99→20  | 100-999→50  | 1000-9999→80  | 10000+→100
TIME_SCORES:          <2min→10 | 2-10min→35 | 10-30min→65 | 30-60min→90 | 60+min→100
LABOR_SCORES:         <20→20 | 20-50→45 | 50-100→75 | 100+→100
ERROR_SCORES:         Low→20 | Medium→55 | High→80 | Critical→100
REPEATABILITY_SCORES: AdHoc→10 | Somewhat→45 | Standardized→80 | Highly→100
JUDGMENT_SCORES:      Critical→10 | High→35 | Moderate→70 | Low→100   (suitability direction)
JUDGMENT_RISK_SCORES: Critical→100 | High→70 | Moderate→35 | Low→10   (risk direction)
NATURE_SCORES:        Physical→0 | Mixed→30 | DigitalOps→70 | DataProc→85 | Knowledge→90 | Communication→95
DATA_SCORES:          Ready→100 | Partial→65 | Messy→30 | Unknown→15
SENSITIVITY_SCORES:   Public→100 | Internal→70 | Confidential→40 | Regulated→10  (high = safe)
INTEGRATION_SCORES:   Standalone→100 | Few→75 | Many→40 | Enterprise→15  (high = easy)
ENG_CAPACITY_SCORES:  Strong→100 | Moderate→70 | Limited→35 | None→10
BUDGET_SCORES:        Large→100 | Medium→70 | Small→40 | Micro→15
TIMELINE_SCORES:      Flexible→100 | 3months→75 | 1month→40 | Immediate→10
```

---

## Composite Scores (4)

### 1. AutomationPotential (0–100)
Measures whether the workflow is worth automating at all.

```
AP = 0.25×VOLUME + 0.20×TIME + 0.20×LABOR + 0.20×REPEATABILITY + 0.15×ERROR
```

### 2. AISuitability (0–100)
Measures how well AI fits the work.

```
Suit = 0.40×NATURE + 0.35×JUDGMENT + 0.25×DATA
```

JUDGMENT uses `JUDGMENT_SCORES` (Critical→10, Low→100).

### 3. RiskComplexity (0–100)
Measures how risky or hard this will be to deploy safely.

```
Risk = 0.30×sensitivity_risk + 0.30×integration_risk + 0.20×ERROR + 0.20×judgment_risk
```

Where:
- `sensitivity_risk = 100 - SENSITIVITY_SCORES[sensitivity]`
- `integration_risk = 100 - INTEGRATION_SCORES[integration]`
- JUDGMENT uses `JUDGMENT_RISK_SCORES` (Critical→100, Low→10)

### 4. Feasibility (0–100)
Measures whether the org can actually execute.

```
Feas = 0.30×BUDGET + 0.30×ENG_CAPACITY + 0.20×TIMELINE + 0.20×DATA
```

---

## Hard Gates (checked in order)

| Gate | Condition | Verdict |
|------|-----------|---------|
| G1 | volume = `<10` | DON'T |
| G2 | AutomationPotential < 35 | DON'T |
| G3 | DATA_SCORES < 50 AND AutomationPotential < 65 | DON'T |
| G4 | workflowNature = `Physical` AND AutomationPotential < 60 | DON'T |

If any gate fires, return DON'T immediately. Skip remaining gates and decision matrix.

---

## Decision Matrix

Evaluated in priority order: BUILD → HYBRID → BUY.

```
BUILD  if: AP ≥ 65 AND Suit ≥ 75
HYBRID if: (AP ≤ 64 AND Suit ≥ 60 AND Risk ≤ 45)  [HYBRID path 1]
        OR (AP ≥ 65 AND Risk in 46–70)              [HYBRID path 2]
BUY    — default (none of the above)
```

---

## Feasibility Downgrade (single step, if/else-if)

Applies only to BUILD and HYBRID verdicts. Checked once — does not cascade.

```
if budget ∈ {Micro, Small} OR engCapacity ∈ {None, Limited} OR timeline ∈ {Immediate, 1month}:
  if verdict == BUILD  → downgrade to HYBRID
  else if verdict == HYBRID → downgrade to BUY
```

---

## humanReviewFlag

Set `true` when any of:
- `errorImpact` is `High` or `Critical`
- `sensitivity` is `Regulated`
- `judgment` is `Critical`
- `riskComplexity > 70`

---

## Confidence

Based on distance to nearest decision boundary. All four composite scores contribute.

```
High   — > 15 pts from any boundary
Medium — 6–15 pts
Low    — ≤ 5 pts
```

---

## ROI Estimate

Computed deterministically before the LLM call. LLM only writes it up.

```
annualRunsSaved  = VOLUME_COUNTS[volume] × 12 × ROI_SUCCESS_FACTOR
hoursSaved       = annualRunsSaved × TIME_HOURS[timePerRun]
annualSavingsMid = hoursSaved × LABOR_RATES[laborCost]
annualSavingsLow = annualSavingsMid × (1 - ROI_RANGE_PCT)
annualSavingsHigh = annualSavingsMid × (1 + ROI_RANGE_PCT)

implCostMid  = IMPL_COSTS[verdict]
paybackYears = implCostMid / annualSavingsMid   (null if annualSavingsMid == 0)
```

ROI is `null` when verdict is DON'T.

---

## Verdict Summary

| Verdict | Meaning |
|---------|---------|
| DON'T | Not worth pursuing. Gate fired or scores too low. |
| BUY | Use an off-the-shelf AI product. |
| HYBRID | Buy a core product, add custom layers. |
| BUILD | Custom in-house AI system needed. |
