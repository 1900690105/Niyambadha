"use client";

import { useState } from "react";
import { Frown, Smile, Loader2, Send } from "lucide-react";

const reasons = [
  "Blocking was too strict",
  "I didn’t see the value",
  "Too many redirects / puzzles",
  "Performance issues / slowed browser",
  "Bugs or unexpected behavior",
  "I’m taking a break",
  "Other",
];

export default function FeedbackPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [rating, setRating] = useState(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason && !details) return;

    setIsSubmitting(true);

    try {
      // Optional: POST to your API route /api/feedback
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          reason,
          details,
          email: consent ? email : null,
          createdAt: new Date().toISOString(),
          source: "extension-uninstall",
        }),
      }).catch(() => {});

      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        darkMode
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950"
          : "bg-linear-to-br from-slate-50 via-indigo-50 to-cyan-50"
      }`}
    >
      {/* Theme toggle */}
      <button
        onClick={() => setDarkMode((d) => !d)}
        className={`fixed top-4 right-4 p-2 rounded-full text-sm shadow-lg ${
          darkMode ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-xl">
        <div
          className={`relative rounded-3xl shadow-2xl p-8 border ${
            darkMode
              ? "bg-slate-900/90 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          {/* Glow blob */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 bg-linear-to-br from-indigo-500/20 to-cyan-500/20 blur-3xl" />

          <div className="relative space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-500 text-white shadow-lg mb-2">
                <Frown className="w-7 h-7" />
              </div>
              <h1
                className={`text-2xl font-bold ${
                  darkMode ? "text-slate-50" : "text-slate-900"
                }`}
              >
                Sorry to see you go 👋
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Your feedback helps us make{" "}
                <span className="font-semibold">Niyambadha</span> more helpful
                for everyone. This takes less than a minute.
              </p>
            </div>

            {submitted ? (
              <div
                className={`mt-6 rounded-2xl p-6 text-center ${
                  darkMode ? "bg-emerald-500/10" : "bg-emerald-50"
                }`}
              >
                <Smile
                  className={`w-10 h-10 mx-auto mb-3 ${
                    darkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
                <h2
                  className={`text-lg font-semibold mb-1 ${
                    darkMode ? "text-slate-50" : "text-slate-900"
                  }`}
                >
                  Thank you for your feedback 💙
                </h2>
                <p
                  className={`text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  We&apos;ll carefully review what you shared and keep improving
                  the extension.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quick rating */}
                <div className="space-y-2">
                  <label
                    className={`text-sm font-medium ${
                      darkMode ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    How helpful was Niyambadha for your focus?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                          rating === value
                            ? darkMode
                              ? "bg-indigo-600 border-indigo-400 text-white"
                              : "bg-indigo-600 border-indigo-600 text-white"
                            : darkMode
                            ? "border-slate-700 text-slate-300 hover:border-indigo-400/60"
                            : "border-slate-200 text-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    1 = Not helpful at all • 5 = Very helpful
                  </p>
                </div>

                {/* Reason select */}
                <div className="space-y-2">
                  <label
                    className={`text-sm font-medium ${
                      darkMode ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    Main reason for removing the extension
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={`w-full text-sm rounded-xl px-3 py-2 border outline-none focus:ring-2 ${
                      darkMode
                        ? "bg-slate-900 border-slate-700 text-slate-100 focus:ring-indigo-500"
                        : "bg-white border-slate-300 text-slate-800 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Select a reason…</option>
                    {reasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <label
                    className={`text-sm font-medium ${
                      darkMode ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    Tell us a bit more (optional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    placeholder="What didn’t work well for you? Any feature you wish existed?"
                    className={`w-full text-sm rounded-2xl px-3 py-2 border resize-none outline-none focus:ring-2 ${
                      darkMode
                        ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-indigo-500"
                        : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500"
                    }`}
                  />
                </div>

                {/* Contact (optional) */}
                <div className="space-y-2">
                  <label
                    className={`text-sm font-medium ${
                      darkMode ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    Want me to follow up? (optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full text-sm rounded-xl px-3 py-2 border outline-none focus:ring-2 ${
                        darkMode
                          ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-indigo-500"
                          : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500"
                      }`}
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-400"
                      />
                      It’s okay to contact me about my feedback.
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || (!reason && !details)}
                  className={`
                    w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold
                    shadow-lg transition-all
                    ${
                      isSubmitting || (!reason && !details)
                        ? "bg-slate-500/40 text-slate-200 cursor-not-allowed"
                        : darkMode
                        ? "bg-linear-to-r from-indigo-500 to-cyan-500 text-white hover:brightness-110"
                        : "bg-linear-to-r from-indigo-600 to-cyan-500 text-white hover:brightness-110"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending feedback…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send feedback
                    </>
                  )}
                </button>

                <p
                  className={`text-[11px] text-center ${
                    darkMode ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Thank you for helping improve Niyambadha 💙
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
