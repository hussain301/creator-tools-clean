// Background service worker for Flow Link Copier & Auto-Reloader (3D Water Glass Edition)

// Configure side panel to open on action click
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Side panel behavior error:', error));
}

// Regex to detect Flow project URL
function isFlowProjectUrl(url) {
  if (!url) return false;
  return /^https?:\/\/(?:flow\.google\.com|labs\.google\/flow)\/project\/[a-zA-Z0-9_\-]+/i.test(url);
}

// Clean project URL to canonical form
function getCleanProjectUrl(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/project\/[a-zA-Z0-9_\-]+/i);
    if (match) {
      return `${parsed.origin}${match[0]}`;
    }
    return url;
  } catch (e) {
    return url;
  }
}

// Helper to format date and time
function getFormattedDateTime(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${year}-${month}-${day} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

// Save project link to history with Project numbering (Project 1, Project 2, etc.)
async function saveProjectLink(rawUrl, customTime) {
  try {
    const cleanUrl = getCleanProjectUrl(rawUrl);
    const data = await chrome.storage.local.get(['flowLinkHistory', 'autoCopyEnabled', 'projectCounter', 'formatStyle']);
    let history = data.flowLinkHistory || [];
    let counter = data.projectCounter || 0;
    
    const now = Date.now();
    const formattedDate = customTime || getFormattedDateTime(now);
    
    // Check if clean project URL already exists in history
    const existingIndex = history.findIndex(item => item.url === cleanUrl);
    let projectNumber;

    if (existingIndex !== -1) {
      projectNumber = history[existingIndex].projectNumber || (existingIndex + 1);
      history[existingIndex].timestamp = now;
      history[existingIndex].formattedDate = formattedDate;
    } else {
      counter += 1;
      projectNumber = counter;
      
      const newEntry = {
        id: 'flow_' + now + '_' + Math.random().toString(36).substring(2, 7),
        projectNumber: projectNumber,
        projectName: `Project ${projectNumber}`,
        url: cleanUrl,
        timestamp: now,
        formattedDate: formattedDate
      };
      
      history.unshift(newEntry);
      await chrome.storage.local.set({ projectCounter: counter });
    }

    // Keep max 150 items
    if (history.length > 150) {
      history = history.slice(0, 150);
    }

    const currentEntry = history.find(item => item.url === cleanUrl) || history[0];

    await chrome.storage.local.set({ 
      flowLinkHistory: history,
      lastCopiedLink: currentEntry
    });

    // Broadcast to sidepanel and popups
    chrome.runtime.sendMessage({
      action: 'HISTORY_UPDATED',
      entry: currentEntry
    }).catch(() => {});

    return currentEntry;
  } catch (err) {
    console.error('Error saving project link:', err);
    return null;
  }
}

// Automatically detect project URLs when any tab updates or loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = (changeInfo && changeInfo.url) || (tab && tab.url);
  if (url && isFlowProjectUrl(url)) {
    saveProjectLink(url);
  }
});

// Automatically detect project URLs when user switches active tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url && isFlowProjectUrl(tab.url)) {
      saveProjectLink(tab.url);
    }
  });
});

// Handle runtime messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_PROJECT_LINK') {
    saveProjectLink(request.url, request.formattedDate).then(savedItem => {
      sendResponse({ status: 'ok', item: savedItem });
    });
    return true;
  }

  if (request.action === 'GET_PROJECT_INFO') {
    chrome.storage.local.get(['flowLinkHistory'], (res) => {
      const history = res.flowLinkHistory || [];
      const cleanUrl = getCleanProjectUrl(request.url);
      const item = history.find(h => h.url === cleanUrl);
      sendResponse({ item: item || null });
    });
    return true;
  }

  if (request.action === 'OPEN_AND_RELOAD_TAB') {
    const targetUrl = request.url;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const activeTabId = tabs[0].id;
        chrome.tabs.update(activeTabId, { url: targetUrl }, () => {
          setTimeout(() => {
            chrome.tabs.reload(activeTabId, { bypassCache: true });
          }, 300);
          sendResponse({ status: 'ok' });
        });
      }
    });
    return true;
  }

  if (request.action === 'RELOAD_CURRENT_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.reload(tabs[0].id, { bypassCache: true }, () => {
          sendResponse({ status: 'reloaded' });
        });
      }
    });
    return true;
  }

  if (request.action === 'OPEN_SIDE_PANEL' && sender.tab && sender.tab.id) {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch(err => {
        console.error('Failed to open side panel:', err);
      });
      sendResponse({ status: 'opened' });
    }
    return true;
  }

  // === TOOL COOKIE INJECTION (PANEL-AUTHORIZED TOOLS ONLY) ===
  if (request.action === 'INJECT_FLOW_COOKIES' || request.action === 'INJECT_VTEN_COOKIES') {
    (async () => {
      try {
        const stored = await chrome.storage.local.get([
          'lastActiveToolId',
          'isPanelAuthorized',
          'isPanelLoggedIn',
          'lastCopiedLink',
          'flowLinkHistory'
        ]);

        const toolId = request.toolId || stored.lastActiveToolId;
        const isAuthorized = stored.isPanelAuthorized;
        const isLoggedIn = stored.isPanelLoggedIn;

        // STRICT SECURITY: Must be authorized from panel!
        if (!isAuthorized || !toolId || isLoggedIn === false) {
          console.warn('[CreatorTools Background] Unauthorized injection attempt rejected. No panel tool selected.');
          sendResponse({ success: false, requireLogin: true, error: 'Please login to panel and select a tool first.' });
          return;
        }

        console.log(`[CreatorTools Background] Fetching cookies for authorized tool: ${toolId}...`);
        const apiUrl = `https://dashboard.creatortools.pro/dist/php/custom.php?website=${encodeURIComponent(toolId)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        const jsonCookies = typeof data.cookies === 'string' ? JSON.parse(data.cookies) : data.cookies;
        const targetUrl = data.url || 'https://flow.google.com/?pli=1';

        // 1. Resolve latest flow project URL if available in local storage
        let finalUrl = targetUrl;
        if (stored.lastCopiedLink && stored.lastCopiedLink.url) {
          finalUrl = stored.lastCopiedLink.url;
        } else if (stored.flowLinkHistory && stored.flowLinkHistory.length > 0 && stored.flowLinkHistory[0].url) {
          finalUrl = stored.flowLinkHistory[0].url;
        }

        console.log(`[CreatorTools Background] Injecting ${jsonCookies ? jsonCookies.length : 0} cookies for ${toolId}. Target: ${finalUrl}`);

        // 2. Inject all cookies
        if (jsonCookies && Array.isArray(jsonCookies)) {
          for (const c of jsonCookies) {
            try {
              let cookieDomain = c.domain || '.google.com';
              if (!cookieDomain.startsWith('.')) cookieDomain = '.' + cookieDomain;
              
              const cookieUrl = 'https://flow.google.com';
              const details = {
                url: cookieUrl,
                name: c.name,
                value: c.value,
                domain: cookieDomain,
                path: c.path || '/',
                secure: !!c.secure,
                httpOnly: !!c.httpOnly,
                sameSite: (c.sameSite && ['no_restriction', 'lax', 'strict'].includes(String(c.sameSite).toLowerCase()))
                  ? String(c.sameSite).toLowerCase()
                  : 'lax'
              };
              if (c.expirationDate) {
                details.expirationDate = c.expirationDate;
              }
              await chrome.cookies.set(details);
            } catch (cookieErr) {
              console.warn(`[CreatorTools] Cookie set error for ${c.name}:`, cookieErr);
            }
          }
        }

        // 3. Mark session in tab and navigate/reload
        const senderTabId = (sender && sender.tab && sender.tab.id) ? sender.tab.id : null;
        if (senderTabId) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: senderTabId },
              func: () => {
                sessionStorage.setItem('SHH_EXTENSION_SESSION', 'true');
                console.log('[CreatorTools] Marked session active for authorized tool');
              }
            });
          } catch (e) {}

          chrome.tabs.update(senderTabId, { url: finalUrl, active: true }, () => {
            setTimeout(() => {
              chrome.tabs.reload(senderTabId, { bypassCache: true });
            }, 600);
          });
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
              chrome.tabs.update(tabs[0].id, { url: finalUrl, active: true }, () => {
                setTimeout(() => {
                  chrome.tabs.reload(tabs[0].id, { bypassCache: true });
                }, 600);
              });
            }
          });
        }

        sendResponse({ success: true, toolId: toolId, url: finalUrl });
      } catch (err) {
        console.error('[CreatorTools Background] Error injecting tool cookies:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }



});

// Set default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['autoCopyEnabled', 'autoReloadOnClick', 'formatStyle', 'projectCounter'], (res) => {
    const defaults = {};
    if (res.autoCopyEnabled === undefined) defaults.autoCopyEnabled = true;
    if (res.autoReloadOnClick === undefined) defaults.autoReloadOnClick = true;
    if (res.formatStyle === undefined) defaults.formatStyle = 'standard';
    if (res.projectCounter === undefined) defaults.projectCounter = 0;
    if (Object.keys(defaults).length > 0) {
      chrome.storage.local.set(defaults);
    }
  });
});
