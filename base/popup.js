/**
 * CREATOR TOOLS (Clean) — base/popup.js
 * Clean-rewritten 2026-10-01.
 *
 * REMOVED (sandbox-verified in the original obfuscated source):
 *  1. The obfuscator.io anti-debug self-defending preamble (debug-protection IIFE
 *     built around the Function-toString comparison identifiers _0x135f4a/_0x33fed9,
 *     plus its string-array/shuffle/decoder machinery). It breaks under devtools
 *     and serves no legitimate purpose, so the whole obfuscation layer was dropped.
 *  2. The `#clearBtn` click handler that called
 *     chrome.browsingData.remove({ since: 0 }, { cookies: true }). That call wipes
 *     ALL browser cookies (every site, every session), not just the vendor's, so
 *     the button itself is being removed from popup.html (separate worker).
 *
 * Nothing benign remained in the original file: after removing the two items
 * above there was no vendor "Login to Account?" link wiring or any other logic
 * left in popup.js, so this file is intentionally inert (header only).
 * If popup UI behavior is needed later, add it here in plain, readable JS.
 */
