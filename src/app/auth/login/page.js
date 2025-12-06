"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Focus, Loader2, AlertCircle } from "lucide-react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

// Next.js router (App Router)
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function FocusLogin() {
  const [darkMode, setDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [resetSent, setResetSent] = useState(false);

  const router = useRouter();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ✅ If user is already authenticated, go directly to dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    const newErrors = {};

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, firebase: "" }));

    try {
      // 🔥 Actual Firebase login
      await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      // Optional: handle "remember me" with persistence if you want
      // (requires setPersistence with browserLocalPersistence / browserSessionPersistence)

      // ✅ Redirect to dashboard when login succeeds
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      let message = "Failed to sign in. Please check your credentials.";

      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/too-many-requests") {
        message =
          "Too many failed attempts. Please wait a moment and try again.";
      }

      setErrors((prev) => ({ ...prev, firebase: message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !validateEmail(resetEmail)) {
      setErrors({ resetEmail: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, resetEmail: "", firebase: "" }));

    try {
      // 🔥 Real Firebase reset email
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSent(true);

      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSent(false);
        setResetEmail("");
      }, 3000);
    } catch (error) {
      console.error("Reset error:", error);
      let message = "Failed to send reset link. Please try again.";

      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      }

      setErrors((prev) => ({ ...prev, resetEmail: message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (showForgotPassword) {
        handleForgotPassword();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
          : "bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50"
      } flex items-center justify-center p-4 transition-colors duration-300`}
    >
      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 p-3 rounded-full ${
          darkMode ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800"
        } shadow-lg hover:scale-105 transition-transform z-10`}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Main Card */}
      <div className="w-full max-w-[420px]">
        <div
          className={`rounded-2xl shadow-2xl ${
            darkMode ? "bg-slate-900 border border-white/10" : "bg-white"
          } p-8 relative overflow-hidden`}
        >
          {/* Decorative gradient blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl z-0"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg`}
              >
                <Focus className="w-8 h-8 text-white" />
              </div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  darkMode ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {showForgotPassword ? "Reset Password" : "Welcome back"}
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {showForgotPassword
                  ? "Enter your email to receive a reset link"
                  : "Sign in to access your Focus account"}
              </p>
            </div>

            {/* Forgot Password View */}
            {showForgotPassword ? (
              <div className="space-y-6">
                {resetSent ? (
                  <div
                    className={`p-4 rounded-lg ${
                      darkMode
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-green-50 border border-green-200"
                    } flex items-start gap-3`}
                  >
                    <AlertCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        Reset link sent!
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          darkMode ? "text-green-300/80" : "text-green-600"
                        }`}
                      >
                        Check your email for password reset instructions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setErrors({ ...errors, resetEmail: "" });
                        }}
                        onKeyPress={handleKeyPress}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                            : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                        } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                      />
                      {errors.resetEmail && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.resetEmail}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setResetSent(false);
                    setErrors({});
                  }}
                  className={`w-full text-center text-sm ${
                    darkMode
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-slate-600 hover:text-slate-700"
                  } transition-colors`}
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              /* Login View */
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                        : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setErrors({ ...errors, password: "" });
                      }}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-4 py-3 rounded-lg border pr-12 ${
                        darkMode
                          ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        darkMode
                          ? "text-slate-400 hover:text-slate-300"
                          : "text-slate-600 hover:text-slate-700"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Firebase login error */}
                {errors.firebase && (
                  <p className="text-red-500 text-xs">{errors.firebase}</p>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rememberMe: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="remember"
                      className={`text-sm ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      } cursor-pointer`}
                    >
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className={`text-sm font-medium ${
                      darkMode
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-indigo-600 hover:text-indigo-700"
                    } transition-colors`}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className={`absolute inset-0 flex items-center`}>
                    <div
                      className={`w-full border-t ${
                        darkMode ? "border-slate-800" : "border-slate-200"
                      }`}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span
                      className={`px-4 ${
                        darkMode
                          ? "bg-slate-900 text-slate-400"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social buttons (still UI only; can be wired to OAuth later) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Google */}
                  <button
                    type="button"
                    className={`py-3 px-4 rounded-lg border ${
                      darkMode
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    } transition-all flex items-center justify-center gap-2 font-medium`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>

                  {/* GitHub */}
                  <button
                    type="button"
                    className={`py-3 px-4 rounded-lg border ${
                      darkMode
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    } transition-all flex items-center justify-center gap-2 font-medium`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    GitHub
                  </button>
                </div>

                {/* Sign Up Link */}
                <p
                  className={`text-center text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Don&apos;t have an account?{" "}
                  <a
                    href="/auth/signup"
                    className={`${
                      darkMode
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-indigo-600 hover:text-indigo-700"
                    } font-medium underline`}
                  >
                    Create account
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
