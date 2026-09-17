# Flip Clock

A quiet, offline flip clock for Windows, Linux, and macOS, inspired by the provided reference. No account or internet connection required. The lightweight installers use your existing browser rather than bundling a browser runtime.

## Install on Linux or macOS

Extract the entire `Flip-Clock-Portable.zip` archive first, then open a terminal in the extracted folder.

- **Linux:** run `sh install-linux.sh`. Open Flip Clock from the application menu. Installs to `${XDG_DATA_HOME:-$HOME/.local/share}/flip-clock` with a `.desktop` launcher in its sibling `applications` directory.
- **macOS:** run `sh "Install macOS.command"`. Open `~/Applications/Flip Clock.app` in Finder. This creates a local app bundle with its own icon. It is not a signed/notarized DMG or App Store package.

Chrome, Chromium, Edge, or Brave provides a dedicated app window. With other browsers, the launcher opens the clock as a normal browser page; use the fullscreen button. Browser window/taskbar branding can still use the browser's icon. No administrator privileges are needed. Re-run the installer to update. Linux/macOS installer syntax is checked, but native launch testing still needs those operating systems.

To uninstall on macOS, move `~/Applications/Flip Clock.app` to Trash. On Linux, move the installed `flip-clock` folder and `applications/flip-clock.desktop` launcher to Trash. Browser preferences and custom image storage remain until cleared in the browser.

Installer structure references: [Desktop Entry specification](https://specifications.freedesktop.org/desktop-entry/latest/exec-variables.html) and [Apple bundle structure](https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html).

## Windows

To install, double-click **Install Flip Clock.cmd**. This copies the app to `%LOCALAPPDATA%\Programs\Flip Clock` and adds desktop and Start menu shortcuts. No administrator access is needed. Microsoft Edge provides the app window. To remove it, choose **Uninstall Flip Clock** in its Start menu folder. Run the installer again to update the installed copy.

Double-click **Start Flip Clock.cmd** to open the clock in a standalone Microsoft Edge window. If Edge is not found, it opens in your default browser. You can also open **index.html** directly.

- **F**: toggle fullscreen (or use the fullscreen button)
- **S**: open settings
- **T**: cycle through the 10 clock themes
- **Escape**: close settings or leave fullscreen

Settings include 12/24-hour time, seconds, date, animation, and clock size. Preferences are saved in the browser when local storage is available. Time follows your Windows local time and timezone. Controls fade after four seconds of inactivity; move the mouse to reveal them.

Settings also offer 10 clock themes and 10 wallpaper choices, including Plain, Aurora, Dusk, Deep sea, Woodland, Dunes, Cosmos, Mist, Ember, and Grid. These abstract backgrounds are drawn locally and work offline. Mix any wallpaper with any theme. The day and date appear above the clock; Show date toggles both. Appearance choices persist after restarting.

Choose **Settings > Choose your image** to use a JPG, PNG, WebP, or AVIF up to 25 MB. The app resizes the image to a maximum of 2560 pixels and stores it locally in browser storage; nothing is uploaded. **Use saved image** switches back after choosing a built-in wallpaper, and **Remove image** deletes the saved copy.

Custom images automatically enable the glass card style unless you turn **Glass cards** off. Tint and digit color adapt to the image's central colors. **Glass opacity** and **Glass blur** adjust the effect. Refraction is approximated with frosted blur, saturation, and edge highlights; it is not optical ray tracing. Older browsers without backdrop blur get a more opaque fallback. If local storage is unavailable, the image works for the current session only.

Enable **Tick-tock sound** in settings and adjust **Sound volume**. After reopening, click anywhere to allow browser audio. Sound is synthesized locally, with no downloads.

Use the toolbar's timer button for a countdown up to 99:59:59, with quick presets, Start/Pause/Resume, Reset, and an optional completion alarm. The alarm sounds for up to 30 seconds or until stopped. Volume applies to both ticking and alarms. Running and paused timers survive reopening. Keep the app open and Windows awake for timely alarms; if the app is closed or the PC sleeps, it updates the countdown when it resumes.

For a desktop shortcut, right-click `Start Flip Clock.cmd`, select **Show more options → Send to → Desktop (create shortcut)**.

The regular clock is a local browser app. Close the window with Alt+F4. It respects the system's reduced-motion preference.

## Windows screensaver

The separate `Flip-Clock-Screensaver-Windows.zip` package includes a compiled Windows x64 `.scr` screensaver. Extract it and run **Install Screensaver.cmd**. It requires the Microsoft Edge WebView2 Runtime and .NET Framework 4.6.2 or newer. The installer enables secure resume and uses five minutes or your existing shorter idle delay. It does not change display-off or sleep settings.

Open **Configure Flip Clock Screensaver** in the Start menu, press **S**, and select its theme and image. This uses a separate WebView2 profile, so choose your wallpaper once here even if you already chose one in the Edge app. Close the configuration window when finished. **Windows Screen Saver Settings** in the same Start menu folder lets you adjust the delay and preview it.

In screensaver mode the clock fills all connected displays, hides controls, and mutes audio. Mouse or keyboard activity dismisses it and requests Windows locking. Windows secure resume is also enabled. It is an idle screensaver, not a replacement for the Win+L lock screen. The `/p` Windows thumbnail preview does not lock; `/c` opens configuration. The hidden `/test` mode verifies page loading without locking. The build and non-locking WebView2 runtime check passed; full-screen dismissal and the resulting sign-in screen still require an interactive test.

Uninstall Flip Clock restores the previous screensaver if it still exists, otherwise selects Windows' blank screensaver. Secure resume and the current timeout remain in place. The screensaver profile under `%LOCALAPPDATA%\FlipClock\ScreensaverProfile` is preserved.

Build source: `screensaver/ScreenSaver.cs`; run `Build-Screensaver.ps1` after extracting Microsoft.Web.WebView2 1.0.4191.47 from NuGet into `screensaver/sdk`. Included WebView2 redistributable notices are in `WebView2-LICENSE.txt` and `WebView2-NOTICE.txt`. Implementation references: [Microsoft WebView2 WinForms](https://learn.microsoft.com/en-us/microsoft-edge/webview2/get-started/winforms), [screensaver registration](https://learn.microsoft.com/en-us/windows/win32/devnotes/scrnsave-exe), and [Windows screen saver settings API](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-systemparametersinfoa).
