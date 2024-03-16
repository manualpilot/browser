#!/usr/bin/bash

xvfb-run -n 1 -a --server-args="-screen 0 800x600x16 -ac -nolisten tcp -dpi 96 +extension RANDR" xclock &
DISPLAY_PID=$!

# display takes some time to come up
sleep 3

xwd -display :1 -root -silent | convert xwd:- png:/tmp/out/screenshot.png

kill $DISPLAY_PID
