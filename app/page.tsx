import Logo from "./components/Logo";
import FormShell from "./components/FormShell";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 1rem 4rem" }}>
      <div style={{ width: "100%", maxWidth: "672px", display: "flex", flexDirection: "column", gap: "2rem" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Logo />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
              The smartest automation starts with a better question.
            </p>
            <p style={{ fontSize: "0.9rem", fontWeight: 400, color: "#6b7280", lineHeight: 1.55, margin: 0 }}>
              Should we buy it, build it, customize it, or leave it alone?
            </p>
          </div>
        </div>

        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
        }}>
          <FormShell />
        </div>

      </div>
    </main>
  );
}
