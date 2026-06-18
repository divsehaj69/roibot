"use client";

import { useState } from "react";
import type { TimePerRun, ErrorCost, DataReady, Constraint, Budget, ScoringInput } from "@/lib/scoring";

interface Props {
  onSubmit: (input: ScoringInput) => void;
  loading?: boolean;
}

interface Option<T extends string> {
  value: T;
  label: string;
  sub?: string;
}

// ── Pill-button group ─────────────────────────────────────────────────────────

function OptionGroup<T extends string>({
  options, value, onChange,
}: {
  options: Option<T>[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {options.map((opt) => {
        const sel = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: sel ? "1.5px solid #4f46e5" : "1.5px solid #d1d5db",
              background: sel ? "#4f46e5" : "#fff",
              cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: sel ? "#fff" : "#374151", lineHeight: 1.4 }}>
              {opt.label}
            </span>
            {opt.sub && (
              <span style={{ fontSize: "0.7rem", marginTop: "2px", color: sel ? "#c7d2fe" : "#9ca3af", lineHeight: 1.3 }}>
                {opt.sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 0 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

// ── Options ───────────────────────────────────────────────────────────────────

const TIME_OPTIONS: Option<TimePerRun>[] = [
  { value: "QUICK",    label: "Under 5 minutes",  sub: "a quick, routine task" },
  { value: "MODERATE", label: "5 to 30 minutes",  sub: "takes real focus" },
  { value: "LONG",     label: "Over 30 minutes",  sub: "substantial or high-stakes" },
];

const ERROR_COST_OPTIONS: Option<ErrorCost>[] = [
  { value: "LOW",    label: "Annoying, easily fixed",       sub: "low stakes" },
  { value: "MEDIUM", label: "Costly or needs rework",       sub: "real impact" },
  { value: "HIGH",   label: "Legal, financial, or safety",  sub: "cannot be wrong" },
];

const DATA_OPTIONS: Option<DataReady>[] = [
  { value: "READY",  label: "Clean and structured", sub: "ready to use" },
  { value: "MESSY",  label: "Messy or incomplete",  sub: "needs work" },
  { value: "UNSURE", label: "Not sure",             sub: "haven't checked" },
];

const CONSTRAINT_OPTIONS: Option<Constraint>[] = [
  { value: "NONE",       label: "No major constraints" },
  { value: "PRIVACY",    label: "Sensitive data",      sub: "can't send to third parties" },
  { value: "REGULATION", label: "Regulated industry",  sub: "HIPAA, FINRA, etc." },
  { value: "TIMELINE",   label: "Need it fast",        sub: "weeks, not months" },
  { value: "NO_ENG",     label: "No dev resources",    sub: "can't write code" },
];

const BUDGET_OPTIONS: Option<Budget>[] = [
  { value: "MICRO", label: "Under $5K" },
  { value: "SMALL", label: "$5K to $25K" },
  { value: "MID",   label: "$25K to $100K" },
  { value: "LARGE", label: "$100K+" },
];

// ── Form ──────────────────────────────────────────────────────────────────────

export default function InputForm({ onSubmit, loading = false }: Props) {
  const [useCase,     setUseCase]     = useState("");
  const [volume,      setVolume]      = useState("");
  const [timePerRun,  setTimePerRun]  = useState<TimePerRun | "">("");
  const [errorCost,   setErrorCost]   = useState<ErrorCost  | "">("");
  const [dataReady,   setDataReady]   = useState<DataReady  | "">("");
  const [constraint,  setConstraint]  = useState<Constraint | "">("");
  const [budget,      setBudget]      = useState<Budget     | "">("");

  const complete =
    useCase.trim() !== "" &&
    volume !== "" &&
    Number(volume) > 0 &&
    timePerRun  !== "" &&
    errorCost   !== "" &&
    dataReady   !== "" &&
    constraint  !== "" &&
    budget      !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    onSubmit({
      useCase:    useCase.trim(),
      volume:     Number(volume),
      timePerRun: timePerRun as TimePerRun,
      errorCost:  errorCost  as ErrorCost,
      dataReady:  dataReady  as DataReady,
      constraint: constraint as Constraint,
      budget:     budget     as Budget,
    });
  }

  const inputBase: React.CSSProperties = {
    borderRadius: "0.5rem",
    border: "1.5px solid #d1d5db",
    background: "#fff",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    color: "#111827",
    outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* 1 — Use case */}
      <Field
        label="Describe the workflow"
        hint="One business process. For example: triaging customer support emails, or extracting data from scanned invoices."
      >
        <textarea
          rows={3}
          placeholder="What does the workflow do today, and what would AI handle in it?"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          style={{ ...inputBase, width: "100%", resize: "none", lineHeight: 1.5 }}
        />
      </Field>

      {/* 2 — Volume */}
      <Field
        label="How many times does this happen per month?"
        hint="A rough number is fine."
      >
        <input
          type="number"
          placeholder="e.g. 500"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          style={{ ...inputBase, width: "12rem" }}
        />
      </Field>

      {/* 3 — Time per run */}
      <Field
        label="How long does one of these take to do by hand?"
        hint="Pick the closest band."
      >
        <OptionGroup options={TIME_OPTIONS} value={timePerRun} onChange={setTimePerRun} />
      </Field>

      {/* 4 — Error cost */}
      <Field
        label="What happens if it's done wrong?"
        hint="Think about the worst realistic case."
      >
        <OptionGroup options={ERROR_COST_OPTIONS} value={errorCost} onChange={setErrorCost} />
      </Field>

      {/* 5 — Data readiness */}
      <Field
        label="How is your data for this workflow?"
        hint="AI needs clean inputs. This affects what is feasible."
      >
        <OptionGroup options={DATA_OPTIONS} value={dataReady} onChange={setDataReady} />
      </Field>

      {/* 6 — Constraint */}
      <Field
        label="What is the biggest constraint on this project?"
        hint="Pick the one that would most limit your options."
      >
        <OptionGroup options={CONSTRAINT_OPTIONS} value={constraint} onChange={setConstraint} />
      </Field>

      {/* 7 — Budget */}
      <Field
        label="What is the realistic budget for AI on this workflow?"
        hint="Include setup costs, not just ongoing fees."
      >
        <OptionGroup options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
      </Field>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={!complete || loading}
          style={{
            padding: "0.75rem 2rem",
            borderRadius: "0.5rem",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: complete && !loading ? "pointer" : "not-allowed",
            background: complete && !loading ? "#4f46e5" : "#e5e7eb",
            color:      complete && !loading ? "#fff"    : "#9ca3af",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Analyzing..." : "Get my verdict"}
        </button>
      </div>

    </form>
  );
}
