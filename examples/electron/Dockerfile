FROM ghcr.io/manualpilot/browser:batteries

VOLUME /home/user/workspace/node_modules
ADD --chown=1000:1000 . /home/user/workspace

WORKDIR /home/user/workspace
RUN npm ci

ENV DISPLAY=:1
ENV ELECTRON_ENABLE_LOGGING=1
EXPOSE 8000
CMD ["overmind", "start"]
