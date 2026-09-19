# Flip Clock for Windows

Download **Flip-Clock-Windows.zip** from [Releases](https://github.com/vasi101/FlipClock/releases) and extract it completely. Double-click **Install Flip Clock.cmd** to install the standalone clock, or **Install Screensaver.cmd** to install both the clock and secure idle screensaver. No administrator access is needed. **Start Flip Clock.cmd** also opens the bundled app directly without installing it. The source-code ZIP does not include the compiled app.

The Windows x64 clock includes its own runtime: no browser, Node.js, or build tools are needed. Only the optional screensaver needs Microsoft Edge WebView2 Runtime and .NET Framework 4.6.2 or newer. Its installer enables sign-in on resume and uses five minutes or an existing shorter delay. **FlipClock-Setup.exe** installs both components using the same bundled files.

Open **Flip Clock** from Start or the desktop. Use **Configure Flip Clock Screensaver** in Start to choose the screensaver's appearance separately. Press **S** for settings, **F** for fullscreen, or **T** to cycle themes. You can choose your own image and adjust adaptive glass opacity and blur.

Use **Uninstall Flip Clock** in Start to uninstall. Close the clock before updating or uninstalling. Re-run an installer to update; the previous runtime is saved under `%LOCALAPPDATA%\FlipClock\Installation Backups`. Saved preferences and backups remain after uninstall. The standalone app has its own profile; preferences from the old browser launcher are not imported. Extract all files before running an installer.

Keep awake in fullscreen is enabled by default. Enter fullscreen using F or the fullscreen button to activate it. Leaving fullscreen, minimizing, or hiding the clock releases it. Maximizing the window alone does not activate it. Settings shows whether it is active. Closing the clock or switching the toggle off restores normal sleep behavior. Screensaver mode never requests keep-awake. Browser/battery policies may deny it; manual sleep and locking remain available. API behavior: https://www.w3.org/TR/screen-wake-lock/
