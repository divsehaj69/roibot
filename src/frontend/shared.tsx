import type { Verdict } from "../backend/scoring";

export const PALETTE: Record<Verdict, {
  bg: string; border: string; badge: string; badgeText: string;
  label: string; bar: string; dot: string;
}> = {
  "DON'T": { bg: "#fef2f2", border: "#fecaca", badge: "#dc2626", badgeText: "#fff", label: "#b91c1c", bar: "#ef4444", dot: "#f87171" },
  "BUY":   { bg: "#f0fdf4", border: "#bbf7d0", badge: "#16a34a", badgeText: "#fff", label: "#15803d", bar: "#22c55e", dot: "#4ade80" },
  "BUILD": { bg: "#eff6ff", border: "#bfdbfe", badge: "#2563eb", badgeText: "#fff", label: "#1d4ed8", bar: "#3b82f6", dot: "#60a5fa" },
  "HYBRID":{ bg: "#faf5ff", border: "#e9d5ff", badge: "#7c3aed", badgeText: "#fff", label: "#6d28d9", bar: "#8b5cf6", dot: "#a78bfa" },
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  "DON'T": "Don't automate this",
  "BUY":   "Buy a tool",
  "BUILD": "Build it",
  "HYBRID":"Buy and customize",
};

export const VERDICT_SUBTEXT: Record<Verdict, string> = {
  "DON'T": "AI is not the right investment for this workflow right now.",
  "BUY":   "An off-the-shelf product covers this. No custom development needed.",
  "BUILD": "The workflow demands control and custom fit. Own the solution.",
  "HYBRID":"Buy the core capability. Add custom layers for the edges.",
};

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "#9ca3af", margin: "0 0 0.35rem",
    }}>
      {children}
    </p>
  );
}

export function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: "0.75rem", border: "1px solid #e5e7eb",
      background: "#fff", padding: "1.25rem 1.5rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", margin: "0 0 0.75rem" }}>
      {children}
    </p>
  );
}

export function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>{value}/100</span>
      </div>
      <div style={{ height: "6px", borderRadius: "9999px", background: "#f3f4f6" }}>
        <div style={{
          height: "6px", borderRadius: "9999px", background: color,
          width: `${value}%`, transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

export function Bullet({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", listStyle: "none" }}>
      <span style={{
        marginTop: "0.45rem", width: "6px", height: "6px",
        borderRadius: "9999px", background: color, flexShrink: 0,
      }} />
      <span style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>{children}</span>
    </li>
  );
}
