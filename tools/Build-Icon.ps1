$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$outputDirectory = Join-Path (Split-Path -Parent $PSScriptRoot) 'shared'
function RoundedRectangle($graphics, $brush, [float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc(($x + $width - $diameter), $y, $diameter, $diameter, 270, 90)
    $path.AddArc(($x + $width - $diameter), ($y + $height - $diameter), $diameter, $diameter, 0, 90)
    $path.AddArc($x, ($y + $height - $diameter), $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $graphics.FillPath($brush, $path)
    $path.Dispose()
}
$frames = @()
foreach ($size in @(16, 24, 32, 48, 64, 128, 256)) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = 'AntiAlias'
    $graphics.TextRenderingHint = 'AntiAliasGridFit'
    $graphics.ScaleTransform(($size / 256.0), ($size / 256.0))
    $background = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#101616'))
    $card = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#2b3634'))
    $ink = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#e7f2eb'))
    $accent = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#9abdab'))
    RoundedRectangle $graphics $background 8 8 240 240 54
    RoundedRectangle $graphics $card 27 51 96 154 16
    RoundedRectangle $graphics $card 133 51 96 154 16
    $font = New-Object System.Drawing.Font('Segoe UI', 112, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = 'Center'
    $format.LineAlignment = 'Center'
    $graphics.DrawString('0', $font, $ink, [System.Drawing.RectangleF]::new(27, 48, 96, 154), $format)
    $graphics.DrawString('8', $font, $ink, [System.Drawing.RectangleF]::new(133, 48, 96, 154), $format)
    $graphics.FillRectangle($background, 27, 126, 96, 5)
    $graphics.FillRectangle($background, 133, 126, 96, 5)
    RoundedRectangle $graphics $accent 110 26 36 5 2.5
    $stream = New-Object System.IO.MemoryStream
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    $frames += ,@{ Size = $size; Bytes = $stream.ToArray() }
    if ($size -eq 256) { $bitmap.Save((Join-Path $outputDirectory 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
    foreach ($resource in @($stream, $format, $font, $accent, $ink, $card, $background, $graphics, $bitmap)) { $resource.Dispose() }
}
$output = [System.IO.File]::Create((Join-Path $outputDirectory 'icon.ico'))
$writer = New-Object System.IO.BinaryWriter($output)
try {
    $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$frames.Count)
    $offset = 6 + 16 * $frames.Count
    foreach ($frame in $frames) {
        $dimension = $frame.Size % 256
        $writer.Write([byte]$dimension); $writer.Write([byte]$dimension)
        $writer.Write([byte]0); $writer.Write([byte]0)
        $writer.Write([uint16]1); $writer.Write([uint16]32)
        $writer.Write([uint32]$frame.Bytes.Length); $writer.Write([uint32]$offset)
        $offset += $frame.Bytes.Length
    }
    foreach ($frame in $frames) { $writer.Write([byte[]]$frame.Bytes) }
} finally { $writer.Dispose(); $output.Dispose() }
Write-Output 'Created icon.ico (7 sizes) and icon.png.'
