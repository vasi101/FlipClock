#!/bin/sh
set -eu
app_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
encoded_path=$(printf '%s' "$app_dir/index.html" | sed 's/%/%25/g; s/ /%20/g; s/#/%23/g; s/?/%3F/g')
app_uri="file://$encoded_path"
if [ "$(uname -s)" = Darwin ]; then
    for browser in 'Google Chrome' 'Microsoft Edge' 'Brave Browser' 'Chromium'; do
        if [ -d "/Applications/$browser.app" ] || [ -d "$HOME/Applications/$browser.app" ]; then
            exec open -a "$browser" --args "--app=$app_uri" --start-maximized
        fi
    done
    exec open "$app_dir/index.html"
fi
for browser in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge microsoft-edge-stable brave-browser; do
    if command -v "$browser" >/dev/null 2>&1; then
        exec "$browser" "--app=$app_uri" --start-maximized
    fi
done
exec xdg-open "$app_dir/index.html"
