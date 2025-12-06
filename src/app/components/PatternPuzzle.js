"use client";
export const PatternPuzzle = ({ handleNodeClick, status, pattern, isDark }) => {
  const nodes = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="flex flex-col items-center gap-6">
      <p
        className={`text-sm text-center ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Draw the pattern: Top row left-to-right, then center-right, then
        bottom-right
      </p>

      <div className="grid grid-cols-3 gap-8 p-8">
        {nodes.map((node) => (
          <button
            key={node}
            onClick={() => handleNodeClick(node)}
            disabled={status !== "idle"}
            className={`
                w-16 h-16 rounded-full transition-all duration-300
                ${
                  pattern.includes(node)
                    ? isDark
                      ? "bg-cyan-500 shadow-lg shadow-cyan-500/50 scale-110"
                      : "bg-indigo-600 shadow-lg shadow-indigo-500/50 scale-110"
                    : isDark
                    ? "bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-cyan-500/30"
                    : "bg-gray-200 hover:bg-gray-300 hover:shadow-lg"
                }
                ${
                  status === "error" && pattern.includes(node)
                    ? "animate-pulse bg-red-500"
                    : ""
                }
                ${
                  status === "success" && pattern.includes(node)
                    ? "animate-pulse bg-green-500 shadow-green-500/50"
                    : ""
                }
              `}
          >
            {pattern.includes(node) && (
              <span
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-white"
                }`}
              >
                {pattern.indexOf(node) + 1}
              </span>
            )}
          </button>
        ))}
      </div>

      {pattern.length > 0 && status === "idle" && (
        <button
          onClick={() => setPattern([])}
          className={`text-sm ${
            isDark
              ? "text-cyan-400 hover:text-cyan-300"
              : "text-indigo-600 hover:text-indigo-700"
          }`}
        >
          Clear Pattern
        </button>
      )}
    </div>
  );
};
