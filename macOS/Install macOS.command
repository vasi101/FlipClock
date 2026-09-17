#!/bin/sh
set -eu
if [ "$(uname -s)" != Darwin ]; then printf '%s\n' 'Run this installer on macOS.' >&2; exit 1; fi
source_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
app_dir="$HOME/Applications/Flip Clock.app"
for file in index.html style.css app.js timer.js background.js icon.svg icon.png icon.ico icon.icns launch-unix.sh; do
    [ -f "$source_dir/$file" ] || { printf 'Missing file: %s\n' "$file" >&2; exit 1; }
done
mkdir -p "$app_dir/Contents/MacOS" "$app_dir/Contents/Resources"
for file in index.html style.css app.js timer.js background.js icon.svg icon.png icon.ico icon.icns launch-unix.sh; do
    cp "$source_dir/$file" "$app_dir/Contents/Resources/$file"
done
cat > "$app_dir/Contents/MacOS/FlipClock" <<'EOF'
#!/bin/sh
set -eu
contents_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
exec /bin/sh "$contents_dir/Resources/launch-unix.sh"
EOF
chmod +x "$app_dir/Contents/MacOS/FlipClock" "$app_dir/Contents/Resources/launch-unix.sh"
cat > "$app_dir/Contents/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Flip Clock</string>
<key>CFBundleDisplayName</key><string>Flip Clock</string>
<key>CFBundleIdentifier</key><string>local.flipclock.app</string>
<key>CFBundleVersion</key><string>1</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleExecutable</key><string>FlipClock</string>
<key>CFBundleIconFile</key><string>icon.icns</string>
<key>LSUIElement</key><true/>
</dict></plist>
EOF
touch "$app_dir"
printf '%s\n' "Installed: $app_dir" 'Open Flip Clock from your user Applications folder.' 'Chrome, Edge, Brave, or Chromium opens a dedicated app window; otherwise your default browser opens.'
