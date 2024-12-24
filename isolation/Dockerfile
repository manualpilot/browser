FROM ghcr.io/manualpilot/browser:latest

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash && \
    sudo apt-get install -y nodejs

ADD --chmod=755 https://raw.githubusercontent.com/chrismytton/shoreman/refs/heads/master/shoreman.sh /bin/shoreman.sh
ADD --chown=1000:1000 . /home/user/workspace

USER 1000:1000
WORKDIR /home/user/workspace
RUN npm ci

EXPOSE 8000
CMD ["/bin/shoreman.sh"]
