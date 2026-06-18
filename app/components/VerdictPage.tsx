"use client";

import { useState } from "react";
import Logo from "./Logo";
import type { ScoringResult, ScoringInput } from "@/lib/scoring";
import type { Explanation }                 from "@/lib/explanation.types";

// ── Palette ───────────────────────────────────────────────────────────────────

const PALETTE = {
  "DON'T": { bg: "#fef2f2", border: "#fecaca", badge: "#dc2626", badgeText: "#fff",
              label: "#b91c1c", bar: "#ef4444", dot: "#f87171",
              roiBorder: "#fecaca", roiBg: "#fff5f5" },
  "BUY":   { bg: "#f0fdf4", border: "#bbf7d0", badge: "#16a34a", badgeText: "#fff",
              label: "#15803d", bar: "#22c55e", dot: "#4ade80",
              roiBorder: "#bbf7d0", roiBg: "#f0fdf4" },
  "BUILD": { bg: "#eff6ff", border: "#bfdbfe", badge: "#2563eb", badgeText: "#fff",
              label: "#1d4ed8", bar: "#3b82f6", dot: "#60a5fa",
              roiBorder: "#bfdbfe", roiBg: "#eff6ff" },
  "HYBRID":{ bg: "#faf5ff", border: "#e9d5ff", badge: "#7c3aed", badgeText: "#fff",
              label: "#6d28d9", bar: "#8b5cf6", dot: "#a78bfa",
              roiBorder: "#e9d5ff", roiBg: "#faf5ff" },
} as const;

const VERDICT_LABELS = {
  "DON'T": "Don't do it",
  "BUY":   "Buy a tool",
  "BUILD": "Build it",
  "HYBRID":"Buy and customize",
};

const VERDICT_SUBTEXT = {
  "DON'T": "AI isn't worth it for this workflow right now.",
  "BUY":   "An off-the-shelf tool exists. Don't reinvent it.",
  "BUILD": "You need control and customization. Own it.",
  "HYBRID":"Buy the core capability. Build the custom edges.",
};

const SECTION_TITLE = {
  "DON'T": "What would have to change",
  "BUY":   "What to look for",
  "BUILD": "Architecture sketch",
  "HYBRID":"Architecture sketch",
};

const GATE_MESSAGES: Record<string, string> = {
  VOLUME:    "This happens too rarely to justify automating. A person can handle this volume directly.",
  LOW_VALUE: "The time saved is too small to justify the cost and effort of setting up AI.",
  DATA:      "Your data needs work first. Cleaning it up would cost more than the payoff right now.",
};

// ── Input summary label maps ──────────────────────────────────────────────────

const TIME_LABELS: Record<string, string> = {
  QUICK:    "Under 5 min",
  MODERATE: "5–30 min",
  LONG:     "30+ min",
};
const ERROR_LABELS: Record<string, string> = {
  LOW:    "Low error cost",
  MEDIUM: "Medium error cost",
  HIGH:   "High error cost",
};
const DATA_LABELS: Record<string, string> = {
  READY:  "Clean data",
  MESSY:  "Messy data",
  UNSURE: "Uncertain data",
};
const CONSTRAINT_LABELS: Record<string, string> = {
  NONE:       "No major constraints",
  PRIVACY:    "Sensitive data",
  REGULATION: "Regulated industry",
  TIMELINE:   "Need it fast",
  NO_ENG:     "No dev resources",
};
const BUDGET_LABELS: Record<string, string> = {
  MICRO: "Under $5K",
  SMALL: "$5K–$25K",
  MID:   "$25K–$100K",
  LARGE: "$100K+",
};

const CONFIDENCE_STYLE: Record<string, React.CSSProperties> = {
  High:   { background: "#111827", color: "#fff" },
  Medium: { background: "#e5e7eb", color: "#374151" },
  Low:    { background: "#fef3c7", color: "#92400e" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#6b7280" }}>
        <span>{label}</span>
        <span style={{ fontWeight: 500, color: "#374151" }}>{value}/100</span>
      </div>
      <div style={{ height: "6px", borderRadius: "9999px", background: "#e5e7eb" }}>
        <div style={{ height: "6px", borderRadius: "9999px", background: color, width: `${value}%`, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      color: "#9ca3af", margin: "0 0 0.4rem" }}>
      {children}
    </p>
  );
}

// ── ROI block ─────────────────────────────────────────────────────────────────
// Parses the LLM's roi string into three visual zones:
//   1. Cost range — first "$X–$Y" or "$X to $Y" pattern found
//   2. Payback line — sentence containing "payback", "year", or "month"
//   3. Assumptions — everything else

function parseRoi(roi: string): { range: string; payback: string; assumptions: string } {
  // Extract a cost range like "$8K–$22K" or "$8K to $22K over 18 months"
  const rangeMatch = roi.match(/\$[\d.,]+[KkMm]?\s*(?:to|–|-)\s*\$[\d.,]+[KkMm]?(?:\s+over\s+[\w\s]+)?/i);
  const range = rangeMatch ? rangeMatch[0] : "";

  const sentences = roi.split(/(?<=[.!?])\s+/);
  const paybackSentence = sentences.find(s =>
    /payback|pay.?back|year|month|break.even/i.test(s) && s !== rangeMatch?.[0]
  ) ?? "";

  const assumptions = sentences
    .filter(s => s !== paybackSentence && !s.includes(range))
    .join(" ")
    .trim();

  return { range, payback: paybackSentence, assumptions: assumptions || roi };
}

function RoiBlock({ roi, accentColor, roiBg, roiBorder }: {
  roi: string;
  accentColor: string;
  roiBg: string;
  roiBorder: string;
}) {
  const { range, payback, assumptions } = parseRoi(roi);
  return (
    <div style={{
      borderRadius: "0.75rem",
      border: `1.5px solid ${roiBorder}`,
      background: roiBg,
      padding: "1.25rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    }}>
      {range && (
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#9ca3af", margin: "0 0 0.25rem" }}>
            Cost range
          </p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em", color: accentColor, margin: 0 }}>
            {range}
          </p>
        </div>
      )}
      {payback && (
        <div style={{ borderTop: `1px solid ${roiBorder}`, paddingTop: "0.75rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#9ca3af", margin: "0 0 0.25rem" }}>
            Payback timeline
          </p>
          <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0, lineHeight: 1.5 }}>
            {payback}
          </p>
        </div>
      )}
      <div style={{ borderTop: `1px solid ${roiBorder}`, paddingTop: "0.75rem" }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#9ca3af", margin: "0 0 0.25rem" }}>
          Assumptions
        </p>
        <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
          {assumptions || roi}
        </p>
      </div>
    </div>
  );
}

function InputsSummary({ input }: { input: ScoringInput }) {
  const chips = [
    `${input.volume.toLocaleString()}/mo`,
    TIME_LABELS[input.timePerRun]       ?? input.timePerRun,
    ERROR_LABELS[input.errorCost]       ?? input.errorCost,
    DATA_LABELS[input.dataReady]        ?? input.dataReady,
    CONSTRAINT_LABELS[input.constraint] ?? input.constraint,
    BUDGET_LABELS[input.budget]         ?? input.budget,
  ];

  return (
    <div style={{
      borderRadius: "0.75rem",
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      padding: "0.875rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    }}>
      <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#9ca3af" }}>
        Your inputs
      </p>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#374151", lineHeight: 1.5 }}>
        {input.useCase}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.125rem" }}>
        {chips.map((chip) => (
          <span key={chip} style={{
            padding: "0.2rem 0.625rem",
            borderRadius: "9999px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            fontSize: "0.7rem",
            color: "#6b7280",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.5rem 1rem", borderRadius: "0.5rem",
      border: "1.5px solid #d1d5db", background: "#fff",
      fontSize: "0.875rem", fontWeight: 500, color: "#374151",
      cursor: "pointer",
    }}>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
      </svg>
      {copied ? "Copied!" : "Copy shareable link"}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  result:      ScoringResult;
  explanation: Explanation | null;
  shareUrl:    string;
  input:       ScoringInput;
  onReset:     () => void;
}

export default function VerdictPage({ result, explanation, shareUrl, input, onReset }: Props) {
  const p = PALETTE[result.verdict];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Logo */}
      <div style={{ marginBottom: "0.25rem" }}>
        <Logo />
      </div>

      {/* ── Verdict hero ──────────────────────────────────────────────────── */}
      <div style={{ borderRadius: "1rem", border: `2px solid ${p.border}`, background: p.bg, padding: "2rem" }}>

        {/* Badge row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <span style={{
            borderRadius: "9999px", padding: "0.25rem 0.875rem",
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            background: p.badge, color: p.badgeText,
          }}>
            {result.verdict}
          </span>
          <span style={{
            borderRadius: "9999px", padding: "0.2rem 0.75rem",
            fontSize: "0.7rem", fontWeight: 600,
            ...CONFIDENCE_STYLE[result.confidence],
          }}>
            {result.confidence} confidence
          </span>
        </div>

        {/* Headline */}
        <p style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em", color: p.label, margin: 0, lineHeight: 1.1 }}>
          {VERDICT_LABELS[result.verdict]}
        </p>
        <p style={{ marginTop: "0.4rem", fontSize: "0.875rem", color: "#6b7280" }}>
          {VERDICT_SUBTEXT[result.verdict]}
        </p>

        {/* Score bars */}
        <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "24rem" }}>
          <ScoreBar label="Worth it"     value={result.worthIt}    color={p.bar} />
          <ScoreBar label="Needs custom" value={result.needsCustom} color={p.bar} />
        </div>

        {/* Flags: gate messages, feasibility, messy data, human review */}
        {(result.firedGate || result.cannotBuild || result.messyWarning || result.humanReviewFlag) && (
          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {result.firedGate && (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#dc2626", fontWeight: 500, lineHeight: 1.4 }}>
                {GATE_MESSAGES[result.firedGate]}
              </p>
            )}
            {result.humanReviewFlag && (
              <div style={{ borderRadius: "0.5rem", border: "1.5px solid #f97316", background: "#fff7ed",
                padding: "0.6rem 0.875rem" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#c2410c", lineHeight: 1.4 }}>
                  Keep a human reviewing outputs. Do not fully automate this.
                </p>
              </div>
            )}
            {result.cannotBuild && !result.firedGate && (
              <span style={{ borderRadius: "9999px", border: "1px solid #e5e7eb", background: "#fff", alignSelf: "flex-start",
                padding: "0.2rem 0.75rem", fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                Build not feasible with current constraints
              </span>
            )}
            {result.messyWarning && (
              <span style={{ borderRadius: "9999px", border: "1px solid #fde68a", background: "#fffbeb", alignSelf: "flex-start",
                padding: "0.2rem 0.75rem", fontSize: "0.75rem", color: "#92400e", fontWeight: 500 }}>
                Fix your data first
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Inputs summary ────────────────────────────────────────────────── */}
      <InputsSummary input={input} />

      {/* ── LLM sections ──────────────────────────────────────────────────── */}
      {explanation ? (
        <div style={{ borderRadius: "1rem", border: "1px solid #e5e7eb", background: "#fff", overflow: "hidden" }}>

          {/* Why */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6" }}>
            <SectionLabel>Why</SectionLabel>
            <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6, margin: 0 }}>
              {explanation.reasoning}
            </p>
          </div>

          {/* ROI — redesigned block */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6" }}>
            <SectionLabel>ROI estimate</SectionLabel>
            <RoiBlock
              roi={explanation.roi}
              accentColor={p.label}
              roiBg={p.roiBg}
              roiBorder={p.roiBorder}
            />
          </div>

          {/* Risks */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6" }}>
            <SectionLabel>Top 3 risks</SectionLabel>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {explanation.risks.map((r, i) => (
                <li key={i} style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ marginTop: "0.45rem", width: "6px", height: "6px", borderRadius: "9999px",
                    background: p.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>{r}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Verdict-specific section */}
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <SectionLabel>{SECTION_TITLE[result.verdict]}</SectionLabel>
            <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {explanation.verdictSection}
            </div>
          </div>

        </div>
      ) : (
        <div style={{ borderRadius: "1rem", border: "1px solid #e5e7eb", background: "#fff", padding: "1.25rem 1.5rem" }}>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af", fontStyle: "italic", margin: 0 }}>
            Explanation unavailable. The verdict above is still valid and was computed entirely by the scoring engine.
          </p>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <CopyLink url={shareUrl} />
        <button onClick={onReset} style={{
          padding: "0.5rem 1rem", borderRadius: "0.5rem",
          border: "1.5px solid #d1d5db", background: "#fff",
          fontSize: "0.875rem", fontWeight: 500, color: "#374151",
          cursor: "pointer",
        }}>
          Analyze another workflow
        </button>
      </div>

    </div>
  );
}
