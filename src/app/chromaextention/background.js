let activeTabId = null;
let activeTabDomain = null;
let timeoutId = null;

// 🔥 User settings loaded from your Next.js API
let userConfig = {
  uid: "", // will be overwritten by API
  blockedDomains: [],
  watchTimeMinutes: 1, // default fallback
  blockEntireDomain: true,
  originalTimeMinutes: 1,
};

// 🧹 Helper to normalize domains (remove www.)
function normalizeDomain(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

// 🔗 Call your Next.js API to get user data from Firestore
async function fetchUserSettings() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/userdata?uid=${encodeURIComponent(
        userConfig.uid
      )}`
      // no credentials needed here, we use ?uid=
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

    console.log("✅ Loaded user config from API:", userConfig);
  } catch (err) {
    console.error("Error fetching user settings:", err);
  }
}

// ✅ Check redirect status for a domain from API
async function fetchRedirectStatus(domain) {
  try {
    const url = `${
      process.env.NEXT_PUBLIC_URL
    }/api/redirects?uid=${encodeURIComponent(
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
  fetch(`${process.env.NEXT_PUBLIC_URL}/api/redirects`, {
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
        // Block entire domain tree:
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
        url: `${process.env.NEXT_PUBLIC_URL}`,
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

        fetch(`${process.env.NEXT_PUBLIC_URL}/api/userdata/watchtime`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: userConfig.uid,
            watchTimeMinutes: 0.1,
          }),
        }).catch((err) => console.error("Failed to update watch time:", err));

        // (Optional) you can send domain as query param to puzzle page
        chrome.tabs.update(activeTabId, {
          url: `${process.env.NEXT_PUBLIC_URL}/?blocked=${encodeURIComponent(
            currentDomain
          )}`,
        });

        console.log(`⛔ Redirected after ${minutes} min →`, currentDomain);
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

// Load user settings once when the extension starts
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
    startTimerForTab(tab); // async but we don't need to await
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

  // ❌ If same tab + same domain → do NOT reset timer
  if (tabId === activeTabId && newDomain === activeTabDomain) {
    // console.log("URL changed on same domain, keeping existing timer");
    return;
  }

  // ✅ Domain changed → restart timer logic for new domain
  stopTimer();
  startTimerForTab(tab);
});

// When Chrome loses / gains focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User left Chrome → stop counting
    stopTimer();
  } else {
    // User came back to Chrome → restart on current tab
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
