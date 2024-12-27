build-run platform *args:
  docker build -f base.Dockerfile --platform linux/{{platform}} --tag ghcr.io/manualpilot/browser:base .
  docker build -f batteries.Dockerfile --platform linux/{{platform}} --tag ghcr.io/manualpilot/browser:batteries .
  docker run --interactive --tty --rm --platform linux/{{platform}} ghcr.io/manualpilot/browser:batteries {{args}}

example script:
  docker run --interactive --tty --rm \
    --publish 8080:8080 \
    --volume $(pwd)/examples:/examples \
    --volume $(pwd)/tmp:/tmp/out \
    ghcr.io/manualpilot/browser:batteries bash /examples/{{script}}
