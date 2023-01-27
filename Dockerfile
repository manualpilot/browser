FROM debian:bullseye
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
      apt-transport-https build-essential chromium curl firefox-esr ffmpeg \
      imagemagick software-properties-common sudo vim wget x11-apps xorg xvfb

RUN addgroup user --gid 1000 && \
    adduser user --disabled-password --gecos "" --uid 1000 --gid 1000 && \
    echo "user ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER 1000:1000
WORKDIR /home/user
