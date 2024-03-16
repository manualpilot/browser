#!/usr/bin/bash

git clone https://github.com/novnc/noVNC.git /tmp/novnc

# this one automatically goes in the background
tigervncserver -SecurityTypes None -geometry 1920x1080

DISPLAY=:1 chromium --no-sandbox \
                    --disable-namespace-sandbox \
                    --disable-dev-shm-usage \
                    --disable-notifications \
                    --use-mock-keychain \
                    --no-default-browser-check \
                    --disable-sync \
                    --no-first-run \
                    --window-position=0,0 \
                    --window-size=1920,1080 \
                    --auto-open-devtools-for-tabs &

/tmp/novnc/utils/novnc_proxy --listen 8080 --vnc localhost:5901
