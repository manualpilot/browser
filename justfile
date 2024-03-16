build-run platform *args:
  docker build --platform linux/{{platform}} --tag ghcr.io/manualpilot/browser .
  docker run --interactive --tty --rm --platform linux/{{platform}} ghcr.io/manualpilot/browser {{args}}

example script:
  docker run --interactive --tty --rm \
    --publish 8080:8080 \
    --volume $(pwd)/examples:/examples \
    ghcr.io/manualpilot/browser bash /examples/{{script}}
