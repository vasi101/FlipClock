# Flip Clock v1.0.0

Offline flip clock with standalone packages for Windows, Linux, and macOS.

- Ten clock themes and ten built-in wallpapers.
- Custom image backgrounds with adjustable glass cards.
- 12/24-hour time, optional seconds and date, fullscreen, and saved preferences.
- Countdown timer with pause/resume, optional alarm, and tick-tock sound.
- Windows x64 screensaver with multiple-display support and secure resume.

## Downloads

Download the ZIP for your operating system and extract it before installing:

| Asset | Installation |
| --- | --- |
| `Flip-Clock-Windows.zip` | Open `Windows/Install Flip Clock.cmd`, or `Windows/Install Screensaver.cmd` for the screensaver. |
| `Flip-Clock-Linux.zip` | In `Linux`, run `sh install-linux.sh`. |
| `Flip-Clock-macOS.zip` | In `macOS`, run `sh "Install macOS.command"`. |

`SHA256SUMS.txt` contains checksums for the three ZIP files.

## Requirements and known limitations

The regular clock uses an installed browser. The Windows screensaver requires Windows x64, Microsoft Edge WebView2 Runtime, and .NET Framework 4.6.2 or newer. Its installer enables sign-in on resume.

Linux/macOS native launch testing and the Windows screensaver's full-screen dismissal/sign-in test remain outstanding. The macOS app is not signed or notarized. Keep the clock open and the computer awake for timely timer alarms.
