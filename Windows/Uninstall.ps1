param(
    [string]$InstallBase = $env:LOCALAPPDATA,
    [string]$DesktopPath = [Environment]::GetFolderPath('Desktop'),
    [string]$ProgramsPath = [Environment]::GetFolderPath('Programs')
)
$ErrorActionPreference = 'Stop'
$appDirectory = [IO.Path]::GetFullPath((Join-Path $InstallBase 'Programs\Flip Clock'))
if ([IO.Path]::GetFullPath($PSScriptRoot) -ne $appDirectory) { throw 'Run the installed uninstaller from the Start menu.' }
$menuDirectory = Join-Path $ProgramsPath 'Flip Clock'
$desktopShortcut = Join-Path $DesktopPath 'Flip Clock.lnk'
$runtimeDirectory = Join-Path $appDirectory 'app'
$installedExecutable = Join-Path $runtimeDirectory 'Flip Clock.exe'
if (Get-Process -Name 'Flip Clock' -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $installedExecutable }) { throw 'Close Flip Clock before uninstalling.' }
# Remove only manifested runtime files, preserving any files added by the user.
$manifest = Join-Path $appDirectory 'runtime-files.json'
if (Test-Path -LiteralPath $manifest) {
    $runtimeFiles = Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json
    if (Test-Path -LiteralPath $runtimeDirectory) {
        $items = @((Get-Item -LiteralPath $runtimeDirectory)) + @(Get-ChildItem -LiteralPath $runtimeDirectory -Recurse -Force)
        if ($items | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) { throw 'Refusing to uninstall through a symbolic link in the app folder.' }
    }
    $paths = foreach ($file in $runtimeFiles) {
        if ($file -isnot [string] -or [string]::IsNullOrWhiteSpace($file)) { throw 'Invalid runtime manifest entry.' }
        $target = [IO.Path]::GetFullPath((Join-Path $runtimeDirectory $file))
        if (-not $target.StartsWith($runtimeDirectory + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid runtime manifest path.' }
        $target
    }
    foreach ($target in $paths) {
        if (Test-Path -LiteralPath $target -PathType Leaf) { Remove-Item -LiteralPath $target -Force }
    }
    if (Test-Path -LiteralPath $runtimeDirectory) {
        $directories = @(Get-ChildItem -LiteralPath $runtimeDirectory -Directory -Recurse | Sort-Object { $_.FullName.Length } -Descending | Select-Object -ExpandProperty FullName) + @($runtimeDirectory)
        foreach ($directory in $directories) {
            if (-not (Get-ChildItem -LiteralPath $directory -Force)) { Remove-Item -LiteralPath $directory }
        }
    }
    Remove-Item -LiteralPath $manifest -Force
}
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
Write-Host 'Flip Clock uninstalled. Saved preferences and runtime backups have been preserved.'
