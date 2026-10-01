// 3D Clean Water Glass Flow Project Link Copier & Auto-Reloader Content Script

(() => {
  let settings = {
    autoCopyEnabled: true,
    autoReloadOnClick: true,
    formatStyle: 'standard'
  };

  let lastHandledUrl = null;
  let lastCopyTime = 0;

  // Load initial settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['autoCopyEnabled', 'autoReloadOnClick', 'formatStyle'], (res) => {
      if (res.autoCopyEnabled !== undefined) settings.autoCopyEnabled = res.autoCopyEnabled;
      if (res.autoReloadOnClick !== undefined) settings.autoReloadOnClick = res.autoReloadOnClick;
      if (res.formatStyle !== undefined) settings.formatStyle = res.formatStyle;
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.autoCopyEnabled) settings.autoCopyEnabled = changes.autoCopyEnabled.newValue;
        if (changes.autoReloadOnClick) settings.autoReloadOnClick = changes.autoReloadOnClick.newValue;
        if (changes.formatStyle) settings.formatStyle = changes.formatStyle.newValue;
      }
    });
  }

  // Regex to detect Flow project URL
  function isFlowProjectUrl(url) {
    if (!url) return false;
    return /^https?:\/\/(?:flow\.google\.com|labs\.google\/flow)\/project\/[a-zA-Z0-9_\-]+/i.test(url);
  }

  // Extract clean project URL
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

  // Format Date & Time nicely
  function getFormattedDateTime(dateObj = new Date()) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    return `${year}-${month}-${day} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }

  // Format copied string with Project 1, Project 2...
  function formatCopyString(projectLabel, url, formattedDate) {
    if (settings.formatStyle === 'date_first') {
      return `[${formattedDate}] ${projectLabel}: ${url}`;
    } else if (settings.formatStyle === 'multiline') {
      return `${projectLabel}\nLink: ${url}\nGenerated: ${formattedDate}`;
    } else if (settings.formatStyle === 'simple') {
      return `${projectLabel} - ${url}`;
    }
    return `${projectLabel}: ${url} [${formattedDate}]`;
  }

  // Clipboard copy
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('[Flow Copier] Clipboard API failed, trying fallback:', err);
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('[Flow Copier] Fallback copy failed:', err);
      return false;
    }
  }

  // Clean 3D Water Glass Toast Notification
  function showWaterGlassToastNotification(projectLabel, url, formattedDate, textCopied) {
    // Popup notification permanently disabled as requested
    return;
    let host = document.getElementById('flow-copier-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'flow-copier-toast-host';
      host.style.cssText = 'all: initial; position: fixed; top: 24px; right: 24px; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; pointer-events: auto;';
      document.documentElement.appendChild(host);
    }

    let shadow = host.shadowRoot;
    if (!shadow) {
      shadow = host.attachShadow({ mode: 'open' });
    }

    const toast = document.createElement('div');
    toast.className = 'toast-water-glass';
    toast.innerHTML = `
      <style>
        .toast-water-glass {
          background: linear-gradient(145deg, rgba(26, 26, 36, 0.78) 0%, rgba(12, 12, 18, 0.88) 100%);
          color: #ffffff;
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-top: 1px solid rgba(255, 255, 255, 0.5);
          border-left: 5px solid #dc2626;
          border-bottom: 3px solid rgba(0, 0, 0, 0.7);
          border-radius: 14px;
          padding: 15px 18px;
          margin-bottom: 12px;
          box-shadow: 
            0 14px 35px rgba(0, 0, 0, 0.85),
            0 0 18px rgba(220, 38, 38, 0.35),
            inset 0 1px 2px rgba(255, 255, 255, 0.4);
          max-width: 410px;
          min-width: 320px;
          animation: slideInGlass 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }
        .water-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 48%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%);
          border-top-left-radius: inherit;
          border-top-right-radius: inherit;
          pointer-events: none;
        }
        @keyframes slideInGlass {
          from { opacity: 0; transform: translateX(50px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeOutGlass {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(50px); }
        }
        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          position: relative;
          z-index: 2;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .project-badge {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(153, 27, 27, 0.45) 100%);
          color: #ffffff;
          border: 1px solid rgba(248, 113, 113, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 11px;
          font-weight: 800;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.4);
        }
        .title {
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.3px;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 16px;
          padding: 0 4px;
          line-height: 1;
        }
        .close-btn:hover { color: #ffffff; }
        .url-box {
          background: rgba(8, 8, 12, 0.85);
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 11.5px;
          color: #f1f5f9;
          word-break: break-all;
          font-family: monospace;
          margin-bottom: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.9);
          position: relative;
          z-index: 2;
        }
        .meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #cbd5e1;
          margin-bottom: 12px;
          position: relative;
          z-index: 2;
        }
        .badge-success {
          color: #f87171;
          font-weight: 700;
        }
        .btn-group {
          display: flex;
          gap: 8px;
          position: relative;
          z-index: 2;
        }
        .btn-glass {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 800;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          user-select: none;
          position: relative;
          overflow: hidden;
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .btn-glass-red {
          background: linear-gradient(180deg, #f43f5e 0%, #dc2626 50%, #991b1b 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 
            0 3px 0 #500e0e,
            0 8px 16px rgba(220, 38, 38, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.7);
        }
        .btn-glass-red:active {
          transform: translateY(2px);
          box-shadow: 0 1px 0 #500e0e;
        }
        .btn-glass-black {
          background: linear-gradient(180deg, rgba(40, 40, 52, 0.9) 0%, rgba(16, 16, 24, 0.95) 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 
            0 3px 0 #050508,
            0 8px 16px rgba(0, 0, 0, 0.7),
            inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }
        .btn-glass-black:active {
          transform: translateY(2px);
          box-shadow: 0 1px 0 #050508;
        }
      </style>
      <div class="water-shine"></div>
      <div class="header-row">
        <div class="title-group">
          <span class="project-badge">${escapeHtml(projectLabel)}</span>
          <span class="title">COPIED WITH DATE & TIME</span>
        </div>
        <button class="close-btn" title="Close">✕</button>
      </div>
      <div class="url-box">${escapeHtml(url)}</div>
      <div class="meta-row">
        <span>🕒 ${escapeHtml(formattedDate)}</span>
        <span class="badge-success">✓ Formatted with ${escapeHtml(projectLabel)}</span>
      </div>
      <div class="btn-group">
        <button class="btn-glass btn-glass-red" id="toast-reload-btn" title="Click to reload this tab">
          🔄 Reload Tab
        </button>
        <button class="btn-glass btn-glass-black" id="toast-recopy-btn">
          📋 Copy Again
        </button>
      </div>
    `;

    shadow.appendChild(toast);

    const closeBtn = toast.querySelector('.close-btn');
    const reloadBtn = toast.querySelector('#toast-reload-btn');
    const recopyBtn = toast.querySelector('#toast-recopy-btn');

    function removeToast() {
      toast.style.animation = 'fadeOutGlass 0.25s forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }

    closeBtn.addEventListener('click', removeToast);

    reloadBtn.addEventListener('click', () => {
      window.location.reload();
    });

    recopyBtn.addEventListener('click', async () => {
      await copyToClipboard(textCopied);
      recopyBtn.textContent = '✓ Copied!';
      setTimeout(() => { recopyBtn.textContent = '📋 Copy Again'; }, 1500);
    });

    setTimeout(removeToast, 7000);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Handle URL change or project generation
  async function handleUrlCheck() {
    const currentUrl = window.location.href;

    if (isFlowProjectUrl(currentUrl)) {
      const cleanUrl = getCleanProjectUrl(currentUrl);
      const now = Date.now();

      if (cleanUrl === lastHandledUrl && (now - lastCopyTime) < 5000) {
        return;
      }

      lastHandledUrl = cleanUrl;
      lastCopyTime = now;

      const formattedDate = getFormattedDateTime();

      // Save to background and get assigned Project 1, Project 2...
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'SAVE_PROJECT_LINK',
          url: cleanUrl,
          formattedDate: formattedDate
        }, async (res) => {
          let projectLabel = 'Project 1';
          if (res && res.item && res.item.projectNumber) {
            projectLabel = `Project ${res.item.projectNumber}`;
          }

          const textToCopy = formatCopyString(projectLabel, cleanUrl, formattedDate);

          if (settings.autoCopyEnabled) {
            const copied = await copyToClipboard(textToCopy);
            console.log(`[Flow Copier Glass] Copied: ${textToCopy} (success=${copied})`);
            // showWaterGlassToastNotification(projectLabel, cleanUrl, formattedDate, textToCopy);
          }
        });
      }
    }
  }

  // Intercept click on links to reload on the same tab
  // "or jab link per click kro tu osi tab per link reload b ho jay"
  document.addEventListener('click', (event) => {
    if (!settings.autoReloadOnClick) return;

    const anchor = event.target.closest('a');
    if (!anchor) return;

    const href = anchor.href;
    if (href && isFlowProjectUrl(href)) {
      const cleanTargetUrl = getCleanProjectUrl(href);
      const cleanCurrentUrl = getCleanProjectUrl(window.location.href);

      event.preventDefault();
      event.stopPropagation();

      console.log(`[Flow Copier Glass] Reloading tab on project click: ${cleanTargetUrl}`);

      if (cleanCurrentUrl === cleanTargetUrl) {
        window.location.reload();
      } else {
        window.location.href = href;
      }
    }
  }, true);

  // Setup pushState & replaceState interception
  function setupHistoryListener() {
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function () {
      const result = pushState.apply(this, arguments);
      handleUrlCheck();
      return result;
    };

    history.replaceState = function () {
      const result = replaceState.apply(this, arguments);
      handleUrlCheck();
      return result;
    };

    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
  }

  // Polling check for SPAs
  function startUrlPolling() {
    setInterval(() => {
      if (window.location.href !== lastHandledUrl) {
        handleUrlCheck();
      }
    }, 600);
  }

    // Floating Google Flow Side Panel Launcher Button
  function inject3DFloatingBadge() {
    if (document.getElementById('flow-copier-page-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'flow-copier-page-pill';
    pill.title = 'PROJECTS - Click to Open Side Panel';
    pill.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483640;
      background: rgba(28, 29, 34, 0.92);
      color: #f1f3f4;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      padding: 8px 18px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.5px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 
        0 4px 18px rgba(0, 0, 0, 0.55),
        inset 0 1px 1px rgba(255, 255, 255, 0.18);
      user-select: none;
      transition: all 0.12s ease;
    `;
    pill.innerHTML = `<span style="font-size:12px;">💧</span><span>PROJECTS</span>`;

    pill.addEventListener('mouseenter', () => {
      pill.style.transform = 'translateY(-2px)';
      pill.style.background = 'rgba(38, 40, 48, 0.96)';
      pill.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      pill.style.boxShadow = '0 6px 22px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
    });

    pill.addEventListener('mouseleave', () => {
      pill.style.transform = 'translateY(0)';
      pill.style.background = 'rgba(28, 29, 34, 0.92)';
      pill.style.borderColor = 'rgba(255, 255, 255, 0.16)';
      pill.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.18)';
    });

    pill.addEventListener('mousedown', () => {
      pill.style.transform = 'translateY(1px)';
      pill.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.5)';
    });

    pill.addEventListener('mouseup', () => {
      pill.style.transform = 'translateY(-2px)';
    });

    pill.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL' });
      }
    });

    document.documentElement.appendChild(pill);
  }

  // Initialize
  
  // =========================================================================
  // CREATE WITH GOOGLE FLOW (PANEL-AUTHORIZED COOKIE INJECTION HOOK)
  // Re-injects cookies for the specific tool previously authorized from the panel!
  // If user is not logged in or no tool was selected, access is denied.
  // =========================================================================
  let isInjectingVTenCookies = false;

  function isCreateWithFlowButton(el) {
    if (!el) return false;
    const label = (el.getAttribute('aria-label') || '').toLowerCase();
    const text = (el.textContent || '').toLowerCase().trim();
    return label.includes('create with google flow') || 
           text.includes('create with google flow') ||
           (text === 'create with flow');
  }

  function triggerVTenCookieInjection(triggerElement) {
    if (isInjectingVTenCookies) return;
    isInjectingVTenCookies = true;

    const textSpan = triggerElement ? (triggerElement.querySelector('.button-text') || triggerElement) : null;
    const originalText = textSpan ? textSpan.innerHTML : '';

    // Check if user has an authorized active tool from panel
    chrome.storage.local.get(['lastActiveToolId', 'isPanelAuthorized', 'isPanelLoggedIn'], (data) => {
      const toolId = data.lastActiveToolId;
      const isAuthorized = data.isPanelAuthorized;
      const isLoggedIn = data.isPanelLoggedIn;

      // 1. STRICT CHECK: Must be logged in and have selected a tool from the panel!
      if (!isAuthorized || !toolId || isLoggedIn === false) {
        console.warn('[CreatorTools] Access Denied: User has not logged into panel or selected a tool.');
        if (textSpan) {
          textSpan.innerHTML = '🔒 Login to Panel First';
        }
        if (triggerElement) {
          triggerElement.style.pointerEvents = 'auto';
          triggerElement.style.opacity = '1';
        }

        alert('Access Restricted: Please log in to your CreatorTools dashboard (app.creatortools.pro) and select your Veo tool first!');
        window.location.href = 'https://app.creatortools.pro/member';
        isInjectingVTenCookies = false;
        return;
      }

      // 2. User is authorized for specific tool (e.g. VTen, VNine)!
      console.log(`[CreatorTools] Authorized session detected for: ${toolId}. Injecting cookies...`);
      if (textSpan) {
        textSpan.innerHTML = `⚡ Refreshing ${toolId} Access...`;
      }
      if (triggerElement) {
        triggerElement.style.transition = 'all 0.2s ease';
        triggerElement.style.opacity = '0.85';
        triggerElement.style.pointerEvents = 'none';
      }

      // Call background service worker to fetch cookies for THIS specific tool
      chrome.runtime.sendMessage({ 
        action: 'INJECT_FLOW_COOKIES', 
        toolId: toolId 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[CreatorTools] Injection error:', chrome.runtime.lastError);
        }

        if (response && response.success) {
          console.log(`[CreatorTools] ${toolId} cookies injected! Redirecting...`);
          if (textSpan) {
            textSpan.innerHTML = `✓ ${toolId} Connected! Opening Flow...`;
          }
          setTimeout(() => {
            window.location.href = response.url || 'https://flow.google.com';
          }, 800);
        } else if (response && response.requireLogin) {
          if (textSpan) {
            textSpan.innerHTML = '🔒 Login Required';
          }
          alert('Session expired: Please log in to your CreatorTools dashboard to activate this tool.');
          window.location.href = 'https://app.creatortools.pro/login';
          isInjectingVTenCookies = false;
        } else {
          console.warn('[CreatorTools] Injection failed, fallback:', response);
          if (textSpan) {
            textSpan.innerHTML = '🔄 Opening Flow...';
          }
          setTimeout(() => {
            window.location.href = 'https://flow.google.com';
          }, 1200);
        }
      });
    });
  }

  function setupCreateWithFlowHook() {
    // 1. Document-level capture click listener (intercepts before Angular/native navigation)
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;

      const candidate = target.closest('flow-button, button, a, [role="button"]');
      if (candidate && isCreateWithFlowButton(candidate)) {
        console.log('[CreatorTools] Intercepted click on "Create with Google Flow"');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        triggerVTenCookieInjection(candidate);
      }
    }, true);

    // 2. DOM Scanner to enhance button title
    function scanButtons() {
      const elements = document.querySelectorAll('flow-button, button, a, [role="button"]');
      elements.forEach(el => {
        if (isCreateWithFlowButton(el)) {
          if (!el.dataset.vtenHooked) {
            el.dataset.vtenHooked = 'true';
            chrome.storage.local.get(['lastActiveToolId', 'isPanelAuthorized'], (data) => {
              if (data.isPanelAuthorized && data.lastActiveToolId) {
                el.title = `CreatorTools (${data.lastActiveToolId}) - Click to restore access`;
              } else {
                el.title = 'CreatorTools - Login to dashboard required';
              }
            });
          }
        }
      });
    }

    scanButtons();
    setInterval(scanButtons, 1200);

    try {
      const obs = new MutationObserver(() => scanButtons());
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  function init() {
    setupCreateWithFlowHook();
    setupHistoryListener();
    startUrlPolling();
    handleUrlCheck();
    setTimeout(inject3DFloatingBadge, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
