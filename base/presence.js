/*
 * CREATOR TOOLS — presence.js (detection-only beacon)
 *
 * Added: 2026-10-01 (clean rebuild follow-up, per user request)
 *
 * Purpose: announce this extension's presence to pages that listen for it
 * (notably the vendor's tools portal, which flips its "MISSING" badge to
 * installed on receiving this signal). This is the ONLY behavior in this
 * file — it collects nothing, reads nothing, sends nothing anywhere else.
 *
 * Background: the original shh.js content script broadcast an identical
 * presence signal (window.postMessage with extensionName:'CREATOR TOOLS').
 * shh.js was stubbed during the clean rebuild because the rest of that file
 * was hostile (cookie/session reading, emergency wipe, vendor exfiltration
 * beacon, sign-out neutering). The presence signal itself was collateral, so
 * it is restored here as an isolated, auditable one-purpose file.
 *
 * Signal shape mirrors the original exactly:
 *   window.postMessage({type:'EXTENSION_CHECK', extensionName:'CREATOR TOOLS'}, '*')
 * fired once on load and repeated every 1500ms.
 */
(function () {
  'use strict';
  var SIGNAL = { type: 'EXTENSION_CHECK', extensionName: 'CREATOR TOOLS' };

  function announce() {
    try {
      window.postMessage(SIGNAL, '*');
    } catch (e) {
      /* page context unavailable — nothing to do */
    }
  }

  announce();
  setInterval(announce, 1500);
})();
