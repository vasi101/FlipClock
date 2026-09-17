"use strict";
const themes = [
  ["midnight", "Midnight", "#202222", "#d8dad9", "#000000"],
  ["paper", "Paper", "#fafaf6", "#292b2b", "#ecece8"],
  ["ocean", "Ocean", "#122c42", "#bce9ff", "#07131f"],
  ["forest", "Forest", "#20382c", "#d6ebcb", "#0c1912"],
  ["lavender", "Lavender", "#342d49", "#e5d9ff", "#171321"],
  ["rose", "Rose", "#462a35", "#ffd7e2", "#211218"],
  ["amber", "Amber", "#3c3020", "#ffda94", "#19140c"],
  ["espresso", "Espresso", "#392e29", "#ead4be", "#191310"],
  ["ice", "Ice", "#e2eef3", "#244352", "#becfd7"],
  ["mint", "Mint", "#dcebe0", "#284a3a", "#b9d1c1"]
];
const wallpapers = [
  ["none", "Plain"], ["aurora", "Aurora"], ["dusk", "Dusk"],
  ["ocean", "Deep sea"], ["forest", "Woodland"], ["desert", "Dunes"],
  ["cosmos", "Cosmos"], ["mist", "Mist"], ["ember", "Ember"], ["grid", "Grid"]
];
const defaults = { format: false, seconds: true, date: true, animate: true, size: 100, light: false, theme: "", wallpaper: "none" };
let prefs = { ...defaults };
try { const saved = JSON.parse(localStorage.getItem("flip-clock") || "{}"); for (const key of Object.keys(defaults)) if (typeof saved[key] === typeof defaults[key]) prefs[key] = saved[key]; } catch {}
prefs.size = Math.max(60, Math.min(120, prefs.size));
if (!themes.some(item => item[0] === prefs.theme)) prefs.theme = prefs.light ? "paper" : "midnight";
if (prefs.wallpaper !== "custom" && !wallpapers.some(item => item[0] === prefs.wallpaper)) prefs.wallpaper = "none";
const $ = id => document.getElementById(id);
const previous = {};
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
function half(value, position, flap = false) {
  const element = document.createElement("div");
  element.className = `half ${position}${flap ? " flap" : ""}`;
  const number = document.createElement("span"); number.className = "number"; number.textContent = value; element.append(number);
  return element;
}
function setCard(id, value) {
  if (previous[id] === value) return;
  const digits = $(id).querySelector(".digits");
  digits.classList.remove("is-flipping");
  digits.replaceChildren(half(value, "top"), half(value, "bottom"));
  if (previous[id] !== undefined && prefs.animate && !reducedMotion.matches && !document.hidden) {
    const top = half(previous[id], "top", true), bottom = half(value, "bottom", true);
    const oldBottom = half(previous[id], "bottom");
    oldBottom.classList.add("departing");
    digits.classList.add("is-flipping");
    digits.append(oldBottom, top, bottom);
    const finish = () => {
      // A delayed completion must not change a newer flip on the same card.
      if (top.parentNode !== digits) return;
      top.remove(); bottom.remove(); oldBottom.remove();
      digits.classList.remove("is-flipping");
    };
    bottom.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 700);
  }
  previous[id] = value;
}
function render(now = new Date()) {
  const hours = now.getHours();
  setCard("hours", String(prefs.format ? hours : hours % 12 || 12).padStart(2, "0"));
  setCard("minutes", String(now.getMinutes()).padStart(2, "0"));
  $("seconds").textContent = String(now.getSeconds()).padStart(2, "0");
  $("period").textContent = prefs.format ? "" : hours < 12 ? "AM" : "PM";
  $("date").textContent = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  $("day").textContent = now.toLocaleDateString("en-US", { weekday: "long" });
  $("accessible-time").dateTime = now.toISOString();
  $("accessible-time").textContent = now.toLocaleString();
}
function apply() {
  const selected = themes.find(item => item[0] === prefs.theme);
  for (const [key, value] of Object.entries({ "--card": selected[2], "--ink": selected[3], "--background": selected[4] })) document.documentElement.style.setProperty(key, value);
  document.body.dataset.wallpaper = prefs.wallpaper;
  document.body.classList.toggle("has-wallpaper", prefs.wallpaper !== "none");
  globalThis.updateGlass?.();
  document.documentElement.style.colorScheme = ["paper", "ice", "mint"].includes(prefs.theme) ? "light" : "dark";
  document.querySelectorAll("[data-theme-option]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.themeOption === prefs.theme)));
  document.querySelectorAll("[data-wallpaper-option]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.wallpaperOption === prefs.wallpaper)));
  document.documentElement.style.setProperty("--scale", prefs.size / 100);
  $("seconds").hidden = !prefs.seconds;
  $("date").hidden = $("day").hidden = !prefs.date;
  $("date-header").hidden = !prefs.date;
  for (const [id, key] of Object.entries({ format: "format", "show-seconds": "seconds", "show-date": "date", animate: "animate" })) $(id).checked = prefs[key];
  $("size").value = prefs.size;
  try { localStorage.setItem("flip-clock", JSON.stringify(prefs)); } catch {}
  render();
}
function toggleSettings(force) { const open = force ?? $("settings").hidden; $("settings").hidden = !open; $("settings-toggle").setAttribute("aria-expanded", String(open)); if (open) { $("timer-panel").hidden = true; $("timer-toggle").setAttribute("aria-expanded", "false"); $("close-settings").focus(); } else $("settings-toggle").focus(); wake(); }
$("settings-toggle").onclick = () => toggleSettings();
$("close-settings").onclick = () => toggleSettings(false);
for (const [id, key] of Object.entries({ format: "format", "show-seconds": "seconds", "show-date": "date", animate: "animate" })) $(id).onchange = event => { prefs[key] = event.target.checked; apply(); };
$("size").oninput = event => { prefs.size = Number(event.target.value); apply(); };
function theme() { prefs.theme = themes[(themes.findIndex(item => item[0] === prefs.theme) + 1) % themes.length][0]; apply(); }
$("theme").onclick = theme;
async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { $("notice").textContent = "Use F11 to enter fullscreen in your browser."; setTimeout(() => $("notice").textContent = "", 5000); } }
$("fullscreen").onclick = fullscreen;
document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("settings").hidden) toggleSettings(false); if (event.target.matches("input, select") || event.ctrlKey || event.altKey || event.metaKey || event.repeat) return; switch (event.key.toLowerCase()) { case "f": fullscreen(); break; case "s": toggleSettings(); break; case "t": theme(); break; } });
let idleTimer;
function wake() { document.body.classList.remove("idle"); clearTimeout(idleTimer); idleTimer = setTimeout(() => { if ($("settings").hidden && $("timer-panel").hidden) document.body.classList.add("idle"); }, 4000); }
for (const event of ["pointermove", "pointerdown", "keydown"]) document.addEventListener(event, wake);
document.addEventListener("visibilitychange", () => render());
for (const [id, name, card, ink] of themes) {
  const button = document.createElement("button");
  button.type = "button"; button.dataset.themeOption = id; button.className = "option";
  const preview = document.createElement("span"); preview.className = "theme-preview"; preview.textContent = "08";
  preview.style.background = card; preview.style.color = ink;
  const label = document.createElement("span"); label.textContent = name;
  button.append(preview, label); button.onclick = () => { prefs.theme = id; apply(); };
  $("theme-options").append(button);
}
for (const [id, name] of wallpapers) {
  const button = document.createElement("button");
  button.type = "button"; button.dataset.wallpaperOption = id; button.className = "option";
  const preview = document.createElement("span"); preview.className = "wallpaper-preview"; preview.dataset.wallpaper = id;
  const label = document.createElement("span"); label.textContent = name;
  button.append(preview, label); button.onclick = () => { prefs.wallpaper = id; apply(); };
  $("wallpaper-options").append(button);
}
apply(); wake();
function tick() { render(); globalThis.playClockTick?.(); setTimeout(tick, 1000 - Date.now() % 1000 + 10); }
tick();
