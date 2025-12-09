"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Focus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
  };

  const backgrounds = {
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md ${backgrounds[type]}`}
      >
        {icons[type]}
        <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function FocusLogin() {
  const [darkMode, setDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const router = useRouter();

  // Validation helpers
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsCheckingAuth(false);
      if (user) {
        showToast("Already logged in. Redirecting...", "success");
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1000);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle login with Firebase
  const handleLogin = async () => {
    try {
      // Clear previous errors
      setErrors({});

      // Validation
      const newErrors = {};

      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(formData.password)) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        showToast("Please fix the errors in the form", "error");
        return;
      }

      setIsLoading(true);

      // Set Firebase persistence based on "Remember Me"
      try {
        await setPersistence(
          auth,
          formData.rememberMe
            ? browserLocalPersistence
            : browserSessionPersistence
        );
      } catch (persistenceError) {
        console.warn("Failed to set persistence:", persistenceError);
        // Continue with login even if persistence fails
      }

      // Attempt Firebase login
      await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      const user = auth.currentUser;
      if (user && typeof window !== "undefined") {
        window.postMessage(
          {
            type: "NIYAMBADHA_UID_CONNECTED",
            uid: user.uid,
            email: user.email,
          },
          "*"
        );
      }

      // Success
      showToast("Login successful! Welcome back.", "success");

      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);

      // Map Firebase errors to user-friendly messages
      const errorMessages = {
        "auth/invalid-email": "Invalid email address format",
        "auth/user-disabled":
          "This account has been disabled. Please contact support.",
        "auth/user-not-found": "No account found with this email address",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential":
          "Invalid credentials. Please check your email and password.",
        "auth/too-many-requests":
          "Too many failed login attempts. Please try again later or reset your password.",
        "auth/network-request-failed":
          "Network error. Please check your connection and try again.",
        "auth/operation-not-allowed":
          "Email/password sign-in is not enabled. Please contact support.",
        "auth/weak-password":
          "Password is too weak. Please use a stronger password.",
      };

      const message =
        errorMessages[error.code] ||
        `Login failed: ${error.message || "Please try again."}`;

      setErrors({ general: message });
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password with Firebase
  const handleForgotPassword = async () => {
    try {
      setErrors({});

      if (!resetEmail) {
        setErrors({ resetEmail: "Email is required" });
        showToast("Please enter your email address", "error");
        return;
      }

      if (!validateEmail(resetEmail)) {
        setErrors({ resetEmail: "Please enter a valid email address" });
        showToast("Invalid email address format", "error");
        return;
      }

      setIsLoading(true);

      // Send Firebase password reset email
      await sendPasswordResetEmail(auth, resetEmail.trim());

      showToast("Password reset email sent! Check your inbox.", "success");

      // Reset form and close modal after delay
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);

      const errorMessages = {
        "auth/invalid-email": "Invalid email address format",
        "auth/user-not-found": "No account found with this email address",
        "auth/network-request-failed":
          "Network error. Please check your connection.",
        "auth/too-many-requests": "Too many requests. Please try again later.",
        "auth/missing-email": "Please enter your email address",
      };

      const message =
        errorMessages[error.code] ||
        `Failed to send reset email: ${error.message || "Please try again."}`;

      setErrors({ resetEmail: message });
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      if (showForgotPassword) {
        handleForgotPassword();
      } else {
        handleLogin();
      }
    }
  };

  // Input change handlers with error clearing
  const handleEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value });
    if (errors.email || errors.general) {
      setErrors({ ...errors, email: "", general: "" });
    }
  };

  const handlePasswordChange = (e) => {
    setFormData({ ...formData, password: e.target.value });
    if (errors.password || errors.general) {
      setErrors({ ...errors, password: "", general: "" });
    }
  };

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value);
    if (errors.resetEmail) {
      setErrors({ ...errors, resetEmail: "" });
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950"
          : "bg-linear-to-br from-slate-50 via-indigo-50 to-cyan-50"
      } flex items-center justify-center p-4 transition-colors duration-300`}
    >
      {/* Toast Notifications */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 p-3 rounded-full ${
          darkMode ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800"
        } shadow-lg hover:scale-105 transition-transform z-10`}
        aria-label="Toggle theme"
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
          {/* Decorative linear blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl z-0 pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg`}
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

            {/* General Error Message */}
            {errors.general && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  darkMode
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p
                  className={`text-sm ${
                    darkMode ? "text-red-300" : "text-red-700"
                  }`}
                >
                  {errors.general}
                </p>
              </div>
            )}

            {/* Forgot Password View */}
            {showForgotPassword ? (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="reset-email"
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={handleResetEmailChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.resetEmail
                        ? "border-red-500 focus:ring-red-500"
                        : darkMode
                        ? "border-slate-700 focus:ring-indigo-500"
                        : "border-slate-300 focus:ring-indigo-500"
                    } ${
                      darkMode
                        ? "bg-slate-800 text-slate-100 placeholder-slate-500"
                        : "bg-white text-slate-800 placeholder-slate-400"
                    } focus:ring-2 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-invalid={errors.resetEmail ? "true" : "false"}
                    aria-describedby={
                      errors.resetEmail ? "reset-email-error" : undefined
                    }
                  />
                  {errors.resetEmail && (
                    <p
                      id="reset-email-error"
                      className="text-red-500 text-xs mt-1"
                      role="alert"
                    >
                      {errors.resetEmail}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-linear-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setErrors({});
                  }}
                  disabled={isLoading}
                  className={`w-full text-center text-sm ${
                    darkMode
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-slate-600 hover:text-slate-700"
                  } transition-colors disabled:opacity-50`}
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              /* Login View */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-6"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : darkMode
                        ? "border-slate-700 focus:ring-indigo-500"
                        : "border-slate-300 focus:ring-indigo-500"
                    } ${
                      darkMode
                        ? "bg-slate-800 text-slate-100 placeholder-slate-500"
                        : "bg-white text-slate-800 placeholder-slate-400"
                    } focus:ring-2 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-red-500 text-xs mt-1"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg border pr-12 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : darkMode
                          ? "border-slate-700 focus:ring-indigo-500"
                          : "border-slate-300 focus:ring-indigo-500"
                      } ${
                        darkMode
                          ? "bg-slate-800 text-slate-100 placeholder-slate-500"
                          : "bg-white text-slate-800 placeholder-slate-400"
                      } focus:ring-2 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        darkMode
                          ? "text-slate-400 hover:text-slate-300"
                          : "text-slate-600 hover:text-slate-700"
                      } disabled:opacity-50 transition-colors`}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-red-500 text-xs mt-1"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

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
                      disabled={isLoading}
                      className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                    />
                    <label
                      htmlFor="remember"
                      className={`text-sm ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      } cursor-pointer select-none`}
                    >
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    disabled={isLoading}
                    className={`text-sm font-medium ${
                      darkMode
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-indigo-600 hover:text-indigo-700"
                    } transition-colors disabled:opacity-50`}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-linear-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      showToast("Google login coming soon!", "info")
                    }
                    disabled={isLoading}
                    className={`py-3 px-4 rounded-lg border ${
                      darkMode
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    } transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
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

                  <button
                    type="button"
                    onClick={() =>
                      showToast("GitHub login coming soon!", "info")
                    }
                    disabled={isLoading}
                    className={`py-3 px-4 rounded-lg border ${
                      darkMode
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    } transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
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
                    } font-medium underline transition-colors`}
                  >
                    Create account
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
