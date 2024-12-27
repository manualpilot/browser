FROM golang:bookworm AS golang

RUN go install github.com/DarthSim/overmind/v2@latest
RUN git clone https://github.com/caddyserver/caddy.git && \
    cd caddy/cmd/caddy/ && \
    go build

FROM ghcr.io/manualpilot/browser:base

COPY --from=golang /go/bin/overmind /usr/local/bin/overmind
COPY --from=golang /go/caddy/cmd/caddy/caddy /usr/local/bin/caddy

RUN export DEBIAN_FRONTEND=noninteractive && \
    sudo apt-get update && \
    sudo apt-get upgrade -y && \
    sudo apt-get install -y \
      firefox-esr ffmpeg git imagemagick libssl-dev libffi-dev python3 python3-dev python3-pip \
      tigervnc-standalone-server tmux vim wget x11-apps && \
    sudo apt-get clean && sudo apt-get autoclean && sudo apt-get autoremove --purge -y

# TODO: this is included in debian 13
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | sudo bash -s -- --to /usr/local/bin

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash && \
    sudo apt-get install -y nodejs

RUN curl -LsSf https://astral.sh/uv/install.sh | sudo -E bash

RUN sudo git clone https://github.com/novnc/noVNC.git /opt/novnc && \
    sudo git clone https://github.com/novnc/websockify.git /opt/novnc/utils/websockify && \
    sudo rm -rf /opt/novnc/.git /opt/novnc/utils/websockify/.git && \
    sudo chown -R 1000:1000 /opt/novnc
