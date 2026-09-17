$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectDirectory 'Windows'
$sdk = Join-Path $PSScriptRoot 'screensaver\sdk'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $sdk)) { throw 'Extract Microsoft.Web.WebView2 1.0.4191.47 NuGet package to screensaver/sdk first.' }
$core = Join-Path $sdk 'lib\net462\Microsoft.Web.WebView2.Core.dll'
$forms = Join-Path $sdk 'lib\net462\Microsoft.Web.WebView2.WinForms.dll'
& $compiler /nologo /target:winexe /platform:x64 "/out:$(Join-Path $outputDirectory 'FlipClock.scr')" "/win32icon:$(Join-Path $projectDirectory 'shared\icon.ico')" /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll "/reference:$core" "/reference:$forms" (Join-Path $PSScriptRoot 'screensaver\ScreenSaver.cs')
if ($LASTEXITCODE) { throw 'Screensaver compilation failed.' }
Copy-Item -LiteralPath $core,$forms -Destination $outputDirectory -Force
Copy-Item -LiteralPath (Join-Path $sdk 'runtimes\win-x64\native\WebView2Loader.dll') -Destination $outputDirectory -Force
Write-Output 'Built FlipClock.scr for Windows x64.'
