import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);

    // 7 days, for example:
    const expiresIn = 90 * 24 * 60 * 60 * 1000;

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    const res = NextResponse.json({ ok: true }, { status: 200 });

    // set HttpOnly cookie
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("createSession error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
