#!/bin/sh
set -eu

if [ "$(uname -s)" != Darwin ]; then
    printf '%s\n' 'Run this installer on macOS.' >&2
    exit 1
fi
source_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
payload="$source_dir/Flip Clock.app"
install_home=${FLIP_CLOCK_INSTALL_HOME:-"$HOME"}
case "$install_home" in /*) ;; *) printf '%s\n' 'The installation home must be an absolute path.' >&2; exit 1;; esac
applications="$install_home/Applications"
destination="$applications/Flip Clock.app"

if [ ! -f "$payload/Contents/Resources/app.asar" ] || [ ! -x "$payload/Contents/MacOS/Flip Clock" ]; then
    printf '%s\n' 'The bundled Flip Clock.app is missing or incomplete.' \
        'Download Flip-Clock-macOS.zip from GitHub Releases and extract the entire archive first.' \
        'The source-code ZIP does not contain the built app.' >&2
    exit 1
fi
if [ -L "$destination" ]; then
    printf '%s\n' 'The installation destination is a symbolic link. Move it aside before installing.' >&2
    exit 1
fi
if /usr/bin/pgrep -f '/Flip Clock.app/Contents/MacOS/' >/dev/null 2>&1; then
    printf '%s\n' 'Quit Flip Clock with Command-Q, then run the installer again.' >&2
    exit 1
fi
mkdir -p "$applications"
if [ "$(CDPATH= cd -- "$source_dir" && pwd -P)/Flip Clock.app" = "$destination" ]; then
    printf '%s\n' 'Flip Clock is already in your Applications folder.'
    exit 0
fi

stage=$(/usr/bin/mktemp -d "$applications/.flip-clock-install.XXXXXX")
backup=''
rollback() {
    if [ ! -e "$destination" ] && [ -n "$backup" ] && [ -d "$backup" ]; then
        /bin/mv "$backup" "$destination"
    fi
}
trap rollback EXIT
/usr/bin/ditto "$payload" "$stage/Flip Clock.app"
/usr/bin/codesign --verify --deep --strict "$stage/Flip Clock.app"
if [ -e "$destination" ]; then
    backup_parent="$install_home/Library/Application Support/Flip Clock/Installation Backups"
    mkdir -p "$backup_parent"
    backup_dir=$(/usr/bin/mktemp -d "$backup_parent/previous.XXXXXX")
    backup="$backup_dir/Flip Clock.app"
    /bin/mv "$destination" "$backup"
fi
/bin/mv "$stage/Flip Clock.app" "$destination"
/bin/rmdir "$stage"
trap - EXIT
printf '\nInstalled: %s\n' "$destination"
if [ -n "$backup" ]; then printf 'Previous app saved to: %s\n' "$backup"; fi
printf '%s\n' 'This app is not Developer ID signed or notarized.' \
    'macOS may require approval in System Settings > Privacy & Security before it opens.' \
    'No security settings or quarantine attributes have been changed.'
if [ "${FLIP_CLOCK_NO_LAUNCH:-0}" = 1 ]; then exit 0; fi
if ! /usr/bin/open "$destination"; then
    printf '%s\n' 'Installation finished. Open Flip Clock from your user Applications folder after approving it in macOS.'
fi
