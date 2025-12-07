import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // adjust if needed
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import "../../../lib/firebase-admin"; // make sure admin is initialized

export async function GET(req) {
  try {
    // 🔍 Read ?uid=... from query (for extension)
    const { searchParams } = new URL(req.url);
    const uidFromQuery = searchParams.get("uid");

    let uid = uidFromQuery;

    // ⭐ If no uid in query → try session cookie (for portal)
    if (!uid) {
      const cookieStore = await cookies(); // Next 16: cookies() is async
      const sessionCookie = cookieStore.get("session")?.value;

      if (!sessionCookie) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }

      const auth = getAuth();
      const decoded = await auth.verifySessionCookie(sessionCookie, true);
      uid = decoded.uid;
    }

    if (!uid) {
      return NextResponse.json(
        { error: "No uid could be determined" },
        { status: 400 }
      );
    }

    // 🔥 Fetch Firestore user doc
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        uid,
        data: snap.data(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/userdata error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../../../lib/firebase"; // or "@/lib/firebase"
// import { cookies } from "next/headers";
// import { getAuth } from "firebase-admin/auth";
// import "../../../lib/firebase-admin"; // make sure admin is initialized

// export async function GET(req) {
//   try {
//     // ⬇️ cookies() is async in Next 16
//     const cookieStore = await cookies();
//     const sessionCookie = cookieStore.get("session")?.value;

//     if (!sessionCookie) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     const auth = getAuth();
//     const decoded = await auth.verifySessionCookie(sessionCookie, true);
//     const uid = decoded.uid; // 🔥 current logged-in user

//     const userRef = doc(db, "users", uid);
//     const snap = await getDoc(userRef);

//     if (!snap.exists()) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       {
//         uid,
//         data: snap.data(),
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("GET /api/userdata error:", error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
