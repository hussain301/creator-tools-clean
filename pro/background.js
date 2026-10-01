// =============================================================================
// CREATOR TOOLS PRO — background.js (CLEAN REBUILD)
// Date: 2026-10-01
//
// This file is a from-scratch, human-readable rewrite of the original obfuscated
// MV3 service worker. An independent auditor decoded it function-by-function
// and found almost all of it was HOSTILE code unrelated to the extension's
// stated purpose (Google Flow access).
//
// REMOVED (deliberately NOT reimplemented) — hostile / deceptive behavior:
//   - The cookie-wipe kill switch: erased ALL browser cookies on demand (via
//     the browser's cookie-data removal APIs and per-cookie deletion), then
//     force-reloaded every non-browser-internal tab — a remote-punishment
//     weapon aimed at the user's own browser.
//   - The companion-extension guard: tracked a paired "extension A" by ID, ran
//     a 1.5-second polling interval plus a 1-minute check alarm, and fired the
//     cookie-wipe kill switch when the companion was removed; it also reacted
//     to the companion's uninstall/disable events.
//   - The third-party extension purge loop: every 3 seconds it scanned all
//     installed extensions and force-disabled + silently uninstalled any
//     third-party extension, hijacking the user's whole browser.
//   - The restricted-pages tab blocker: force-closed tabs on the internal
//     extensions, settings, and password-manager pages (plus Edge equivalents)
//     and on Chrome Web Store tabs — stopping the user from inspecting or
//     removing hostile extensions.
//   - Companion-ID persistence / v2 tracking / tab-reload re-infection hooks
//     (deceptive log-only handlers and dead code).
//   - Dead always-false branches (code bloat to confuse analysis).
//   - The filename-fraud hook that silently renamed files whose names carried
//     a resolution tag in the filename to fake "4K"-style labels —
//     pure mislabeling; the files were never re-encoded.
//   As a result this file only touches the tabs, permissions, windows, and
//   runtime namespaces, and makes NO network calls (the original had none —
//   kept that way).
//
// KEPT — the only two legitimate features, verified benign:
//   1. killFlowTabsIfNoAccess: if the host permission for flow.google.com is
//      not granted, close all tabs on flow.google.com (legitimate hygiene for a
//      Flow-access tool). Re-checked on chrome.permissions.onRemoved.
//   2. Single Flow tab enforcer: chrome.tabs.onUpdated listener — when a tab
//      navigates to flow.google.com and more than one Flow tab exists, the new
//      tab is closed and the pre-existing Flow tab is brought to the front.
// =============================================================================

const FLOW_HOST_ORIGIN = "*://flow.google.com/*";

// Matches any tab URL on the Flow site.
function isFlowTabUrl(url) {
  return typeof url === "string" && url.includes("flow.google.com");
}

// Closes every open tab on flow.google.com.
function closeAllFlowTabs() {
  chrome.tabs.query({}, (tabs) => {
    if (!tabs) return;
    const flowTabs = tabs.filter(
      (tab) => tab && tab.id != null && isFlowTabUrl(tab.url)
    );
    if (flowTabs.length === 0) return;
    for (const tab of flowTabs) {
      chrome.tabs.remove(tab.id, () => {
        // Ignore per-tab errors (e.g. tab already closed).
        if (chrome.runtime.lastError) {
          /* noop */
        }
      });
    }
  });
}

// FEATURE 1: hygiene — without the flow.google.com host permission the
// extension cannot function there, so any open Flow tabs are dead weight.
async function killFlowTabsIfNoAccess() {
  let granted = false;
  try {
    granted = await chrome.permissions.contains({
      origins: [FLOW_HOST_ORIGIN],
    });
  } catch (err) {
    // If the check itself fails, err on the side of caution: leave tabs alone.
    console.warn("Flow permission check failed:", err);
    return;
  }
  if (!granted) {
    closeAllFlowTabs();
  }
}

// FEATURE 2: single Flow tab enforcer — only one Flow session tab at a time.
// When a newly-navigated Flow tab would create a duplicate, the newcomer is
// closed and the original tab is focused.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url || !isFlowTabUrl(changeInfo.url)) {
    return; // Not a Flow navigation — ignore.
  }

  chrome.tabs.query({}, (tabs) => {
    if (!tabs) return;
    const flowTabs = tabs.filter(
      (t) => t && t.id != null && isFlowTabUrl(t.url)
    );
    if (flowTabs.length <= 1) return; // No duplicate — nothing to do.

    const newTab = flowTabs.find((t) => t.id === tabId);
    const otherTab = flowTabs.find((t) => t.id !== tabId) || flowTabs[0];
    const duplicateId = newTab ? newTab.id : tabId;

    chrome.tabs.remove(duplicateId, () => {
      if (chrome.runtime.lastError) {
        /* noop */
      }
      // Bring the surviving Flow tab to the front.
      chrome.tabs.update(otherTab.id, { active: true }, () => {
        if (chrome.runtime.lastError) {
          /* noop */
        }
        chrome.windows.update(otherTab.windowId, { focused: true }, () => {
          if (chrome.runtime.lastError) {
            /* noop */
          }
        });
      });
    });
  });
});

// Run the permission hygiene check at service-worker startup...
killFlowTabsIfNoAccess();

// ...and again whenever any permission is removed (e.g. the user revokes the
// flow.google.com host permission in chrome://extensions).
if (
  chrome.permissions &&
  chrome.permissions.onRemoved &&
  chrome.permissions.onRemoved.addListener
) {
  chrome.permissions.onRemoved.addListener(() => {
    killFlowTabsIfNoAccess();
  });
}
