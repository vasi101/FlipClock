#!/bin/sh
set -eu
[ "$(uname -s)" = Linux ] || { printf '%s\n' 'Run this installer on Linux.' >&2; exit 1; }
source_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
data_dir=${XDG_DATA_HOME:-"$HOME/.local/share"}
case "$data_dir" in /*) ;; *) printf '%s\n' 'XDG_DATA_HOME must be an absolute path.' >&2; exit 1;; esac
app_dir="$data_dir/flip-clock"
for file in app/flip-clock app/resources/app.asar app/chrome_crashpad_handler icon.png launch-unix.sh; do
    [ -f "$source_dir/$file" ] || { printf 'Missing bundled file: %s. Extract the complete Linux release ZIP first.\n' "$file" >&2; exit 1; }
done
[ ! -L "$app_dir" ] || { printf '%s\n' 'Move the symbolic link at the installation destination aside first.' >&2; exit 1; }
[ "$source_dir" != "$app_dir" ] || { printf '%s\n' 'Run the installer from the extracted release folder.' >&2; exit 1; }
if command -v pgrep >/dev/null 2>&1 && pgrep -x flip-clock >/dev/null 2>&1; then
    printf '%s\n' 'Close Flip Clock before updating.' >&2
    exit 1
fi
mkdir -p "$data_dir" "$data_dir/applications"
stage=$(mktemp -d "$data_dir/.flip-clock-install.XXXXXX")
cp -pR "$source_dir/app" "$stage/app"
cp "$source_dir/icon.png" "$source_dir/launch-unix.sh" "$stage/"
chmod +x "$stage/app/flip-clock" "$stage/app/chrome_crashpad_handler" "$stage/launch-unix.sh"
backup=''
rollback() {
    if [ ! -e "$app_dir" ] && [ -n "$backup" ] && [ -d "$backup" ]; then mv "$backup" "$app_dir"; fi
}
trap rollback EXIT
if [ -e "$app_dir" ]; then
    mkdir -p "$data_dir/flip-clock-backups"
    backup_parent=$(mktemp -d "$data_dir/flip-clock-backups/previous.XXXXXX")
    backup="$backup_parent/flip-clock"
    mv "$app_dir" "$backup"
fi
mv "$stage" "$app_dir"
trap - EXIT
# Desktop Entry Exec quoting differs from shell quoting.
exec_path=$(printf '%s' "$app_dir/app/flip-clock" | sed 's/\\/\\\\\\\\/g; s/"/\\\\"/g; s/`/\\\\`/g; s/\$/\\\\$/g; s/%/%%/g')
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
printf '%s\n' 'Installed. Open Flip Clock from your application menu. No browser is required.'
if [ -n "$backup" ]; then printf 'Previous app saved to: %s\n' "$backup"; fi
