"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

function SettingRow({ title, description, disabled, darkMode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={`text-xs font-medium ${disabled ? "opacity-60" : ""}`}>
          {title}
        </p>
        <p
          className={`text-[11px] ${
            darkMode ? "text-slate-500" : "text-slate-500"
          } ${disabled ? "opacity-60" : ""}`}
        >
          {description}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        className={`
          relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors
          ${
            disabled
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500"
          }
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform
            translate-x-4
          `}
        />
      </button>
    </div>
  );
}

export function SettingsSection({ darkMode, userDoc }) {
  const [displayName, setDisplayName] = useState(userDoc?.displayName ?? "");
  const [email, setEmail] = useState(userDoc?.email ?? "");
  const [watchTimeMinutes, setWatchTimeMinutes] = useState(
    userDoc?.settings?.watchTimeMinutes ?? 1
  );

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // keep local state in sync if userDoc changes
  useEffect(() => {
    if (!userDoc) return;
    setDisplayName(userDoc.displayName ?? "");
    setEmail(userDoc.email ?? "");
    setWatchTimeMinutes(userDoc.settings?.watchTimeMinutes ?? 1);
  }, [userDoc]);

  const handleSaveProfile = async () => {
    if (!userDoc?.uid) {
      setProfileError("Missing user id, cannot save changes.");
      return;
    }

    setProfileError("");
    setProfileSuccess("");

    const nameTrimmed = displayName.trim();
    if (nameTrimmed.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }

    const watchTimeNumber = Number(watchTimeMinutes);
    if (isNaN(watchTimeNumber) || watchTimeNumber <= 0) {
      setProfileError("Watch time must be a positive number (in minutes).");
      return;
    }

    try {
      setSavingProfile(true);

      const userRef = doc(db, "users", userDoc.uid);
      await updateDoc(userRef, {
        displayName: nameTrimmed,
        email: email.toLowerCase(), // NOTE: this only updates Firestore, not Firebase Auth
        "settings.watchTimeMinutes": watchTimeNumber,
        "settings.originalTimeMinutes": watchTimeNumber,
      });

      setProfileSuccess("Profile updated successfully.");
      console.log("✅ Profile updated in Firestore");
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileError("Failed to save changes. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Settings</h2>
        <p
          className={`text-xs ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Control how Focus behaves on your browser and devices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile & account details */}
        <div
          className={`
            rounded-2xl p-4 border space-y-3
            ${
              darkMode
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <h3 className="text-sm font-semibold">Profile & account</h3>
          <p
            className={`text-[11px] mb-1 ${
              darkMode ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Update your basic account information and default focus watch time.
          </p>

          <div className="space-y-3 text-xs">
            {/* Name */}
            <div className="space-y-1">
              <label
                className={`text-[11px] font-medium ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border text-xs outline-none
                  ${
                    darkMode
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  }
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                `}
                placeholder="Your name"
              />
            </div>

            {/* Email (Firestore only) */}
            <div className="space-y-1">
              <label
                className={`text-[11px] font-medium ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border text-xs outline-none
                  ${
                    darkMode
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  }
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                `}
                placeholder="you@example.com"
              />
              <p
                className={`text-[10px] mt-0.5 ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                This updates your profile record. Changing login email in
                Firebase Auth must be handled separately.
              </p>
            </div>

            {/* Watch time */}
            <div className="space-y-1">
              <label
                className={`text-[11px] font-medium ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Watch time per blocked site (minutes)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={watchTimeMinutes}
                onChange={(e) => setWatchTimeMinutes(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border text-xs outline-none
                  ${
                    darkMode
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  }
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                `}
              />
              <p
                className={`text-[10px] mt-0.5 ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                How long you are allowed to stay on a blocked site before being
                redirected to the puzzle.
              </p>
            </div>

            {profileError && (
              <p className="text-[11px] text-red-500">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-[11px] text-emerald-500">{profileSuccess}</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className={`
                  inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold
                  bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow
                  hover:shadow-md hover:scale-[1.02] active:scale-95 transition-transform
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Focus + Sync cards */}
        <div
          className={`
            rounded-2xl p-4 border space-y-3
            ${
              darkMode
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <h3 className="text-sm font-semibold">Focus behavior</h3>
          <div className="space-y-3 text-xs">
            <SettingRow
              darkMode={darkMode}
              title="Block entire domain"
              description="If enabled, all pages under a domain will be blocked, not just specific URLs."
            />
            <SettingRow
              darkMode={darkMode}
              title="Redirect after 30 seconds"
              description="After 30 seconds spent on a blocked site, redirect to the puzzle page."
            />
            <SettingRow
              darkMode={darkMode}
              title="Enable sound on redirect"
              description="Play a soft sound when you are redirected away from a blocked site."
              disabled
            />
          </div>
        </div>

        <div
          className={`
            rounded-2xl p-4 border space-y-3
            ${
              darkMode
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <h3 className="text-sm font-semibold">Sync & account</h3>
          <div className="space-y-3 text-xs">
            <SettingRow
              darkMode={darkMode}
              title="Sync settings to cloud"
              description="Keep your blocked websites and preferences synced across devices."
            />
            <SettingRow
              darkMode={darkMode}
              title="Weekly focus summary email"
              description="Receive a summary of your focus stats every week."
            />
            <SettingRow
              darkMode={darkMode}
              title="Beta features"
              description="Try new Focus experiments before they are released to everyone."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
