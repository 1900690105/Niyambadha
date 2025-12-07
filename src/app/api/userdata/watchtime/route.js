import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { uid, watchTimeMinutes } = body;

    if (!uid || watchTimeMinutes == null) {
      return NextResponse.json(
        { error: "uid and watchTimeMinutes required" },
        { status: 400 }
      );
    }

    const userRef = doc(db, "users", uid);

    await setDoc(
      userRef,
      {
        settings: {
          watchTimeMinutes: watchTimeMinutes,
        },
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH watchtime error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
