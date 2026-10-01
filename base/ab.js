// ab.js — STUB (2026-10-01)
// CreatorTools (Clean rebuild): original content script fully removed.
//
// The original 44 KB file was heavily obfuscated (obfuscator.io: RC4+base64
// string table with rotation, split string tables, index remapping). A full
// deobfuscation + audit was performed 2026-10-01. It contained NO legitimate
// feature. Everything it did was hostile or anti-analysis, so the file is
// replaced with this comment-only stub. Nothing is loaded; the script is inert.
//
// Removed behavior (verified from decoded code, not assumed):
//
// 1. Google login-page UI tampering (ran on any *.google.com page; injected at
//    document_start on accounts.google.com):
//    - Injected <style id="hide-google-auth-elements-style"> plus inline styles
//      hiding the "Show password" checkbox and its row
//      (div[jsname="wQnmvb"], div.sfqPrd, div#selectionc1, div[id^="selectionc"],
//      input[type="checkbox"][aria-labelledby*="selectionc"]).
//    - Hid "Forgot password" links/buttons/containers
//      (#forgotPassword, div[jsname="e8SUOb"], a[href*="signin/recovery"],
//      a[href*="/recovery"], aria-label matches), including text-content
//      scanning of div/span/label/button/a for "forgot password" /
//      "show password" text and hiding their ancestors.
//    - Installed a MutationObserver on every input[type="password"] that forced
//      the type attribute back to "password" if anything changed it — the user
//      could never reveal their typed password.
//    - Re-applied all of the above on every DOM mutation via a MutationObserver
//      on documentElement (childList + subtree).
//    Why removed: it degrades the security of the Google sign-in flow
//    (suppresses "Forgot password" account recovery and the show-password
//    visibility control) with no user benefit; there is no legitimate
//    extension feature here.
//
// 2. Broken "promo watermark" injector: on semrush.com, leonardo.com/.ai,
//    udemy.com, grammarly.com, envato.com, canva.com, chat.openai.com, moz.com,
//    ubersuggest.com, wordai.com, netflix.com, primevideo.com, skillshare.com,
//    mangools.com, woorank.com, piktochart.com, serpstat.com, wordtracker.com,
//    majestic.com, app.neilpatel.com, ahrefs.com, designai.com, quillbot.com it
//    tried to append a fixed-position promo div ("tortools.p", "You are using
//    service f crea... Note"). Verified it crashes at runtime (its obfuscated
//    document[...] call resolves to a non-function property, throwing a
//    TypeError before anything is inserted). Hostile intent, broken execution.
//    Why removed: unauthorized DOM injection / branding on third-party sites;
//    not a legitimate feature.
//
// 3. Anti-debug / anti-analysis scaffolding:
//    - Debugger-detection class embedded in the string decoder (function-source
//      regex test "\w+\s*\(\s*\)\s*\{\w+\s*..." plus \x0a toString check;
//      short-circuited to inert in this build).
//    - A self-defending wrapper (_0x4ec5a8) around the auth-tampering installer
//      that only lets the wrapped function run once and disables re-runs.
//    - A catastrophic-backtracking regex search ("(((.+)+)+)+$") executed in
//      the hide routine whose result is unused (CPU trap on matching pages).
//    Why removed: anti-analysis code has no place in a clean rebuild.
//
// Negative findings (verified on the fully decoded body): no network activity
// at all (no http/https strings, fetch, XHR, sendBeacon, WebSocket, postMessage,
// chrome.* API calls), no cookie/storage reads, no .value / password-value
// capture, no input listeners, no exfiltration of any kind. The file read
// textContent only to decide what login UI to hide.
//
// NOTE for the clean manifest: this stub is intentionally inert. The
// original manifest registered ab.js for https://accounts.google.com/* at
// document_start and for *://*/* at document_idle; the coordinator may drop
// those registrations entirely now that the file is a no-op.
