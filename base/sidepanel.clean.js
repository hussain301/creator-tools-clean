// 3D Water Glass Side Panel Controller with Real-Time Auto Project Update

document.addEventListener('DOMContentLoaded', async () => {
  const currentUrlEl = document.getElementById('current-tab-url');
  const projectNumberBadge = document.getElementById('project-number-badge');
  const currentTabActions = document.getElementById('current-tab-actions');
  const btnCopyCurrent = document.getElementById('btn-copy-current');
  const btnCopyCurrentLabel = document.getElementById('btn-copy-current-label');
  const btnReloadCurrent = document.getElementById('btn-reload-current');

  const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
  const settingsBody = document.getElementById('settings-body');
  const settingsArrow = document.getElementById('settings-arrow');

  const toggleAutoCopy = document.getElementById('toggle-autocopy');
  const toggleAutoReload = document.getElementById('toggle-autoreload');
  const selectFormat = document.getElementById('select-format');

  const historyListEl = document.getElementById('history-list');
  const historyCountEl = document.getElementById('history-count');
  const btnCopyAll = document.getElementById('btn-copy-all');
  const btnClearAll = document.getElementById('btn-clear-all');
  const btnOpenFlow = document.getElementById('btn-open-flow');
  const toastEl = document.getElementById('toast-message');

  let activeTab = null;
  let currentProjectNumber = 1;
  let lastRecordedUrl = null;

  // Show 3D water glass toast
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2200);
  }

  // Format Date & Time
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

  // Clean project URL
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

  // Format link string with Project 1, Project 2...
  function formatCopyString(projectLabel, url, formattedDate, style = 'standard') {
    if (style === 'date_first') {
      return `[${formattedDate}] ${projectLabel}: ${url}`;
    } else if (style === 'multiline') {
      return `${projectLabel}\nLink: ${url}\nGenerated: ${formattedDate}`;
    } else if (style === 'simple') {
      return `${projectLabel} - ${url}`;
    }
    return `${projectLabel}: ${url} [${formattedDate}]`;
  }

  // Check Active Tab in Browser and Auto-Save New Projects
  async function refreshActiveTabInfo() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        activeTab = tabs[0];
        const rawUrl = activeTab.url || '';
        const isProjectMatch = /^https?:\/\/(?:flow\.google\.com|labs\.google\/flow)\/project\/[a-zA-Z0-9_\-]+/i.test(rawUrl);

        if (isProjectMatch) {
          const cleanUrl = getCleanProjectUrl(rawUrl);
          const data = await chrome.storage.local.get(['flowLinkHistory', 'projectCounter', 'autoCopyEnabled', 'formatStyle']);
          const history = data.flowLinkHistory || [];
          const found = history.find(item => item.url === cleanUrl);

          if (found && found.projectNumber) {
            currentProjectNumber = found.projectNumber;
          } else {
            // NEW PROJECT DETECTED!
            // Automatically save it to history immediately!
            const dateStr = getFormattedDateTime();
            const savedItem = await new Promise(resolve => {
              chrome.runtime.sendMessage({
                action: 'SAVE_PROJECT_LINK',
                url: cleanUrl,
                formattedDate: dateStr
              }, res => resolve(res ? res.item : null));
            });

            if (savedItem && savedItem.projectNumber) {
              currentProjectNumber = savedItem.projectNumber;
            } else {
              currentProjectNumber = (data.projectCounter || history.length) + 1;
            }

            // Auto copy to clipboard if new
            if (cleanUrl !== lastRecordedUrl && data.autoCopyEnabled !== false) {
              lastRecordedUrl = cleanUrl;
              const formatStyle = data.formatStyle || 'standard';
              const textToCopy = formatCopyString(`Project ${currentProjectNumber}`, cleanUrl, dateStr, formatStyle);
              navigator.clipboard.writeText(textToCopy).catch(() => {});
            }

            // Re-render history list immediately!
            await loadHistory();
          }

          const label = `Project ${currentProjectNumber}`;
          projectNumberBadge.textContent = label.toUpperCase();
          projectNumberBadge.style.display = 'inline-block';
          currentUrlEl.textContent = cleanUrl;
          btnCopyCurrentLabel.textContent = `Copy ${label} + Date/Time`;
          currentTabActions.style.display = 'flex';
        } else if (rawUrl.includes('flow.google.com') || rawUrl.includes('labs.google/flow')) {
          projectNumberBadge.textContent = 'FLOW HOME';
          currentUrlEl.textContent = 'On Flow (Open or generate a project)';
          currentTabActions.style.display = 'none';
        } else {
          projectNumberBadge.textContent = 'OTHER TAB';
          currentUrlEl.textContent = 'Active tab is not Google Flow';
          currentTabActions.style.display = 'none';
        }
      }
    } catch (e) {
      console.error('Error refreshing active tab:', e);
    }
  }

  // Track tab changes in real-time
  chrome.tabs.onActivated.addListener(() => refreshActiveTabInfo());
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (activeTab && tabId === activeTab.id) {
      refreshActiveTabInfo();
    }
  });

  // Listen to storage changes to update history list live
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && (changes.flowLinkHistory || changes.projectCounter)) {
      loadHistory();
    }
  });

  // Periodic polling every 1 second to catch SPA navigation on Google Flow
  setInterval(() => {
    refreshActiveTabInfo();
  }, 1000);

  // Copy Current Tab URL
  btnCopyCurrent.addEventListener('click', async () => {
    if (!activeTab || !activeTab.url) return;
    const cleanUrl = getCleanProjectUrl(activeTab.url);
    const dateStr = getFormattedDateTime();
    const formatStyle = (selectFormat && selectFormat.value) ? selectFormat.value : 'standard';
    const projectLabel = `Project ${currentProjectNumber}`;
    const textToCopy = formatCopyString(projectLabel, cleanUrl, dateStr, formatStyle);

    await navigator.clipboard.writeText(textToCopy);
    showToast(`✓ Copied ${projectLabel} with Date & Time!`);

    chrome.runtime.sendMessage({
      action: 'SAVE_PROJECT_LINK',
      url: cleanUrl,
      formattedDate: dateStr
    }, () => {
      loadHistory();
      refreshActiveTabInfo();
    });
  });

  // Reload current active tab
  btnReloadCurrent.addEventListener('click', () => {
    if (activeTab && activeTab.id) {
      chrome.tabs.reload(activeTab.id, { bypassCache: true });
      showToast('🔄 Reloading Flow Tab...');
    }
  });

  // Open Flow
  btnOpenFlow.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://chat.whatsapp.com/LgfJNFkXieTJXTVCdYtvJx' });
  });

  // Settings handlers (if visible)
  if (toggleSettingsBtn && settingsBody) {
    toggleSettingsBtn.addEventListener('click', () => {
      settingsBody.classList.toggle('hidden');
      if (settingsArrow) settingsArrow.classList.toggle('collapsed');
    });
  }

  chrome.storage.local.get(['autoCopyEnabled', 'autoReloadOnClick', 'formatStyle'], (res) => {
    if (toggleAutoCopy) toggleAutoCopy.checked = res.autoCopyEnabled !== false;
    if (toggleAutoReload) toggleAutoReload.checked = res.autoReloadOnClick !== false;
    if (selectFormat && res.formatStyle) selectFormat.value = res.formatStyle;
  });

  if (toggleAutoCopy) {
    toggleAutoCopy.addEventListener('change', () => {
      chrome.storage.local.set({ autoCopyEnabled: toggleAutoCopy.checked });
    });
  }

  if (toggleAutoReload) {
    toggleAutoReload.addEventListener('change', () => {
      chrome.storage.local.set({ autoReloadOnClick: toggleAutoReload.checked });
    });
  }

  if (selectFormat) {
    selectFormat.addEventListener('change', () => {
      chrome.storage.local.set({ formatStyle: selectFormat.value });
    });
  }

  // Load History List
  async function loadHistory() {
    const data = await chrome.storage.local.get(['flowLinkHistory', 'formatStyle']);
    const history = data.flowLinkHistory || [];
    const style = data.formatStyle || 'standard';

    historyCountEl.textContent = history.length;

    if (history.length === 0) {
      historyListEl.innerHTML = `
        <div class="empty-state-glass">
          <div class="empty-icon">💎</div>
          <div class="empty-title">No Projects Recorded</div>
          <div class="empty-subtitle">When links are generated on flow.google.com, they will appear here as Project 1, Project 2... with Date & Time.</div>
        </div>
      `;
      return;
    }

    historyListEl.innerHTML = '';
    history.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'history-project-card';

      const projectNum = item.projectNumber || (history.length - index);
      const projectLabel = `Project ${projectNum}`;
      const displayUrl = item.url.replace(/^https?:\/\//, '');

      card.innerHTML = `
        <div class="history-top-bar">
          <span class="project-label-badge">${escapeHtml(projectLabel)}</span>
          <span class="history-link-glass" title="Click to open and reload in current tab">${escapeHtml(displayUrl)}</span>
          <div class="history-action-icons">
            <button class="btn-icon-glass btn-copy-single" title="Copy ${projectLabel} + Date">📋</button>
            <button class="btn-icon-glass text-danger btn-delete-single" title="Delete project">🗑️</button>
          </div>
        </div>
        <div class="history-meta-bar">
          <span class="time-tag">🕒 ${escapeHtml(item.formattedDate)}</span>
          <span class="reload-pill-glass">Click reloads tab 🔄</span>
        </div>
      `;

      // Click on link opens and reloads current active tab
      const linkEl = card.querySelector('.history-link-glass');
      linkEl.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: 'OPEN_AND_RELOAD_TAB',
          url: item.url
        });
        showToast(`🔄 Opening & Reloading ${projectLabel}...`);
      });

      // Copy single project button
      const copyBtn = card.querySelector('.btn-copy-single');
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const copyText = formatCopyString(projectLabel, item.url, item.formattedDate, style);
        await navigator.clipboard.writeText(copyText);
        showToast(`✓ Copied ${projectLabel}!`);
      });

      // Delete single project button
      const deleteBtn = card.querySelector('.btn-delete-single');
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        history.splice(index, 1);
        await chrome.storage.local.set({ flowLinkHistory: history });
        loadHistory();
      });

      historyListEl.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Copy All button
  btnCopyAll.addEventListener('click', async () => {
    const data = await chrome.storage.local.get(['flowLinkHistory', 'formatStyle']);
    const history = data.flowLinkHistory || [];
    const style = data.formatStyle || 'standard';

    if (history.length === 0) {
      showToast('No projects to copy');
      return;
    }

    const allText = history.map((item, index) => {
      const projectNum = item.projectNumber || (history.length - index);
      const projectLabel = `Project ${projectNum}`;
      return formatCopyString(projectLabel, item.url, item.formattedDate, style);
    }).join('\n');

    await navigator.clipboard.writeText(allText);
    showToast(`✓ Copied ${history.length} projects!`);
  });

  // Clear All button
  btnClearAll.addEventListener('click', async () => {
    if (confirm('Clear all recorded Flow projects history?')) {
      await chrome.storage.local.set({ flowLinkHistory: [], projectCounter: 0 });
      loadHistory();
      refreshActiveTabInfo();
      showToast('History Cleared');
    }
  });

  // Real-time listener for incoming links
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'HISTORY_UPDATED') {
      loadHistory();
      refreshActiveTabInfo();
    }
  });

  // Initial calls
  refreshActiveTabInfo();
  loadHistory();
});


  // Header WhatsApp button
  const btnWhatsappHeader = document.getElementById('btn-whatsapp-header');
  if (btnWhatsappHeader) {
    btnWhatsappHeader.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://chat.whatsapp.com/LgfJNFkXieTJXTVCdYtvJx' });
    });
  }
