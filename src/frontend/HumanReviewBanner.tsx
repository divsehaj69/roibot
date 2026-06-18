export default function HumanReviewBanner({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div style={{
      borderRadius: "0.75rem",
      border: "2px solid #f97316",
      background: "#fff7ed",
      padding: "1rem 1.25rem",
      display: "flex",
      gap: "0.75rem",
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>⚠</span>
      <div>
        <p style={{ margin: "0 0 0.25rem", fontSize: "0.875rem", fontWeight: 700, color: "#9a3412" }}>
          Human review required
        </p>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#c2410c", lineHeight: 1.55 }}>
          This workflow has high error impact or involves regulated data. Do not fully automate it. A qualified person must review AI outputs before they affect downstream decisions or systems.
        </p>
      </div>
    </div>
  );
}
