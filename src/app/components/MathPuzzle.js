"use client";
export const MathPuzzle = ({
  mathProblem,
  mathAnswer,
  setMathAnswer,
  checkMathAnswer,
  status,
  isDark,
}) => (
  <div className="flex flex-col items-center gap-6 p-8">
    <div
      className={`text-4xl font-bold font-mono ${
        isDark ? "text-cyan-400" : "text-indigo-600"
      }`}
    >
      {mathProblem.question} = ?
    </div>

    <input
      type="text"
      value={mathAnswer}
      onChange={(e) => setMathAnswer(e.target.value)}
      onKeyPress={(e) => e.key === "Enter" && checkMathAnswer()}
      disabled={status !== "idle"}
      placeholder="Your answer"
      className={`
          w-full max-w-xs px-6 py-3 rounded-full text-center text-xl font-mono
          ${
            isDark
              ? "bg-white/10 text-white border border-white/20 placeholder-gray-500"
              : "bg-white text-gray-900 border border-gray-300 placeholder-gray-400"
          }
          focus:outline-none focus:ring-2 ${
            isDark ? "focus:ring-cyan-500" : "focus:ring-indigo-500"
          }
          ${status === "error" ? "animate-shake border-red-500" : ""}
        `}
    />

    <button
      onClick={checkMathAnswer}
      disabled={status !== "idle" || !mathAnswer}
      className={`
          w-full max-w-xs px-6 py-3 rounded-full font-semibold
          bg-linear-to-r ${
            isDark
              ? "from-indigo-600 to-cyan-500"
              : "from-indigo-500 to-cyan-400"
          }
          text-white shadow-lg
          hover:scale-105 hover:shadow-xl
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300
        `}
    >
      Submit Answer
    </button>
  </div>
);
