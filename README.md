a straightforward and non-opinionated image for running browsers in a containerized environment

the image is based on debian bullseye and is automatically rebuilt weekly to keep up with new browser versions

example usage

```shell
docker run -it --rm \
  ghcr.io/manualpilot/browser \
  xvfb-run xeyes
```

some options for getting the display output are 
 - using ffmpeg x11grab to record the virtual frame buffer
 - installing a vnc server and connecting to it
 - using the screencast feature of the browser
 - external display server streaming over tcp or vsock
