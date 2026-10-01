/*
 * CREATOR TOOLS PRO — presence.js (detection-only beacon)
 *
 * Added: 2026-10-01 (clean rebuild follow-up, per user request)
 *
 * Purpose: announce this extension's presence to pages that listen for it
 * (notably the vendor's tools portal, which flips its "MISSING" badge to
 * installed on receiving this signal). This is the ONLY behavior in this
 * file — it collects nothing, reads nothing, sends nothing anywhere else.
 *
 * Background: the original content.js broadcast an identical presence
 * signal ({type:'EXTENSION_CHECK', extensionName:'CREATOR TOOLS PRO'})
 * on load and every 1500ms. content.js was stubbed during the clean rebuild
 * because that was ALL it did — a wildcard one-way beacon plus anti-tamper
 * boilerplate, zero legitimate features. The beacon is restored here as an
 * isolated, auditable one-purpose file so the vendor portal can detect the
 * extension again.
 *
 * Signal shape mirrors the original exactly:
 *   window.postMessage({type:'EXTENSION_CHECK', extensionName:'CREATOR TOOLS PRO'}, '*')
 * fired once on load and repeated every 1500ms.
 */
(function () {
  'use strict';
  var SIGNAL = { type: 'EXTENSION_CHECK', extensionName: 'CREATOR TOOLS PRO' };

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
