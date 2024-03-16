#!/usr/bin/bash

xvfb-run -n 1 -a --server-args="-screen 0 800x600x24 -ac -nolisten tcp -dpi 96 +extension RANDR" xclock -update 1 &
DISPLAY_PID=$!

ffmpeg -y \
       -video_size 800x600 \
       -framerate 25 \
       -f x11grab \
       -i :1.0+0,0 \
       -c:v libx264 \
       -crf 32 \
       -probesize 32 \
       -an \
       /tmp/out/recording.mp4 &

FFMPEG_PID=$!

sleep 30

kill $DISPLAY_PID
kill $FFMPEG_PID
wait $FFMPEG_PID
