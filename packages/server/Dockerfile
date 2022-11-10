FROM node:18.12.0

VOLUME [ "/data" ]

RUN apt-get update \
    && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && cd /data \
    && npm config set registry https://registry.npm.taobao.org \
    && npm i -g pnpm \
    && pnpm i

CMD [ "pnpm dev" ]
