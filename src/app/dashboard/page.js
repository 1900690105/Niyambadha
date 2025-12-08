"use client";

import React, { useState, useEffect } from "react";
import {
  Focus,
  Menu,
  X,
  BarChart3,
  Clock,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { OverviewSection, SessionsSection } from "./components/OverviewSection";
import { BlockedSection } from "./components/BloackedSites";
import Image from "next/image";
import { SettingsSection } from "./components/Settings";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userDoc, setUserDoc] = useState(null); // 🔥 user document from Firestore
  const [sessions, setSessions] = useState([]); // 🔥 recent sessions from Firestore
  const [loadingData, setLoadingData] = useState(true);

  const router = useRouter();

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "sessions", label: "Focus Sessions", icon: Clock },
    { id: "blocked", label: "Blocked Sites", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // ✅ Auth guard + Firestore fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        setLoadingData(true);

        // 1) get user doc: /users/{uid}
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUserDoc({ id: user.uid, ...snap.data() });
        } else {
          // if no doc, you can handle it here (maybe redirect or create default)
          setUserDoc({
            id: user.uid,
            displayName: user.displayName || "User",
            blockedDomains: [],
            settings: {},
          });
        }

        // 2) (optional) recent sessions from /users/{uid}/sessions
        const sessionsRef = collection(db, "users", user.uid, "sessions");
        const q = query(sessionsRef, orderBy("createdAt", "desc"), limit(10));
        const sessionsSnap = await getDocs(q);

        const sessionsData = sessionsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setSessions(sessionsData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } transition-colors duration-300`}
    >
      {/* -------- SIDEBAR (same as before, shortened) -------- */}
      <aside
        className={`
          hidden lg:flex lg:flex-col lg:w-64 border-r
          ${
            darkMode
              ? "border-slate-800 bg-slate-900/80"
              : "border-slate-200 bg-white/80"
          }
          backdrop-blur
        `}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div>
            <div className="text-sm font-semibold tracking-wide w-16 h-16">
              <Image src={"/logo.jpeg"} alt="logo" height={200} width={200} />
            </div>
            <p className="text-xs text-slate-400">
              Stay sharp. Block distractions.
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? "bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow"
                      : darkMode
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-700 hover:bg-slate-100"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
              ${
                darkMode
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-700"
              }
            `}
          >
            <span>{darkMode ? "☀️ Light mode" : "🌙 Dark mode"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* -------- MOBILE SIDEBAR (unchanged except logic) -------- */}
      <div
        className={`
          lg:hidden fixed inset-0 z-40 transition-opacity
          ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      >
        {/* ... your existing mobile sidebar code ... */}
        {/* (left as-is for brevity) */}
      </div>

      {/* -------- MAIN CONTENT -------- */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header
          className={`
            sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3
            border-b backdrop-blur
            ${
              darkMode
                ? "bg-slate-950/70 border-slate-800"
                : "bg-slate-50/80 border-slate-200"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-700/60 hover:bg-slate-800/70"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-slate-400">Good afternoon 👋</p>
              <h1 className="text-lg sm:text-xl font-semibold">
                {userDoc?.displayName
                  ? `${userDoc.displayName}, stay focused today`
                  : "Stay focused today"}
              </h1>
            </div>
          </div>

          {/* mini stats on top right can later use real data too */}
        </header>

        {/* Content area */}
        <div className="px-4 sm:px-6 py-5 max-w-6xl w-full mx-auto space-y-6">
          {loadingData ? (
            <div className="text-sm text-slate-400">
              Loading your dashboard…
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewSection
                  darkMode={darkMode}
                  userDoc={userDoc}
                  sessions={sessions}
                />
              )}
              {activeTab === "sessions" && (
                <SessionsSection darkMode={darkMode} sessions={sessions} />
              )}
              {activeTab === "blocked" && (
                <BlockedSection
                  userDoc={userDoc}
                  darkMode={darkMode}
                  blockedDomains={userDoc?.blockedDomains || []}
                />
              )}
              {activeTab === "settings" && (
                <SettingsSection
                  darkMode={darkMode}
                  userDoc={userDoc}
                  userSettings={userDoc?.settings || {}}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
