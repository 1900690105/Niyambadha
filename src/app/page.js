"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, HelpCircle, Lock, RefreshCw, Sparkles } from "lucide-react";
import { paheliData } from "./data";
import { PaheliPuzzle } from "./components/PaheliPuzzle";
import { PatternPuzzle } from "./components/PatternPuzzle";
import { MathPuzzle } from "./components/MathPuzzle";
import { SuccessScreen } from "./components/SuccessScreen";
import { getAuth } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Header from "./components/Header";
import { useSearchParams } from "next/navigation";

const CyberPuzzlePortal = () => {
  const [isDark, setIsDark] = useState(true);
  const [puzzleType, setPuzzleType] = useState("paheli");
  const [pattern, setPattern] = useState([]);
  const [status, setStatus] = useState("idle");
  const [mathAnswer, setMathAnswer] = useState("");
  const [paheliAnswer, setPaheliAnswer] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [attempts, setAttempts] = useState(3);
  const [currentPaheli, setCurrentPaheli] = useState(paheliData[0]);
  const [showHint, setShowHint] = useState(false);

  const params = useSearchParams();
  const storedDomain = params.get("blocked");

  // domain we will redirect back to (from query param or fallback)
  const [redirectDomain, setRedirectDomain] = useState(
    storedDomain || "youtube.com"
  );

  // Pattern + math config
  const correctPattern = [0, 1, 2, 5, 8];
  const mathProblem = { question: "15 + 27", answer: "42" };

  // 🔹 When status becomes success → log to Firestore
  useEffect(() => {
    if (status !== "success") return;

    const saveCompletion = async () => {
      try {
        const authInstance = getAuth();
        const user = authInstance.currentUser;

        if (!user) {
          console.error("❌ No logged-in user");
          return;
        }

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
          // track last solved time
          puzzleSolvedAt: serverTimestamp(),
        });

        console.log("✅ Puzzle data merged into user doc");
      } catch (error) {
        console.error("❌ Error saving puzzle completion:", error);
      }
    };

    saveCompletion();
  }, [status, puzzleType, attempts, redirectDomain, countdown]);

  // 🔹 Countdown (currently just visual, redirect commented out)
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      const targetDomain = redirectDomain || "youtube.com";
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

  // 🎁 Reset watchTimeMinutes back to originalTimeMinutes from Firestore
  const giveFiveMinuteBonus = async () => {
    try {
      const authInstance = getAuth();
      const user = authInstance.currentUser;

      if (!user) {
        console.error("❌ No logged-in user for bonus");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        console.error("❌ No user doc found for bonus");
        return;
      }

      const data = snap.data();

      // Try to read original time from multiple possible places
      const originalTime =
        data?.settings?.originalTimeMinutes ??
        data?.settings?.watchTimeMinutes ??
        data?.watchTimeMinutes ??
        1;

      console.log("ℹ️ Original time detected:", originalTime);

      // 🔥 IMPORTANT: update the nested field, not just root
      await updateDoc(userRef, {
        "settings.watchTimeMinutes": originalTime,
      });

      console.log("✅ Watch time reset to:", originalTime);
    } catch (error) {
      console.error("❌ Error updating watch time:", error);
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

      // 🎁 Give bonus in Firestore
      giveFiveMinuteBonus();
    } else {
      // ❌ Wrong
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
        <Header
          isDark={isDark}
          setShowHelp={setShowHelp}
          showHelp={showHelp}
          setIsDark={setIsDark}
        />

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

// "use client";

// import React, { useState, useEffect } from "react";
// import { Moon, Sun, HelpCircle, Lock, RefreshCw, Sparkles } from "lucide-react";
// import { paheliData } from "./data";
// import { PaheliPuzzle } from "./components/PaheliPuzzle";
// import { PatternPuzzle } from "./components/PatternPuzzle";
// import { MathPuzzle } from "./components/MathPuzzle";
// import { SuccessScreen } from "./components/SuccessScreen";
// import { getAuth } from "firebase/auth";
// import { doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
// import { db } from "../lib/firebase";
// import Header from "./components/Header";
// import { useSearchParams } from "next/navigation";

// const CyberPuzzlePortal = () => {
//   const [isDark, setIsDark] = useState(true);
//   const [puzzleType, setPuzzleType] = useState("paheli");
//   const [pattern, setPattern] = useState([]);
//   const [status, setStatus] = useState("idle");
//   const [mathAnswer, setMathAnswer] = useState("");
//   const [paheliAnswer, setPaheliAnswer] = useState("");
//   const [showHelp, setShowHelp] = useState(false);
//   const [countdown, setCountdown] = useState(null);
//   const [attempts, setAttempts] = useState(countdown === null ? 3 : null);
//   const [currentPaheli, setCurrentPaheli] = useState(paheliData[0]);
//   const [showHint, setShowHint] = useState(false);
//   const params = useSearchParams();
//   const storedDomain = params.get("blocked");
//   const [userdocs, setUserDocs] = useState(null);

//   // 🚀 domain we will redirect back to (from localStorage)
//   const [redirectDomain, setRedirectDomain] = useState(
//     storedDomain || "youtube.com"
//   );

//   // Pattern + math config (you can later randomize)
//   const correctPattern = [0, 1, 2, 5, 8];
//   const mathProblem = { question: "15 + 27", answer: "42" };

//   // 🔹 When status becomes success → start countdown & log to Firestore
//   useEffect(() => {
//     if (status !== "success") return;

//     const saveCompletion = async () => {
//       try {
//         const authInstance = getAuth();
//         const user = authInstance.currentUser;

//         if (!user) {
//           console.error("❌ No logged-in user");
//           return;
//         }
//         setUserDocs(user);

//         const userRef = doc(db, "users", user.uid);

//         await updateDoc(userRef, {
//           lastPuzzle: {
//             puzzleType,
//             domain: redirectDomain ?? "unknown",
//             attemptsRemaining: attempts,
//             attemptsUsed: 3 - attempts,
//             completedAt: serverTimestamp(),
//             solved: true,
//           },

//           puzzleSolvedAt: serverTimestamp(), // you can track last solved time
//         });

//         console.log("✅ Puzzle data merged into user doc");
//       } catch (error) {
//         console.error("❌ Error saving puzzle completion:", error);
//       }
//     };

//     saveCompletion();
//   }, [status, puzzleType, attempts, redirectDomain, countdown]);

//   // 🔹 Countdown + redirect back to domain
//   useEffect(() => {
//     if (countdown === null) return;

//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
//       return () => clearTimeout(timer);
//     }

//     // if (countdown === 0) {
//     //   const targetDomain = redirectDomain || "youtube.com"; // fallback
//     //   window.location.href = `https://${targetDomain}`;
//     // }
//   }, [countdown, redirectDomain]);

//   // 🔹 Pattern puzzle logic
//   const handleNodeClick = (index) => {
//     if (status !== "idle") return;

//     if (!pattern.includes(index)) {
//       const newPattern = [...pattern, index];
//       setPattern(newPattern);

//       if (newPattern.length === 5) {
//         checkPattern(newPattern);
//       }
//     }
//   };

//   const checkPattern = (pat) => {
//     const isCorrect = JSON.stringify(pat) === JSON.stringify(correctPattern);

//     if (isCorrect) {
//       setStatus("success");
//     } else {
//       setStatus("error");

//       setAttempts((prev) => {
//         const newAttempts = prev - 1;

//         setTimeout(() => {
//           if (newAttempts > 0) {
//             setStatus("idle");
//             setPattern([]);
//           } else {
//             setStatus("locked");
//           }
//         }, 1500);

//         return newAttempts;
//       });
//     }
//   };

//   // 🔹 Math puzzle logic
//   const checkMathAnswer = () => {
//     if (status !== "idle") return;

//     if (mathAnswer.trim() === mathProblem.answer) {
//       setStatus("success");
//     } else {
//       setStatus("error");

//       setAttempts((prev) => {
//         const newAttempts = prev - 1;

//         setTimeout(() => {
//           if (newAttempts > 0) {
//             setStatus("idle");
//             setMathAnswer("");
//           } else {
//             setStatus("locked");
//           }
//         }, 1500);

//         return newAttempts;
//       });
//     }
//   };

//   const giveFiveMinuteBonus = async () => {
//     try {
//       if (!userdocs) {
//         alert(userdocs);
//       }
//       const userRef = doc(db, "users", "rqW772XFcnWAlZfZakKNVJmK1UC2");

//       await updateDoc(userRef, {
//         watchTimeMinutes: userdocs.settings?.originalTimeMinutes ?? 1,
//       });

//       console.log("✅ Watch time reset to originalTimeMinutes");
//     } catch (error) {
//       console.error("❌ Error updating watch time:", error);
//     }
//   };

//   // 🔹 Paheli puzzle logic
//   const checkPaheliAnswer = (selectedAnswer) => {
//     if (!currentPaheli || status !== "idle") return;

//     const userAnswer = (selectedAnswer ?? paheliAnswer).trim().toLowerCase();
//     const correctAnswer = currentPaheli.answer.toLowerCase();

//     if (userAnswer === correctAnswer) {
//       // ✅ Correct → success flow
//       setStatus("success");
//       setCountdown(3);

//       // 🎁 Give 5-minute bonus in Firestore
//       giveFiveMinuteBonus(userdocs);
//     } else {
//       // ❌ Wrong → existing error logic...
//       setStatus("error");
//       const newAttempts = attempts - 1;
//       setAttempts(newAttempts);

//       setTimeout(() => {
//         if (newAttempts <= 0) {
//           setStatus("locked");
//           return;
//         }

//         setStatus("idle");
//         setPaheliAnswer("");
//         setShowHint(false);

//         const nextPaheli =
//           paheliData[Math.floor(Math.random() * paheliData.length)];

//         setCurrentPaheli(nextPaheli);
//       }, 1200);
//     }
//   };

//   // 🔹 Reset everything
//   const resetPuzzle = () => {
//     setPattern([]);
//     setMathAnswer("");
//     setPaheliAnswer("");
//     setAttempts(3);
//     setStatus("idle");
//     setCountdown(null);
//     setShowHint(false);

//     const randomPaheli =
//       paheliData[Math.floor(Math.random() * paheliData.length)];
//     setCurrentPaheli(randomPaheli);
//   };

//   // 🔹 Switch to another puzzle type
//   const switchPuzzle = () => {
//     resetPuzzle();
//     const puzzles = ["paheli", "pattern", "math"];
//     const currentIndex = puzzles.indexOf(puzzleType);
//     const nextIndex = (currentIndex + 1) % puzzles.length;
//     setPuzzleType(puzzles[nextIndex]);
//   };

//   return (
//     <>
//       <div
//         className={`min-h-screen transition-colors duration-500 ${
//           isDark
//             ? "bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900"
//             : "bg-linear-to-br from-slate-50 via-indigo-50 to-slate-50"
//         }`}
//       >
//         {/* App Bar */}
//         <Header
//           isDark={isDark}
//           setShowHelp={setShowHelp}
//           showHelp={showHelp}
//           setIsDark={setIsDark}
//         />

//         {/* Main Content */}
//         <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
//           <div className="w-full max-w-md">
//             {/* Domain Badge */}
//             <div className="flex justify-center mb-4">
//               <div
//                 className={`
//               inline-flex items-center gap-2 px-4 py-2 rounded-full
//               ${
//                 isDark
//                   ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
//                   : "bg-indigo-100 border border-indigo-200 text-indigo-700"
//               }
//             `}
//               >
//                 <Lock className="w-4 h-4" />
//                 <span className="font-mono text-sm font-semibold">
//                   {redirectDomain ?? "Loading..."}
//                 </span>
//               </div>
//             </div>

//             {/* Main Card */}
//             <div
//               className={`
//             rounded-3xl p-1 shadow-2xl
//             ${status === "error" ? "animate-shake" : ""}
//             ${status === "success" ? "animate-glow" : ""}
//           `}
//             >
//               <div
//                 className={`
//               rounded-3xl p-6
//               ${
//                 isDark
//                   ? "bg-white/10 backdrop-blur-xl border border-white/20"
//                   : "bg-white shadow-lg"
//               }
//             `}
//               >
//                 {status === "success" ? (
//                   <SuccessScreen isDark={isDark} countdown={countdown} />
//                 ) : status === "locked" ? (
//                   <div className="flex flex-col items-center gap-6 p-8">
//                     <div className="text-6xl">🔒</div>
//                     <h2
//                       className={`text-2xl font-bold ${
//                         isDark ? "text-red-400" : "text-red-600"
//                       }`}
//                     >
//                       Too Many Attempts
//                     </h2>
//                     <p
//                       className={`text-center ${
//                         isDark ? "text-gray-400" : "text-gray-600"
//                       }`}
//                     >
//                       Please wait a moment before trying again.
//                     </p>
//                     <button
//                       onClick={resetPuzzle}
//                       className={`
//                       flex items-center gap-2 px-6 py-3 rounded-full font-semibold
//                       ${
//                         isDark
//                           ? "bg-cyan-500 hover:bg-cyan-600 text-white"
//                           : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                       }
//                     `}
//                     >
//                       <RefreshCw className="w-4 h-4" />
//                       Try Again
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     {/* Timer Info */}
//                     <div
//                       className={`
//                     flex items-start gap-3 mb-6 p-4 rounded-xl
//                     ${isDark ? "bg-white/5" : "bg-gray-50"}
//                   `}
//                     >
//                       <Sparkles
//                         className={`w-5 h-5 mt-0.5 shrink-0 ${
//                           isDark ? "text-cyan-400" : "text-indigo-600"
//                         }`}
//                       />
//                       <p
//                         className={`text-sm ${
//                           isDark ? "text-gray-400" : "text-gray-600"
//                         }`}
//                       >
//                         Solve this puzzle to continue using this website for{" "}
//                         <span className="font-semibold">30 seconds</span>.
//                       </p>
//                     </div>

//                     {/* Puzzle Type Badge */}
//                     <div className="flex justify-center mb-4">
//                       <div
//                         className={`
//                       inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
//                       ${
//                         isDark
//                           ? "bg-cyan-500/20 text-cyan-300"
//                           : "bg-indigo-100 text-indigo-700"
//                       }
//                     `}
//                       >
//                         {puzzleType === "paheli" && "🧩 हिंदी पहेली"}
//                         {puzzleType === "pattern" && "🔐 Pattern Lock"}
//                         {puzzleType === "math" && "🔢 Math Challenge"}
//                       </div>
//                     </div>

//                     {/* Puzzle */}
//                     {puzzleType === "paheli" && (
//                       <PaheliPuzzle
//                         isDark={isDark}
//                         currentPaheli={currentPaheli}
//                         showHint={showHint}
//                         setPaheliAnswer={setPaheliAnswer}
//                         paheliAnswer={paheliAnswer}
//                         checkPaheliAnswer={checkPaheliAnswer}
//                         setShowHint={setShowHint}
//                         status={status}
//                         attempts={attempts}
//                       />
//                     )}
//                     {puzzleType === "pattern" && (
//                       <PatternPuzzle
//                         handleNodeClick={handleNodeClick}
//                         status={status}
//                         pattern={pattern}
//                         isDark={isDark}
//                       />
//                     )}
//                     {puzzleType === "math" && (
//                       <MathPuzzle
//                         mathProblem={mathProblem}
//                         mathAnswer={mathAnswer}
//                         setMathAnswer={setMathAnswer}
//                         checkMathAnswer={checkMathAnswer}
//                         status={status}
//                         isDark={isDark}
//                       />
//                     )}

//                     {/* Attempts Indicator */}
//                     <div className="flex items-center justify-center gap-3 mt-6">
//                       <span
//                         className={`text-sm ${
//                           isDark ? "text-gray-400" : "text-gray-600"
//                         }`}
//                       >
//                         Attempts:
//                       </span>
//                       {[...Array(3)].map((_, i) => (
//                         <div
//                           key={i}
//                           className={`
//                           w-3 h-3 rounded-full
//                           ${
//                             i < attempts
//                               ? isDark
//                                 ? "bg-cyan-500"
//                                 : "bg-indigo-600"
//                               : isDark
//                               ? "bg-white/10"
//                               : "bg-gray-300"
//                           }
//                         `}
//                         />
//                       ))}
//                     </div>

//                     {/* Switch Puzzle */}
//                     <button
//                       onClick={switchPuzzle}
//                       className={`
//                       w-full mt-4 text-sm
//                       ${
//                         isDark
//                           ? "text-cyan-400 hover:text-cyan-300"
//                           : "text-indigo-600 hover:text-indigo-700"
//                       }
//                     `}
//                     >
//                       Try a different puzzle
//                     </button>

//                     {/* Error Message */}
//                     {status === "error" && (
//                       <p className="text-center mt-4 text-amber-500 font-semibold animate-pulse">
//                         Try again!
//                       </p>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div
//           className={`
//         py-6 text-center text-sm
//         ${isDark ? "text-gray-500" : "text-gray-600"}
//       `}
//         >
//           <div className="flex items-center justify-center gap-4 mb-2">
//             <a
//               href="#"
//               className={`hover:${
//                 isDark ? "text-cyan-400" : "text-indigo-600"
//               }`}
//             >
//               Need help?
//             </a>
//             <span>|</span>
//             <a
//               href="#"
//               className={`hover:${
//                 isDark ? "text-cyan-400" : "text-indigo-600"
//               }`}
//             >
//               About Focus Portal
//             </a>
//           </div>
//           <p className="text-xs">Made with ❤️ for better productivity</p>
//         </div>

//         <style jsx>{`
//           @keyframes shake {
//             0%,
//             100% {
//               transform: translateX(0);
//             }
//             25% {
//               transform: translateX(-10px);
//             }
//             75% {
//               transform: translateX(10px);
//             }
//           }

//           @keyframes glow {
//             0%,
//             100% {
//               box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
//             }
//             50% {
//               box-shadow: 0 0 40px rgba(6, 182, 212, 0.8);
//             }
//           }

//           .animate-shake {
//             animation: shake 0.5s;
//           }

//           .animate-glow {
//             animation: glow 2s infinite;
//           }
//         `}</style>
//       </div>
//     </>
//   );
// };

// export default CyberPuzzlePortal;
