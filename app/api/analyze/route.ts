import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { score }                     from "@/lib/scoring";
import { SYSTEM_MESSAGE, buildUserMessage } from "@/lib/prompt";
import { isValidExplanation }         from "@/lib/explanation.types";
import type { ScoringInput }          from "@/lib/scoring";
import type { Explanation }           from "@/lib/explanation.types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Strip markdown code fences the model sometimes wraps JSON in ──────────────
function stripFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/,      "")
    .replace(/```\s*$/,      "")
    .trim();
}

// ── Call Anthropic, retry once, return null on persistent failure ─────────────
async function fetchExplanation(
  input: ScoringInput,
  result: ReturnType<typeof score>
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
      // Network / auth error — no point retrying auth failures, but retry once
      // for transient network issues.
      if (attempt === 2) {
        console.error("Anthropic call failed:", err);
        return null;
      }
      continue;
    }

    try {
      const parsed = JSON.parse(stripFences(raw));
      if (isValidExplanation(parsed)) return parsed;
      // Shape is wrong — retry will get a fresh completion
    } catch {
      // JSON.parse threw — retry
    }

    if (attempt === 2) {
      console.error("Explanation parse failed after 2 attempts. Raw:", raw);
      return null;
    }
  }

  return null; // unreachable, but satisfies TypeScript
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let input: ScoringInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // 1. Deterministic verdict — always computed, always returned
  const result = score(input);

  // 2. LLM explanation — best-effort, nullable
  const explanation = await fetchExplanation(input, result);

  return NextResponse.json({ result, explanation });
}
