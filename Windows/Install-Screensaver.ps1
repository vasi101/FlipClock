$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'Install.ps1')
$appDirectory = Join-Path $env:LOCALAPPDATA 'Programs\Flip Clock'
$files = @('FlipClock.scr','Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.WinForms.dll','WebView2Loader.dll','Remove-Screensaver.ps1')
foreach ($file in $files) {
    $source = Join-Path $PSScriptRoot $file
    if (-not (Test-Path -LiteralPath $source)) { throw "Missing screensaver file: $file" }
    Copy-Item -LiteralPath $source -Destination $appDirectory -Force
}
$key = 'HKCU:\Control Panel\Desktop'
$oldSettings = Get-ItemProperty -LiteralPath $key
$backup = Join-Path $appDirectory 'previous-screensaver.json'
if (-not (Test-Path -LiteralPath $backup)) {
    @{ Previous = $oldSettings.'SCRNSAVE.EXE' } | ConvertTo-Json | Set-Content -LiteralPath $backup
}
$timeout = 300
$existingTimeout = 0
if ([int]::TryParse([string]$oldSettings.ScreenSaveTimeOut, [ref]$existingTimeout) -and $existingTimeout -gt 0) { $timeout = [Math]::Min(300, $existingTimeout) }
New-ItemProperty -LiteralPath $key -Name 'SCRNSAVE.EXE' -Value (Join-Path $appDirectory 'FlipClock.scr') -PropertyType String -Force | Out-Null
New-ItemProperty -LiteralPath $key -Name 'ScreenSaveActive' -Value '1' -PropertyType String -Force | Out-Null
New-ItemProperty -LiteralPath $key -Name 'ScreenSaverIsSecure' -Value '1' -PropertyType String -Force | Out-Null
New-ItemProperty -LiteralPath $key -Name 'ScreenSaveTimeOut' -Value ([string]$timeout) -PropertyType String -Force | Out-Null
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class FlipSaverSettings {
 [DllImport("user32.dll", SetLastError=true)] public static extern bool SystemParametersInfo(uint action, uint value, IntPtr data, uint flags);
}
'@
foreach ($setting in @(@(0x000F,$timeout),@(0x0011,1),@(0x0077,1))) {
    if (-not [FlipSaverSettings]::SystemParametersInfo($setting[0],$setting[1],[IntPtr]::Zero,3)) { throw "Windows could not apply screensaver setting $($setting[0])." }
}
$menu = Join-Path ([Environment]::GetFolderPath('Programs')) 'Flip Clock'
$shell = New-Object -ComObject WScript.Shell
$configure = $shell.CreateShortcut((Join-Path $menu 'Configure Flip Clock Screensaver.lnk'))
$configure.TargetPath = Join-Path $appDirectory 'FlipClock.scr'
$configure.Arguments = '/c'
$configure.IconLocation = "$(Join-Path $appDirectory 'icon.ico'),0"
$configure.Save()
$settings = $shell.CreateShortcut((Join-Path $menu 'Windows Screen Saver Settings.lnk'))
$settings.TargetPath = Join-Path $env:WINDIR 'System32\rundll32.exe'
$settings.Arguments = 'shell32.dll,Control_RunDLL desk.cpl,,1'
$settings.Save()
Write-Output "Screensaver installed: activates after $timeout seconds; sign-in required on resume."
Write-Output 'Use Configure Flip Clock Screensaver in Start to choose its theme and wallpaper.'
