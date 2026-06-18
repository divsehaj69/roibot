import type { ScoringInput, ScoringResult, VolumeRange, TimePerRun, WorkflowNature } from "../backend/scoring";
import { volumeToBand } from "../backend/scoring";
import { SectionCard, SectionTitle, Bullet, PALETTE } from "./shared";

const VOLUME_DESC: Record<VolumeRange, (n: number) => string> = {
  "<10":        (n) => `Very low volume (${n.toLocaleString()}/month), which limits the ROI case for automation`,
  "10-99":      (n) => `Low monthly volume (${n.toLocaleString()} instances), modest automation payback`,
  "100-999":    (n) => `Moderate monthly volume (${n.toLocaleString()} instances)`,
  "1000-9999":  (n) => `High monthly volume (${n.toLocaleString()} instances), strong ROI foundation`,
  "10000+":     (n) => `Very high monthly volume (${n.toLocaleString()}+), automation ROI compounds quickly`,
};

const TIME_DESC: Record<TimePerRun, string> = {
  "<2min":    "Very short tasks (under 2 min each), limited time savings per run",
  "2-10min":  "Short tasks (2-10 min each)",
  "10-30min": "Moderate task length (10-30 min), meaningful automation savings",
  "30-60min": "Long tasks (30-60 min), high per-run value from automation",
  "60+min":   "Very long tasks (60+ min), highest per-run automation value",
};

const NATURE_DESC: Record<WorkflowNature, string> = {
  Physical:       "Physical workflow. Software AI cannot automate physical actions.",
  Mixed:          "Mixed physical and digital workflow. Only the digital components are automatable.",
  DigitalOps:     "Digital operations workflow, automatable with established tooling",
  DataProc:       "Data processing workflow, a core AI strength",
  Knowledge:      "Knowledge-based workflow, well suited to language model automation",
  Communication:  "Communication workflow, maps closely to language model capabilities",
};

function deriveKeyDrivers(input: ScoringInput, result: ScoringResult): string[] {
  // Physical-workflow DON'T: the blocker is workflow nature, not economics.
  // Suppress volume/economics reasoning so the report does not contradict itself.
  if (result.firedGate === "G4") {
    return [
      "This is a physical workflow. Software AI cannot directly perform physical actions or manipulate physical objects.",
      "Volume, task duration, and labor cost are not the deciding factors here. The workflow nature is what places it outside the scope of software-AI automation.",
      "Robotics, warehouse automation, or operational redesign are separate opportunities. Any digital sub-processes (record-keeping, scheduling, reporting) could be evaluated on their own.",
    ];
  }

  const bullets: string[] = [];

  bullets.push(VOLUME_DESC[volumeToBand(input.volume)](input.volume));
  bullets.push(TIME_DESC[input.timePerRun]);
  bullets.push(NATURE_DESC[input.workflowNature]);

  if (input.repeatability === "Highly" || input.repeatability === "Standardized") {
    bullets.push(`${input.repeatability} workflow, well suited to automation`);
  } else if (input.repeatability === "AdHoc") {
    bullets.push("Ad hoc task pattern. Automation captures only part of the work.");
  }

  if (input.judgment === "Low") {
    bullets.push("Low judgment required. AI can execute autonomously.");
  } else if (input.judgment === "Critical" || input.judgment === "High") {
    bullets.push(`${input.judgment} judgment required. Human oversight is mandatory.`);
  }

  if (input.dataReadiness === "Ready") {
    bullets.push("Clean, structured data. No preparation work required.");
  } else if (input.dataReadiness === "Messy" || input.dataReadiness === "Unknown") {
    bullets.push(`Data is ${input.dataReadiness.toLowerCase()}. Preparation is a prerequisite.`);
  }

  if (input.sensitivity === "Regulated") {
    bullets.push("Regulated data. Compliance requirements constrain vendor options significantly.");
  } else if (input.sensitivity === "Confidential") {
    bullets.push("Confidential data. Limits use of public cloud AI services.");
  }

  if (input.integration === "Enterprise" || input.integration === "Many") {
    bullets.push(`${input.integration} system integration, which increases implementation complexity`);
  }

  if (input.engCapacity === "None" || input.engCapacity === "Limited") {
    bullets.push(`${input.engCapacity} engineering capacity. Rules out custom-build paths.`);
  }

  if (input.budget === "Micro" || input.budget === "Small") {
    bullets.push(`${input.budget} budget. Constrains what is buildable in-house.`);
  }

  if (input.errorImpact === "Critical" || input.errorImpact === "High") {
    bullets.push(`${input.errorImpact} error impact. Automation requires output validation before results reach downstream systems.`);
  }

  return bullets.slice(0, 6);
}

export default function KeyDrivers({ input, result }: { input: ScoringInput; result: ScoringResult }) {
  const drivers = deriveKeyDrivers(input, result);
  const p = PALETTE[result.verdict];

  return (
    <SectionCard>
      <SectionTitle>Why we reached this verdict</SectionTitle>
      <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {drivers.map((d, i) => (
          <Bullet key={i} color={p.dot}>{d}</Bullet>
        ))}
      </ul>
    </SectionCard>
  );
}
