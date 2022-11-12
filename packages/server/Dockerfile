FROM node:18.12.0

COPY . /data

WORKDIR /data

RUN sed -i "s@http://\(deb\|security\).debian.org@https://mirrors.aliyun.com@g" /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && \
    npm config set registry https://registry.npm.taobao.org && \
    npm i -g pnpm && \
    pnpm i && \
    pnpm i @tensorflow/tfjs-node @vladmandic/face-api

CMD [ "pnpm", "dev" ]
