param([Parameter(Mandatory=$true)][string]$Payload, [Parameter(Mandatory=$true)][string]$Archive)
$ErrorActionPreference = 'Stop'
Compress-Archive -LiteralPath $Payload -DestinationPath $Archive -Force
