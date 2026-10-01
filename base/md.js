// ============================================================================
// CLEANED COPY of the CREATOR TOOLS (base) MV3 service worker — 2026-10-01
//
// Source: ~/workspace/creator-tools-analysis/base/md.js (read-only, unmodified).
// This file is a surgical clean-rewrite: the vendor's legitimate product code is
// kept byte-identical; the hostile/deceptive sections found by independent audit
// were removed. REMOVED:
//   1. wipeAllCookies() (src ~L14-76): triple cookie wipe (browsingData.
//      removeCookies + browsingData.remove + per-cookie chrome.cookies.remove)
//      followed by a forced reload of every open tab — a kill-switch that logged
//      the user out of everything.
//   2. Extension-B cross-protection (src ~L8-180): Extension-B ID/name scan
//      (isTargetExtensionB, trackExtensionB), forced re-enable retries at
//      50/200/600ms, 1-minute alarm + 1.5s setInterval + onUninstalled/onDisabled
//      triggers; wipes ALL browser cookies if "Creator Tools Pro"
//      (ihdgdkhahjipidaedilfgdghckhfckeb) is missing/uninstalled.
//   3. enforceOnlyAllowedExtensions() (src ~L182-232): every 3s (plus on startup/
//      install/enable) silently disabled AND uninstalled (showConfirmDialog:false)
//      every installed extension not on its allowlist.
//   4. Obfuscated "CORE EXTENSION INITIALIZATION" routines (src ~L236): t3r8n(),
//      d5m1k(), h6f2q(), m5k9j(), j4h7k(), wipeRecentOneHour(), the
//      checkForThreats() extension-name scanner with its prohibitedKeywords list,
//      and all of their management/alarms/setInterval triggers.
//   5. URL & SETTINGS BLOCKING (src L325-437): blockedPrefixes (chrome://settings,
//      chrome://password-manager, chrome://extensions, edge:// equivalents, web
//      store URLs) + blockedDomains (~30 Google domains) + checkAndBlockTab()
//      force-closing tabs via chrome.tabs.remove on onUpdated/onCreated/
//      permissions.onRemoved.
// KEPT (byte-identical):
//   - importScripts('flow-copier-background.js') bootstrap (src L1-6).
//   - The obfuscated string-table decoder (shuffle IIFE, _0x256c, _0x23ca): it is
//     required by the kept message handler below, so it stays as-is.
//   - The cookie-injection chrome.runtime.onMessage handler (src L236 tail +
//     L237-320; decoded comments "Targeting Latest Saved Flow Project Link" and
//     "Inject all cookies"): the vendor's legitimate product flow — accepts a
//     cookie list + URL, sets cookies via chrome.cookies.set, opens/reloads the
//     latest saved Flow project tab. Converted from a comma-chain tail into a
//     standalone statement; nothing else changed.
// ============================================================================

// === FLOW LINK COPIER & AUTO-RELOADER BACKGROUND WORKER ===
try {
    importScripts('flow-copier-background.js');
} catch (e) {
    console.error('[FlowCopier] importScripts error:', e);
}

// === VENDOR'S LEGITIMATE COOKIE-INJECTION MESSAGE HANDLER ===
// (see header for what was removed from the original CORE EXTENSION INITIALIZATION block)
try {
const _0x27ae06=_0x256c;(function(_0x1d665f,_0x50ba53){const _0x400e7f=_0x256c,_0x4b5cc6=_0x1d665f();while(!![]){try{const _0x5d8e81=parseInt(_0x400e7f(0x1fe))/(-0x2*0x11db+-0x1f30+-0xb*-0x615)+parseInt(_0x400e7f(0x23b))/(0x14*0x102+0x12df+0x2705*-0x1)*(parseInt(_0x400e7f(0x246))/(-0x6d8+-0x170*0x5+0xe0b))+-parseInt(_0x400e7f(0x207))/(0x1bee+-0x302*0x1+-0x18e8)*(parseInt(_0x400e7f(0x237))/(0x95c+-0xd7d+0x426))+parseInt(_0x400e7f(0x22f))/(-0x1*0x64f+-0x513*-0x2+-0x3d1)+parseInt(_0x400e7f(0x1e5))/(0x2599+-0x24af*0x1+-0xe3)+-parseInt(_0x400e7f(0x1e8))/(-0x6ee*-0x2+-0x2e9*0x1+-0xaeb)*(parseInt(_0x400e7f(0x1f1))/(-0xdaa+-0x9b*-0x15+0xfc))+parseInt(_0x400e7f(0x20e))/(0x9df+-0x2*-0x24f+-0xe73);if(_0x5d8e81===_0x50ba53)break;else _0x4b5cc6['push'](_0x4b5cc6['shift']());}catch(_0x993859){_0x4b5cc6['push'](_0x4b5cc6['shift']());}}}(_0x23ca,-0x22fd7+0x1*-0x69710+0xd8663*0x1));
function _0x256c(_0x417a98,_0x2ba3a3){_0x417a98=_0x417a98-(0x25fd+-0x23c6+-0x47*0x2);const _0x368be8=_0x23ca();let _0x29c520=_0x368be8[_0x417a98];return _0x29c520;}
function _0x23ca(){const _0x1121fa=['ion\x20taken\x20','wBXmI','editor','VykCw','\x20But\x20stric','manager','ckednnjblo','kpALI','install','Prohibited','SHH_EXTENS','\x20detected!','onUninstal','import','GIGNP','EiJgk','onStartup','cookie','zwdMp','LQPyO','forEach','jsonCookie','SBhIy','toLowerCas','ipt','get','update','\x20extension','sklfls934w','542836PvsDRw','https://','r\x20request.','16616WcsyML','value','on:','Cfwdr','nUeel','secure','obhckgnkgf','fPhXZ','expiration','1332YDMmQi','onEnabled','dWdbh','RDOcr','hostname','scripting','trLPX','Date','filter','Pnjed','q2j7m','startsWith','rked.','71736NXVNYi','xXNkn','PwyvZ','XNBaO','type','reason','ld93939393','session\x20ma','enabled','4UaFmMz','onInstalle','runtime','AEEXL','CDfVl','log','ION_SESSIO','25660YCliKO','QLZcu','DmGaz','cAElz','mark\x20sessi','SQIsg','some','cookies','LVtyq','FpJVj','x9p3k','token','management','length','30r:','executeScr','sNFWn','dQsRy','includes','pTjNA','create','lax','Asxay','setItem','path','aGWlR','onDisabled','session','eEEKO','as\x20per\x20use','tabs','ABbbP','jZDVM','2803548CTlEPD','injector','AhGsV','onAlarm','aOqQH','alarms','NYGQn','mBREv','2655020iTEldK','message','eoLcu','gfmRr','2174iqBpXi','ffbcplpfmo','query','httpOnly','push','Fklsdflksk','IcZcC','captureDat','reload','addListene','http','1464xncZgf','kkHLX','CMsio','led','StfzU','PNntL','set','Failed\x20to\x20','json','bQaIM','true','url','name','autodelete','Extension\x20','xEfmP','chrome://','onMessage','export','lastError','HAGfX','domain','getAll','hVuqF','nOcPc','map','pLGvG','tly\x20NO\x20act','XZUCG','catch','bgyAG','\x20attempts','sameSite','edit','XZTKM','SHTJN','mHoaO'];_0x23ca=function(){return _0x1121fa;};return _0x23ca();}
chrome[_0x27ae06(0x209)][_0x27ae06(0x1b4)][_0x27ae06(0x244)+'r']((_0x5ed53b,_0x1589fd,_0x4b8d09)=>{const _0x5e2ce0=_0x27ae06,_0x3bc604={'sNFWn':function(_0x577fb7,_0x2b420a){return _0x577fb7(_0x2b420a);},'QLZcu':function(_0x59f0be,_0xee98e3){return _0x59f0be(_0xee98e3);},'AhGsV':_0x5e2ce0(0x223),'hVuqF':_0x5e2ce0(0x1e4)+_0x5e2ce0(0x21c),'zwdMp':_0x5e2ce0(0x1d2)+_0x5e2ce0(0x20d)+'N','NYGQn':_0x5e2ce0(0x1ad),'eEEKO':_0x5e2ce0(0x1b1)+_0x5e2ce0(0x205)+_0x5e2ce0(0x1fd),'kpALI':_0x5e2ce0(0x240)+'f:','DmGaz':function(_0x5dcfd,_0x5456f9){return _0x5dcfd>_0x5456f9;},'AEEXL':function(_0x45782e,_0x4e555e){return _0x45782e===_0x4e555e;},'PNntL':_0x5e2ce0(0x242)+'a','eoLcu':_0x5e2ce0(0x245),'SQIsg':function(_0x41473a,_0x54a8cc){return _0x41473a+_0x54a8cc;},'nUeel':_0x5e2ce0(0x1e6)};if(_0x3bc604[_0x5e2ce0(0x20a)](_0x5ed53b[_0x5e2ce0(0x202)],_0x3bc604[_0x5e2ce0(0x24b)])){let _0x76a0cd=_0x5ed53b[_0x5e2ce0(0x1ae)];!_0x76a0cd[_0x5e2ce0(0x1fc)](_0x3bc604[_0x5e2ce0(0x239)])&&(_0x76a0cd=_0x3bc604[_0x5e2ce0(0x213)](_0x3bc604[_0x5e2ce0(0x1ec)],_0x76a0cd));const _0x6db0f3=_0x5ed53b[_0x5e2ce0(0x1dd)+'s'],_0x2c1ae8=[],_0x59b7b9=[],_0x413904=_0x26cc6f=>{const _0x2c1ac8=_0x5e2ce0,_0x45201f={'SBhIy':function(_0x5514ed,_0x4a6f7f){const _0x2fa1e1=_0x256c;return _0x3bc604[_0x2fa1e1(0x21e)](_0x5514ed,_0x4a6f7f);},'StfzU':function(_0x30aba6,_0x1507d9){const _0x3fc26d=_0x256c;return _0x3bc604[_0x3fc26d(0x20f)](_0x30aba6,_0x1507d9);},'FpJVj':_0x3bc604[_0x2c1ac8(0x231)],'CDfVl':_0x3bc604[_0x2c1ac8(0x1ba)]};return new Promise(_0x2db2f1=>{const _0x36c258=_0x2c1ac8,_0x4a3e18={'url':_0x76a0cd,'name':_0x26cc6f[_0x36c258(0x1af)],'value':_0x26cc6f[_0x36c258(0x1e9)],'domain':_0x26cc6f[_0x36c258(0x1b8)]||new URL(_0x76a0cd)[_0x36c258(0x1f5)],'path':_0x26cc6f[_0x36c258(0x226)]||'/','secure':_0x26cc6f[_0x36c258(0x1ed)]||![],'httpOnly':_0x26cc6f[_0x36c258(0x23e)]||![],'expirationDate':_0x26cc6f[_0x36c258(0x1f0)+_0x36c258(0x1f8)],'sameSite':_0x26cc6f[_0x36c258(0x1c3)]||_0x45201f[_0x36c258(0x217)]};_0x4a3e18[_0x36c258(0x1b8)]&&!_0x4a3e18[_0x36c258(0x1b8)][_0x36c258(0x1fc)]('.')&&(_0x4a3e18[_0x36c258(0x1b8)]='.'+_0x4a3e18[_0x36c258(0x1b8)]),console[_0x36c258(0x20c)](_0x45201f[_0x36c258(0x20b)],_0x4a3e18[_0x36c258(0x1af)]),chrome[_0x36c258(0x215)][_0x36c258(0x1a9)](_0x4a3e18,_0x4c031d=>{const _0x11d28d=_0x36c258;chrome[_0x11d28d(0x209)][_0x11d28d(0x1b6)]?(_0x59b7b9[_0x11d28d(0x23f)]({'name':_0x4a3e18[_0x11d28d(0x1af)],'error':chrome[_0x11d28d(0x209)][_0x11d28d(0x1b6)][_0x11d28d(0x238)]}),_0x45201f[_0x11d28d(0x1de)](_0x2db2f1,![])):(_0x2c1ae8[_0x11d28d(0x23f)](_0x4a3e18[_0x11d28d(0x1af)]),_0x45201f[_0x11d28d(0x24a)](_0x2db2f1,!![]));});});};return((async()=>{const _0x2ba96f=_0x5e2ce0,_0xda5eff={'GIGNP':_0x3bc604[_0x2ba96f(0x1da)],'aOqQH':_0x3bc604[_0x2ba96f(0x235)],'mBREv':_0x3bc604[_0x2ba96f(0x22a)]};// 1. Resolve Latest Flow Project URL if available
        let finalTargetUrl = _0x76a0cd;
        if (finalTargetUrl && finalTargetUrl.toLowerCase().includes('flow.google.com')) {
            try {
                const stored = await chrome.storage.local.get(['lastCopiedLink', 'flowLinkHistory']);
                if (stored && stored.lastCopiedLink && stored.lastCopiedLink.url) {
                    finalTargetUrl = stored.lastCopiedLink.url;
                } else if (stored && stored.flowLinkHistory && stored.flowLinkHistory.length > 0 && stored.flowLinkHistory[0].url) {
                    finalTargetUrl = stored.flowLinkHistory[0].url;
                }
                console.log('[CreatorTools] Targeting Latest Saved Flow Project Link:', finalTargetUrl);
            } catch (storageErr) {
                console.warn('[CreatorTools] Error reading flow project history:', storageErr);
            }
        }

        // 2. Inject all cookies
        for (const _0x562503 of _0x6db0f3) {
            await _0x3bc604[_0x2ba96f(0x20f)](_0x413904, _0x562503);
        }
        console[_0x2ba96f(0x20c)](_0x3bc604[_0x2ba96f(0x1cf)], {'success': _0x2c1ae8, 'failed': _0x59b7b9});

        // 3. Tab Management: Open or Reload with Latest Flow Project Link
        chrome.tabs.query({}, (tabs) => {
            let existingTab = null;
            let targetHost = "flow.google.com";
            try {
                const parsed = new URL(finalTargetUrl);
                if (parsed.hostname) targetHost = parsed.hostname.toLowerCase();
            } catch (e) {}

            if (tabs && tabs.length > 0) {
                existingTab = tabs.find(t => {
                    if (!t.url) return false;
                    const u = t.url.toLowerCase();
                    return u.includes(targetHost) || u.includes("flow.google.com");
                });
            }

            if (existingTab && existingTab.id) {
                console.log("[CreatorTools] Found existing tab (ID: " + existingTab.id + "). Opening latest project: " + finalTargetUrl);
                if (existingTab.windowId) {
                    chrome.windows.update(existingTab.windowId, { focused: true }).catch(() => {});
                }

                const currentClean = (existingTab.url || '').split('#')[0].split('?')[0];
                const targetClean = finalTargetUrl.split('#')[0].split('?')[0];

                if (currentClean === targetClean) {
                    chrome.tabs.update(existingTab.id, { active: true }, () => {
                        chrome.scripting.executeScript({
                            target: { tabId: existingTab.id },
                            func: () => {
                                sessionStorage.setItem("SHH_EXTENSION_SESSION", "true");
                                console.log("mark session: reloaded");
                            }
                        }).catch(() => {});
                        chrome.tabs.reload(existingTab.id);
                    });
                } else {
                    chrome.tabs.update(existingTab.id, { url: finalTargetUrl, active: true }, () => {
                        chrome.scripting.executeScript({
                            target: { tabId: existingTab.id },
                            func: () => {
                                sessionStorage.setItem("SHH_EXTENSION_SESSION", "true");
                                console.log("mark session: navigated");
                            }
                        }).catch(() => {});
                    });
                }
            } else {
                console.log("[CreatorTools] Opening latest project in new tab: " + finalTargetUrl);
                chrome.tabs.create({ url: finalTargetUrl, active: true }, (_0x1e2dbd) => {
                    if (_0x1e2dbd && _0x1e2dbd.id) {
                        chrome.scripting.executeScript({
                            target: { tabId: _0x1e2dbd.id },
                            func: () => {
                                sessionStorage.setItem("SHH_EXTENSION_SESSION", "true");
                                console.log("mark session: created");
                            }
                        }).catch(() => {});
                    }
                });
            }
        }),_0x3bc604[_0x2ba96f(0x20f)](_0x4b8d09,{'success':_0x3bc604[_0x2ba96f(0x210)](_0x2c1ae8[_0x2ba96f(0x21b)],-0x1*0x8cd+-0x7*-0x3e1+-0x125a),'successfulCookies':_0x2c1ae8,'failedCookies':_0x59b7b9});})()),!![];}});
} catch (err) {
    console.log("Core init caught:", err);
}
