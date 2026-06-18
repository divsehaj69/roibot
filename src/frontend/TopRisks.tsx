import { SectionCard, SectionTitle, Bullet } from "./shared";

const FALLBACK_RISKS = [
  "Integration complexity may exceed initial estimates. Budget extra time and cost for the unexpected.",
  "AI outputs require validation before feeding into downstream processes.",
  "User adoption and change management are consistently underestimated in AI rollouts.",
];

interface Props {
  risks:       string[] | null;
  accentColor: string;
}

export default function TopRisks({ risks, accentColor }: Props) {
  const items = (risks ?? FALLBACK_RISKS).slice(0, 3);

  return (
    <SectionCard>
      <SectionTitle>Top risks</SectionTitle>
      <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {items.map((r, i) => (
          <Bullet key={i} color={accentColor}>{r}</Bullet>
        ))}
      </ul>
    </SectionCard>
  );
}
