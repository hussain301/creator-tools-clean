// CreatorTools Panel Authentication & Tool Tracking Script
(() => {
  console.log('[CreatorTools Panel Tracker] Initialized on:', window.location.href);

  function checkLoginState() {
    try {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/login')) {
        chrome.storage.local.set({ isPanelLoggedIn: false });
        console.log('[CreatorTools Panel Tracker] On login page, marked logged out.');
      } else if (path.includes('/member') || path.includes('/content/')) {
        chrome.storage.local.set({ isPanelLoggedIn: true });
        console.log('[CreatorTools Panel Tracker] On member/content page, marked logged in.');
      }
    } catch (e) {}
  }

  checkLoginState();
  window.addEventListener('popstate', checkLoginState);

  // 1. Capture toolId from window.postMessage (ACCESS_TOOL_TRIGGER)
  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'ACCESS_TOOL_TRIGGER' || data.action === 'inject_cookies') {
      const toolId = data.toolId || 'VTen';
      chrome.storage.local.set({
        lastActiveToolId: toolId,
        isPanelAuthorized: true,
        isPanelLoggedIn: true,
        authorizedTimestamp: Date.now()
      });
      console.log('[CreatorTools Panel Tracker] Tool authorized via postMessage:', toolId);
    }
  });

  // 2. Capture toolId from button clicks (e.g. #VTenCookies, #VNineCookies, etc.)
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest('button, a, [role="button"]');
    if (!btn) return;

    let toolId = null;
    const btnId = btn.id || '';
    if (btnId.includes('Cookies')) {
      toolId = btnId.replace('Cookies', '').trim();
    } else {
      const text = (btn.textContent || '').trim();
      const match = text.match(/access\s+(v(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)|veo\s*\w+)/i);
      if (match) {
        toolId = match[1].replace(/\s+/g, '');
      }
    }

    if (toolId) {
      chrome.storage.local.set({
        lastActiveToolId: toolId,
        isPanelAuthorized: true,
        isPanelLoggedIn: true,
        authorizedTimestamp: Date.now()
      });
      console.log('[CreatorTools Panel Tracker] Tool authorized via click:', toolId);
    }

    // Clear authorization on Logout
    const textLower = (btn.textContent || '').toLowerCase();
    if (textLower.includes('logout') || (btn.getAttribute('href') || '').toLowerCase().includes('logout')) {
      chrome.storage.local.set({
        lastActiveToolId: null,
        isPanelAuthorized: false,
        isPanelLoggedIn: false
      });
      console.log('[CreatorTools Panel Tracker] User logged out, cleared authorization.');
    }
  }, true);
})();
