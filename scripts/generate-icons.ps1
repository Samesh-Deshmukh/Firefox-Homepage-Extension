$out = Join-Path $PSScriptRoot "..\public"
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }
Add-Type -AssemblyName System.Drawing
foreach ($size in 48, 96) {
  $b = New-Object Drawing.Bitmap $size, $size
  $g = [Drawing.Graphics]::FromImage($b)
  $g.Clear([Drawing.Color]::FromArgb(255, 79, 158, 255))
  $f = New-Object Drawing.Font("Segoe UI", [int]($size / 3), [Drawing.FontStyle]::Bold)
  $g.DrawString("N", $f, [Drawing.Brushes]::White, [int]($size / 4), [int]($size / 4))
  $g.Dispose()
  $path = Join-Path $out "icon$size.png"
  $b.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $b.Dispose()
  Copy-Item $path (Join-Path $PSScriptRoot "..\dist\icon$size.png") -Force -ErrorAction SilentlyContinue
}
Write-Host "Icons written to public/"
