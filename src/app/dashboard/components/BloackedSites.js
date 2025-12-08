"use client";

import React, { useState, useEffect } from "react";
import { Globe2, X, Plus, Loader2 } from "lucide-react";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export function BlockedSection({ darkMode, blockedDomains = [], userDoc }) {
  const [isManaging, setIsManaging] = useState(false);
  const [localBlocked, setLocalBlocked] = useState(blockedDomains);
  const [domainInput, setDomainInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // keep local state in sync when Firestore / props change
  useEffect(() => {
    setLocalBlocked(blockedDomains || []);
  }, [blockedDomains]);

  // simple domain validator (same style as your signup form)
  const validateDomain = (domain) => {
    const cleaned = domain.replace(/^(https?:\/\/)?(www\.)?/, "").trim();
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(
      cleaned
    );
  };

  const cleanDomain = (domain) =>
    domain
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .trim()
      .toLowerCase();

  const handleAddDomain = () => {
    setError("");
    const cleaned = cleanDomain(domainInput);
    if (!cleaned) return;

    if (!validateDomain(cleaned)) {
      setError("Please enter a valid domain like youtube.com");
      return;
    }

    if (localBlocked.includes(cleaned)) {
      setDomainInput("");
      return;
    }

    setLocalBlocked((prev) => [...prev, cleaned]);
    setDomainInput("");
  };

  const handleRemoveDomain = (domain) => {
    setError("");
    setLocalBlocked((prev) => prev.filter((d) => d !== domain));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDomain();
    }
  };

  const handleSaveChanges = async () => {
    if (!userDoc?.uid) {
      setError("Missing user id, cannot save changes.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const userRef = doc(db, "users", userDoc.uid);
      await updateDoc(userRef, {
        blockedDomains: localBlocked,
      });

      // optional: close manage mode after saving
      setIsManaging(false);
      console.log("✅ Blocked domains updated:", localBlocked);
    } catch (err) {
      console.error("Error updating blocked domains:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const data = localBlocked.map((d) => ({
    domain: d,
    redirects: 0, // TODO: replace with real count when you store it
    today: 0,
  }));

  return (
    <div className="space-y-4">
      {/* Header + manage button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Blocked websites</h2>
          <p
            className={`text-xs ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Overview of domains currently blocked by your Focus extension.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsManaging((prev) => !prev)}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold border border-dashed
          ${
            darkMode
              ? "border-slate-700 text-slate-200 hover:border-indigo-500/70 hover:text-indigo-400"
              : "border-slate-300 text-slate-700 hover:border-indigo-500/70 hover:text-indigo-500"
          }`}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {isManaging ? "Close block list" : "Manage block list"}
        </button>
      </div>

      {/* Table of blocked domains */}
      <div
        className={`
          rounded-2xl border overflow-hidden text-xs
          ${
            darkMode
              ? "border-slate-800 bg-slate-900/60"
              : "border-slate-200 bg-white"
          }
        `}
      >
        <div
          className={`
            grid grid-cols-3 gap-2 px-3 py-2 border-b text-[11px] font-semibold
            ${
              darkMode
                ? "border-slate-800 text-slate-300"
                : "border-slate-200 text-slate-600"
            }
          `}
        >
          <span>Domain</span>
          <span>Total redirects</span>
          <span>Today</span>
        </div>
        <div>
          {data.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-slate-500">
              No blocked domains yet.
            </div>
          ) : (
            data.map((b) => (
              <div
                key={b.domain}
                className={`
                  grid grid-cols-3 gap-2 px-3 py-2.5 items-center
                  ${darkMode ? "hover:bg-slate-800/70" : "hover:bg-slate-50"}
                `}
              >
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{b.domain}</span>
                </span>
                <span>{b.redirects}</span>
                <span className="text-slate-400">{b.today}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manage block list panel */}
      {isManaging && (
        <div
          className={`
            rounded-2xl p-4 border text-xs space-y-3
            ${
              darkMode
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <p
            className={`text-[11px] ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Add or remove websites. These changes will sync to your Focus
            extension.
          </p>

          {/* Chips of current domains */}
          <div className="flex flex-wrap gap-2">
            {localBlocked.length === 0 && (
              <span
                className={`text-[11px] ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                No blocked domains yet. Add one below.
              </span>
            )}
            {localBlocked.map((domain) => (
              <span
                key={domain}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                  ${
                    darkMode
                      ? "bg-slate-800 border border-slate-700 text-slate-100"
                      : "bg-slate-100 border border-slate-300 text-slate-800"
                  }
                `}
              >
                {domain}
                <button
                  type="button"
                  onClick={() => handleRemoveDomain(domain)}
                  className={`${
                    darkMode ? "hover:text-red-400" : "hover:text-red-600"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Input to add new domain */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="text"
              placeholder="Add a domain, e.g. youtube.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`
                flex-1 px-3 py-2 rounded-lg border text-xs outline-none
                ${
                  darkMode
                    ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                    : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                }
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              `}
            />
            <button
              type="button"
              onClick={handleAddDomain}
              className={`
                inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold
                bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow
                hover:shadow-md hover:scale-[1.02] active:scale-95 transition-transform
              `}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </button>
          </div>

          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className={`
                inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold
                bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow
                hover:shadow-md hover:scale-[1.02] active:scale-95 transition-transform
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
