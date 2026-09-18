const SIDEBAR_KEY = "guide-sidebar";

export function revealSidebar() {
  try { window.localStorage.setItem(SIDEBAR_KEY, "open"); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event("guide-sidebar-reveal"));
}

export function sidebarInitiallyOpen() {
  try { return window.localStorage.getItem(SIDEBAR_KEY) === "open"; } catch { return false; }
}
