# Tab Reaper

A minimal Chrome extension that automatically closes tabs you haven't visited in **45 minutes**.

- No UI, no settings page — installs and runs silently in the background
- Checks every 5 minutes
- Always spares the active tab in every open Chrome window
- New or restored tabs get a fresh 45-minute window before they're eligible

## Install

Tab Reaper is not on the Chrome Web Store. Load it directly as an unpacked extension:

1. Clone or download this repo
   ```
   git clone https://github.com/mj407/tab-reaper.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer Mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `tab-reaper` folder

That's it. The extension is now active.

## Customization

To change the idle threshold or sweep interval, edit the constants at the top of `background.js`:

```js
const THRESHOLD_MS = 45 * 60 * 1000;   // 45 minutes
const SWEEP_INTERVAL_MINUTES = 5;
```

After editing, go to `chrome://extensions` and click the refresh icon on the Tab Reaper card.

## How it works

A Manifest V3 service worker listens for `chrome.tabs.onActivated` and `chrome.tabs.onCreated` events and records a timestamp for each tab. Every 5 minutes a `chrome.alarms` sweep wakes the worker, compares each tab's timestamp against the threshold, and closes any that have been idle too long — skipping whichever tab is currently active in each window.
