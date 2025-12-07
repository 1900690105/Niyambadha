// app/api/redirects/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { Settings } from "lucide-react";

/**
 * GET /api/redirects?uid=...&domain=...
 * -> return redirect info for that user+domain
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const domain = searchParams.get("domain");

    if (!uid || !domain) {
      return NextResponse.json(
        { error: "uid and domain are required" },
        { status: 400 }
      );
    }

    const ref = doc(db, "users", uid, "redirects", domain);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        exists: true,
        data: snap.data(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/redirects error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/redirects
 * Body: { uid, domain }
 * -> log/append a redirect event
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { uid, domain } = body;

    if (!uid || !domain) {
      return NextResponse.json(
        { error: "uid and domain are required" },
        { status: 400 }
      );
    }

    const ref = doc(db, "users", uid, domain);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // First redirect for this domain
      await setDoc(ref, {
        uid,
        domain,
        redirectCount: 1,
        firstRedirectAt: serverTimestamp(),
        lastRedirectAt: serverTimestamp(),
        puzzleSolvedAt: null,
        watchTimeMinutes: 0.5,
      });
    } else {
      // Update existing
      await setDoc(
        ref,
        {
          redirectCount: increment(1),
          lastRedirectAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/redirects error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/redirects
 * Body: { uid, domain }
 * -> mark puzzle solved for this domain
 */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { uid, domain, originalTimeMinutes } = body;

    if (!uid || !domain || !originalTimeMinutes) {
      return NextResponse.json(
        { error: "uid and domain are required" },
        { status: 400 }
      );
    }

    const ref = doc(db, "users", uid, "redirects", domain);
    await setDoc(
      ref,
      {
        puzzleSolvedAt: serverTimestamp(),
        settings: {
          watchTimeMinutes: originalTimeMinutes,
        },
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/redirects error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
