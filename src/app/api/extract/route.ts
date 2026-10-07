import { NextRequest, NextResponse } from "next/server";
import { ExtractionResult } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert at extracting concrete commitments and deadlines from spoken conversations.

Given a transcript of a call or voice memo, extract ONLY actionable commitments — things a specific person promised to do, with an optional deadline.

Return strict JSON with this shape:
{
  "commitments": [
    {
      "person": "Name or role of the person who made the commitment",
      "commitment": "What they promised to do (clear, concise)",
      "deadline": "The deadline phrase as spoken, or null if none",
      "context": "One short sentence of surrounding context"
    }
  ],
  "summary": "Optional 1-sentence overall summary of the call"
}

Rules:
- Only extract commitments (promises, "I'll do X", "he'll send Y by Z").
- Ignore pure information or opinions.
- Keep person names exactly as spoken. Do not invent names.
- If the speaker is the user themselves, use "Me" or the name if given.
- deadline should be the original phrase ("by Saturday", "end of the week", "tomorrow") or null.
- Be precise and sparse — better to miss a weak one than invent.
- Respond with JSON only, no markdown fences.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body as { transcript?: string };

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!groqKey && !openaiKey) {
      return NextResponse.json(
        {
          error:
            "Extraction is not configured yet. Add GROQ_API_KEY in Vercel (free at console.groq.com).",
        },
        { status: 503 }
      );
    }

    const { default: OpenAI } = await import("openai");

    // Prefer free Groq — gpt-oss-20b is available on free/developer tier
    if (groqKey) {
      const groq = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const modelsToTry = [
        "openai/gpt-oss-20b",
        "openai/gpt-oss-120b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
      ];

      let lastError: unknown = null;
      for (const model of modelsToTry) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: `Transcript:\n\n${transcript}` },
            ],
          });
          const raw = completion.choices[0]?.message?.content || "{}";
          const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(cleaned) as ExtractionResult;
          return NextResponse.json({
            result: parsed,
            demo: false,
            provider: "groq",
            model,
          });
        } catch (err) {
          lastError = err;
          console.warn(`Groq model ${model} failed:`, err);
        }
      }

      const message =
        lastError instanceof Error ? lastError.message : "All Groq models failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    // Fallback: OpenAI
    const openai = new OpenAI({ apiKey: openaiKey! });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Transcript:\n\n${transcript}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as ExtractionResult;

    return NextResponse.json({ result: parsed, demo: false, provider: "openai" });
  } catch (err: unknown) {
    console.error("Extraction error:", err);
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
