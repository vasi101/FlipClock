# Flip Clock for Linux

Download **Flip-Clock-Linux.zip** from [Releases](https://github.com/vasi101/FlipClock/releases), extract the entire archive, then open a terminal in the extracted `Linux` folder and run:

```sh
sh install-linux.sh
```

Open **Flip Clock** from your application menu. This is a standalone x64 app with its own runtime; no browser, Node.js, or build tools are needed. No administrator access is needed to install into your user data directory. The source-code ZIP does not include the compiled app. To run the extracted app without installing, use `sh launch-unix.sh`.

The app needs a Linux desktop with standard GTK, NSS, and audio libraries, plus working Chromium sandbox support. Packaging is tested on Ubuntu 22.04 in CI. If your distribution reports a sandbox or missing-library error, use its supported configuration; the launcher does not disable the sandbox.

Press **S** for themes, wallpapers, custom images, adaptive glass, and sound. **F** toggles fullscreen. The toolbar includes a countdown timer. The Windows screensaver is not included.

To uninstall, move `~/.local/share/flip-clock` and `~/.local/share/applications/flip-clock.desktop` to Trash (or the corresponding paths under your custom `XDG_DATA_HOME`). Close Flip Clock before re-running the installer to update. Previous installations are saved in `flip-clock-backups` under the same data directory. Saved preferences and backups remain after uninstall. Preferences from the old browser launcher are not imported. Interactive desktop behavior still needs testing on your target distribution.
