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
- Keep person names as spoken (e.g. "Capt. Shakil", "Pravash Dey", "HR").
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
      // If transcript looks like the demo sample, return demo extraction;
      // otherwise return empty so user sees we need a key for custom text.
      const isDemoLike =
        transcript.includes("Capt. Shakil") || transcript.length < 40;
      return NextResponse.json({
        result: isDemoLike ? DEMO_EXTRACTION : { commitments: [], summary: "Add GROQ_API_KEY (free) or OPENAI_API_KEY to extract from custom text." },
        demo: true,
        provider: "demo",
      });
    }

    const { default: OpenAI } = await import("openai");

    // Prefer free Groq Llama
    if (groqKey) {
      const groq = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Transcript:\n\n${transcript}` },
        ],
      });
      const raw = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw) as ExtractionResult;
      return NextResponse.json({ result: parsed, demo: false, provider: "groq" });
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

const DEMO_EXTRACTION: ExtractionResult = {
  commitments: [
    {
      person: "Capt. Shakil",
      commitment: "Review the documents and get back",
      deadline: "by Saturday",
      context: "About the documents that were sent",
    },
    {
      person: "Pravash Dey",
      commitment: "Share the updated spreadsheet",
      deadline: "end of the week",
      context: "Mentioned during the call",
    },
    {
      person: "HR",
      commitment: "Confirm the exact interview time",
      deadline: "tomorrow",
      context: "Regarding the interview slot",
    },
    {
      person: "Me",
      commitment: "Finalize the shortlist",
      deadline: "by Tuesday next week",
      context: "Promised the team",
    },
  ],
  summary: "Multiple follow-ups on documents, spreadsheet, interview timing, and shortlist finalization.",
};
