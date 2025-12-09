import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    await addDoc(collection(db, "extensionFeedback"), {
      rating: body.rating ?? null,
      reason: body.reason ?? "",
      details: body.details ?? "",
      email: body.email ?? null,
      source: body.source ?? "unknown",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
