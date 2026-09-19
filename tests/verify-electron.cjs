"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");

(async () => {
 for (const platform of ["darwin", "win32", "linux"]) {
  const windows = [], appEvents = {};
  let menu, exitCode, quit = false;
  class BrowserWindow {
    constructor(options) {
      this.options = options;
      this.events = {};
      this.webContents = {
        events: {}, url: "",
        on(name, handler) { this.events[name] = handler; },
        getURL() { return this.url; },
        setWindowOpenHandler(handler) { this.openHandler = handler; },
        session: {
          setPermissionRequestHandler(handler) { this.request = handler; },
          setPermissionCheckHandler(handler) { this.check = handler; }
        }
      };
      windows.push(this);
    }
    on(name, handler) { this.events[name] = handler; }
    once(name, handler) { this.events[name] = handler; }
    show() { this.shown = true; }
    async loadFile(file) { this.webContents.url = pathToFileURL(file).href; }
    static getAllWindows() { return windows; }
  }
  const electron = {
    BrowserWindow,
    app: {
      whenReady: () => Promise.resolve(),
      on: (name, handler) => { appEvents[name] = handler; },
      exit: code => { exitCode = code; },
      quit() { quit = true; }
    },
    Menu: { buildFromTemplate: template => template, setApplicationMenu: value => { menu = value; } },
    dialog: { showErrorBox: () => assert.fail("Unexpected startup error") }
  };
  const root = path.resolve(__dirname, "..");
  vm.runInNewContext(fs.readFileSync(path.join(root, "electron/main.cjs"), "utf8"), {
    require: name => name === "electron" ? electron : require(name),
    __dirname: path.join(root, "electron"),
    process: { platform, argv: [] }, console, setTimeout
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(exitCode, undefined);
  assert.equal(windows.length, 1);
  const win = windows[0], contents = win.webContents;
  assert.equal(contents.url, pathToFileURL(path.join(root, "shared/index.html")).href);
  assert.equal(win.options.webPreferences.nodeIntegration, false);
  assert.equal(win.options.webPreferences.contextIsolation, true);
  assert.equal(win.options.webPreferences.sandbox, true);
  assert.equal(win.shown, undefined);
  win.events["ready-to-show"]();
  assert.equal(win.shown, true);
  assert.equal(contents.openHandler().action, "deny");
  for (const name of ["will-navigate", "will-attach-webview"]) {
    let prevented = false;
    contents.events[name]({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
  }
  for (const permission of ["fullscreen", "screen-wake-lock", "media", "geolocation", "notifications"]) {
    const expected = ["fullscreen", "screen-wake-lock"].includes(permission);
    assert.equal(contents.session.check(contents, permission), expected);
    contents.session.request(contents, permission, allowed => assert.equal(allowed, expected));
    assert.equal(contents.session.check({}, permission), false);
  }
  contents.url = "https://example.com/";
  assert.equal(contents.session.check(contents, "fullscreen"), false);
  assert.equal(menu.some(item => item.role === "appMenu"), platform === "darwin");
  appEvents["window-all-closed"]();
  assert.equal(quit, platform !== "darwin");
  windows.length = 0;
  appEvents.activate();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(windows.length, 1);
  console.log(`Passed: Electron startup, isolation, permissions, close and reopen behavior on ${platform}.`);
 }
})().catch(error => { console.error(error); process.exitCode = 1; });
