$ErrorActionPreference = 'Stop'
$appDirectory = Join-Path $env:LOCALAPPDATA 'Programs\Flip Clock'
$key = 'HKCU:\Control Panel\Desktop'
$installedSaver = Join-Path $appDirectory 'FlipClock.scr'
if ((Get-ItemProperty -LiteralPath $key).'SCRNSAVE.EXE' -eq $installedSaver) {
    $replacement = Join-Path $env:WINDIR 'System32\scrnsave.scr'
    $backup = Join-Path $appDirectory 'previous-screensaver.json'
    if (Test-Path -LiteralPath $backup) {
        $previous = (Get-Content -LiteralPath $backup -Raw | ConvertFrom-Json).Previous
        if ($previous -and $previous -ne $installedSaver -and (Test-Path -LiteralPath $previous)) { $replacement = $previous }
    }
    # Keep secure resume and the existing timeout in place.
    Set-ItemProperty -LiteralPath $key -Name 'SCRNSAVE.EXE' -Value $replacement
}
