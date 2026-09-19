# Flip Clock v1.1.0

Download **FlipClock-Setup.exe** and double-click it to install both Flip Clock and its Windows screensaver. No ZIP extraction or administrator access is required.

On macOS, download **Flip-Clock-macOS.zip**, extract it, and double-click **Install macOS.command**. It installs a standalone app for Intel and Apple Silicon Macs into `~/Applications`. No browser or build tools are required. The app is ad-hoc signed, not Developer ID signed or notarized; macOS may require manual approval in Privacy & Security. Quit the app before updating; the installer saves the previous copy as a backup.

**Flip-Clock-Windows.zip** and **Flip-Clock-Linux.zip** contain standalone x64 apps with their own runtimes and installation scripts. No installed browser is required on any platform. The Windows ZIP also includes the optional screensaver. Close the app before updating; installers preserve previous app files in a backup directory.

- Ten clock themes and ten built-in wallpapers.
- Custom image backgrounds with adjustable glass cards.
- 12/24-hour time, optional seconds and date, fullscreen, and saved preferences.
- Countdown timer with pause/resume, optional alarm, and tick-tock sound.
- Windows x64 screensaver with multiple-display support.
- Desktop and Start menu shortcuts, screensaver configuration, and an uninstaller for both components.

Setup enables the screensaver after five minutes (or your existing shorter delay) and requires sign-in on resume. It preserves the previous screensaver selection for uninstall.

The Windows screensaver requires WebView2 Runtime and .NET Framework 4.6.2 or newer; the regular clock does not require Edge or WebView2. Setup checks for WebView2 before installing both components. The Windows binaries are unsigned. Screensaver dismissal/sign-in still needs an interactive test. Keep the clock open and the computer awake for timely timer alarms.

`SHA256SUMS.txt` contains checksums for the Windows installer and all three platform ZIPs. The automatically generated source-code archives do not include the compiled apps.
