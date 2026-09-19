$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$testRoot = Join-Path $project ('releases\windows-install-test-' + [Guid]::NewGuid().ToString('N'))
$extracted = Join-Path $testRoot 'extracted'
Expand-Archive -LiteralPath (Join-Path $project 'releases\Flip-Clock-Windows.zip') -DestinationPath $extracted
$payload = Join-Path $extracted 'Windows'
$parameters = @{
    InstallBase = Join-Path $testRoot 'local data'
    DesktopPath = Join-Path $testRoot 'desktop'
    ProgramsPath = Join-Path $testRoot 'programs'
}
$installed = Join-Path $parameters.InstallBase 'Programs\Flip Clock'
& (Join-Path $payload 'Install.ps1') @parameters
$binary = Join-Path $installed 'app\Flip Clock.exe'
if (-not (Test-Path -LiteralPath $binary)) { throw 'Standalone executable was not installed.' }
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut((Join-Path $parameters.DesktopPath 'Flip Clock.lnk'))
if ($shortcut.TargetPath -ne $binary) { throw 'Shortcut does not target the bundled executable.' }
& node (Join-Path $PSScriptRoot 'run-electron-smoke.cjs') $binary
if ($LASTEXITCODE) { throw 'Installed app smoke test failed.' }
Set-Content -LiteralPath (Join-Path $installed 'app\previous-version.txt') -Value 'previous runtime'
& (Join-Path $payload 'Install.ps1') @parameters
$backupRoot = Join-Path $parameters.InstallBase 'FlipClock\Installation Backups'
if (-not (Get-ChildItem -LiteralPath $backupRoot -Recurse -Filter previous-version.txt)) { throw 'Update did not preserve the previous runtime.' }
# Reject an escaping manifest before deleting anything.
$manifest = Join-Path $installed 'runtime-files.json'
$originalManifest = Get-Content -LiteralPath $manifest -Raw
$sentinel = Join-Path $installed 'outside-sentinel.txt'
Set-Content -LiteralPath $sentinel -Value 'preserve'
Set-Content -LiteralPath $manifest -Value '["../outside-sentinel.txt"]'
$rejected = $false
try { & (Join-Path $installed 'Uninstall.ps1') @parameters } catch { $rejected = $true }
if (-not $rejected -or -not (Test-Path -LiteralPath $sentinel) -or -not (Test-Path -LiteralPath $binary)) { throw 'Manifest path traversal was not rejected safely.' }
Set-Content -LiteralPath $manifest -Value $originalManifest
$userFile = Join-Path $installed 'app\user-note.txt'
Set-Content -LiteralPath $userFile -Value 'preserve user files'
& (Join-Path $installed 'Uninstall.ps1') @parameters
if (Test-Path -LiteralPath $binary) { throw 'Bundled runtime was not removed.' }
if (-not (Test-Path -LiteralPath $userFile)) { throw 'Uninstaller removed a user-added file.' }
if (Test-Path -LiteralPath (Join-Path $parameters.DesktopPath 'Flip Clock.lnk')) { throw 'Desktop shortcut was not removed.' }
Write-Output "Passed: standalone Windows install, shortcut, startup, update backup, manifest validation, and uninstall. Test files: $testRoot"
