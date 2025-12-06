"use client";
export const SuccessScreen = ({ isDark, countdown }) => (
  <div className="flex flex-col items-center gap-6 p-8 animate-fadeIn">
    <div className="text-6xl animate-bounce">🎉</div>
    <h2
      className={`text-3xl font-extrabold ${
        isDark ? "text-cyan-400" : "text-indigo-600"
      }`}
    >
      Great Job!
    </h2>
    <p className={`text-center ${isDark ? "text-gray-300" : "text-gray-700"}`}>
      Redirecting you back to <span className="font-semibold">youtube.com</span>
      <br />
      Enjoy your next 30 seconds wisely.
    </p>

    <div className="relative w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r="44"
          stroke={isDark ? "#1e293b" : "#e5e7eb"}
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r="44"
          stroke={isDark ? "#06b6d4" : "#4f46e5"}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={276.46}
          strokeDashoffset={276.46 * (countdown / 3)}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-2xl font-bold ${
            isDark ? "text-cyan-400" : "text-indigo-600"
          }`}
        >
          {countdown}
        </span>
      </div>
    </div>
  </div>
);
