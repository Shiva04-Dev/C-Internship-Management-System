const HOST_ID = "fixed-chrome-host";

let cached: HTMLElement | null = null;

/**
 * The portal target for `position: fixed` page chrome — the dashboards'
 * `.retro-navbar` and the landing page's nav.
 *
 * WHY A PORTAL AT ALL: `ScrollSmootherProvider` is mounted globally in
 * `App.tsx`, and GSAP's ScrollSmoother drives scrolling by putting a CSS
 * `transform` on `#smooth-content`. Per the CSS spec a transformed ancestor
 * becomes the containing block for every `position: fixed` descendant, so
 * fixed chrome rendered inline resolves `top: 0` against `#smooth-content`
 * instead of the viewport and rides the page's `translateY(-scrollY)` straight
 * off the top of the screen. Fixed chrome has to live outside that subtree.
 *
 * WHY A HOST *BEFORE* `#root`, RATHER THAN APPENDING TO `<body>`: tab order and
 * screen-reader reading order follow DOM order, not React tree order.
 * Appending would put the navbar's controls after every card, table and modal
 * trigger on the page, when they belong first — a real keyboard/AT regression.
 * Prepending a dedicated host keeps the containing-block escape AND the
 * original document order.
 *
 * STACKING IS UNAFFECTED: the host is a plain, unpositioned div, and its only
 * children are `position: fixed` (so nothing is in flow and it stays
 * zero-height). It creates no stacking context of its own, so the navbars keep
 * competing on their own explicit z-index — 100 for `.retro-navbar`, 50 for the
 * landing nav — against `#smooth-wrapper`, which is `z-index: auto`. Both still
 * paint above page content and below `AnimatedModal`'s `z-index: 1000` overlay.
 *
 * `AnimatedModal` deliberately does NOT share this host: a dialog belongs at
 * the END of the document, after the content it covers, which is what appending
 * to `<body>` already gives it. Only chrome that belongs *first* goes here.
 *
 * Idempotent and safe to call from render: it reuses the existing node if one
 * is already in the document, so React StrictMode's double-invoke and repeated
 * component mounts never create a second host.
 */
export function getFixedChromeHost(): HTMLElement {
  if (cached?.isConnected) return cached;

  const existing = document.getElementById(HOST_ID);
  if (existing) {
    cached = existing;
    return existing;
  }

  const host = document.createElement("div");
  host.id = HOST_ID;

  // A skip-to-content link only works if it's the very first focusable thing
  // on the page. Every page's fixed nav (this file's whole reason for
  // existing) portals into this same host, so inserting it here — ahead of
  // whatever nav content a page appends next — is the one place that's
  // guaranteed to hold regardless of which page is mounted. A React child
  // rendered inside a page would land after this host's siblings in `#root`,
  // i.e. after the very nav it's supposed to let users skip past.
  const skipLink = document.createElement("a");
  skipLink.href = "#main";
  skipLink.className = "skip-to-content";
  skipLink.textContent = "Skip to main content";
  host.appendChild(skipLink);

  document.body.prepend(host);
  cached = host;
  return host;
}
