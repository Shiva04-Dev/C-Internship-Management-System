const HOST_ID = "fixed-chrome-host";

let cached: HTMLElement | null = null;

export function getFixedChromeHost(): HTMLElement {
  if (cached?.isConnected) return cached;

  const existing = document.getElementById(HOST_ID);
  if (existing) {
    cached = existing;
    return existing;
  }

  const host = document.createElement("div");
  host.id = HOST_ID;

  const skipLink = document.createElement("a");
  skipLink.href = "#main";
  skipLink.className = "skip-to-content";
  skipLink.textContent = "Skip to main content";
  host.appendChild(skipLink);

  document.body.prepend(host);
  cached = host;
  return host;
}
