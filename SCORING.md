# ROIbot — Scoring Engine v1 (deterministic; the math decides)

## Inputs — 6 fields
UseCase     : free text — LLM explanation ONLY, never scored
Volume      : monthly number — how many times the workflow happens per month
ValuePerRun : TRIVIAL(<$1) | LOW($1–10) | MED($10–100) | HIGH($100+)
              — what ONE instance is worth (labor saved or stakes if wrong)
DataReady   : READY | MESSY | UNSURE
Constraint  : NONE | PRIVACY | TIMELINE | NO_ENG | REGULATION
Budget      : MICRO(<$5K) | SMALL($5-25K) | MID($25-100K) | LARGE($100K+)

## Field collection note (UX)
ValuePerRun must be asked in plain language, not as a dollar input:
"If you handled one of these manually, what's it worth — in time spent or
cost if it goes wrong?" with the four bands as gut-feel options.

## AXIS A — Worth It (0–100) = volume × value  [heaviest gate]
Volume (0–50):       <100 -> 8  | 100–999 -> 25 | 1K–9.9K -> 42 | 10K+ -> 50
ValuePerRun (0–50):  TRIVIAL -> 5 | LOW -> 18 | MED -> 38 | HIGH -> 50
WorthIt = volume_pts + value_pts

## AXIS B — Needs Custom (0–100) = resistance to off-the-shelf
Constraint: REGULATION -> 80 | PRIVACY -> 70 | NONE -> 25 | TIMELINE -> 20 | NO_ENG -> 15

## Feasibility gate (constrains HOW, not WHETHER)
CannotBuild = (Budget == MICRO) OR (Constraint == NO_ENG) OR (Constraint == TIMELINE)
Budget and these constraints NEVER inflate a score — they only gate build options.

## Hard "Don't" gates — checked FIRST, any one fires -> DON'T
G1  WorthIt < 30
G2  ValuePerRun == TRIVIAL AND Volume < 1000
G3  DataReady == MESSY AND WorthIt < 55
    (G3 is soft: high-value cases survive with a "fix your data first" warning
     instead of a DON'T)

## Decision logic (order of operations)
1. Check G1, G2, G3. If any fire -> DON'T. Stop.
2. Else map (WorthIt, NeedsCustom):
                   NeedsCustom <40   NeedsCustom 40–64   NeedsCustom 65+
   WorthIt 30–64   BUY               HYBRID              HYBRID
   WorthIt 65+     BUY               HYBRID              BUILD
3. Apply feasibility gate:
   BUILD  AND CannotBuild -> downgrade to HYBRID
   HYBRID AND CannotBuild -> downgrade to BUY
4. Confidence = distance to nearest verdict flip across all boundaries:
   High >15pts | Medium 6–15 | Low <=5  -> state plainly.

## Validation — these MUST pass (regression tests)
Candle shop  : Vol 80,  LOW,  READY, NONE,       MICRO -> DON'T  (G1: WorthIt 26<30)
Priya store  : Vol 3000,LOW,  READY, NONE,       SMALL -> BUY    (WorthIt 60, custom 25)
Healthcare   : Vol 400, HIGH, READY, REGULATION, MID   -> BUILD  (WorthIt 75, custom 80)
Healthcare-µ : Vol 400, HIGH, READY, REGULATION, MICRO -> HYBRID (BUILD downgraded, CannotBuild)

## IMPORTANT: weights are v1 guesses, not sacred
These thresholds are research-informed but tuned to pass the cases above.
They are EXPECTED to be adjusted after running 10–15 real workflows.
Build them as easily-editable constants in one config file, not scattered
magic numbers. Do not treat them as final.
