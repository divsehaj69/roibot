import { NextRequest, NextResponse } from "next/server";
import { analyzeWorkflow }           from "@/src/orchestrator";
import type { ScoringInput }         from "@/src/backend/scoring";

export async function POST(req: NextRequest) {
  let input: ScoringInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { result, explanation, reviewFlags } = await analyzeWorkflow(input);
  return NextResponse.json({ result, explanation, reviewFlags });
}
