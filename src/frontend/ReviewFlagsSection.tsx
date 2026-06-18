import type { ReviewFlag, FlagSeverity } from "../../lib/explanation.types";
import { SectionCard, SectionTitle } from "./shared";

const SEVERITY_STYLE: Record<FlagSeverity, {
  bg: string; border: string; dot: string; label: string;
}> = {
  "info":           { bg: "#f0f9ff", border: "#bae6fd", dot: "#0ea5e9",  label: "Note" },
  "warning":        { bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b",  label: "Warning" },
  "strong-warning": { bg: "#fff1f2", border: "#fecdd3", dot: "#f43f5e",  label: "Inconsistency" },
};

interface Props {
  flags: ReviewFlag[];
}

export default function ReviewFlagsSection({ flags }: Props) {
  if (flags.length === 0) return null;

  return (
    <SectionCard>
      <SectionTitle>Review flags</SectionTitle>
      <p style={{ margin: "0 0 0.875rem", fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.55 }}>
        Based on the workflow description, the following potential mismatches were detected between the description and the structured inputs. These do not change the verdict. They are provided so you can verify your classifications are correct.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {flags.map((flag, i) => {
          const s = SEVERITY_STYLE[flag.severity];
          return (
            <div key={i} style={{
              borderRadius: "0.5rem", border: `1.5px solid ${s.border}`,
              background: s.bg, padding: "0.75rem 1rem",
              display: "flex", gap: "0.75rem", alignItems: "flex-start",
            }}>
              <span style={{
                flexShrink: 0, marginTop: "0.1rem",
                width: "8px", height: "8px", borderRadius: "50%",
                background: s.dot, display: "inline-block",
              }} />
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: s.dot, display: "block",
                  marginBottom: "0.2rem",
                }}>
                  {s.label} — {flag.field}
                </span>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#374151", lineHeight: 1.55 }}>
                  {flag.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
