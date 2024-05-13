ARG BASE_IMAGE=debian:bookworm


FROM caddy as caddy


FROM $BASE_IMAGE
ARG TARGETARCH

COPY --from=caddy /usr/bin/caddy /usr/local/bin/caddy

RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
      apt-transport-https build-essential chromium curl firefox-esr ffmpeg git imagemagick software-properties-common \
      sudo tigervnc-standalone-server vim wget x11-apps xorg xvfb && \
    apt-get clean && apt-get autoclean && apt-get autoremove --purge -y

# google chrome doesn't ship arm for linux
RUN if [ $TARGETARCH = "amd64" ]; then \
      curl https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/chrome.deb && \
      apt-get install -y /tmp/chrome.deb && rm -rf /tmp/chrome.deb; \
    fi

RUN git clone https://github.com/novnc/noVNC.git /opt/novnc && \
    git clone https://github.com/novnc/websockify.git /opt/novnc/utils/websockify && \
    rm -rf /opt/novnc/.git /opt/novnc/utils/websockify/.git && \
    chown -R 1000:1000 /opt/novnc

RUN addgroup user --gid 1000 && \
    adduser user --disabled-password --gecos "" --uid 1000 --gid 1000 && \
    echo "user ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER 1000:1000
WORKDIR /home/user
