#!/bin/sh
set -eu
[ "$(uname -s)" = Darwin ] || { printf '%s\n' 'This integration test requires macOS.' >&2; exit 1; }
archive=${1:?Pass the absolute path to Flip-Clock-macOS.zip}
test_dir=$(/usr/bin/mktemp -d "${TMPDIR:-/tmp}/flip-clock-install-test.XXXXXX")
/usr/bin/ditto -x -k "$archive" "$test_dir/extracted"
payload="$test_dir/extracted/Flip Clock macOS"
[ -x "$payload/Install macOS.command" ]
/usr/bin/lipo -verify_arch x86_64 arm64 "$payload/Flip Clock.app/Contents/MacOS/Flip Clock"
install_home="$test_dir/user"
export FLIP_CLOCK_INSTALL_HOME="$install_home"
export FLIP_CLOCK_NO_LAUNCH=1
mkdir -p "$install_home/Applications/Flip Clock.app"
printf '%s\n' 'previous version' > "$install_home/Applications/Flip Clock.app/previous.txt"
sh "$payload/Install macOS.command"
[ -x "$install_home/Applications/Flip Clock.app/Contents/MacOS/Flip Clock" ]
[ ! -e "$install_home/Applications/Flip Clock.app/previous.txt" ]
find "$install_home/Library/Application Support/Flip Clock/Installation Backups" -name previous.txt | /usr/bin/grep -q .
/usr/bin/codesign --verify --deep --strict "$install_home/Applications/Flip Clock.app"
# A second install must replace the bundle and leave another complete backup.
sh "$payload/Install macOS.command"
/usr/bin/codesign --verify --deep --strict "$install_home/Applications/Flip Clock.app"
# Source-only/incomplete downloads must fail without replacing the installed app.
mkdir "$test_dir/incomplete"
cp "$payload/Install macOS.command" "$test_dir/incomplete/"
if sh "$test_dir/incomplete/Install macOS.command"; then
    printf '%s\n' 'An incomplete payload was unexpectedly accepted.' >&2
    exit 1
fi
[ -f "$install_home/Applications/Flip Clock.app/Contents/Resources/app.asar" ]
printf 'Passed: universal ZIP, executable installer, install, update backup, and incomplete payload rejection. Test files: %s\n' "$test_dir"
