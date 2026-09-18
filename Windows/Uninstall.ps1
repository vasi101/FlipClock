$ErrorActionPreference = 'Stop'
$appDirectory = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Programs\Flip Clock'))
if ([IO.Path]::GetFullPath($PSScriptRoot) -ne $appDirectory) { throw 'Run the installed uninstaller from the Start menu.' }
$menuDirectory = Join-Path ([Environment]::GetFolderPath('Programs')) 'Flip Clock'
$desktopShortcut = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Flip Clock.lnk'
if (Test-Path -LiteralPath (Join-Path $appDirectory 'Remove-Screensaver.ps1')) { & (Join-Path $appDirectory 'Remove-Screensaver.ps1') }
foreach ($name in @('Configure Flip Clock Screensaver.lnk','Windows Screen Saver Settings.lnk')) {
    $shortcutPath = Join-Path $menuDirectory $name
    if (Test-Path -LiteralPath $shortcutPath) { Remove-Item -LiteralPath $shortcutPath -Force }
}
foreach ($path in @($desktopShortcut, (Join-Path $menuDirectory 'Flip Clock.lnk'), (Join-Path $menuDirectory 'Uninstall Flip Clock.lnk'))) {
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
}
foreach ($file in @('index.html', 'style.css', 'app.js', 'timer.js', 'background.js','awake.js', 'icon.ico', 'icon.svg', 'icon.png', 'Start Flip Clock.cmd', 'Uninstall.ps1', 'FlipClock.scr', 'Microsoft.Web.WebView2.Core.dll', 'Microsoft.Web.WebView2.WinForms.dll', 'WebView2Loader.dll', 'Remove-Screensaver.ps1', 'previous-screensaver.json', 'WebView2-LICENSE.txt', 'WebView2-NOTICE.txt')) {
    $path = Join-Path $appDirectory $file
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
}
# Remove only empty directories; preserve any files the user added.
foreach ($directory in @($appDirectory, $menuDirectory)) {
    if ((Test-Path -LiteralPath $directory) -and -not (Get-ChildItem -LiteralPath $directory -Force)) { Remove-Item -LiteralPath $directory }
}
Write-Host 'Flip Clock uninstalled. Browser preferences have been preserved.'
