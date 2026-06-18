"use client";

import { useState, useEffect, useRef } from "react";
import InputForm    from "./InputForm";
import VerdictPage  from "@/src/frontend/VerdictPage";
import { encodeInputs, decodeInputs } from "@/lib/share";
import type { ScoringInput }  from "@/src/backend/scoring";
import type { ScoringResult } from "@/src/backend/scoring";
import type { Explanation, ReviewFlag } from "@/lib/explanation.types";

type Phase =
  | { tag: "form" }
  | { tag: "loading" }
  | { tag: "result"; result: ScoringResult; explanation: Explanation | null; reviewFlags: ReviewFlag[]; shareUrl: string; input: ScoringInput };

export default function FormShell() {
  const [phase, setPhase] = useState<Phase>({ tag: "form" });
  const autoRunFired = useRef(false);

  // On mount, check for a shared ?r= param and auto-run it.
  // Guard with a ref so React StrictMode's double-invocation doesn't fire twice.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoRunFired.current) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("r");
      if (encoded) {
        const input = decodeInputs(encoded);
        if (input) {
          autoRunFired.current = true;
          runAnalysis(input);
        }
      }
    } catch (e) {
      console.error("Share param decode failed:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis(input: ScoringInput) {
    setPhase({ tag: "loading" });

    try {
      const res = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const { result, explanation, reviewFlags } = await res.json();

      // Only update the URL once we have a result — this is the shareable link.
      // Setting it earlier (before the API returns) would cause auto-run on refresh
      // even when the user submitted the form manually.
      const encoded  = encodeInputs(input);
      const shareUrl = `${window.location.origin}${window.location.pathname}?r=${encoded}`;
      window.history.replaceState(null, "", shareUrl);

      setPhase({ tag: "result", result, explanation, reviewFlags: reviewFlags ?? [], shareUrl, input });
    } catch {
      setPhase({ tag: "form" });
      alert("Something went wrong. Please try again.");
    }
  }

  function reset() {
    window.history.replaceState(null, "", window.location.pathname);
    setPhase({ tag: "form" });
  }

  if (phase.tag === "loading") {
    return (
      <>
        <style>{`
          @keyframes roibot-slide {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(500%); }
          }
        `}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: "1.25rem", padding: "4rem 2rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0, letterSpacing: "0.02em" }}>
            Running the analysis…
          </p>
          <div style={{ width: "6rem", height: "2px", background: "#e5e7eb",
            borderRadius: "9999px", overflow: "hidden", position: "relative" }}>
            <div style={{
              position: "absolute", top: 0, left: 0, height: "100%", width: "40%",
              background: "#4f46e5", borderRadius: "9999px",
              animation: "roibot-slide 1.1s ease-in-out infinite",
            }} />
          </div>
        </div>
      </>
    );
  }

  if (phase.tag === "result") {
    return (
      <VerdictPage
        result={phase.result}
        explanation={phase.explanation}
        reviewFlags={phase.reviewFlags}
        shareUrl={phase.shareUrl}
        input={phase.input}
        onReset={reset}
      />
    );
  }

  return <InputForm onSubmit={runAnalysis} loading={false} />;
}
