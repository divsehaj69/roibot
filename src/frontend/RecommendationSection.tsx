import type { Verdict } from "../backend/scoring";
import { SectionCard, SectionTitle } from "./shared";

const SECTION_HEADING: Record<Verdict, string> = {
  "DON'T": "Why not now",
  "BUY":   "What to look for in a tool",
  "BUILD": "Architecture sketch",
  "HYBRID":"Architecture sketch",
};

const FALLBACK: Record<Verdict, string> = {
  "DON'T": "Based on the information provided, this workflow does not meet the threshold for AI automation at this time. The scoring engine identified specific gaps in automation potential, data quality, or suitability that need to be addressed first.",
  "BUY":   "An off-the-shelf AI product in this category should cover the core workflow. Prioritize platforms with native integration support for your existing tools and clear audit trails given the error impact level identified.",
  "BUILD": "This workflow justifies a custom solution. The high suitability and automation potential scores mean a bespoke system would outperform any off-the-shelf alternative, and the complexity warrants the investment.",
  "HYBRID":"Buy a core platform for the main capability, then build custom layers for the edges specific to your context. The risk and integration profile means a pure off-the-shelf solution will not cover your full requirements.",
};

interface Props {
  verdict:        Verdict;
  verdictSection: string | null;
}

export default function RecommendationSection({ verdict, verdictSection }: Props) {
  return (
    <SectionCard>
      <SectionTitle>{SECTION_HEADING[verdict]}</SectionTitle>
      <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
        {verdictSection ?? FALLBACK[verdict]}
      </div>
    </SectionCard>
  );
}
