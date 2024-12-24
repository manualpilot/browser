FROM ghcr.io/manualpilot/browser:latest

RUN mkdir -p /home/user/workspace/node_modules && sudo chown -R user:user /home/user/workspace
VOLUME /home/user/workspace/node_modules

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash && \
    sudo apt-get install -y nodejs

ADD --chmod=755 https://raw.githubusercontent.com/chrismytton/shoreman/refs/heads/master/shoreman.sh /bin/shoreman.sh
ADD --chown=user package.json package-lock.json /tmp/
RUN cd /tmp && \
    sudo npm install --global
