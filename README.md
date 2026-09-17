# Flip Clock

Choose the folder for your operating system. Each platform folder contains all the files it needs and can be copied on its own.

| Platform | Install |
| --- | --- |
| **Windows** | Open `Windows/Install Flip Clock.cmd`. For the secure idle screensaver, use `Windows/Install Screensaver.cmd`. |
| **Linux** | Open a terminal in `Linux` and run `sh install-linux.sh`. |
| **macOS** | Open a terminal in `macOS` and run `sh "Install macOS.command"`. |

Ready-to-share archives are in **releases**: `Flip-Clock-Windows.zip`, `Flip-Clock-Linux.zip`, and `Flip-Clock-macOS.zip`. Extract the archive before installing. Windows includes the screensaver; Linux/macOS include the regular clock only. Native Linux/macOS launch testing remains outstanding.

## Project layout

- `Windows/`, `Linux/`, `macOS/`: standalone platform packages and installers.
- `shared/`: canonical clock source and shared assets. Make UI changes here.
- `tools/`: icon generation, Windows screensaver source/SDK, and packaging scripts.
- `tests/`: JavaScript checks and the previous screensaver smoke-test result.
- `docs/README.md`: detailed feature and platform documentation from the previous flat layout.
- `releases/legacy/`: preserved older combined packages, superseded by the platform archives.

After changing `shared`, run `powershell -NoProfile -ExecutionPolicy Bypass -File tools/Package.ps1` to synchronize the platform folders and rebuild the archives.

Run checks from any working directory with `node tests/verify.cjs`, `node tests/verify-background.cjs`, and `node tests/verify-timer.cjs` (use the appropriate absolute path when outside this project). Build the Windows screensaver with `tools/Build-Screensaver.ps1`, or regenerate icons with `tools/Build-Icon.ps1`, then rerun packaging.

Installed copies in your user Apps folder are independent of this source folder reorganization.
