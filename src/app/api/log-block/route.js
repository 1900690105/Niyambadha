import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// POST /api/log-block
export async function POST(request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "domain is required" },
        { status: 400 }
      );
    }

    // 👇 Always store in: users / 1
    const userRef = doc(db, "users", "1");

    // ✔ Update the user document
    await updateDoc(userRef, {
      lastBlockedDomain: domain,
      lastBlockedAt: serverTimestamp(),

      // Optional: Keep a history list
      blockHistory: arrayUnion({
        domain,
        time: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/log-block:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
