// ── Logo options — show all three in /logo-preview, pick one, then lock it ──

// OPTION A: Diamond mark. A small rotated square (diamond) preceding the wordmark.
// Clean, precise, decision-matrix feel.
export function LogoA({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect x="6" y="6" width="16" height="16" rx="2" transform="rotate(45 14 14)"
          fill="#1e293b" />
        <rect x="9" y="9" width="10" height="10" rx="1" transform="rotate(45 14 14)"
          fill="#fff" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "#0f172a" }}>
        ROI<span style={{ color: "#4f46e5" }}>bot</span>
      </span>
    </div>
  );
}

// OPTION B: Single vertical bar mark. A thick left rule as a divider accent.
// Typographic, restrained. Works well small.
export function LogoB({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
      <svg width={Math.round(size * 0.35)} height={size} viewBox="0 0 10 28" fill="none">
        <rect x="0" y="0" width="4" height="28" rx="2" fill="#4f46e5" />
        <rect x="6" y="8" width="4" height="12" rx="2" fill="#c7d2fe" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "#0f172a" }}>
        ROIbot
      </span>
    </div>
  );
}

// OPTION C: Verdict-dot mark. Three horizontally stacked dots, leftmost filled
// in indigo, the rest in grey. Alludes to the decision output.
export function LogoC({ size = 28 }: { size?: number }) {
  const r = size * 0.14;
  const cy = size / 2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <circle cx={r + 1}           cy={cy} r={r} fill="#4f46e5" />
        <circle cx={r * 3 + 3}       cy={cy} r={r} fill="#cbd5e1" />
        <circle cx={r * 5 + 5}       cy={cy} r={r} fill="#e2e8f0" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "#0f172a" }}>
        ROIbot
      </span>
    </div>
  );
}

// Default export is the locked choice — will be swapped after review
export default LogoA;
