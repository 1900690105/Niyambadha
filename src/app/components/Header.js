import { HelpCircle, Lock, Moon, Sun } from "lucide-react";
import Image from "next/image";
import React from "react";

function Header({ isDark, setShowHelp, showHelp, setIsDark }) {
  return (
    <>
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
              <div
                className={`text-xl font-extrabold h-16 w-16 mt-0 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <Image src={"/logo.jpeg"} alt="logo" height={300} width={300} />
              </div>
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
            <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
    </>
  );
}

export default Header;
