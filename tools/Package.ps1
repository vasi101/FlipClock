$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$sharedDirectory = Join-Path $projectDirectory 'shared'
$releaseDirectory = Join-Path $projectDirectory 'releases'
New-Item -ItemType Directory -Path $releaseDirectory -Force | Out-Null
$commonFiles = @('index.html','style.css','app.js','timer.js','background.js','awake.js','icon.svg','icon.png','icon.ico')
foreach ($platform in @('Windows','Linux','macOS')) {
    $platformDirectory = Join-Path $projectDirectory $platform
    $files = $commonFiles
    if ($platform -ne 'Windows') { $files += 'launch-unix.sh' }
    if ($platform -eq 'macOS') { $files += 'icon.icns' }
    foreach ($file in $files) {
        Copy-Item -LiteralPath (Join-Path $sharedDirectory $file) -Destination $platformDirectory -Force
    }
    Compress-Archive -LiteralPath $platformDirectory -DestinationPath (Join-Path $releaseDirectory "Flip-Clock-$platform.zip") -Force
    Write-Output "Updated $platform folder and Flip-Clock-$platform.zip"
}
