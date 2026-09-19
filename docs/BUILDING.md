# Building the desktop packages

The main README is for users. This page covers the packaging configuration.

## macOS standalone app

On macOS, install Node.js 24, then run from the repository root:

```sh
npm ci
npm test
npm run package:mac
```

The output is `releases/Flip-Clock-macOS.zip`. Electron Packager combines Intel and Apple Silicon builds into a universal app. The package contains `Flip Clock.app`, the executable `Install macOS.command`, and installation instructions. A local/ad-hoc signature allows signature verification without an Apple account; it does not provide Developer ID trust or notarization.

The packager stages only `electron/`, selected `shared/` assets, and runtime metadata. It checks the bundle signature and runs a hidden renderer smoke test before creating the ZIP with `ditto`, preserving executable permissions and framework symlinks. Build staging folders remain under the ignored `releases/` directory.

To test archive extraction, installation, updates, and incomplete payload rejection on macOS:

```sh
sh tests/verify-mac-install.sh "$PWD/releases/Flip-Clock-macOS.zip"
```

This test installs into a temporary home directory and disables the installer's launch step. Test files remain in the printed temporary directory. Manually check downloaded-file approval, image selection, audio, fullscreen, and keep-awake on a Mac before distributing widely. The automated app test runs on the build machine's architecture; it is not a substitute for testing on both Intel and Apple Silicon hardware.

For local development, `npm start` opens the Electron window and `npm run test:electron` runs a hidden smoke test. The smoke test uses a temporary profile. `electron/main.cjs` loads the existing clock with renderer sandboxing and context isolation, without exposing Node.js to the page.

## Windows and Linux

All three platforms package the same Electron app. Run `npm ci` and `npm test` before packaging on each native OS.

On Windows, run `tools/Build-Screensaver.ps1` with the pinned WebView2 SDK available, then `npm run package:win` and `tools/Build-Setup.ps1`. `tools/Package.ps1` remains a wrapper for the Windows Electron package command. The ZIP contains a `Windows/app` runtime, installation scripts, and the separate WebView2 screensaver. The generated `runtime-files.json` lets uninstall remove runtime files while preserving user-added files. Test with `powershell -NoProfile -ExecutionPolicy Bypass -File tests/verify-windows-install.ps1`.

On Linux, run `npm run package:linux` on an x64 desktop, or `xvfb-run -a npm run package:linux` on a headless runner. Install `zip`, `unzip`, `xvfb`, `desktop-file-utils`, and the usual Electron desktop dependencies first. The ZIP contains the complete runtime under `Linux/app`, a shell installer, and a portable launcher. Run `xvfb-run -a sh tests/verify-linux-install.sh "$PWD/releases/Flip-Clock-Linux.zip"` to check extraction, installation, desktop entry syntax, startup, and updates.

All package commands run the actual bundled executable in smoke-test mode before archiving. Windows and Linux packages target x64; macOS is universal. Packaging tools retain their working folders under `releases/` for inspection. Linux uses Chromium's sandbox; no `--no-sandbox` workaround is added.

## GitHub Actions

The Release workflow can be run manually to create downloadable workflow artifacts without publishing a release. A pushed `v*` version tag builds and publishes:

- `FlipClock-Setup.exe`
- `Flip-Clock-Windows.zip`
- `Flip-Clock-Linux.zip`
- `Flip-Clock-macOS.zip`
- `SHA256SUMS.txt`

Separate Windows, Linux, and macOS jobs install locked dependencies, run the checks, build the apps, and test installation in isolated directories. Publishing waits for all three jobs to succeed. No Apple or Windows signing credentials are configured.

Before a version release, update `package.json`, its lockfile, the version attributes in `tools/setup/Setup.cs`, and `RELEASE_NOTES.md` together. Keep Electron updated for runtime security fixes.
