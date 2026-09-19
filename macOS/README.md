# Flip Clock for macOS

Download **Flip-Clock-macOS.zip** from [Releases](https://github.com/vasi101/FlipClock/releases). This package contains a standalone app for both Apple Silicon and Intel Macs; no browser, Node.js, or build tools are required.

1. Extract the entire ZIP.
2. Double-click **Install macOS.command** in the extracted folder.
3. The installer copies **Flip Clock.app** to `~/Applications` and opens it.

If you prefer Terminal, open it in the extracted folder and run:

```sh
sh "Install macOS.command"
```

The app uses local/ad-hoc signing and is **not Developer ID signed or notarized**. macOS may block the app or the downloaded installation script. If macOS offers it, approve the blocked item in **System Settings > Privacy & Security > Open Anyway**, then open it again. The installer does not disable security checks or remove quarantine attributes.

You can also copy **Flip Clock.app** into `~/Applications` manually. The source-code ZIP does not contain the compiled app. Use the release ZIP after the first Electron release is published.

Press **S** for settings, **F** for fullscreen, and **T** to cycle themes. The toolbar includes the countdown timer. The Windows screensaver is not included.

To update, quit Flip Clock with **Command-Q** and run the installer from the new release. An existing app is backed up under `~/Library/Application Support/Flip Clock/Installation Backups`. Settings and images are stored separately in the app's local profile; preferences from the old browser launcher are not imported.

To uninstall, quit Flip Clock and move `~/Applications/Flip Clock.app` to Trash. Saved preferences and installation backups remain until you remove them separately.

The release workflow checks the packaged app on its macOS runner. Interactive installation, Gatekeeper approval, audio, and fullscreen behavior should also be checked on a Mac before broad distribution.
