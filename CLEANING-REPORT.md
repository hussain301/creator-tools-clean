# CLEANING REPORT — CreatorTools (Clean) / CreatorTools Pro (Clean)

**Date:** 2026-10-01
**Sources (read-only, never modified):** `~/workspace/creator-tools-analysis/base/` (CREATOR TOOLS v35.0) and `~/workspace/creator-tools-analysis/pro/` (CREATOR TOOLS PRO v1.1)
**Output:** `~/workspace/creator-tools-clean/base/` and `~/workspace/creator-tools-clean/pro/` — complete, loadable MV3 extension directories.
**Method:** full static analysis (6 auditor agents; obfuscator.io string-tables decoded in Node sandboxes, 0 unresolved call sites), then surgical removals by 13 writer agents. Every edited file carries a dated header comment describing what was removed and why.

**Amendment (2026-10-01, user instruction):** the `" (Clean)"` name suffix added to both manifests during the build was reverted. Both `manifest.json` files are now byte-identical to the originals in `name` and `version` (`CREATOR TOOLS` / `35.0`, `CREATOR TOOLS PRO` / `1.1`); nothing else in the manifests was touched. References below to the `" (Clean)"` suffix describe the build-time state, not the final state.

**Headline:** the base extension kept its legitimate product features (cookie-injection service, project history, side panel, copy formats, floating launcher, panel auth); the pro extension had **zero** legitimate features in its audited UI files — its background worker was rewritten clean around its only two legitimate behaviors.

---

## 1. BASE — CREATOR TOOLS (Clean) v35.0

### Feature inventory with verdicts

| File | Feature | Verdict | Notes |
|---|---|---|---|
| manifest.json | Extension wiring | KEEP (name → "CREATOR TOOLS (Clean)") | References obfuscated originals everywhere; `.clean.js` files are unreferenced dead code (kept in tree, inert) |
| md.js (service worker) | `importScripts('flow-copier-background.js')` bootstrap | KEEP | |
| md.js | Cookie-injection `chrome.runtime.onMessage` handler ("Targeting Latest Saved Flow Project Link" / "Inject all cookies") | KEEP | Vendor's own backend product flow: accepts cookie list + URL, `chrome.cookies.set`, opens/reloads latest saved Flow project tab |
| md.js | `wipeAllCookies()` — triple cookie wipe + forced tab reloads | REMOVE | Cookie kill-switch |
| md.js | Extension-B cross-protection (`isTargetExtensionB`, `trackExtensionB`, force re-enable at 50/200/600ms, wipe if Pro missing/uninstalled; 1-min alarm + 1.5s interval + onUninstalled/onDisabled) | REMOVE | Anti-competition + kill-switch |
| md.js | `enforceOnlyAllowedExtensions()` — every 3s disables + silently uninstalls (`showConfirmDialog:false`) every non-allowlisted extension | REMOVE | Silent mass-uninstall |
| md.js | Obfuscated "CORE EXTENSION INITIALIZATION" (`t3r8n`/`d5m1k`/`h6f2q`, `checkForThreats()` + `prohibitedKeywords` extension-name scan) | REMOVE | Anti-competition scan |
| md.js | `blockedPrefixes`/`blockedDomains` + `checkAndBlockTab()` closing `chrome://extensions`, `chrome://settings`, `chrome://password-manager`, `edge://*`, webstore URLs, ~30 Google domains | REMOVE | Anti-removal tab blocking |
| popup.js | Anti-debug preamble (obfuscator.io debug-protection, Function-toString check) | REMOVE | Anti-debug |
| popup.js | `#clearBtn` → `browsingData.remove({"since":0},{"cookies":true})` wipes ALL cookies | REMOVE | Cookie kill-switch; file is now a comment-only stub (no benign logic remained) |
| popup.html | `#clearBtn` button + its styles | REMOVE | Button for the wipe above |
| popup.html | "Login to Account?" link → `https://app.creatortools.pro/member` | KEEP | Vendor's own site |
| sidepanel.html/css/js | Flow project tracker: active-tab watcher, auto-save to `storage.local` history (Project no. + timestamp), 1s SPA-nav polling, history UI (copy/delete/Copy All/Clear All with confirm), copy-current with format styles, tab reload bypassCache, settings toggles, `HISTORY_UPDATED` live refresh, WhatsApp community links | KEEP (all) | Legitimate product functionality; no changes needed |
| panel-auth-content.js | Vendor panel auth tracker: login-state via URL path, tool-auth via `postMessage` (`ACCESS_TOOL_TRIGGER`/`inject_cookies`) and button clicks | KEEP | Vendor's own backend integration |
| flow-copier-background.js | Side-panel wiring, `isFlowProjectUrl`, project history (150-cap, dedupe, `HISTORY_UPDATED`), tab handlers, `INJECT_FLOW_COOKIES`/`INJECT_VTEN_COOKIES` (fetch from `dashboard.creatortools.pro/dist/php/custom.php?website=<toolId>`, gated on `isPanelAuthorized`+`lastActiveToolId`+`isPanelLoggedIn`), `onInstalled` defaults | KEEP (all) | Fully deobfuscated + verified: nothing deceptive; `.clean.js` is a faithful deobfuscation |
| flow-copier-content.js | Settings sync, 4 copy-format variants, clipboard + fallback, `escapeHtml`, URL check/dedupe, click interceptor, SPA tracking (pushState/hashchange/600ms poll), floating "💧 PROJECTS" pill, "Create with Google Flow" button hook → `INJECT_FLOW_COOKIES` | KEEP (all) | Fully deobfuscated + verified |
| shh.js | Anti-debug IIFE (`debugger;` + Date.now trap → `about:blank`, re-armed on interval); `waitForButton()` (reads `document.cookie`/sessionStorage, `sendMessage`, auto-clicks page buttons); `triggerEmergencyWipe()` (reads cookies/sessions, beacons to vendor PHP endpoint, clicks logout elements, hides Flow account-panel buttons, reloads); `purgeFlowSignout()` (hides all sign-out elements, MutationObserver + interval + click interception); WATCHDOG interval driving the wipe; PHP beacon; `postMessage` bridge | REMOVE ENTIRELY | Stubbed — no legitimate standalone feature found |
| ab.js | Google sign-in UI tampering (hides "Show password"/"Forgot password", forces password fields to stay masked, MutationObserver re-application, document_start on accounts.google.com); broken promo-watermark injector (crashes); anti-debug scaffolding (decoder toString checks, once-only wrapper, regex CPU trap) | REMOVE ENTIRELY | Stubbed — no legitimate feature; verified zero credential capture / zero network activity |
| sd.js | Anti-competition URL blocker: 815 URL patterns / 287 domains (competitor resellers + legitimate SaaS account pages) → `location.replace("https://app.creatortools.pro/member")`, with pushState overrides, click interceptor, 500ms watcher | REMOVE ENTIRELY | Stubbed — purely a redirector |
| aa.js | (1) Visited-domain beacon (base64 domain → background on every page load); (2) auto-login with vendor credentials on vidiq/quillbot/turnitin; (3) logout/account/upgrade UI hiding on 95 domains (+ hiding plan-limit UI, "Remove My Account" buttons); (4) Grammarly logout-button remover; (5) chatgpt.com account-button eradicator; (6) anti-debug + devtools detection (50ms outerWidth/Height + `debugger;` 2s interval → `x93939` message) | REMOVE ENTIRELY | Stubbed — no legitimate feature |

### Removals applied (base/)
- `md.js`: cut source lines 8–180 (wipeAllCookies + Extension-B protection), 182–232 (purge loop), line 236 obfuscated middle (`t3r8n`/`d5m1k`/`h6f2q`/`checkForThreats`), 325–437 (blockedPrefixes/blockedDomains/checkAndBlockTab). Kept byte-identical: `importScripts` bootstrap, string-table decoder (needed by kept handler; hostile strings inside are inert data), cookie-injection `onMessage` handler (verified `chrome.runtime.onMessage.addListener` at runtime).
- `popup.js` → comment-only stub (anti-debug preamble + clear-cookies wipe removed; nothing benign remained).
- `popup.html`: `#clearBtn` button + its CSS rules removed.
- `shh.js`, `ab.js`, `sd.js`, `aa.js` → comment-only stubs (each header lists what was removed and why).
- `manifest.json`: name → "CREATOR TOOLS (Clean)". Nothing else changed.

---

## 2. PRO — CREATOR TOOLS PRO (Clean) v1.1

### Feature inventory with verdicts

| File | Feature | Verdict | Notes |
|---|---|---|---|
| manifest.json | Extension wiring | KEEP (name → "CREATOR TOOLS PRO (Clean)") | Nothing else changed |
| background.js | `killFlowTabsIfNoAccess()`: closes flow.google.com tabs only when the host permission is not granted; re-runs on `permissions.onRemoved` | KEEP | Rewritten clean (was obfuscated) |
| background.js | Single-Flow-tab enforcer (`tabs.onUpdated` → dedupe flow tabs, focus survivor) | KEEP | Rewritten clean (was obfuscated) |
| background.js | `wipeAllCookies()` kill-switch (browsingData.removeCookies + remove + per-cookie remove + reload all tabs) | REMOVE | |
| background.js | `trackExtensionA()` companion guard + 1.5s interval + 1-min `checkExtensionAAlarm` + `onUninstalled`/`onDisabled` → wipe/force re-enable | REMOVE | |
| background.js | `enforceOnlyAllowedExtensions()` 3s purge loop (disable + silent uninstall of third-party extensions) + onInstalled/onEnabled wiring | REMOVE | |
| background.js | `BLOCKED_URL_PREFIXES` + `blockRestrictedPages()` (closes chrome://extensions/settings/password-manager, edge://*, webstore tabs) | REMOVE | |
| background.js | `saveExtensionTwoId` / `trackExtensionA` v2 / `reloadAllTabs` / deceptive log-only handlers / dead `![] &&` branches | REMOVE | |
| background.js | `downloads.onDeterminingFilename`: `*1080p*.mp4` → `*4k*.mp4` filename-only rename | REMOVE | Deceptive quality mislabeling |
| content.js | 1.5s `EXTENSION_CHECK` presence beacon to all pages (`'*'` targetOrigin); anti-tamper boilerplate | REMOVE ENTIRELY | Stubbed — zero legitimate features |
| core_module.js | F1 fake-credit ledger (`fakeBalance=45000`, per-model fake costs); F2 fake-credit CSS injection (blanks real balances, fabricates "Google Ultra Plan 20x"); F3 hidden sign-out (CSS + `purgeSignoutElements` every 50ms); F4 automated setup hijack (synthetic UI operation, fake "Veo 3.1 - Lite" overlay); F5 model-downgrade click interceptor; F6 "4K Upscaled"→1080p click redirect + suppressed credit warnings; F7 fake deduction engine; F8 Enter/submit hijack; F9 fullscreen blur click-funnel; F10 UI suppression (Manage subscription, Add AI credits, Agent buttons, Extend options…); F11 `simulateClick()` synthetic-input engine; F12 anti-debug IIFE (`debugger;` → `about:blank` on 1.5s interval) | REMOVE ENTIRELY | Stubbed — zero legitimate features; verified zero network exfiltration in this file |
| md.js | Dead code (not in manifest): dormant kill-switch (disable "New CreatorTools Two", wipe cookies on rival uninstall/disable) | REMOVE ENTIRELY | Stubbed as precaution |
| popup.js | Dead code (popup.html has no `<script>` tag — never executes); not fully decoded | REMOVE ENTIRELY | Stubbed as precaution |
| popup.html | WhatsApp support text + `03193533420` | KEEP | Benign, unchanged |

### Removals applied (pro/)
- `background.js`: **rewritten clean** (5,707 bytes, was 79,252 obfuscated) — implements only the two kept features in readable code; uses only `chrome.permissions`/`runtime`/`tabs`/`windows`. All hostile machinery gone (no `management`/`browsingData`/`downloads`/`cookies` usage, no network calls).
- `content.js`, `core_module.js`, `md.js`, `popup.js` → comment-only stubs (headers list removed feature classes).
- `manifest.json`: name → "CREATOR TOOLS PRO (Clean)". Nothing else changed.

---

## 3. Validation (Phase 4)

- `node --check` on **every** `.js` file in both trees: **ALL PASS**.
- `manifest.json` (both): JSON parses; names/versions are byte-identical to the originals — "CREATOR TOOLS" / 35.0 and "CREATOR TOOLS PRO" / 1.1 (the build-time `" (Clean)"` suffix was reverted per user instruction).
- Anti-debug sweep (`debugger;`, devtools detection, F12/keyCode-123, contextmenu blocks): **zero live-code hits** — the only matches are inside stub header comments documenting the removals.
- Hostile-marker sweep (`wipeAllCookies`, `Kill-Switch`, `enforceOnlyAllowedExtensions`, `blockRestrictedPages`, `checkAndBlockTab`, `isTargetExtension*`, `trackExtension*`, `fakeBalance`, `creditMap`, `onDeterminingFilename`, `showConfirmDialog:false`): **zero live-code hits**.
- `chrome.management` / `chrome.browsingData` / `chrome.downloads`: **zero live usage** in either tree.
- Dated (2026-10-01) header comments present in all 12 edited files.
- Removed from tree: `base/icons/.DS_Store` (macOS junk). Not copied: `*.bak` files, root `.DS_Store` (inert backups, excluded for a clean build).

## 4. Ambiguous calls & caveats

1. **Vendor cookie-injection kept (base):** `INJECT_FLOW_COOKIES`/`INJECT_VTEN_COOKIES` fetch session cookies from the vendor's own backend (`dashboard.creatortools.pro`) and inject them — kept per the "vendor's own backend API calls are not deception" rule. Caveat: the handlers have **no sender/origin allowlist** (gated only on `storage.local` flags `isPanelAuthorized`/`lastActiveToolId`/`isPanelLoggedIn`); the shared-account model means all users share one Google identity (ToS/account-flag risk). Flagged, functionality kept.
2. **Manifest permissions unchanged:** both clean manifests still declare broad permissions (`management`, `browsingData`, `cookies`, `<all_urls>`, `webRequest`, …) although no live code now uses `management`/`browsingData`/`downloads`/`webRequest`. Per instructions only the `name` field was changed. Recommend trimming unused permissions in a follow-up pass.
3. **Stubbed-but-referenced files:** `shh.js`, `ab.js`, `sd.js`, `aa.js` (base) and `content.js`, `core_module.js` (pro) are still referenced by their manifests but are now inert comment-only stubs — intentional, since manifests were frozen except for the name.
4. **`pro/popup.html`** kept as-is (only a WhatsApp support number) — benign.
5. **`.clean.js` files (base):** unreferenced dead code from an earlier pass, kept in the tree as shipped; verified faithful deobfuscations with nothing deceptive in them.
6. **panel-auth-content.js `postMessage` listener** accepts `inject_cookies` from any frame on the vendor's own domain — the vendor's design, kept; noted, not an external hole.
7. Static analysis only — no runtime/network testing was performed on the clean builds.
