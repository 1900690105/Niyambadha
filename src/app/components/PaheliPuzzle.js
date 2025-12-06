"use client";
import { Lightbulb } from "lucide-react";

export const PaheliPuzzle = ({
  isDark,
  currentPaheli,
  showHint,
  setPaheliAnswer,
  paheliAnswer,
  checkPaheliAnswer,
  setShowHint,
  status,
  attempts, // still accepted in case you want to show it later
}) => {
  if (!currentPaheli) return null;

  const optionsArray = Object.entries(currentPaheli.options); // [ ["A","..."], ["B","..."], ...]

  // derive which option is selected from paheliAnswer, e.g. "C. डगर"
  const selectedKey = paheliAnswer?.split(".")[0]; // "A" | "B" | "C" | "D" | undefined

  const handleOptionClick = (key, text) => {
    if (status !== "idle") return;

    // Match the format used in your JSON answers: "C. डगर"
    const selected = `${key}. ${text}`;

    // 1) save answer
    setPaheliAnswer(selected);

    // 2) immediately check answer (parent will change question if wrong)
    checkPaheliAnswer(selected);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb
          className={`w-6 h-6 ${
            isDark ? "text-yellow-400" : "text-yellow-600"
          }`}
        />
        <span
          className={`text-lg font-bold ${
            isDark ? "text-cyan-400" : "text-indigo-600"
          }`}
        >
          हिंदी पहेली
        </span>
      </div>

      {/* Riddle text */}
      <div
        className={`
          p-6 rounded-2xl text-center max-w-md
          ${
            isDark
              ? "bg-white/5 border border-white/10"
              : "bg-indigo-50 border border-indigo-100"
          }
        `}
      >
        <p
          className={`text-lg leading-relaxed ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {currentPaheli.paheli}
        </p>
      </div>

      {/* Hint box */}
      {showHint && (
        <div
          className={`
            p-4 rounded-xl text-sm max-w-md animate-fadeIn
            ${
              isDark
                ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                : "bg-yellow-50 border border-yellow-200 text-yellow-800"
            }
          `}
        >
          <p className="font-semibold mb-1">💡 संकेत:</p>
          <p>{currentPaheli.reason}</p>
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
        {optionsArray.map(([key, text]) => {
          const isSelected = selectedKey === key;
          const baseClasses = `
            flex items-center gap-2 px-4 py-3 rounded-2xl text-sm sm:text-base
            border transition-all duration-200 cursor-pointer
          `;

          const themeClasses = isDark
            ? "bg-white/5 border-white/15 text-gray-100 hover:bg-white/10"
            : "bg-white border-gray-200 text-gray-800 hover:bg-indigo-50";

          const selectedClasses = isDark
            ? "border-cyan-400 bg-cyan-500/20 shadow-md"
            : "border-indigo-500 bg-indigo-50 shadow-md";

          const disabledClasses =
            status !== "idle"
              ? "opacity-60 cursor-not-allowed"
              : "hover:scale-[1.02]";

          return (
            <button
              key={key}
              type="button"
              disabled={status !== "idle"}
              onClick={() => handleOptionClick(key, text)}
              className={`
                ${baseClasses}
                ${themeClasses}
                ${isSelected ? selectedClasses : ""}
                ${disabledClasses}
              `}
            >
              <span
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm
                  ${
                    isDark
                      ? "bg-cyan-500 text-white"
                      : "bg-indigo-500 text-white"
                  }
                `}
              >
                {key}
              </span>
              <span className="text-left">{text}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
        <button
          // still works as manual submit if you want
          onClick={() => checkPaheliAnswer()}
          disabled={status !== "idle" || !paheliAnswer}
          className={`
            flex-1 px-6 py-3 rounded-full font-semibold
            bg-linear-to-r ${
              isDark
                ? "from-indigo-600 to-cyan-500"
                : "from-indigo-500 to-cyan-400"
            }
            text-white shadow-lg
            hover:scale-105 hover:shadow-xl
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300
            ${status === "error" ? "animate-shake" : ""}
          `}
        >
          जवाब दें
        </button>

        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className={`
            px-6 py-3 rounded-full text-sm font-medium
            border
            ${
              isDark
                ? "border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                : "border-yellow-400 text-yellow-700 hover:bg-yellow-50"
            }
            transition-colors duration-200
          `}
        >
          {showHint ? "संकेत छुपाएँ" : "संकेत देखें"}
        </button>
      </div>
    </div>
  );
};
