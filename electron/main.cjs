"use strict";

const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const page = path.join(__dirname, "../shared/index.html");
const pageURL = pathToFileURL(page).href;
const smokeTest = process.argv.includes("--smoke-test");
if (smokeTest) {
  const fs = require("node:fs");
  const os = require("node:os");
  app.setPath("userData", fs.mkdtempSync(path.join(os.tmpdir(), "flip-clock-smoke-")));
}
let window;

function createWindow() {
  window = new BrowserWindow({
    title: "Flip Clock",
    width: 1200,
    height: 800,
    minWidth: 480,
    minHeight: 360,
    backgroundColor: "#000000",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      spellcheck: false
    }
  });
  const contents = window.webContents;
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-navigate", event => event.preventDefault());
  contents.on("will-attach-webview", event => event.preventDefault());
  const allowPermission = (requester, permission) =>
    requester === contents && contents.getURL() === pageURL &&
    (permission === "fullscreen" || permission === "screen-wake-lock");
  contents.session.setPermissionRequestHandler((requester, permission, callback) => {
    callback(allowPermission(requester, permission));
  });
  contents.session.setPermissionCheckHandler((requester, permission) =>
    allowPermission(requester, permission));
  window.on("closed", () => { window = null; });
  window.once("ready-to-show", () => {
    if (!smokeTest) window.show();
  });
  return window.loadFile(page);
}

app.whenReady().then(async () => {
  const menu = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { role: "editMenu" },
    { label: "View", submenu: [{ role: "togglefullscreen" }] },
    { role: "windowMenu" }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  await createWindow();
  if (smokeTest) {
    // Runs against the actual packaged renderer as well as the development app.
    const passed = await window.webContents.executeJavaScript(`(async () => {
      const check = (value, message) => { if (!value) throw new Error(message); };
      check(typeof require === 'undefined', 'Node must not be exposed to the page');
      check(document.getElementById('hours').textContent.trim(), 'Clock did not render');
      check(document.getElementById('theme-options').children.length === 10, 'Themes missing');
      check(document.getElementById('wallpaper-options').children.length === 10, 'Wallpapers missing');
      document.getElementById('timer-toggle').click();
      check(!document.getElementById('timer-panel').hidden, 'Timer panel did not open');
      localStorage.setItem('flip-clock-smoke-test', 'ok');
      check(localStorage.getItem('flip-clock-smoke-test') === 'ok', 'Storage unavailable');
      localStorage.removeItem('flip-clock-smoke-test');
      check(getComputedStyle(document.body).margin === '0px', 'Stylesheet did not load');
      return true;
    })()`);
    console.log(`Electron smoke test: ${passed ? "passed" : "failed"}`);
    app.exit(passed ? 0 : 1);
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(fail);
    }
  });
}).catch(fail);

function fail(error) {
  console.error(error);
  if (!smokeTest) dialog.showErrorBox("Flip Clock could not open", error.message);
  app.exit(1);
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

if (smokeTest) setTimeout(() => fail(new Error("Smoke test timed out")), 30000).unref();
