const THRESHOLD_MS = 45 * 60 * 1000;
const SWEEP_INTERVAL_MINUTES = 5;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("sweep", { periodInMinutes: SWEEP_INTERVAL_MINUTES });
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.storage.session.set({ [tabId]: Date.now() });
});

chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.session.set({ [tab.id]: Date.now() });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(String(tabId));
});

chrome.alarms.onAlarm.addListener(async ({ name }) => {
  if (name !== "sweep") return;

  const [timestamps, tabs] = await Promise.all([
    chrome.storage.session.get(null),
    chrome.tabs.query({}),
  ]);

  // Collect the active tab in every open window
  const activeTabIds = new Set(
    tabs.filter((t) => t.active).map((t) => t.id)
  );

  const now = Date.now();
  const toClose = [];

  for (const tab of tabs) {
    if (activeTabIds.has(tab.id)) continue;

    const last = timestamps[tab.id];
    if (last === undefined) {
      // Tab predates the extension or was restored — give it a fresh window
      chrome.storage.session.set({ [tab.id]: now });
      continue;
    }

    if (now - last > THRESHOLD_MS) {
      toClose.push(tab.id);
    }
  }

  if (toClose.length > 0) {
    chrome.tabs.remove(toClose);
  }
});
