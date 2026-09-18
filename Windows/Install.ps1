$ErrorActionPreference = 'Stop'
$appDirectory = Join-Path $env:LOCALAPPDATA 'Programs\Flip Clock'
$desktopDirectory = [Environment]::GetFolderPath('Desktop')
$menuDirectory = Join-Path ([Environment]::GetFolderPath('Programs')) 'Flip Clock'
$edgeCandidates = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)
$edge = $edgeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge is required to install Flip Clock in its own app window.' }
$files = @('index.html', 'style.css', 'app.js', 'timer.js', 'background.js','awake.js', 'icon.ico', 'icon.svg', 'icon.png', 'Start Flip Clock.cmd', 'Uninstall.ps1')
foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot $file))) { throw "Missing installation file: $file" }
}
New-Item -ItemType Directory -Path $appDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $menuDirectory -Force | Out-Null
foreach ($file in $files) { Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $appDirectory -Force }
$shell = New-Object -ComObject WScript.Shell
$appUri = ([Uri](Join-Path $appDirectory 'index.html')).AbsoluteUri
foreach ($shortcutPath in @((Join-Path $desktopDirectory 'Flip Clock.lnk'), (Join-Path $menuDirectory 'Flip Clock.lnk'))) {
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $edge
    $shortcut.Arguments = "--app=`"$appUri`" --start-maximized"
    $shortcut.WorkingDirectory = $appDirectory
    $shortcut.Description = 'Your offline flip clock'
    $shortcut.IconLocation = "$(Join-Path $appDirectory 'icon.ico'),0"
    $shortcut.Save()
}
$uninstall = $shell.CreateShortcut((Join-Path $menuDirectory 'Uninstall Flip Clock.lnk'))
$uninstall.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$uninstall.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$(Join-Path $appDirectory 'Uninstall.ps1')`""
$uninstall.Save()
Write-Host "Flip Clock installed in $appDirectory"
Write-Host 'Open Flip Clock from your desktop or Start menu.'
