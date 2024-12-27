# RUN:

- `just start`
- (optional) visit vnc viewer to see what is happening remotely http://localhost:8000/vnc.html
- visit http://localhost:8080/ to use remote browser

# TODO

- cross-origin iframes
- run without root (currently get sigtrap with no logs)
- run with sandbox (https://github.com/electron/electron/issues/42510)
- cover all situations where client can navigate outside the isolated site
  - might have to rewrite all hrefs in client side
- audio / video via webrtc
