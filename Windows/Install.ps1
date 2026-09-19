param(
    [string]$InstallBase = $env:LOCALAPPDATA,
    [string]$DesktopPath = [Environment]::GetFolderPath('Desktop'),
    [string]$ProgramsPath = [Environment]::GetFolderPath('Programs')
)
$ErrorActionPreference = 'Stop'
$appDirectory = [IO.Path]::GetFullPath((Join-Path $InstallBase 'Programs\Flip Clock'))
$menuDirectory = Join-Path $ProgramsPath 'Flip Clock'
$runtimeDirectory = Join-Path $appDirectory 'app'
$sourceRuntime = Join-Path $PSScriptRoot 'app'
$files = @('index.html', 'style.css', 'app.js', 'timer.js', 'background.js', 'awake.js', 'icon.ico', 'icon.svg', 'icon.png', 'Start Flip Clock.cmd', 'Uninstall.ps1', 'runtime-files.json')
foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot $file) -PathType Leaf)) { throw "Missing installation file: $file. Extract the complete Windows release ZIP first." }
}
foreach ($file in @('Flip Clock.exe', 'resources\app.asar')) {
    if (-not (Test-Path -LiteralPath (Join-Path $sourceRuntime $file) -PathType Leaf)) { throw "Missing bundled app file: $file" }
}
if ([IO.Path]::GetFullPath($PSScriptRoot) -eq $appDirectory) { throw 'Run the installer from the extracted release folder, not the installed folder.' }
foreach ($directory in @($appDirectory, $runtimeDirectory)) {
    if ((Test-Path -LiteralPath $directory) -and ((Get-Item -LiteralPath $directory).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Installation path cannot be a symbolic link: $directory" }
}
$installedExecutable = Join-Path $runtimeDirectory 'Flip Clock.exe'
if (Get-Process -Name 'Flip Clock' -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $installedExecutable }) { throw 'Close Flip Clock before updating.' }
New-Item -ItemType Directory -Path $appDirectory, $menuDirectory, $DesktopPath -Force | Out-Null
$stage = Join-Path $appDirectory ('.app-install-' + [Guid]::NewGuid().ToString('N'))
Copy-Item -LiteralPath $sourceRuntime -Destination $stage -Recurse
$backup = $null
try {
    if (Test-Path -LiteralPath $runtimeDirectory) {
        $backupRoot = [IO.Path]::GetFullPath((Join-Path $InstallBase 'FlipClock\Installation Backups'))
        New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
        $backup = Join-Path $backupRoot ('app-' + [Guid]::NewGuid().ToString('N'))
        # Check the exact absolute source and destination before moving a directory.
        if ([IO.Path]::GetFullPath($runtimeDirectory) -ne (Join-Path $appDirectory 'app') -or -not ([IO.Path]::GetFullPath($backup).StartsWith($backupRoot + '\', [StringComparison]::OrdinalIgnoreCase))) { throw 'Invalid runtime backup path.' }
        Move-Item -LiteralPath $runtimeDirectory -Destination $backup
    }
    if (-not ([IO.Path]::GetFullPath($stage).StartsWith($appDirectory + '\', [StringComparison]::OrdinalIgnoreCase))) { throw 'Invalid staging path.' }
    Move-Item -LiteralPath $stage -Destination $runtimeDirectory
} catch {
    if ($backup -and -not (Test-Path -LiteralPath $runtimeDirectory)) { Move-Item -LiteralPath $backup -Destination $runtimeDirectory }
    throw
}
foreach ($file in $files) { Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $appDirectory -Force }
$shell = New-Object -ComObject WScript.Shell
foreach ($shortcutPath in @((Join-Path $DesktopPath 'Flip Clock.lnk'), (Join-Path $menuDirectory 'Flip Clock.lnk'))) {
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $installedExecutable
    $shortcut.WorkingDirectory = $runtimeDirectory
    $shortcut.Description = 'Your offline flip clock'
    $shortcut.IconLocation = "$(Join-Path $appDirectory 'icon.ico'),0"
    $shortcut.Save()
}
$uninstall = $shell.CreateShortcut((Join-Path $menuDirectory 'Uninstall Flip Clock.lnk'))
$uninstall.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$uninstall.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$(Join-Path $appDirectory 'Uninstall.ps1')`" -InstallBase `"$InstallBase`" -DesktopPath `"$DesktopPath`" -ProgramsPath `"$ProgramsPath`""
$uninstall.Save()
Write-Host "Flip Clock installed in $appDirectory"
if ($backup) { Write-Host "Previous runtime saved to $backup" }
Write-Host 'Open Flip Clock from your desktop or Start menu. No browser is required.'
