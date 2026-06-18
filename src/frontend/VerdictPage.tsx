"use client";

import type { ScoringResult, ScoringInput } from "../backend/scoring";
import type { Explanation, ReviewFlag }     from "../../lib/explanation.types";
import Logo                                 from "../../app/components/Logo";
import PrintButton                          from "../makepdf";
import InputsSummary                        from "./InputsSummary";
import HeroCard                             from "./HeroCard";
import KeyDrivers                           from "./KeyDrivers";
import RoiSection                           from "./RoiSection";
import RecommendationSection                from "./RecommendationSection";
import TopRisks                             from "./TopRisks";
import HumanReviewBanner                    from "./HumanReviewBanner";
import WhatWouldChange                      from "./WhatWouldChange";
import Scorecard                            from "./Scorecard";
import ConfidenceSection                    from "./ConfidenceSection";
import ReviewFlagsSection                   from "./ReviewFlagsSection";
import NextSteps                            from "./NextSteps";
import { PALETTE }                          from "./shared";

interface Props {
  result:      ScoringResult;
  explanation: Explanation | null;
  reviewFlags: ReviewFlag[];
  shareUrl:    string;
  input:       ScoringInput;
  onReset:     () => void;
}

export default function VerdictPage({ result, explanation, reviewFlags, shareUrl, input, onReset }: Props) {
  const p = PALETTE[result.verdict];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      <div style={{ marginBottom: "0.25rem" }}>
        <Logo />
      </div>

      {/* Inputs summary */}
      <InputsSummary input={input} />

      {/* 1 — Hero */}
      <HeroCard result={result} reasoning={explanation?.reasoning ?? null} />

      {/* 2 — Key drivers */}
      <KeyDrivers input={input} result={result} />

      {/* 3 — ROI */}
      <RoiSection result={result} input={input} />

      {/* 4 — Recommendation */}
      <RecommendationSection verdict={result.verdict} verdictSection={explanation?.verdictSection ?? null} />

      {/* 5 — Top risks */}
      <TopRisks risks={explanation?.risks ?? null} accentColor={p.dot} />

      {/* 6 — Human review banner */}
      <HumanReviewBanner show={result.humanReviewFlag} />

      {/* 7 — What would change */}
      <WhatWouldChange input={input} result={result} />

      {/* 8 — Scorecard */}
      <Scorecard result={result} />

      {/* 9 — Confidence (with review-flag count badge) */}
      <ConfidenceSection confidence={result.confidence} reviewFlagCount={reviewFlags.length} />

      {/* 10 — Review flags (additive, never affect verdict) */}
      <ReviewFlagsSection flags={reviewFlags} />

      {/* 11 — Next steps */}
      <NextSteps verdict={result.verdict} />

      {/* Actions — hidden in print */}
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", paddingTop: "0.5rem" }}>
        <PrintButton />
        <button
          onClick={() => {
            const copied = navigator.clipboard.writeText(shareUrl);
            void copied;
          }}
          style={actionBtn}
        >
          Copy shareable link
        </button>
        <button onClick={onReset} style={actionBtn}>
          Analyze another workflow
        </button>
      </div>

    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "0.5rem",
  padding: "0.5rem 1.1rem", borderRadius: "0.5rem",
  border: "1.5px solid #d1d5db", background: "#fff",
  fontSize: "0.875rem", fontWeight: 500, color: "#374151",
  cursor: "pointer",
};
