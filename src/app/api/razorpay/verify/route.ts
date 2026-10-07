import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PASSES, type PassKind } from "@/lib/types";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Razorpay secret missing" }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const { orderId, paymentId, signature, kind } = body as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    kind?: PassKind;
  };
  if (!orderId || !paymentId || !signature || !kind || !PASSES[kind]) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Payment signature did not match" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, kind });
}
