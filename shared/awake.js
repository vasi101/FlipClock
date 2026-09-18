"use strict";
(() => {
  const toggle = document.getElementById("keep-awake");
  const status = document.getElementById("wake-status");
  let enabled = true, lock = null, pending = false;
  const screensaver = !!globalThis.flipClockScreensaver;
  try { enabled = localStorage.getItem("flip-clock-keep-awake") !== "false"; } catch {}
  toggle.checked = enabled;
  async function release() {
    const held = lock; lock = null;
    if (held) { try { await held.release(); } catch {} }
  }
  async function update() {
    if (screensaver) { toggle.disabled = true; status.textContent = "Screensaver follows Windows sleep settings."; return; }
    if (!enabled || document.visibilityState !== "visible" || !document.fullscreenElement) {
      await release();
      status.textContent = enabled ? "Enter fullscreen with F to keep the screen awake." : "Normal sleep settings are active.";
      return;
    }
    if (!navigator.wakeLock) { status.textContent = "Keep-awake is unavailable in this browser."; return; }
    if (lock || pending) return;
    pending = true;
    try {
      const acquired = await navigator.wakeLock.request("screen");
      if (!enabled || document.visibilityState !== "visible" || !document.fullscreenElement) { await acquired.release(); return; }
      lock = acquired;
      acquired.addEventListener("release", () => {
        if (lock !== acquired) return;
        lock = null;
        status.textContent = enabled ? "Keep-awake paused by the browser. Click to retry." : "Normal sleep settings are active.";
      });
      status.textContent = "Active — keeps the screen awake only in fullscreen.";
    } catch { status.textContent = "Keep-awake was not allowed. Click to retry; check battery-saving settings."; }
    finally { pending = false; }
  }
  toggle.onchange = () => { enabled = toggle.checked; try { localStorage.setItem("flip-clock-keep-awake", String(enabled)); } catch {} void update(); };
  document.addEventListener("visibilitychange", update);
  document.addEventListener("fullscreenchange", update);
  document.addEventListener("pointerdown", update);
  document.addEventListener("keydown", update);
  window.addEventListener("pagehide", release);
  window.addEventListener("pageshow", update);
  void update();
})();
