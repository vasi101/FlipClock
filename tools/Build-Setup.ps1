$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$releaseDirectory = Join-Path $projectDirectory 'releases'
$payload = Join-Path $releaseDirectory 'Flip-Clock-Windows.zip'
if (-not (Test-Path -LiteralPath $payload)) { throw 'Run Build-Screensaver.ps1 and Package.ps1 first.' }
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$output = Join-Path $releaseDirectory 'FlipClock-Setup.exe'
& $compiler /nologo /target:winexe /platform:x64 "/out:$output" "/win32icon:$(Join-Path $projectDirectory 'shared\icon.ico')" /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll "/resource:$payload,FlipClock.Payload.zip" (Join-Path $PSScriptRoot 'setup\Setup.cs')
if ($LASTEXITCODE) { throw 'Setup compilation failed.' }
Write-Output "Built $output"
