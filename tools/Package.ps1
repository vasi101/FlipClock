$ErrorActionPreference = 'Stop'
# Package on the native OS so its runtime and installer can be tested before release.
$builder = Join-Path $PSScriptRoot 'Package-Electron.mjs'
& node $builder win32
if ($LASTEXITCODE) { throw 'Electron Windows packaging failed.' }
