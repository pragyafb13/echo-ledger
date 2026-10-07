import { NextRequest, NextResponse } from "next/server";
import { PASSES, type PassKind } from "@/lib/types";

export async function POST(req: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not configured. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID in Vercel.",
      },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const kind = body.kind as PassKind;
  const pass = PASSES[kind];
  if (!pass) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const receipt = `echo_${kind}_${Date.now()}`.slice(0, 40);
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: pass.priceInr * 100,
      currency: "INR",
      receipt,
      notes: { plan: kind, product: "echo-ledger" },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.description || "Could not create Razorpay order";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId,
    kind,
    label: pass.label,
    priceInr: pass.priceInr,
  });
}
