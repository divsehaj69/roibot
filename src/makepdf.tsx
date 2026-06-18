"use client";

export default function PrintButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      onClick={handlePrint}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.5rem",
        padding: "0.5rem 1.1rem", borderRadius: "0.5rem",
        border: "1.5px solid #d1d5db", background: "#fff",
        fontSize: "0.875rem", fontWeight: 500, color: "#374151",
        cursor: "pointer",
      }}
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Download report (PDF)
    </button>
  );
}
