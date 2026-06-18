"use client";

import { useState } from "react";
import type {
  TimePerRun, LaborCost, ErrorImpact, Repeatability,
  Judgment, WorkflowNature, DataReadiness, Sensitivity, Integration,
  EngCapacity, Budget, Timeline, ScoringInput,
} from "@/src/backend/scoring";

interface Props {
  onSubmit: (input: ScoringInput) => void;
  loading?: boolean;
}

interface Option<T extends string> {
  value: T;
  label: string;
  sub?: string;
}

// ── Primitives ────────────────────────────────────────────────────────────────

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
              display: "flex", flexDirection: "column", alignItems: "flex-start",
              padding: "0.5rem 1rem", borderRadius: "0.5rem",
              border: sel ? "1.5px solid #4f46e5" : "1.5px solid #d1d5db",
              background: sel ? "#4f46e5" : "#fff",
              cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0 -0.5rem" }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#9ca3af", whiteSpace: "nowrap" }}>
        {title}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#f3f4f6" }} />
    </div>
  );
}

// ── Options ───────────────────────────────────────────────────────────────────

const TIME_OPTIONS: Option<TimePerRun>[] = [
  { value: "<2min",    label: "Under 2 minutes",  sub: "very quick" },
  { value: "2-10min",  label: "2-10 minutes",     sub: "short" },
  { value: "10-30min", label: "10-30 minutes",    sub: "moderate" },
  { value: "30-60min", label: "30-60 minutes",    sub: "substantial" },
  { value: "60+min",   label: "Over an hour",     sub: "complex task" },
];

const LABOR_OPTIONS: Option<LaborCost>[] = [
  { value: "<20",   label: "Under $20/hr",  sub: "e.g. entry-level ops" },
  { value: "20-50", label: "$20-50/hr",     sub: "e.g. coordinator, analyst" },
  { value: "50-100",label: "$50-100/hr",    sub: "e.g. specialist, RN" },
  { value: "100+",  label: "$100+/hr",      sub: "e.g. doctor, lawyer" },
];

const ERROR_OPTIONS: Option<ErrorImpact>[] = [
  { value: "Low",      label: "Minor annoyance",       sub: "easily corrected" },
  { value: "Medium",   label: "Rework or cost",        sub: "real but recoverable" },
  { value: "High",     label: "Significant loss",      sub: "financial, legal, reputational" },
  { value: "Critical", label: "Safety or compliance",  sub: "HIPAA, life, law" },
];

const REPEATABILITY_OPTIONS: Option<Repeatability>[] = [
  { value: "AdHoc",        label: "Ad hoc",              sub: "every case is different" },
  { value: "Somewhat",     label: "Somewhat consistent", sub: "similar but varies" },
  { value: "Standardized", label: "Standardized",        sub: "clear, predictable steps" },
  { value: "Highly",       label: "Highly repetitive",   sub: "almost identical each time" },
];

const JUDGMENT_OPTIONS: Option<Judgment>[] = [
  { value: "Critical", label: "Critical judgment",  sub: "expert decisions only" },
  { value: "High",     label: "High judgment",      sub: "professional expertise needed" },
  { value: "Moderate", label: "Moderate judgment",  sub: "some rules, some discretion" },
  { value: "Low",      label: "Low judgment",       sub: "rule-based, predictable" },
];

const NATURE_OPTIONS: Option<WorkflowNature>[] = [
  { value: "Physical",      label: "Physical",           sub: "moving or handling things" },
  { value: "Mixed",         label: "Mixed",              sub: "physical + digital steps" },
  { value: "DigitalOps",    label: "Digital operations", sub: "clicks, forms, system actions" },
  { value: "DataProc",      label: "Data processing",    sub: "transform, validate, enrich" },
  { value: "Knowledge",     label: "Knowledge work",     sub: "reading, reasoning, writing" },
  { value: "Communication", label: "Communication",      sub: "emails, messages, documents" },
];

const DATA_OPTIONS: Option<DataReadiness>[] = [
  { value: "Ready",   label: "Clean and ready",     sub: "structured, accessible" },
  { value: "Partial", label: "Partially ready",     sub: "some gaps or inconsistencies" },
  { value: "Messy",   label: "Messy or scattered",  sub: "needs significant cleanup" },
  { value: "Unknown", label: "Not sure",            sub: "hasn't been audited" },
];

const SENSITIVITY_OPTIONS: Option<Sensitivity>[] = [
  { value: "Public",       label: "Public data",    sub: "no restrictions" },
  { value: "Internal",     label: "Internal only",  sub: "not for external sharing" },
  { value: "Confidential", label: "Confidential",   sub: "limits cloud AI options" },
  { value: "Regulated",    label: "Regulated",      sub: "HIPAA, GDPR, FINRA, etc." },
];

const INTEGRATION_OPTIONS: Option<Integration>[] = [
  { value: "Standalone", label: "Standalone",      sub: "no other systems" },
  { value: "Few",        label: "Few systems",     sub: "1-3 integrations" },
  { value: "Many",       label: "Many systems",    sub: "4-10 integrations" },
  { value: "Enterprise", label: "Enterprise stack",sub: "SAP, Epic, Salesforce, etc." },
];

const ENG_OPTIONS: Option<EngCapacity>[] = [
  { value: "None",     label: "No engineering",  sub: "no code, no IT resources" },
  { value: "Limited",  label: "Limited",         sub: "occasional dev help" },
  { value: "Moderate", label: "Moderate",        sub: "a developer part-time" },
  { value: "Strong",   label: "Strong",          sub: "dedicated engineering team" },
];

const BUDGET_OPTIONS: Option<Budget>[] = [
  { value: "Micro",  label: "Under $5K",     sub: "SaaS tools only" },
  { value: "Small",  label: "$5K-$25K",      sub: "off-the-shelf + config" },
  { value: "Medium", label: "$25K-$100K",    sub: "custom integration" },
  { value: "Large",  label: "$100K+",        sub: "enterprise or bespoke build" },
];

const TIMELINE_OPTIONS: Option<Timeline>[] = [
  { value: "Immediate", label: "Immediately",       sub: "weeks, not months" },
  { value: "1month",    label: "Within 1 month" },
  { value: "3months",   label: "Within 3 months" },
  { value: "Flexible",  label: "No hard deadline",  sub: "do it right" },
];

// ── Form ──────────────────────────────────────────────────────────────────────

export default function InputForm({ onSubmit, loading = false }: Props) {
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [volume,              setVolume]              = useState("");
  const [timePerRun,          setTimePerRun]          = useState<TimePerRun     | "">("");
  const [laborCost,           setLaborCost]           = useState<LaborCost      | "">("");
  const [errorImpact,         setErrorImpact]         = useState<ErrorImpact    | "">("");
  const [repeatability,       setRepeatability]       = useState<Repeatability  | "">("");
  const [judgment,            setJudgment]            = useState<Judgment       | "">("");
  const [workflowNature,      setWorkflowNature]      = useState<WorkflowNature | "">("");
  const [dataReadiness,       setDataReadiness]       = useState<DataReadiness  | "">("");
  const [sensitivity,         setSensitivity]         = useState<Sensitivity    | "">("");
  const [integration,         setIntegration]         = useState<Integration    | "">("");
  const [engCapacity,         setEngCapacity]         = useState<EngCapacity    | "">("");
  const [budget,              setBudget]              = useState<Budget         | "">("");
  const [timeline,            setTimeline]            = useState<Timeline       | "">("");

  const complete =
    workflowDescription.trim() !== "" &&
    Number(volume) > 0 &&
    timePerRun    !== "" &&
    laborCost     !== "" &&
    errorImpact   !== "" &&
    repeatability !== "" &&
    judgment      !== "" &&
    workflowNature !== "" &&
    dataReadiness !== "" &&
    sensitivity   !== "" &&
    integration   !== "" &&
    engCapacity   !== "" &&
    budget        !== "" &&
    timeline      !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    onSubmit({
      workflowDescription: workflowDescription.trim(),
      volume:        Number(volume),
      timePerRun:    timePerRun    as TimePerRun,
      laborCost:     laborCost     as LaborCost,
      errorImpact:   errorImpact   as ErrorImpact,
      repeatability: repeatability as Repeatability,
      judgment:      judgment      as Judgment,
      workflowNature: workflowNature as WorkflowNature,
      dataReadiness: dataReadiness as DataReadiness,
      sensitivity:   sensitivity   as Sensitivity,
      integration:   integration   as Integration,
      engCapacity:   engCapacity   as EngCapacity,
      budget:        budget        as Budget,
      timeline:      timeline      as Timeline,
    });
  }

  const inputBase: React.CSSProperties = {
    borderRadius: "0.5rem", border: "1.5px solid #d1d5db",
    background: "#fff", padding: "0.5rem 0.75rem",
    fontSize: "0.875rem", color: "#111827", outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* ── Workflow ── */}
      <SectionDivider title="About the workflow" />

      <Field
        label="Describe the workflow"
        hint="One business process. For example: triaging customer support emails, or extracting data from scanned invoices."
      >
        <textarea
          rows={3}
          placeholder="What does the workflow do today, and what would AI handle in it?"
          value={workflowDescription}
          onChange={(e) => setWorkflowDescription(e.target.value)}
          style={{ ...inputBase, width: "100%", resize: "none", lineHeight: 1.5 }}
        />
      </Field>

      <Field
        label="How many times does this happen per month?"
        hint="Enter a number. Under 10 is too infrequent to automate."
      >
        <input
          type="number"
          min={0}
          placeholder="e.g. 2400"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          style={{ ...inputBase, width: "12rem" }}
        />
      </Field>

      <Field
        label="How long does one run take by hand?"
        hint="Pick the closest band."
      >
        <OptionGroup options={TIME_OPTIONS} value={timePerRun} onChange={setTimePerRun} />
      </Field>

      <Field
        label="What is the fully-loaded labor cost for the person doing this today?"
        hint="Include salary, benefits, and overhead."
      >
        <OptionGroup options={LABOR_OPTIONS} value={laborCost} onChange={setLaborCost} />
      </Field>

      {/* ── Characteristics ── */}
      <SectionDivider title="Workflow characteristics" />

      <Field
        label="What happens if this is done wrong?"
        hint="Think about the worst realistic case."
      >
        <OptionGroup options={ERROR_OPTIONS} value={errorImpact} onChange={setErrorImpact} />
      </Field>

      <Field
        label="How consistent is this workflow across runs?"
        hint="More consistent means easier to automate."
      >
        <OptionGroup options={REPEATABILITY_OPTIONS} value={repeatability} onChange={setRepeatability} />
      </Field>

      <Field
        label="How much expert judgment does each run require?"
        hint="Judgment that can't be codified into rules."
      >
        <OptionGroup options={JUDGMENT_OPTIONS} value={judgment} onChange={setJudgment} />
      </Field>

      <Field
        label="What type of work is this?"
        hint="Physical work cannot be automated by software AI."
      >
        <OptionGroup options={NATURE_OPTIONS} value={workflowNature} onChange={setWorkflowNature} />
      </Field>

      {/* ── Data & systems ── */}
      <SectionDivider title="Data and systems" />

      <Field
        label="How is the input data quality for this workflow?"
        hint="AI needs clean, structured inputs. This is a common blocker."
      >
        <OptionGroup options={DATA_OPTIONS} value={dataReadiness} onChange={setDataReadiness} />
      </Field>

      <Field
        label="How sensitive is the data involved?"
        hint="Regulated data significantly limits which AI vendors you can use."
      >
        <OptionGroup options={SENSITIVITY_OPTIONS} value={sensitivity} onChange={setSensitivity} />
      </Field>

      <Field
        label="How many systems does this workflow touch?"
        hint="Each integration adds implementation cost and risk."
      >
        <OptionGroup options={INTEGRATION_OPTIONS} value={integration} onChange={setIntegration} />
      </Field>

      {/* ── Resources ── */}
      <SectionDivider title="Resources and constraints" />

      <Field
        label="How much engineering capacity do you have for this?"
        hint="Honest assessment — not what you hope to have."
      >
        <OptionGroup options={ENG_OPTIONS} value={engCapacity} onChange={setEngCapacity} />
      </Field>

      <Field
        label="What is the realistic budget for AI on this workflow?"
        hint="Include setup costs, not just ongoing fees."
      >
        <OptionGroup options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
      </Field>

      <Field label="When does this need to be live?">
        <OptionGroup options={TIMELINE_OPTIONS} value={timeline} onChange={setTimeline} />
      </Field>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={!complete || loading}
          style={{
            padding: "0.75rem 2rem", borderRadius: "0.5rem", border: "none",
            fontSize: "0.875rem", fontWeight: 600,
            cursor: complete && !loading ? "pointer" : "not-allowed",
            background: complete && !loading ? "#4f46e5" : "#e5e7eb",
            color:      complete && !loading ? "#fff"    : "#9ca3af",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Analyzing..." : "Get my verdict"}
        </button>
        {!complete && (
          <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.5rem", marginBottom: 0 }}>
            Answer all questions to continue.
          </p>
        )}
      </div>

    </form>
  );
}
