build-run platform *args:
  docker build --platform linux/{{platform}} --tag ghcr.io/manualpilot/browser .
  docker run --interactive --tty --rm --platform linux/{{platform}} ghcr.io/manualpilot/browser {{args}}
