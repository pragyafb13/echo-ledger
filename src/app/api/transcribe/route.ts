import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        text: DEMO_TRANSCRIPT,
        demo: true,
      });
    }

    // Dynamic import so the app builds even if openai is not yet installed
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const buffer = Buffer.from(await file.arrayBuffer());
    const audioFile = new File([buffer], file.name || "audio.webm", {
      type: file.type || "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "text",
    });

    return NextResponse.json({ text: transcription, demo: false });
  } catch (err: unknown) {
    console.error("Transcription error:", err);
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const DEMO_TRANSCRIPT = `Hey, this is Capt. Shakil. Look, about the documents you sent — I'll review them and get back to you by Saturday for sure. Pravash Dey also mentioned he'll share the updated spreadsheet by end of the week. And regarding the interview slot, HR said they'll confirm the exact time tomorrow. I promised the team I'd finalize the shortlist by Tuesday next week. Okay, talk soon.`;
