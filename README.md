# Flip Clock

A minimal desktop flip clock with animated digits, colorful themes, custom wallpapers, and a built-in countdown timer. Designed for a clear, distraction-free view of the time, from a simple dark clock to a personalized fullscreen display.

The clock works offline, requires no account, and keeps your preferences on your device.

![Flip Clock with frosted glass cards over a purple starry sky](docs/screenshots/Screenshot%202026-09-18%20223552.png)

*Your wallpaper, your clock — adaptive glass cards over a custom night-sky background.*

[Screenshots](#screenshots) · [Features](#features) · [Countdown timer](#countdown-timer) · [Wallpapers](#wallpapers) · [Installation](#installation)

## Screenshots

| Minimal dark | Warm gradient |
| --- | --- |
| ![Dark clock with large gray digits and a black background](docs/screenshots/Screenshot%202026-09-18%20223435.png) | ![Pink clock digits over a warm peach and purple gradient](docs/screenshots/Screenshot%202026-09-18%20223509.png) |
| A clean display with weekday, date, and seconds. | Combine clock themes with colorful backgrounds. |

![Flip Clock in 12-hour mode with glass cards over an orange abstract wallpaper](docs/screenshots/Screenshot%202026-09-17%20075739.png)

*A warmer look: custom wallpaper, translucent cards, and a 12-hour display.*

## Features

- **Animated flip display** — large hour and minute cards with optional seconds, weekday, and date.
- **Flexible time format** — switch between 12-hour and 24-hour time using your computer's local timezone.
- **10 themes and 10 wallpapers** — combine a clock palette with a built-in background.
- **Custom image backgrounds** — choose your own JPG, PNG, WebP, or AVIF image.
- **Adaptive glass cards** — frosted cards with colors that adapt to your wallpaper, plus adjustable opacity and blur.
- **Countdown timer** — custom durations, quick presets, pause/resume, reset, and an optional alarm.
- **Fullscreen focus** — controls fade when idle, with an optional keep-awake setting where supported.
- **Optional sound** — synthesized tick-tock audio and adjustable volume.
- **Saved preferences** — restore appearance choices and timer state using local browser storage.
- **Windows screensaver** — a matching clock across connected displays, with separate appearance settings.

## Make it your own

Use a plain dark background for a minimal desk clock, pair warm digits with a gradient wallpaper, or add a photo and translucent glass cards. Settings let you adjust clock size, animation, seconds, and date visibility. The clock also respects your system's reduced-motion preference.

Custom images stay on your device and are never uploaded. Images up to **25 MB** are resized to a maximum dimension of **2560 pixels** before being saved locally.

## Wallpapers

Browse the [wallpaper collection](assets/Walpapers/) for backgrounds to pair with your clock. To apply one, download the image, open **Settings → Choose your image**, and select it. Adjust **Glass opacity** and **Glass blur** to suit the background.

These image assets are separate from the 10 built-in wallpapers and are selected through the custom-image picker.

## Countdown timer

Open the **stopwatch button** in the toolbar to set a timer for a focus session, a short break, or a reminder.

| Countdown on a gradient background | Countdown with a custom wallpaper |
| --- | --- |
| ![Countdown timer showing hours, minutes, seconds, quick presets, Start, Reset, and an enabled alarm](docs/screenshots/Screenshot%202026-09-18%20223741.png) | ![Pink countdown timer panel over the glass clock and starry wallpaper](docs/screenshots/Screenshot%202026-09-18%20223658.png) |

- Enter a duration from **1 second to 99 hours, 59 minutes, and 59 seconds**.
- Choose a quick preset: **1 minute**, **5 minutes**, **25 minutes**, or **1 hour**.
- **Start, pause, resume, or reset** the countdown.
- Enable **Alarm when finished** for an audible alert.
- Close the timer panel while the countdown continues.

Running and paused timers are restored when local storage is available. Keep the app open and your computer awake to hear the alarm on time; the timer updates when reopened but cannot sound while the app is closed.

## Controls

| Control | Action |
| --- | --- |
| Stopwatch button | Open the countdown timer |
| **S** / Settings button | Open or close settings |
| **F** / Fullscreen button | Toggle fullscreen |
| **T** / Theme button | Cycle through themes |
| **Escape** | Close an open panel or exit browser fullscreen |

Move the pointer to reveal the toolbar after it fades.

## Installation

Flip Clock includes a **standalone app for Windows, macOS, and Linux**. Each release bundles everything needed to open the clock in its own window, without an installed browser or build tools. The screensaver is available on Windows only. Download the platform packages from Releases after the first bundled-app release is published; the source-code ZIP does not include compiled apps.

### Windows

1. Download **FlipClock-Setup.exe** from a published [release](https://github.com/vasi101/FlipClock/releases).
2. Double-click the installer and follow the prompts. No administrator access is needed.
3. Open **Flip Clock** from your desktop or Start menu.

Requires Windows x64. The screensaver additionally requires WebView2 Runtime and .NET Framework 4.6.2 or newer. Setup installs both the standalone clock and screensaver, enables the screensaver after five minutes (or your existing shorter delay), and enables sign-in on resume.

For the clock alone, download **Flip-Clock-Windows.zip**, extract it completely, and double-click **Install Flip Clock.cmd**. You can also run **Start Flip Clock.cmd** directly from the extracted folder. The regular clock does not require Edge or WebView2.

Use **Configure Flip Clock Screensaver** in the Start menu to choose its appearance. To uninstall, choose **Uninstall Flip Clock**.

### macOS

1. Download **Flip-Clock-macOS.zip** from [Releases](https://github.com/vasi101/FlipClock/releases) after the first standalone macOS release is published. It supports both **Apple Silicon and Intel Macs**.
2. Extract the entire ZIP and double-click **Install macOS.command**.
3. Open **Flip Clock.app** from `~/Applications`. The installer also attempts to open it for you.

No browser, Node.js, build tools, or administrator access is needed. The source-code ZIP does not include the compiled app.

The app is **not Developer ID signed or notarized**. macOS may require you to approve the app or installer in **System Settings → Privacy & Security → Open Anyway**, when that option is offered.

Quit Flip Clock with **Command-Q** before updating. The installer backs up an existing copy. To uninstall, move `~/Applications/Flip Clock.app` to Trash. [More macOS installation details](macOS/README.md).

### Linux

1. Download **Flip-Clock-Linux.zip** from [Releases](https://github.com/vasi101/FlipClock/releases) and extract it completely. This package is for **x64 Linux desktops**.
2. Open a terminal in the extracted `Linux` folder and run:

   ```sh
   sh install-linux.sh
   ```

3. Open **Flip Clock** from your application menu.

The app opens in its own window. No browser or administrator access is needed for the user installation; standard desktop libraries and working Chromium sandbox support are required. Close Flip Clock before updating. To uninstall, remove `~/.local/share/flip-clock` and `~/.local/share/applications/flip-clock.desktop`, or their equivalents under your custom `XDG_DATA_HOME`. Update backups are kept in `flip-clock-backups` under the same data directory.

Re-run your platform's installer from a newer download to update. More installation details: [Windows](Windows/README.md) · [macOS](macOS/README.md) · [Linux](Linux/README.md).
