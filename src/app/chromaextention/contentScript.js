// contentScript.js
window.addEventListener("message", (event) => {
  // Only accept messages from this page
  if (event.source !== window) return;

  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "NIYAMBADHA_UID_CONNECTED" && data.uid) {
    console.log("🔗 Received UID from page:", data.uid);

    // HERE we can safely use chrome.storage.sync
    chrome.storage.sync.set({ userUid: data.uid }, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to save UID:", chrome.runtime.lastError);
      } else {
        console.log("✅ UID saved to chrome.storage.sync");
      }
    });
  }
});
