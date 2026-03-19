import { NextRequest, NextResponse } from "next/server";
import { IAiActivityContext, IAiActivityAnalysis } from "@/utils/datasentinel/aiService";
import { GROQ_API_URL, GROQ_MODEL } from "@/constants/datasentinel/ai";
import { buildActivityPatternPrompts } from "@/utils/datasentinel/aiPrompts";

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  maxTokens: number,
): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) throw new Error(`Groq returned HTTP ${response.status}`);
  const json = await response.json();
  const text: string | undefined = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq response contained no content.");
  return text.trim();
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  let ctx: IAiActivityContext;
  try {
    ctx = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const patternSummary = await callGroq(...buildActivityPatternPrompts(ctx), apiKey, 200);
    const analysis: IAiActivityAnalysis = { patternSummary };
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[ai/activity-summary] Groq call failed:", err);
    return NextResponse.json(
      { error: "AI analysis is temporarily unavailable." },
      { status: 503 },
    );
  }
}
