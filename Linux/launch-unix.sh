#!/bin/sh
set -eu
app_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
[ -x "$app_dir/app/flip-clock" ] || { printf '%s\n' 'The bundled app is missing. Extract the Linux release ZIP or run install-linux.sh first.' >&2; exit 1; }
exec "$app_dir/app/flip-clock" "$@"
