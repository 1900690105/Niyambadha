"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, HelpCircle, Lock, RefreshCw, Sparkles } from "lucide-react";
import { paheliData } from "./data";
import { PaheliPuzzle } from "./components/PaheliPuzzle";
import { PatternPuzzle } from "./components/PatternPuzzle";
import { MathPuzzle } from "./components/MathPuzzle";
import { SuccessScreen } from "./components/SuccessScreen";
import { getAuth } from "firebase/auth";
import { doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const CyberPuzzlePortal = () => {
  const [isDark, setIsDark] = useState(true);
  const [puzzleType, setPuzzleType] = useState("paheli"); // "paheli" | "pattern" | "math"
  const [pattern, setPattern] = useState([]);
  const [attempts, setAttempts] = useState(3);
  const [status, setStatus] = useState("idle"); // "idle" | "error" | "success" | "locked"
  const [mathAnswer, setMathAnswer] = useState("");
  const [paheliAnswer, setPaheliAnswer] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const [currentPaheli, setCurrentPaheli] = useState(paheliData[0]);
  const [showHint, setShowHint] = useState(false);

  // 🚀 domain we will redirect back to (from localStorage)
  const [redirectDomain, setRedirectDomain] = useState(null);

  // Pattern + math config (you can later randomize)
  const correctPattern = [0, 1, 2, 5, 8];
  const mathProblem = { question: "15 + 27", answer: "42" };

  // 🔹 Load domain from localStorage once
  useEffect(() => {
    try {
      const storedDomain =
        typeof window !== "undefined" ? "instagram.com" : null;
      if (storedDomain) {
        setRedirectDomain(storedDomain);
      }
    } catch (err) {
      console.error("Error reading blocked_domain from localStorage:", err);
    }
  }, []);

  // 🔹 When status becomes success → start countdown & log to Firestore
  useEffect(() => {
    if (status !== "success") return;

    // start countdown if not already started
    if (countdown === null) {
      setCountdown(3);
    }

    const saveCompletion = async () => {
      try {
        const authInstance = getAuth();
        const user = authInstance.currentUser;

        if (!user) {
          console.error("❌ No logged-in user");
          return;
        }

        console.log(user);

        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
          lastPuzzle: {
            puzzleType,
            domain: redirectDomain ?? "unknown",
            attemptsRemaining: attempts,
            attemptsUsed: 3 - attempts,
            completedAt: serverTimestamp(),
            solved: true,
          },

          puzzleSolvedAt: serverTimestamp(), // you can track last solved time
        });

        console.log("✅ Puzzle data merged into user doc");
      } catch (error) {
        console.error("❌ Error saving puzzle completion:", error);
      }
    };

    saveCompletion();
  }, [status, puzzleType, attempts, redirectDomain, countdown]);

  // 🔹 Countdown + redirect back to domain
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      const targetDomain = redirectDomain || "youtube.com"; // fallback
      window.location.href = `https://${targetDomain}`;
    }
  }, [countdown, redirectDomain]);

  // 🔹 Pattern puzzle logic
  const handleNodeClick = (index) => {
    if (status !== "idle") return;

    if (!pattern.includes(index)) {
      const newPattern = [...pattern, index];
      setPattern(newPattern);

      if (newPattern.length === 5) {
        checkPattern(newPattern);
      }
    }
  };

  const checkPattern = (pat) => {
    const isCorrect = JSON.stringify(pat) === JSON.stringify(correctPattern);

    if (isCorrect) {
      setStatus("success");
    } else {
      setStatus("error");

      setAttempts((prev) => {
        const newAttempts = prev - 1;

        setTimeout(() => {
          if (newAttempts > 0) {
            setStatus("idle");
            setPattern([]);
          } else {
            setStatus("locked");
          }
        }, 1500);

        return newAttempts;
      });
    }
  };

  // 🔹 Math puzzle logic
  const checkMathAnswer = () => {
    if (status !== "idle") return;

    if (mathAnswer.trim() === mathProblem.answer) {
      setStatus("success");
    } else {
      setStatus("error");

      setAttempts((prev) => {
        const newAttempts = prev - 1;

        setTimeout(() => {
          if (newAttempts > 0) {
            setStatus("idle");
            setMathAnswer("");
          } else {
            setStatus("locked");
          }
        }, 1500);

        return newAttempts;
      });
    }
  };

  const giveFiveMinuteBonus = async () => {
    try {
      const fixedUid = "qaR0OkD5hkcFDWgKTcrGsUQcNzr2"; // 👈 your given UID
      const userRef = doc(db, "users", fixedUid);

      await updateDoc(userRef, {
        // 5 minutes = 300 seconds
        bonusTimeSeconds: increment(5 * 60),
        // you can also track last bonus time if you want:
        lastPaheliBonusAt: serverTimestamp(),
      });

      localStorage.getItem("bonusTimeSeconds", increment(5 * 60));

      console.log("✅ Added 5-minute bonus to user");
    } catch (err) {
      console.error("❌ Error giving 5-minute bonus:", err);
    }
  };

  // 🔹 Paheli puzzle logic
  const checkPaheliAnswer = (selectedAnswer) => {
    if (!currentPaheli || status !== "idle") return;

    const userAnswer = (selectedAnswer ?? paheliAnswer).trim().toLowerCase();
    const correctAnswer = currentPaheli.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      // ✅ Correct → success flow
      setStatus("success");
      setCountdown(3);

      // 🎁 Give 5-minute bonus in Firestore
      giveFiveMinuteBonus();
    } else {
      // ❌ Wrong → existing error logic...
      setStatus("error");
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);

      setTimeout(() => {
        if (newAttempts <= 0) {
          setStatus("locked");
          return;
        }

        setStatus("idle");
        setPaheliAnswer("");
        setShowHint(false);

        const nextPaheli =
          paheliData[Math.floor(Math.random() * paheliData.length)];

        setCurrentPaheli(nextPaheli);
      }, 1200);
    }
  };

  // 🔹 Reset everything
  const resetPuzzle = () => {
    setPattern([]);
    setMathAnswer("");
    setPaheliAnswer("");
    setAttempts(3);
    setStatus("idle");
    setCountdown(null);
    setShowHint(false);

    const randomPaheli =
      paheliData[Math.floor(Math.random() * paheliData.length)];
    setCurrentPaheli(randomPaheli);
  };

  // 🔹 Switch to another puzzle type
  const switchPuzzle = () => {
    resetPuzzle();
    const puzzles = ["paheli", "pattern", "math"];
    const currentIndex = puzzles.indexOf(puzzleType);
    const nextIndex = (currentIndex + 1) % puzzles.length;
    setPuzzleType(puzzles[nextIndex]);
  };

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          isDark
            ? "bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900"
            : "bg-linear-to-br from-slate-50 via-indigo-50 to-slate-50"
        }`}
      >
        {/* App Bar */}
        <header>
          <div
            className={`
        sticky top-0 z-50 backdrop-blur-lg
        ${
          isDark
            ? "bg-slate-900/80 border-b border-white/10"
            : "bg-white/80 border-b border-gray-200"
        }
        shadow-lg
      `}
          >
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock
                  className={`w-6 h-6 ${
                    isDark ? "text-cyan-400" : "text-indigo-600"
                  }`}
                />
                <h1
                  className={`text-xl font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Niyambadha
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className={`text-sm flex items-center gap-1 ${
                    isDark
                      ? "text-gray-400 hover:text-cyan-400"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Why am I here?</span>
                </button>

                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
              className={`
            max-w-md w-full p-6 rounded-2xl
            ${
              isDark
                ? "bg-slate-800 border border-white/10"
                : "bg-white shadow-2xl"
            }
          `}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                About Focus Portal
              </h3>
              <p
                className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                You&apos;ve spent more than 30 seconds on a blocked website. To
                continue, solve a simple puzzle to earn 30 more seconds.
              </p>
              <p
                className={`mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-sm`}
              >
                This helps you stay mindful of your time and build better focus
                habits.
              </p>
              <button
                onClick={() => setShowHelp(false)}
                className={`
                w-full px-4 py-2 rounded-full font-semibold
                ${
                  isDark
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }
              `}
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="w-full max-w-md">
            {/* Domain Badge */}
            <div className="flex justify-center mb-4">
              <div
                className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              ${
                isDark
                  ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                  : "bg-indigo-100 border border-indigo-200 text-indigo-700"
              }
            `}
              >
                <Lock className="w-4 h-4" />
                <span className="font-mono text-sm font-semibold">
                  {redirectDomain ?? "Loading..."}
                </span>
              </div>
            </div>

            {/* Main Card */}
            <div
              className={`
            rounded-3xl p-1 shadow-2xl
            ${status === "error" ? "animate-shake" : ""}
            ${status === "success" ? "animate-glow" : ""}
          `}
            >
              <div
                className={`
              rounded-3xl p-6
              ${
                isDark
                  ? "bg-white/10 backdrop-blur-xl border border-white/20"
                  : "bg-white shadow-lg"
              }
            `}
              >
                {status === "success" ? (
                  <SuccessScreen isDark={isDark} countdown={countdown} />
                ) : status === "locked" ? (
                  <div className="flex flex-col items-center gap-6 p-8">
                    <div className="text-6xl">🔒</div>
                    <h2
                      className={`text-2xl font-bold ${
                        isDark ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      Too Many Attempts
                    </h2>
                    <p
                      className={`text-center ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Please wait a moment before trying again.
                    </p>
                    <button
                      onClick={resetPuzzle}
                      className={`
                      flex items-center gap-2 px-6 py-3 rounded-full font-semibold
                      ${
                        isDark
                          ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }
                    `}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Timer Info */}
                    <div
                      className={`
                    flex items-start gap-3 mb-6 p-4 rounded-xl
                    ${isDark ? "bg-white/5" : "bg-gray-50"}
                  `}
                    >
                      <Sparkles
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          isDark ? "text-cyan-400" : "text-indigo-600"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Solve this puzzle to continue using this website for{" "}
                        <span className="font-semibold">30 seconds</span>.
                      </p>
                    </div>

                    {/* Puzzle Type Badge */}
                    <div className="flex justify-center mb-4">
                      <div
                        className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        isDark
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-indigo-100 text-indigo-700"
                      }
                    `}
                      >
                        {puzzleType === "paheli" && "🧩 हिंदी पहेली"}
                        {puzzleType === "pattern" && "🔐 Pattern Lock"}
                        {puzzleType === "math" && "🔢 Math Challenge"}
                      </div>
                    </div>

                    {/* Puzzle */}
                    {puzzleType === "paheli" && (
                      <PaheliPuzzle
                        isDark={isDark}
                        currentPaheli={currentPaheli}
                        showHint={showHint}
                        setPaheliAnswer={setPaheliAnswer}
                        paheliAnswer={paheliAnswer}
                        checkPaheliAnswer={checkPaheliAnswer}
                        setShowHint={setShowHint}
                        status={status}
                        attempts={attempts}
                      />
                    )}
                    {puzzleType === "pattern" && (
                      <PatternPuzzle
                        handleNodeClick={handleNodeClick}
                        status={status}
                        pattern={pattern}
                        isDark={isDark}
                      />
                    )}
                    {puzzleType === "math" && (
                      <MathPuzzle
                        mathProblem={mathProblem}
                        mathAnswer={mathAnswer}
                        setMathAnswer={setMathAnswer}
                        checkMathAnswer={checkMathAnswer}
                        status={status}
                        isDark={isDark}
                      />
                    )}

                    {/* Attempts Indicator */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Attempts:
                      </span>
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`
                          w-3 h-3 rounded-full
                          ${
                            i < attempts
                              ? isDark
                                ? "bg-cyan-500"
                                : "bg-indigo-600"
                              : isDark
                              ? "bg-white/10"
                              : "bg-gray-300"
                          }
                        `}
                        />
                      ))}
                    </div>

                    {/* Switch Puzzle */}
                    <button
                      onClick={switchPuzzle}
                      className={`
                      w-full mt-4 text-sm
                      ${
                        isDark
                          ? "text-cyan-400 hover:text-cyan-300"
                          : "text-indigo-600 hover:text-indigo-700"
                      }
                    `}
                    >
                      Try a different puzzle
                    </button>

                    {/* Error Message */}
                    {status === "error" && (
                      <p className="text-center mt-4 text-amber-500 font-semibold animate-pulse">
                        Try again!
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`
        py-6 text-center text-sm
        ${isDark ? "text-gray-500" : "text-gray-600"}
      `}
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <a
              href="#"
              className={`hover:${
                isDark ? "text-cyan-400" : "text-indigo-600"
              }`}
            >
              Need help?
            </a>
            <span>|</span>
            <a
              href="#"
              className={`hover:${
                isDark ? "text-cyan-400" : "text-indigo-600"
              }`}
            >
              About Focus Portal
            </a>
          </div>
          <p className="text-xs">Made with ❤️ for better productivity</p>
        </div>

        <style jsx>{`
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-10px);
            }
            75% {
              transform: translateX(10px);
            }
          }

          @keyframes glow {
            0%,
            100% {
              box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
            }
            50% {
              box-shadow: 0 0 40px rgba(6, 182, 212, 0.8);
            }
          }

          .animate-shake {
            animation: shake 0.5s;
          }

          .animate-glow {
            animation: glow 2s infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default CyberPuzzlePortal;
