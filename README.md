# ROIbot

ROIbot answers one question about a business workflow: should you **buy** an off-the-shelf AI tool for it, **build** a custom system, do a **hybrid** of the two, or **not automate** it at all.

Most automation advice only ever says yes. ROIbot will tell you no when no is the right answer, and it explains why.

## How it works

You describe one workflow through a 14-question form (volume, time per run, labor cost, error impact, data quality, regulatory sensitivity, engineering capacity, budget, and so on). From there:

1. **A deterministic engine computes the verdict.** Fourteen inputs roll up into four composite scores (Automation Potential, AI Suitability, Risk & Complexity, Feasibility). Hard gates and a decision matrix turn those scores into one of four verdicts. The same inputs always produce the same verdict.
2. **A language model explains the verdict.** It writes the reasoning, the risks, and the next steps. It never computes, changes, or second-guesses the verdict.

That split is the core design rule: the math decides, the model explains. The verdict cannot be hallucinated because no model produces it.

The free-text description you enter never touches the scores. It is only used to flag possible mismatches between what you wrote and the options you picked (for example, mentioning patient records while marking the data non-sensitive).

## What the description does, and what it doesn't

The verdict is calculated entirely from the 14 structured inputs. The description never feeds into the scores, the verdict, or the confidence. It does exactly three things: it shapes the wording of the explanation, it powers contradiction detection, and it raises missing-risk warnings.

This means the result is reproducible. Two users who enter identical structured inputs get the **same scores, the same verdict, and the same confidence**, even if one writes "customer support email routing" and the other writes "sort incoming customer messages." Only the explanation wording differs.

What the description **does** do is catch inconsistencies. Suppose someone writes:

> Review patient records and recommend treatment plans.

but selects `Data Sensitivity = Internal` and `Error Impact = Rework or cost`. ROIbot raises a flag:

> ⚠ Possible mismatch. Your description references patient records and treatment decisions, but the workflow is not marked as regulated or safety-critical. Review your inputs.

What it must **not** do is let the text move the math. "The description mentions healthcare" never raises the Risk score or changes the verdict on its own. If the risk is real, the user has to capture it through the structured inputs, where it is visible and auditable. That boundary is what keeps the recommendation deterministic and explainable instead of LLM-dependent.

## The four verdicts

| Verdict | Meaning |
|---------|---------|
| **BUY** | An off-the-shelf tool fits. ROIbot returns a category and a buying checklist, never a named product. |
| **BUILD** | The workflow needs control or customization a tool cannot give. |
| **HYBRID** | Buy the core capability, customize the edges. |
| **DON'T** | Not worth automating. Volume is too low, data is too messy, or the work is physical. |

## Scoring engine

Every answer maps to a **0–100 subscore**. The encoding is ordinal: volume `<10`→0, `10-99`→20, `100-999`→50, `1000-9999`→80, `10000+`→100, and so on for each question. Direction is deliberate. Some answers raise a score, some are inverted. Regulated data, for example, produces a high *risk* score (`sensitivity_risk = 100 − sensitivity_score`). Required judgment is used twice in opposite directions: it lowers AI Suitability and raises Risk.

Those subscores feed four weighted composite scores. The weights encode how an experienced consultant actually weighs a decision.

| Score | Formula | Why these weights |
|-------|---------|-------------------|
| **Automation Potential** | 0.25·Volume + 0.20·Time + 0.20·Labor + 0.20·Repeatability + 0.15·Error | Volume is the biggest lever on whether automation pays off |
| **AI Suitability** | 0.40·Nature + 0.35·Judgment + 0.25·Data | Workflow nature dominates: software AI cannot do physical work |
| **Risk & Complexity** | 0.30·Sensitivity + 0.30·Integration + 0.20·Error + 0.20·Judgment | Data sensitivity and system sprawl drive deployment risk |
| **Feasibility** | 0.30·Budget + 0.30·EngCapacity + 0.20·Timeline + 0.20·Data | Whether the org can actually execute it |

The verdict is then resolved in a fixed order:

1. **Hard gates** force a DON'T and stop everything: volume under 10, automation potential under 35, messy data with low potential, or physical work.
2. **Decision matrix** turns Automation Potential, Suitability, and Risk into BUILD, HYBRID, or BUY.
3. **Risk overrides** pull very high-risk workflows (risk above 80) toward HYBRID instead of a clean buy or build.
4. **Feasibility downgrade** steps the verdict down when budget, engineering capacity, or timeline is too weak to execute.

**Confidence** is the distance from the nearest decision boundary. A workflow sitting right on a threshold is reported as Low confidence. Every weight, subscore, and threshold lives in one file, `src/backend/scoring.config.ts`, so behavior is tuned in exactly one place.

## How the explanations are generated

The model never decides anything. Two separate Anthropic calls run in parallel, each tightly scoped.

**Explanation call.** The system prompt fixes the model in one role: explain a verdict that is already final, never question or change it. It receives the verdict, the four scores, the gate reason translated to plain English (internal gate codes never reach the model), and the pre-computed value-at-stake numbers. It returns strict JSON with four fields: reasoning, ROI write-up, risks, and a verdict-specific section. Three things keep it reliable:

- **Numbers are passed in, never computed by the model.** It writes up figures the engine already calculated, so it cannot invent economics.
- **Verdict-specific instructions.** BUY produces a category and buying checklist (never a named product), BUILD and HYBRID produce an architecture sketch, DON'T explains what would have to change. Physical-work cases get special handling so the report does not contradict itself.
- **Retry and validate.** The response is parsed, shape-checked, and retried once if malformed. Voice rules (short sentences, concrete constraints, no em-dashes) are part of the prompt.

**Review-flags call.** A separate classifier compares your free-text description against the options you picked and raises flags for specific mismatches, such as mentioning patient records while marking the data non-sensitive. It returns JSON flags and cannot touch the score or verdict. This is what keeps the free text walled off from the math.

## Validation

The engine was tested against **150 workflows across 17 industries**: operations, finance, healthcare, insurance, legal, government, manufacturing, logistics, retail, customer support, HR, marketing, sales, engineering, IT, construction, and education. The harness lives in [`validation.harness.ts`](validation.harness.ts).

The process:

1. **Build a representative set.** 150 workflows with realistic values for all 14 inputs, deliberately including the hard cases: physical work, regulated low-volume work, messy data, and high-stakes expert judgment.
2. **Set the expected verdict first.** Each workflow got the verdict a consultant would give *before* it was run through the engine. Deciding the expectation afterward would only rationalize whatever the engine returned.
3. **Run the real engine.** Every workflow is scored by the actual engine, not a re-implementation. The harness prints each verdict, all four scores, and any gate that fired.
4. **Compare and tally.** Expected against actual, counted per verdict class, with every mismatch listed next to its scores so the cause is visible.
5. **Keep only recurring patterns.** A finding counted only if it appeared in three or more workflows and reflected systematic behavior, then was classified as no-action, monitor, calibrate, or critical.

What the run established:

- **Every verdict is deterministic and reproducible.** Re-running the suite produces identical results.
- **Physical work is screened out without exception.** All 24 physical or low-feasibility workflows returned DON'T. Software AI never leaked onto work it cannot do.
- **No viable automation was wrongly rejected.** DON'T fired only on genuinely weak cases: sub-threshold volume, messy data, or physical tasks.
- **Every disagreement with the human reviewer was a single tier and erred toward caution**, recommending more ownership or review than strictly needed, never less. There were no reversals between automate and don't-automate on viable work.

The one known tension: the engine leans toward BUILD on high-potential digital workflows where a buy would also be defensible. It is tracked as a calibration item, not a correctness bug, and it never makes the engine less cautious.

Changes to the engine follow a fixed discipline. Diagnosis and implementation stay separate, and the four locked regression fixtures (a low-volume DON'T, a clear BUY, a regulated HYBRID with a human-review flag, and a physical DON'T) are re-run after every change so nothing silently regresses.

## Running locally

Requires Node 18+ and an Anthropic API key.

```bash
npm install

# add your key (this file is gitignored, never commit it)
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

npm run dev          # http://localhost:3000
```

Run the scoring regression tests:

```bash
npx tsx src/backend/scoring.test.ts
```

Run the full 150-workflow validation:

```bash
npx tsx validation.harness.ts
```

## Project structure

```
src/
  orchestrator.ts        one Anthropic call per report, runs scoring + explanation
  backend/
    scoring.ts           the deterministic engine
    scoring.config.ts    all weights, subscores, gates, thresholds (tune here only)
    scoring.test.ts      regression fixtures
  config/                system and user prompts for the explanation layer
  frontend/              the verdict report, section by section
  makepdf.tsx            print-to-PDF action
app/                     Next.js routes, the input form, the API endpoint
lib/                     shared types and helpers
```

All scoring behavior is controlled from `src/backend/scoring.config.ts`. Nothing about the verdict depends on the language model.

## Configuration

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Server-side key for the explanation call. Read only from the environment, never committed. |

The key is used server-side in the `/api/analyze` route and is never exposed to the browser.

## Built with

Next.js 16, React 19, TypeScript, and the Anthropic SDK.
