import { LogoA, LogoB, LogoC } from "../components/Logo";

export default function LogoPreview() {
  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh", padding: "3rem 2rem", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "2.5rem" }}>
        Logo options — pick one
      </h2>

      {[
        { label: "Option A", sublabel: "Diamond mark. Rotated square, decision-matrix feel.", node: <LogoA /> },
        { label: "Option B", sublabel: "Vertical bar mark. Typographic, restrained.", node: <LogoB /> },
        { label: "Option C", sublabel: "Verdict dots. Three dots alluding to the decision output.", node: <LogoC /> },
      ].map(({ label, sublabel, node }) => (
        <div key={label} style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem",
          padding: "1.75rem 2rem", marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: "3rem",
        }}>
          <div style={{ minWidth: "200px" }}>{node}</div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a", margin: "0 0 0.2rem" }}>{label}</p>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>{sublabel}</p>
          </div>
        </div>
      ))}

      {/* Also show on dark */}
      <h2 style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", margin: "2.5rem 0 1rem" }}>
        On dark background
      </h2>
      {[<LogoA key="a" />, <LogoB key="b" />, <LogoC key="c" />].map((node, i) => (
        <div key={i} style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem",
          padding: "1.75rem 2rem", marginBottom: "1rem",
        }}>
          {node}
        </div>
      ))}
    </main>
  );
}
