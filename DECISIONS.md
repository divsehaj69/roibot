# ROIbot — Locked Product Decisions (do not re-litigate)

## What it is
An AI implementation decision advisor. A user describes ONE business
workflow; ROIbot returns an honest verdict on what to do about AI for it:
  - BUY    — an off-the-shelf tool exists; don't reinvent it
  - BUILD  — you need control/customization; build/own it
  - HYBRID — buy the core, customize the edges
  - DON'T  — AI isn't worth it here; say so plainly

The DON'T verdict is the product's moat. Most tools never say no. This one
does, and that honesty is the whole value proposition.

## What it is NOT
- NOT a tool recommender. On a BUY verdict, output a CATEGORY + a tailored
  BUYING CHECKLIST derived from the user's inputs — never a named product
  (names go stale, risk hallucination, and destroy trust/neutrality).
- NOT a chatbot. It is a form -> deterministic verdict -> explanation pipeline.
- NOT an org-readiness quiz. It assesses ONE workflow, not company maturity.

## Core architectural principle (non-negotiable)
The MATH decides the verdict. The LLM ONLY explains it.
The LLM never computes, chooses, or overrides a verdict. This is what makes
the recommendation un-hallucinatable and is the key trust feature.

## Method (grounded in how consultants actually do this)
A value × feasibility decision matrix with weights FIXED IN ADVANCE (the
discipline consultants impose manually), plus evidence-backed hard "Don't"
gates, plus a confidence measure based on how close the verdict is to flipping.

## Who it's for
Hard cases with competing constraints (volume vs. value vs. privacy vs.
budget vs. data quality) where common sense can't produce an answer. Easy
obvious cases are not the target — the tool earns its value untangling
trade-offs a human can't weigh in their head. Specifically serves SMBs and
solopreneurs priced out of $2K–$50K consultants.

## Output — one page, color-coded, shareable
- Verdict (big) + confidence level (DON'T=red, BUY=green, BUILD=blue, HYBRID=purple)
- Reasoning: 2 sentences (LLM)
- ROI: a RANGE with stated assumptions, modeling FULL total cost of ownership
  (not just license: integration, data prep, tuning, monitoring, change mgmt).
  Default to honest payback priors — typical AI payback is 2–4 years; under
  1 year is rare and only for narrow high-volume rules-based work. Never
  hand-wave a rosy number.
- Top 3 risks specific to this case (LLM)
- If BUY: tailored buying checklist (category + must-haves from inputs)
  If BUILD/HYBRID: minimal architecture sketch
  If DON'T: what would have to change for AI to become worth it

## MVP scope
The one-page verdict generator only. NO accounts, NO database, ONE Anthropic
call per report. Ship the screenshot-worthy verdict first.

## Known business risk (flagged, not solved)
"Who pays to be told no?" The DON'T moat is also a monetization tension.
Intended answer: charge for the honest decision itself, not for referrals.
Does not affect the MVP build.
