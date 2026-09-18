# Flip Clock

A quiet, customizable flip clock for your desktop. Keep the time in view, set a countdown for your next break, and make the clock your own with themes, wallpapers, and frosted glass cards.

Built with HTML, CSS, and vanilla JavaScript. Runs locally in your browser on **Windows, macOS, and Linux**, with no account, server, or internet connection needed after download.

[Installation](#installation) · [Countdown timer](#countdown-timer) · [Customization](#customization) · [Development](#development)

## Features

- **Animated flip clock** with 12/24-hour time, optional seconds, and a weekday/date display.
- **10 clock themes and 10 built-in wallpapers**, from a minimal dark clock to colorful backgrounds.
- **Custom image backgrounds** with adaptive glass cards, adjustable opacity, and blur.
- **Countdown timer** with quick presets, pause/resume, reset, and an optional completion alarm.
- **Optional tick-tock sound** and a shared sound-volume control.
- **Fullscreen mode** with controls that fade after inactivity.
- **Keep awake in fullscreen**, where supported by your browser.
- **Saved preferences** and timer state using local browser storage.
- **Windows screensaver** with support for multiple displays and separate appearance settings.
- **Reduced-motion support** that respects your system preference.

## Installation

All installers run for your user account without administrator access. The regular clock uses an existing browser instead of bundling a browser engine.

| Platform | Install method | Requirements |
| --- | --- | --- |
| Windows | Windows setup executable | Windows x64, Microsoft Edge, WebView2 Runtime, .NET Framework 4.6.2 or newer |
| macOS | Shell installer from the source folder | macOS and a browser; Chrome, Edge, Brave, or Chromium for an app window |
| Linux | Shell installer from the source folder | Linux desktop and a browser; Chrome, Chromium, Edge, or Brave for an app window |

### Windows

1. Open [Releases](https://github.com/vasi101/FlipClock/releases) and download **FlipClock-Setup.exe** from a published release.
2. Double-click the executable. Setup checks for Edge and WebView2, then installs the clock and screensaver.
3. Open **Flip Clock** from your desktop or Start menu.

The app installs to `%LOCALAPPDATA%\Programs\Flip Clock`. Setup enables the screensaver after **five minutes**, or keeps your existing shorter delay, and enables sign-in on resume.

Use **Configure Flip Clock Screensaver** in the Start menu to customize the screensaver. Use **Windows Screen Saver Settings** to adjust its idle delay.

> The Windows installer is unsigned. If no release has been published yet, use the browser-only option below or build the installer from source. Full installation and screensaver dismissal/sign-in still need interactive verification.

### macOS

Download the repository using **Code → Download ZIP** on [GitHub](https://github.com/vasi101/FlipClock), then extract it. Open Terminal in the extracted project folder and run:

```sh
cd macOS
sh "Install macOS.command"
```

Alternatively, with Git installed:

```sh
git clone https://github.com/vasi101/FlipClock.git
cd FlipClock/macOS
sh "Install macOS.command"
```

Open **Flip Clock.app** from your user Applications folder (`~/Applications`). Chrome, Edge, Brave, or Chromium provides a dedicated app window; otherwise the launcher opens your default browser.

This installer creates a local browser launcher, not a signed or notarized native application. The Windows screensaver is not included. Native macOS launching still needs verification.

### Linux

Download the repository using **Code → Download ZIP** on [GitHub](https://github.com/vasi101/FlipClock), then extract it. Open a terminal in the extracted project folder and run:

```sh
cd Linux
sh install-linux.sh
```

Alternatively, with Git installed:

```sh
git clone https://github.com/vasi101/FlipClock.git
cd FlipClock/Linux
sh install-linux.sh
```

Open **Flip Clock** from your application menu. Chrome, Chromium, Edge, or Brave provides a dedicated app window; otherwise the launcher uses `xdg-open` to open your default browser.

The default installation paths are:

- App files: `~/.local/share/flip-clock`
- Application launcher: `~/.local/share/applications/flip-clock.desktop`

If you set `XDG_DATA_HOME`, the installer uses that directory instead of `~/.local/share`. It must be an absolute path. The Windows screensaver is not included. Native Linux launching still needs verification.

### Run without installing — any OS

Download and extract the repository, then open **`shared/index.html`** in a modern browser. Keep the entire `shared` folder together so the scripts, styles, and icons load correctly.

No Node.js, package installation, or build step is needed to use the clock this way.

## Using the clock

The clock follows your computer's local time and timezone. Move the pointer to reveal the toolbar after it fades.

| Control | Action |
| --- | --- |
| Timer button | Open the countdown timer |
| Settings button / **S** | Open or close settings |
| Fullscreen button / **F** | Toggle fullscreen |
| Theme button / **T** | Cycle through clock themes |
| **Escape** | Close an open panel or exit browser fullscreen |

### Countdown timer

Use the toolbar's **stopwatch icon** to open the countdown panel.

1. Enter **hours, minutes, and seconds**, or choose a preset: **1 min**, **5 min**, **25 min**, or **1 hour**.
2. Enable **Alarm when finished** if you want an audible alert.
3. Select **Start**. Use **Pause** and **Resume** to control the countdown, or **Reset** to return to the selected duration.

The timer supports durations from **1 second to 99:59:59**. You can close the panel while it runs. Running and paused timers are saved locally when browser storage is available and restored when you reopen the clock.

The completion alarm sounds for up to **30 seconds**, or until stopped. **Sound volume** in settings controls both the timer alarm and tick-tock sound.

Keep the app open and your computer awake to hear the alarm on time. If you close the app or your computer sleeps, the timer updates when the app resumes; it cannot sound an alarm while closed. After reopening, interact with the page if your browser requires a gesture to enable audio.

### Customization

Open **Settings** to adjust:

- **Time display:** 12/24-hour format, seconds, date, animation, and clock size.
- **Appearance:** mix any of the 10 themes with any of the 10 wallpapers.
- **Custom backgrounds:** choose a JPG, PNG, WebP, or AVIF image up to 25 MB.
- **Glass cards:** enable or disable the effect and adjust opacity and blur. Colors adapt to your image.
- **Audio:** enable tick-tock sound and change sound volume.
- **Keep awake:** request that the screen stay awake while the clock is fullscreen.

Custom images are resized to a maximum dimension of 2560 pixels and stored in your browser; nothing is uploaded. **Use saved image** restores your custom background after trying a built-in wallpaper, and **Remove image** deletes the stored copy. If storage is unavailable, the image is available only for the current session.

Keep awake is enabled by default, but only activates when you enter fullscreen using **F** or the fullscreen button. Maximizing the window alone does not activate it. Leaving fullscreen, hiding/minimizing the clock, or disabling the setting releases the request. Browser or battery policies may deny it; settings shows its status. Screensaver mode never requests keep-awake.

## Windows screensaver

The Windows setup includes a matching screensaver that fills connected displays, hides the toolbar, and mutes audio.

- Configure its theme and wallpaper through **Configure Flip Clock Screensaver** in the Start menu.
- Its WebView2 profile is separate from the regular clock, so appearance choices must be configured separately.
- Mouse or keyboard activity dismisses it and requests Windows locking; secure resume is enabled by the installer.
- It is an idle screensaver, not a replacement for the Windows lock screen.
- Installation does not change display-off or sleep settings.

## Updating and uninstalling

Re-run the appropriate installer from a newer download to update the installed files.

| Platform | Uninstall |
| --- | --- |
| Windows | Choose **Uninstall Flip Clock** from the Start menu to remove the app and screensaver. |
| macOS | Move `~/Applications/Flip Clock.app` to Trash. |
| Linux | Remove the installed `flip-clock` folder and `applications/flip-clock.desktop` under your data directory. |

Browser preferences and saved images may remain until you clear the browser's stored data. Windows also preserves `%LOCALAPPDATA%\FlipClock\ScreensaverProfile`. Its uninstaller restores the previous screensaver if it still exists, or selects the Windows blank screensaver; secure resume and the current timeout remain in place.

## Development

### Project structure

```text
shared/                  Canonical HTML, CSS, JavaScript, and icons
Windows/                 Windows app files and installation scripts
macOS/                   macOS app files and shell installer
Linux/                   Linux app files and shell installer
tools/                   Packaging, icon, screensaver, and setup builders
tests/                   JavaScript verification scripts
docs/                    Additional documentation
.github/workflows/       Release automation
releases/                Generated packages (excluded from Git)
```

Make clock changes in **`shared/`**. The packaging script copies these files into each platform folder, overwriting the corresponding platform copies.

### Run the checks

With Node.js installed (the release workflow uses Node.js 22), run these commands from the repository root:

```sh
node tests/verify.cjs
node tests/verify-background.cjs
node tests/verify-timer.cjs
node tests/verify-awake.cjs
```

The checks cover clock behavior, appearance preferences, backgrounds, the timer, and fullscreen keep-awake behavior. Native installers and operating-system interactions need separate testing on their target OS.

### Package the platform folders

From PowerShell at the repository root:

```powershell
./tools/Package.ps1
```

This synchronizes shared assets and creates `Flip-Clock-Windows.zip`, `Flip-Clock-macOS.zip`, and `Flip-Clock-Linux.zip` in `releases/`. Build the screensaver first when preparing the complete Windows product.

### Build the Windows installer

On Windows, extract **Microsoft.Web.WebView2 1.0.4191.47** from NuGet into `tools/screensaver/sdk`, then run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/Build-Screensaver.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools/Package.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools/Build-Setup.ps1
```

The output is **`releases/FlipClock-Setup.exe`**. Run it with `/verify` to extract and validate its embedded payload without installing or changing Windows settings:

```powershell
Start-Process -FilePath .\releases\FlipClock-Setup.exe -ArgumentList /verify -Wait
```

### Publish a release

Update `RELEASE_NOTES.md` and the version attributes in `tools/setup/Setup.cs`, then commit and push your changes. Create and push a new version tag, replacing the example with the intended version:

```sh
git tag v1.0.0
git push origin v1.0.0
```

The release workflow builds and verifies the Windows installer, then publishes **FlipClock-Setup.exe** and **SHA256SUMS.txt**. GitHub also supplies source archives. The workflow currently publishes the Windows installer; macOS and Linux can be installed from the source folders above.
