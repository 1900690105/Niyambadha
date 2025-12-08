let activeTabId = null;
let activeTabDomain = null;
let timeoutId = null;

// 🔥 User settings loaded from your Next.js API
let userConfig = {
  uid: "", // will be overwritten by API
  blockedDomains: ["youtube.com"], // default, in case API fails
  watchTimeMinutes: 1, // default fallback
  blockEntireDomain: true,
  originalTimeMinutes: 1,
};

// ⏱️ Keep track of when we last fetched settings
let lastSettingsFetch = 0;
// How long settings are considered "fresh" (tune as you like)
const SETTINGS_TTL_MS = 30 * 1000; // 30 seconds

// 🧹 Helper to normalize domains (remove www.)
function normalizeDomain(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

// 🔗 Call your Next.js API to get user data from Firestore
async function fetchUserSettings() {
  try {
    const res = await fetch(
      `https://niyambadha.vercel.app/api/userdata?uid=${encodeURIComponent(
        userConfig.uid
      )}`
    );

    if (!res.ok) {
      console.error("Failed to fetch user settings:", res.status);
      return;
    }

    const json = await res.json();
    const data = json.data || {};

    userConfig = {
      uid: json.uid,
      blockedDomains: data.blockedDomains || [],
      watchTimeMinutes: data.settings?.watchTimeMinutes ?? 1,
      blockEntireDomain: data.settings?.blockEntireDomain ?? true,
      originalTimeMinutes: data.settings?.originalTimeMinutes ?? 1,
    };

    lastSettingsFetch = Date.now();

    console.log("✅ Loaded user config from API:", userConfig);
  } catch (err) {
    console.error("Error fetching user settings:", err);
  }
}

// ✅ Ensure we have fresh settings (re-fetch if too old / empty / penalized)
async function ensureFreshSettings() {
  const now = Date.now();

  const needRefetch =
    !userConfig.uid || // never loaded
    !userConfig.blockedDomains.length || // empty config
    now - lastSettingsFetch > SETTINGS_TTL_MS || // too old
    userConfig.watchTimeMinutes === 0.1; // 🔥 in penalty mode → always refresh

  if (needRefetch) {
    await fetchUserSettings();
  }
}

// ✅ Check redirect status for a domain from API
async function fetchRedirectStatus(domain) {
  try {
    const url = `https://niyambadha.vercel.app/api/redirects?uid=${encodeURIComponent(
      userConfig.uid
    )}&domain=${encodeURIComponent(domain)}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to fetch redirect status:", res.status);
      return null;
    }

    const json = await res.json();
    // expected: { exists: boolean, data?: { puzzleSolvedAt?: ... } }
    return json;
  } catch (err) {
    console.error("Error fetching redirect status:", err);
    return null;
  }
}

// ✅ Log a redirect event for this domain in Firestore via API
function logRedirect(domain) {
  fetch("https://niyambadha.vercel.app/api/redirects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: userConfig.uid,
      domain,
    }),
  }).catch((err) => {
    console.error("Failed to log redirect:", err);
  });
}

// Decide which URLs should trigger the redirect (domain-based)
function shouldAutoRedirect(url) {
  try {
    const u = new URL(url);
    const domain = normalizeDomain(u.hostname);

    if (!userConfig.blockedDomains || userConfig.blockedDomains.length === 0) {
      // No config / nothing to block → do nothing
      return false;
    }

    // Check if this domain matches any blocked domain
    return userConfig.blockedDomains.some((blocked) => {
      const blockedDomain = blocked.toLowerCase();

      if (userConfig.blockEntireDomain) {
        // "youtube.com" matches "youtube.com" and "m.youtube.com"
        return domain === blockedDomain || domain.endsWith("." + blockedDomain);
      } else {
        // Strict domain match only
        return domain === blockedDomain;
      }
    });
  } catch (e) {
    return false;
  }
}

// 🔁 Now async so we can call the new API
async function startTimerForTab(tab) {
  if (!tab || !tab.id || !tab.url) return;

  // 👇 Make sure we have fresh settings whenever we start a timer
  await ensureFreshSettings();

  if (!shouldAutoRedirect(tab.url)) return;

  const url = tab.url;
  let domain;
  try {
    domain = normalizeDomain(new URL(url).hostname);
  } catch {
    return;
  }

  // 🔍 Check if this domain is already in redirect table and puzzle not solved
  try {
    const status = await fetchRedirectStatus(domain);
    if (status && status.exists && status.data && !status.data.puzzleSolvedAt) {
      console.log(
        "⚠️ Domain already redirected & puzzle not solved, instant redirect:",
        domain
      );

      // Immediate redirect to puzzle page, no extra watch time
      chrome.tabs.update(tab.id, {
        url: "https://niyambadha.vercel.app/",
      });
      return;
    }
  } catch (err) {
    console.error("Error checking redirect status:", err);
    // If it fails, we still fall back to timer below
  }

  // Use watchTimeMinutes from userConfig (default to 1 minute if missing)
  const minutes = userConfig.watchTimeMinutes || 1;
  const timeoutDurationMs = minutes * 60 * 1000;

  // Clear previous timer and set domain for this tab
  clearTimeout(timeoutId);
  activeTabId = tab.id;
  activeTabDomain = domain;

  console.log(
    `⏱️ Starting timer for tab ${activeTabId} on domain ${domain} for ${minutes} min`
  );

  timeoutId = setTimeout(() => {
    chrome.tabs.get(activeTabId, (currentTab) => {
      if (chrome.runtime.lastError || !currentTab) return;

      try {
        const currentDomain = normalizeDomain(new URL(currentTab.url).hostname);

        // If user navigated away to a different domain, don't redirect
        if (currentDomain !== activeTabDomain) {
          console.log(
            "ℹ️ Domain changed before timeout, not redirecting:",
            currentDomain
          );
          return;
        }

        // 🔥 Log redirect for this domain
        logRedirect(currentDomain);

        // 🚨 LOCK USER *BEFORE* redirect
        // 1) Update local config immediately so any new timers use 0.1
        userConfig.watchTimeMinutes = 0.1;

        // 2) Update backend (fire-and-forget)
        fetch("https://niyambadha.vercel.app/api/userdata/watchtime", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: userConfig.uid,
            watchTimeMinutes: 0.1, // lock to 6 seconds
          }),
        }).catch((err) => console.error("Failed to update watch time:", err));

        // 3) Redirect to puzzle portal with domain
        chrome.tabs.update(activeTabId, {
          url: `https://niyambadha.vercel.app/?blocked=${encodeURIComponent(
            currentDomain
          )}`,
        });

        console.log(
          `⛔ Redirected after ${minutes} min → ${currentDomain} (watchTimeMinutes now 0.1)`
        );
      } catch (e) {
        console.error("Error during redirect:", e);
      }
    });
  }, timeoutDurationMs);
}

function stopTimer() {
  clearTimeout(timeoutId);
  timeoutId = null;
  activeTabId = null;
  activeTabDomain = null;
}

// ────────────────────────────
// 🔁 Event wiring
// ────────────────────────────

// Load user settings once when the extension starts (warm up)
fetchUserSettings();

// Optionally refresh settings when installed / updated
chrome.runtime.onInstalled.addListener(() => {
  fetchUserSettings();
});

// When active tab changes → start timer for that tab/domain
chrome.tabs.onActivated.addListener((activeInfo) => {
  stopTimer();
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) return;
    startTimerForTab(tab);
  });
});

// When URL of active tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.active) return;
  if (!changeInfo.url) return;

  let newDomain;
  try {
    newDomain = normalizeDomain(new URL(changeInfo.url).hostname);
  } catch {
    return;
  }

  if (tabId === activeTabId && newDomain === activeTabDomain) {
    return;
  }

  stopTimer();
  startTimerForTab(tab);
});

// When Chrome loses / gains focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTimer();
  } else {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      startTimerForTab(tabs[0]);
    });
  }
});

// Clean up when extension is unloading
chrome.runtime.onSuspend.addListener(() => {
  stopTimer();
});

// let activeTabId = null;
// let activeTabDomain = null;
// let timeoutId = null;

// // 🔥 User settings loaded from your Next.js API
// let userConfig = {
//   uid: "", // will be set later (e.g. via message from your portal)
//   blockedDomains: ["youtube.com"], // default until we know real config
//   watchTimeMinutes: 1, // default fallback
//   blockEntireDomain: true,
//   originalTimeMinutes: 1,
// };

// // ⏱️ Keep track of when we last fetched settings
// let lastSettingsFetch = 0;
// // How long settings are considered "fresh"
// const SETTINGS_TTL_MS = 30 * 1000; // 30 seconds

// // 🧹 Helper to normalize domains (remove www.)
// function normalizeDomain(hostname) {
//   return hostname.replace(/^www\./, "").toLowerCase();
// }

// // 🔗 Call your Next.js API to get user data from Firestore
// async function fetchUserSettings() {
//   // ❗ If we don't know the uid yet, skip remote fetch
//   if (!userConfig.uid) {
//     console.log(
//       "[Niyambadha] No uid set yet, using local defaults (e.g. youtube.com)."
//     );
//     return;
//   }

//   try {
//     const res = await fetch(
//       `https://niyambadha.vercel.app/api/userdata?uid=${encodeURIComponent(
//         userConfig.uid
//       )}`
//     );

//     if (!res.ok) {
//       console.error("Failed to fetch user settings:", res.status);
//       return;
//     }

//     const json = await res.json();
//     const data = json.data || {};

//     userConfig = {
//       uid: json.uid,
//       blockedDomains: data.blockedDomains || [],
//       watchTimeMinutes: data.settings?.watchTimeMinutes ?? 1,
//       blockEntireDomain: data.settings?.blockEntireDomain ?? true,
//       originalTimeMinutes: data.settings?.originalTimeMinutes ?? 1,
//     };

//     lastSettingsFetch = Date.now();

//     console.log("✅ Loaded user config from API:", userConfig);
//   } catch (err) {
//     console.error("Error fetching user settings:", err);
//   }
// }

// // ✅ Ensure we have fresh settings (re-fetch if too old / empty)
// async function ensureFreshSettings() {
//   const now = Date.now();

//   const needRefetch =
//     !!userConfig.uid && // only refetch if we actually know a uid
//     (!userConfig.blockedDomains.length ||
//       now - lastSettingsFetch > SETTINGS_TTL_MS);

//   if (needRefetch) {
//     await fetchUserSettings();
//   }
// }

// // ✅ Check redirect status for a domain from API
// async function fetchRedirectStatus(domain) {
//   if (!userConfig.uid) return null; // no user, no redirects

//   try {
//     const url = `https://niyambadha.vercel.app/api/redirects?uid=${encodeURIComponent(
//       userConfig.uid
//     )}&domain=${encodeURIComponent(domain)}`;

//     const res = await fetch(url);
//     if (!res.ok) {
//       console.error("Failed to fetch redirect status:", res.status);
//       return null;
//     }

//     const json = await res.json();
//     // expected: { exists: boolean, data?: { puzzleSolvedAt?: ... } }
//     return json;
//   } catch (err) {
//     console.error("Error fetching redirect status:", err);
//     return null;
//   }
// }

// // ✅ Log a redirect event for this domain in Firestore via API
// function logRedirect(domain) {
//   if (!userConfig.uid) return; // nothing to log without user

//   fetch("https://niyambadha.vercel.app/api/redirects", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       uid: userConfig.uid,
//       domain,
//     }),
//   }).catch((err) => {
//     console.error("Failed to log redirect:", err);
//   });
// }

// // Decide which URLs should trigger the redirect (domain-based)
// function shouldAutoRedirect(url) {
//   try {
//     const u = new URL(url);
//     const domain = normalizeDomain(u.hostname);

//     if (!userConfig.blockedDomains || userConfig.blockedDomains.length === 0) {
//       // No config / nothing to block → do nothing
//       return false;
//     }

//     // Check if this domain matches any blocked domain
//     return userConfig.blockedDomains.some((blocked) => {
//       const blockedDomain = blocked.toLowerCase();

//       if (userConfig.blockEntireDomain) {
//         // "youtube.com" matches "youtube.com" and "m.youtube.com"
//         return domain === blockedDomain || domain.endsWith("." + blockedDomain);
//       } else {
//         // Strict domain match only
//         return domain === blockedDomain;
//       }
//     });
//   } catch (e) {
//     return false;
//   }
// }

// // 🔁 Now async so we can call the new API
// async function startTimerForTab(tab) {
//   if (!tab || !tab.id || !tab.url) return;

//   // 👇 Make sure we have fresh settings whenever we start a timer
//   await ensureFreshSettings();

//   if (!shouldAutoRedirect(tab.url)) return;

//   const url = tab.url;
//   let domain;
//   try {
//     domain = normalizeDomain(new URL(url).hostname);
//   } catch {
//     return;
//   }

//   // 🔍 Check if this domain is already in redirect table and puzzle not solved
//   try {
//     const status = await fetchRedirectStatus(domain);
//     if (status && status.exists && status.data && !status.data.puzzleSolvedAt) {
//       console.log(
//         "⚠️ Domain already redirected & puzzle not solved, instant redirect:",
//         domain
//       );

//       // Immediate redirect to puzzle page, no extra watch time
//       chrome.tabs.update(tab.id, {
//         url: "https://niyambadha.vercel.app/",
//       });
//       return;
//     }
//   } catch (err) {
//     console.error("Error checking redirect status:", err);
//     // If it fails, we still fall back to timer below
//   }

//   // Use watchTimeMinutes from userConfig (default to 1 minute if missing)
//   const minutes = userConfig.watchTimeMinutes || 1;
//   const timeoutDurationMs = minutes * 60 * 1000;

//   // Clear previous timer and set domain for this tab
//   clearTimeout(timeoutId);
//   activeTabId = tab.id;
//   activeTabDomain = domain;

//   console.log(
//     `⏱️ Starting timer for tab ${activeTabId} on domain ${domain} for ${minutes} min`
//   );

//   timeoutId = setTimeout(() => {
//     chrome.tabs.get(activeTabId, (currentTab) => {
//       if (chrome.runtime.lastError || !currentTab) return;

//       try {
//         const currentDomain = normalizeDomain(new URL(currentTab.url).hostname);

//         // If user navigated away to a different domain, don't redirect
//         if (currentDomain !== activeTabDomain) {
//           console.log(
//             "ℹ️ Domain changed before timeout, not redirecting:",
//             currentDomain
//           );
//           return;
//         }

//         // 🔥 Log redirect for this domain (if we have a user)
//         logRedirect(currentDomain);

//         // 🔁 Update watchTimeMinutes in backend AND local config
//         if (userConfig.uid) {
//           fetch("https://niyambadha.vercel.app/api/userdata/watchtime", {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               uid: userConfig.uid,
//               watchTimeMinutes: userConfig.originalTimeMinutes, // or 0.1 if you want short window
//             }),
//           })
//             .then(() => {
//               // keep extension in sync immediately if you want short 0.1 min
//               // userConfig.watchTimeMinutes = 0.1;
//               console.log("✅ watchTimeMinutes updated in backend");
//             })
//             .catch((err) => console.error("Failed to update watch time:", err));
//         }

//         // (Optional) you can send domain as query param to puzzle page
//         chrome.tabs.update(activeTabId, {
//           url: `https://niyambadha.vercel.app/?blocked=${encodeURIComponent(
//             currentDomain
//           )}`,
//         });
//         console.log(`⛔ Redirected after ${minutes} min →`, currentDomain);
//       } catch (e) {
//         console.error("Error during redirect:", e);
//       }
//     });
//   }, timeoutDurationMs);
// }

// function stopTimer() {
//   clearTimeout(timeoutId);
//   timeoutId = null;
//   activeTabId = null;
//   activeTabDomain = null;
// }

// // ────────────────────────────
// // 🔁 Event wiring
// // ────────────────────────────

// // 👉 When the extension is installed the FIRST time, open signup page
// chrome.runtime.onInstalled.addListener((details) => {
//   if (details.reason === "install") {
//     chrome.tabs.create({
//       url: "https://niyambadha.vercel.app/auth/signup",
//     });
//   }

//   // You can still attempt to load settings if uid is known later
//   fetchUserSettings();
// });

// // When active tab changes → start timer for that tab/domain
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   stopTimer();
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     if (chrome.runtime.lastError || !tab) return;
//     startTimerForTab(tab); // async but we don't need to await
//   });
// });

// // When URL of active tab changes
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (!tab.active) return;
//   if (!changeInfo.url) return;

//   let newDomain;
//   try {
//     newDomain = normalizeDomain(new URL(changeInfo.url).hostname);
//   } catch {
//     return;
//   }

//   // ❌ If same tab + same domain → do NOT reset timer
//   if (tabId === activeTabId && newDomain === activeTabDomain) {
//     return;
//   }

//   // ✅ Domain changed → restart timer logic for new domain
//   stopTimer();
//   startTimerForTab(tab);
// });

// // When Chrome loses / gains focus
// chrome.windows.onFocusChanged.addListener((windowId) => {
//   if (windowId === chrome.windows.WINDOW_ID_NONE) {
//     // User left Chrome → stop counting
//     stopTimer();
//   } else {
//     // User came back to Chrome → restart on current tab
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
//       if (!tabs || !tabs[0]) return;
//       startTimerForTab(tabs[0]);
//     });
//   }
// });

// // Clean up when extension is unloading
// chrome.runtime.onSuspend.addListener(() => {
//   stopTimer();
// });

// let activeTabId = null;
// let activeTabDomain = null;
// let timeoutId = null;

// // 🔥 User settings loaded from your Next.js API
// let userConfig = {
//   uid: "", // will be overwritten by API
//   blockedDomains: ["youtube.com"],
//   watchTimeMinutes: 1, // default fallback
//   blockEntireDomain: true,
//   originalTimeMinutes: 1,
// };

// // ⏱️ Keep track of when we last fetched settings
// let lastSettingsFetch = 0;
// // How long settings are considered "fresh" (tune as you like)
// const SETTINGS_TTL_MS = 30 * 1000; // 30 seconds

// // 🧹 Helper to normalize domains (remove www.)
// function normalizeDomain(hostname) {
//   return hostname.replace(/^www\./, "").toLowerCase();
// }

// // 🔗 Call your Next.js API to get user data from Firestore
// async function fetchUserSettings() {
//   try {
//     const res = await fetch(
//       `https://niyambadha.vercel.app/api/userdata?uid=${encodeURIComponent(
//         userConfig.uid
//       )}`
//       // if your API ignores uid & uses cookies, this is still fine
//     );

//     if (!res.ok) {
//       console.error("Failed to fetch user settings:", res.status);
//       return;
//     }

//     const json = await res.json();
//     const data = json.data || {};

//     userConfig = {
//       uid: json.uid,
//       blockedDomains: data.blockedDomains || [],
//       watchTimeMinutes: data.settings?.watchTimeMinutes ?? 1,
//       blockEntireDomain: data.settings?.blockEntireDomain ?? true,
//       originalTimeMinutes: data.settings?.originalTimeMinutes ?? 1,
//     };

//     lastSettingsFetch = Date.now();

//     console.log("✅ Loaded user config from API:", userConfig);
//   } catch (err) {
//     console.error("Error fetching user settings:", err);
//   }
// }

// // ✅ Ensure we have fresh settings (re-fetch if too old / empty)
// async function ensureFreshSettings() {
//   const now = Date.now();

//   const needRefetch =
//     !userConfig.uid || // never loaded
//     !userConfig.blockedDomains.length || // empty config
//     now - lastSettingsFetch > SETTINGS_TTL_MS; // too old

//   if (needRefetch) {
//     await fetchUserSettings();
//   }
// }

// // ✅ Check redirect status for a domain from API
// async function fetchRedirectStatus(domain) {
//   try {
//     const url = `https://niyambadha.vercel.app/api/redirects?uid=${encodeURIComponent(
//       userConfig.uid
//     )}&domain=${encodeURIComponent(domain)}`;

//     const res = await fetch(url);
//     if (!res.ok) {
//       console.error("Failed to fetch redirect status:", res.status);
//       return null;
//     }

//     const json = await res.json();
//     // expected: { exists: boolean, data?: { puzzleSolvedAt?: ... } }
//     return json;
//   } catch (err) {
//     console.error("Error fetching redirect status:", err);
//     return null;
//   }
// }

// // ✅ Log a redirect event for this domain in Firestore via API
// function logRedirect(domain) {
//   fetch("https://niyambadha.vercel.app/api/redirects", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       uid: userConfig.uid,
//       domain,
//     }),
//   }).catch((err) => {
//     console.error("Failed to log redirect:", err);
//   });
// }

// // Decide which URLs should trigger the redirect (domain-based)
// function shouldAutoRedirect(url) {
//   try {
//     const u = new URL(url);
//     const domain = normalizeDomain(u.hostname);

//     if (!userConfig.blockedDomains || userConfig.blockedDomains.length === 0) {
//       // No config / nothing to block → do nothing
//       return false;
//     }

//     // Check if this domain matches any blocked domain
//     return userConfig.blockedDomains.some((blocked) => {
//       const blockedDomain = blocked.toLowerCase();

//       if (userConfig.blockEntireDomain) {
//         // Block entire domain tree:
//         // "youtube.com" matches "youtube.com" and "m.youtube.com"
//         return domain === blockedDomain || domain.endsWith("." + blockedDomain);
//       } else {
//         // Strict domain match only
//         return domain === blockedDomain;
//       }
//     });
//   } catch (e) {
//     return false;
//   }
// }

// // 🔁 Now async so we can call the new API
// async function startTimerForTab(tab) {
//   if (!tab || !tab.id || !tab.url) return;

//   // 👇 Make sure we have fresh settings whenever we start a timer
//   await ensureFreshSettings();

//   if (!shouldAutoRedirect(tab.url)) return;

//   const url = tab.url;
//   let domain;
//   try {
//     domain = normalizeDomain(new URL(url).hostname);
//   } catch {
//     return;
//   }

//   // 🔍 Check if this domain is already in redirect table and puzzle not solved
//   try {
//     const status = await fetchRedirectStatus(domain);
//     if (status && status.exists && status.data && !status.data.puzzleSolvedAt) {
//       console.log(
//         "⚠️ Domain already redirected & puzzle not solved, instant redirect:",
//         domain
//       );

//       // Immediate redirect to puzzle page, no extra watch time
//       chrome.tabs.update(tab.id, {
//         url: "https://niyambadha.vercel.app/",
//       });
//       return;
//     }
//   } catch (err) {
//     console.error("Error checking redirect status:", err);
//     // If it fails, we still fall back to timer below
//   }

//   // Use watchTimeMinutes from userConfig (default to 1 minute if missing)
//   const minutes = userConfig.watchTimeMinutes || 1;
//   const timeoutDurationMs = minutes * 60 * 1000;

//   // Clear previous timer and set domain for this tab
//   clearTimeout(timeoutId);
//   activeTabId = tab.id;
//   activeTabDomain = domain;

//   console.log(
//     `⏱️ Starting timer for tab ${activeTabId} on domain ${domain} for ${minutes} min`
//   );

//   timeoutId = setTimeout(() => {
//     chrome.tabs.get(activeTabId, (currentTab) => {
//       if (chrome.runtime.lastError || !currentTab) return;

//       try {
//         const currentDomain = normalizeDomain(new URL(currentTab.url).hostname);

//         // If user navigated away to a different domain, don't redirect
//         if (currentDomain !== activeTabDomain) {
//           console.log(
//             "ℹ️ Domain changed before timeout, not redirecting:",
//             currentDomain
//           );
//           return;
//         }

//         // 🔥 Log redirect for this domain
//         logRedirect(currentDomain);

//         // 🔁 Update watchTimeMinutes in backend AND local config
//         fetch("https://niyambadha.vercel.app/api/userdata/watchtime", {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             uid: userConfig.uid,
//             watchTimeMinutes: userConfig.originalTimeMinutes, // 6 seconds
//           }),
//         })
//           .then(() => {
//             // keep extension in sync immediately
//             userConfig.watchTimeMinutes = 0.1;
//             console.log(
//               "✅ watchTimeMinutes updated to 0.1 in backend & local"
//             );
//           })
//           .catch((err) => console.error("Failed to update watch time:", err));

//         // (Optional) you can send domain as query param to puzzle page
//         chrome.tabs.update(activeTabId, {
//           url: `https://niyambadha.vercel.app/?blocked=${encodeURIComponent(
//             currentDomain
//           )}`,
//         });

//         console.log(`⛔ Redirected after ${minutes} min →`, currentDomain);
//       } catch (e) {
//         console.error("Error during redirect:", e);
//       }
//     });
//   }, timeoutDurationMs);
// }

// function stopTimer() {
//   clearTimeout(timeoutId);
//   timeoutId = null;
//   activeTabId = null;
//   activeTabDomain = null;
// }

// // ────────────────────────────
// // 🔁 Event wiring
// // ────────────────────────────

// // Load user settings once when the extension starts (warm up)
// fetchUserSettings();

// // Optionally refresh settings when installed / updated
// chrome.runtime.onInstalled.addListener(() => {
//   fetchUserSettings();
// });

// // When active tab changes → start timer for that tab/domain
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   stopTimer();
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     if (chrome.runtime.lastError || !tab) return;
//     startTimerForTab(tab); // async but we don't need to await
//   });
// });

// // When URL of active tab changes
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (!tab.active) return;
//   if (!changeInfo.url) return;

//   let newDomain;
//   try {
//     newDomain = normalizeDomain(new URL(changeInfo.url).hostname);
//   } catch {
//     return;
//   }

//   // ❌ If same tab + same domain → do NOT reset timer
//   if (tabId === activeTabId && newDomain === activeTabDomain) {
//     // console.log("URL changed on same domain, keeping existing timer");
//     return;
//   }

//   // ✅ Domain changed → restart timer logic for new domain
//   stopTimer();
//   startTimerForTab(tab);
// });

// // When Chrome loses / gains focus
// chrome.windows.onFocusChanged.addListener((windowId) => {
//   if (windowId === chrome.windows.WINDOW_ID_NONE) {
//     // User left Chrome → stop counting
//     stopTimer();
//   } else {
//     // User came back to Chrome → restart on current tab
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
//       if (!tabs || !tabs[0]) return;
//       startTimerForTab(tabs[0]);
//     });
//   }
// });

// // Clean up when extension is unloading
// chrome.runtime.onSuspend.addListener(() => {
//   stopTimer();
// });
