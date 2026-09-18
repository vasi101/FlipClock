#!/bin/sh
set -eu
if [ "$(uname -s)" != Linux ]; then printf '%s\n' 'Run this installer on Linux.' >&2; exit 1; fi
source_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
data_dir=${XDG_DATA_HOME:-"$HOME/.local/share"}
case "$data_dir" in /*) ;; *) printf '%s\n' 'XDG_DATA_HOME must be an absolute path.' >&2; exit 1;; esac
app_dir="$data_dir/flip-clock"
for file in index.html style.css app.js timer.js background.js awake.js icon.svg icon.png icon.ico launch-unix.sh; do
    [ -f "$source_dir/$file" ] || { printf 'Missing file: %s\n' "$file" >&2; exit 1; }
done
mkdir -p "$app_dir" "$data_dir/applications"
for file in index.html style.css app.js timer.js background.js awake.js icon.svg icon.png icon.ico launch-unix.sh; do
    cp "$source_dir/$file" "$app_dir/$file"
done
chmod +x "$app_dir/launch-unix.sh"
# Desktop Entry Exec quoting differs from shell quoting.
exec_path=$(printf '%s' "$app_dir/launch-unix.sh" | sed 's/\\/\\\\\\\\/g; s/"/\\\\"/g; s/`/\\\\`/g; s/\$/\\\\$/g; s/%/%%/g')
icon_path=$(printf '%s' "$app_dir/icon.png" | sed 's/\\/\\\\/g')
cat > "$data_dir/applications/flip-clock.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Flip Clock
Comment=Offline flip clock and countdown timer
Exec="$exec_path"
Icon=$icon_path
Terminal=false
Categories=Utility;Clock;
EOF
if command -v update-desktop-database >/dev/null 2>&1; then update-desktop-database "$data_dir/applications" || true; fi
printf '%s\n' 'Installed. Open Flip Clock from your application menu.' 'Chrome, Chromium, Edge, or Brave opens a dedicated app window; otherwise your default browser opens.'
