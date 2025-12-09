"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  X,
  Focus,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { auth, db } from "../../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CreateFocusAccount() {
  const [darkMode, setDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    blockEntireDomain: true,
    syncToCloud: true,
    watchTimeMinutes: 30, // 🆕 allowed watch time before block (in minutes)
  });

  const [blockedDomains, setBlockedDomains] = useState([
    "youtube.com",
    "instagram.com",
  ]);
  const [domainInput, setDomainInput] = useState("");
  const [errors, setErrors] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
    domain: "",
    firebase: "",
  });

  const quickSuggestions = [
    "youtube.com",
    "instagram.com",
    "facebook.com",
    "tiktok.com",
    "twitter.com",
  ];

  const getPasswordStrength = (password) => {
    if (!password) return { level: "none", text: "", color: "" };
    if (password.length < 6)
      return { level: "weak", text: "Weak", color: "bg-red-500" };
    if (password.length < 10)
      return { level: "medium", text: "Medium", color: "bg-yellow-500" };
    return { level: "strong", text: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDomain = (domain) => {
    const cleaned = domain.replace(/^(https?:\/\/)?(www\.)?/, "").trim();
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(
      cleaned
    );
  };

  const cleanDomain = (domain) => {
    return domain
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .trim()
      .toLowerCase();
  };

  const handleAddDomain = (domain) => {
    const cleaned = cleanDomain(domain);
    if (!cleaned) return;

    if (!validateDomain(cleaned)) {
      setErrors((prev) => ({
        ...prev,
        domain: "Please enter a valid domain like youtube.com",
      }));
      return;
    }

    if (blockedDomains.includes(cleaned)) {
      setDomainInput("");
      return;
    }

    setBlockedDomains((prev) => [...prev, cleaned]);
    setDomainInput("");
    setErrors((prev) => ({ ...prev, domain: "" }));
  };

  const handleRemoveDomain = (domain) => {
    setBlockedDomains((prev) => prev.filter((d) => d !== domain));
  };

  const handleDomainKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDomain(domainInput);
    }
  };

  const handleQuickAdd = (domain) => {
    if (!blockedDomains.includes(domain)) {
      setBlockedDomains((prev) => [...prev, domain]);
    }
  };

  // 🔍 Extra validation rules for password
  const isPasswordStrongEnough = (password) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Name is required";
    } else if (formData.displayName.trim().length < 3) {
      newErrors.displayName = "Name must be at least 3 characters";
    }

    // Email validation
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordStrongEnough(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include 1 uppercase letter and 1 number";
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Blocked domains validation
    if (blockedDomains.length === 0) {
      newErrors.domain = "Please add at least one website to block";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, firebase: "" }));

    try {
      // 🔥 Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Set display name
      if (user) {
        await updateProfile(user, {
          displayName: formData.displayName.trim(),
        });
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: formData.displayName.trim(),
        email: formData.email.toLowerCase(),
        blockedDomains,
        settings: {
          blockEntireDomain: formData.blockEntireDomain,
          syncToCloud: formData.syncToCloud,
          watchTimeMinutes: formData.watchTimeMinutes, // 🆕 saved here
          originalTimeMinutes: formData.watchTimeMinutes,
        },
        createdAt: serverTimestamp(),
      });

      const idToken = await auth.currentUser.getIdToken();

      await fetch("/api/createSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (typeof window !== "undefined") {
        window.postMessage(
          {
            type: "NIYAMBADHA_UID_CONNECTED",
            uid: user.uid,
            email: user.email,
          },
          "*"
        );
      }
      alert("Account created successfully and settings saved!");
      window.location.href = `/dashboard`;

      // Optional: reset form
      setFormData({
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        blockEntireDomain: true,
        syncToCloud: true,
        watchTimeMinutes: 30, // 🆕 reset default
      });

      setBlockedDomains(["youtube.com", "instagram.com"]);
      setDomainInput("");
      setErrors({});
    } catch (error) {
      console.error("Firebase error:", error);
      let firebaseMessage = "Failed to create account. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        firebaseMessage = "This email is already in use.";
      } else if (error.code === "auth/weak-password") {
        firebaseMessage = "Firebase says this password is too weak.";
      } else if (error.code === "auth/network-request-failed") {
        firebaseMessage =
          "Network error. Please check your internet connection.";
      }

      setErrors((prev) => ({
        ...prev,
        firebase: firebaseMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950"
          : "bg-linear-to-br from-slate-50 via-indigo-50 to-cyan-50"
      } flex items-center justify-center p-4 transition-colors duration-300`}
    >
      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 p-3 rounded-full ${
          darkMode ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800"
        } shadow-lg hover:scale-105 transition-transform`}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Main Card */}
      <div className="w-full max-w-[480px]">
        <div
          className={`rounded-2xl shadow-2xl ${
            darkMode ? "bg-slate-900 border border-white/10" : "bg-white"
          } p-8`}
        >
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
              Create your Niyambadha account
            </h1>
            <p
              className={`text-sm ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              We&apos;ll sync your blocked websites and settings across devices.
            </p>
          </div>

          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Name
              </label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={formData.displayName}
                onChange={(e) => {
                  setFormData({ ...formData, displayName: e.target.value });
                  setErrors((prev) => ({ ...prev, displayName: "" }));
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                    : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
              />
              {errors.displayName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>

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
                suppressHydrationWarning
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
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
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{
                          width:
                            passwordStrength.level === "weak"
                              ? "33%"
                              : passwordStrength.level === "medium"
                              ? "66%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    });
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border pr-12 ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    darkMode
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-slate-600 hover:text-slate-700"
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Blocked Domains Section */}
            <div
              className={`pt-6 border-t ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-1 ${
                  darkMode ? "text-slate-100" : "text-slate-800"
                }`}
              >
                Which websites do you want to block?
              </h3>
              <p
                className={`text-sm mb-4 ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                You&apos;ll be redirected to a puzzle if you spend more than 30
                seconds on these.
              </p>

              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Blocked domains
              </label>

              <div
                className={`min-h-20 p-3 rounded-lg border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-300"
                } focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all`}
              >
                <div className="flex flex-wrap gap-2 mb-2">
                  {blockedDomains.map((domain) => (
                    <div
                      key={domain}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        darkMode
                          ? "bg-slate-700 border border-cyan-500/30 text-slate-100"
                          : "bg-indigo-50 border border-indigo-200 text-indigo-900"
                      } text-sm font-medium`}
                    >
                      <span>{domain}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDomain(domain)}
                        className={`${
                          darkMode ? "hover:text-red-400" : "hover:text-red-600"
                        } transition-colors`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a domain, e.g. youtube.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyPress={handleDomainKeyPress}
                  onBlur={() => domainInput && handleAddDomain(domainInput)}
                  className={`w-full bg-transparent outline-none ${
                    darkMode
                      ? "text-slate-100 placeholder-slate-500"
                      : "text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>

              <p
                className={`text-xs mt-2 ${
                  darkMode ? "text-slate-500" : "text-slate-600"
                }`}
              >
                You don&apos;t need https:// or www — just domain.com is enough.
              </p>

              {errors.domain && (
                <p className="text-red-500 text-xs mt-1">{errors.domain}</p>
              )}

              {/* Quick Suggestions */}
              <div className="mt-4">
                <label
                  className={`block text-xs font-medium mb-2 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Quick add:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => handleQuickAdd(domain)}
                      disabled={blockedDomains.includes(domain)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        blockedDomains.includes(domain)
                          ? darkMode
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : darkMode
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-400 border border-slate-700"
                          : "bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 border border-slate-200"
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Allowed watch time before redirect */}
            <div className="pt-4">
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                How much watch time before blocking?
              </label>

              <div className="flex items-center gap-3">
                <select
                  value={formData.watchTimeMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      watchTimeMinutes: Number(e.target.value),
                    })
                  }
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-white border-slate-300 text-slate-800"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <p
                className={`text-xs mt-2 ${
                  darkMode ? "text-slate-500" : "text-slate-600"
                }`}
              >
                After this time on a blocked site, we&apos;ll redirect to the
                puzzle.
              </p>
            </div>

            {/* Firebase error */}
            {errors.firebase && (
              <p className="text-red-500 text-xs">{errors.firebase}</p>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 rounded-lg bg-linear-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your account…
                </>
              ) : (
                "Create account & save settings"
              )}
            </button>

            {/* Login Link */}
            <p
              className={`text-center text-sm ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Already have an account?{" "}
              <a
                href="#"
                className={`${
                  darkMode
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-700"
                } font-medium underline`}
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
