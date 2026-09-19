#!/bin/sh
set -eu
[ "$(uname -s)" = Linux ] || exit 1
archive=${1:?Pass the absolute path to Flip-Clock-Linux.zip}
test_dir=$(mktemp -d "${TMPDIR:-/tmp}/flip-clock-linux-test.XXXXXX")
unzip -q "$archive" -d "$test_dir/extracted"
payload="$test_dir/extracted/Linux"
[ -x "$payload/app/flip-clock" ]
export XDG_DATA_HOME="$test_dir/data with spaces"
sh "$payload/install-linux.sh"
installed="$XDG_DATA_HOME/flip-clock"
[ -x "$installed/app/flip-clock" ]
desktop-file-validate "$XDG_DATA_HOME/applications/flip-clock.desktop"
"$installed/app/flip-clock" --smoke-test
printf '%s\n' 'previous runtime' > "$installed/previous.txt"
sh "$payload/install-linux.sh"
[ ! -e "$installed/previous.txt" ]
find "$XDG_DATA_HOME/flip-clock-backups" -name previous.txt | grep -q .
mkdir "$test_dir/incomplete"
cp "$payload/install-linux.sh" "$test_dir/incomplete/"
if sh "$test_dir/incomplete/install-linux.sh"; then
    printf '%s\n' 'Incomplete payload was unexpectedly accepted.' >&2
    exit 1
fi
[ -f "$installed/app/resources/app.asar" ]
printf 'Passed: Linux ZIP permissions, install, desktop entry, startup, update backup, and incomplete payload rejection. Test files: %s\n' "$test_dir"
