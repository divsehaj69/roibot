import Anthropic from "@anthropic-ai/sdk";
import { score } from "./backend/scoring";
import { SYSTEM_MESSAGE }      from "./config/system_prompt";
import { buildUserMessage }    from "./config/user_prompt";
import { REVIEW_FLAGS_SYSTEM, buildFlagsUserMessage } from "./config/review_flags_prompt";
import { isValidExplanation, isValidReviewFlags } from "../lib/explanation.types";
import type { ScoringInput }  from "./backend/scoring";
import type { Explanation, ReviewFlag } from "../lib/explanation.types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function stripFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/,      "")
    .replace(/```\s*$/,      "")
    .trim();
}

async function fetchExplanation(
  input:  ScoringInput,
  result: ReturnType<typeof score>,
): Promise<Explanation | null> {
  const userMessage = buildUserMessage(input, result);
  for (let attempt = 1; attempt <= 2; attempt++) {
    let raw: string;
    try {
      const response = await client.messages.create({
        model:      "claude-sonnet-4-6",
        max_tokens: 1024,
        system:     SYSTEM_MESSAGE,
        messages:   [{ role: "user", content: userMessage }],
      });
      const block = response.content[0];
      raw = block.type === "text" ? block.text : "";
    } catch (err) {
      if (attempt === 2) { console.error("Anthropic call failed:", err); return null; }
      continue;
    }
    try {
      const parsed = JSON.parse(stripFences(raw));
      if (isValidExplanation(parsed)) return parsed;
    } catch { /* retry */ }
    if (attempt === 2) { console.error("Explanation parse failed. Raw:", raw); return null; }
  }
  return null;
}

// Separate path from scoring — description flags never affect verdict, scores, or confidence.
async function fetchReviewFlags(
  description: string,
  input:       ScoringInput,
): Promise<ReviewFlag[]> {
  try {
    const response = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 512,
      system:     REVIEW_FLAGS_SYSTEM,
      messages:   [{ role: "user", content: buildFlagsUserMessage(description, input) }],
    });
    const block = response.content[0];
    const raw   = block.type === "text" ? block.text : "";
    const parsed = JSON.parse(stripFences(raw));
    if (parsed?.flags && isValidReviewFlags(parsed.flags)) return parsed.flags;
  } catch (err) {
    console.error("Review flags step failed:", err);
  }
  return [];
}

export async function analyzeWorkflow(input: ScoringInput) {
  const result = score(input);
  // Run LLM calls in parallel — flags path is completely independent of scoring
  const [explanation, reviewFlags] = await Promise.all([
    fetchExplanation(input, result),
    fetchReviewFlags(input.workflowDescription, input),
  ]);
  return { result, explanation, reviewFlags };
}
