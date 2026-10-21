FROM node:24-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package.json package-lock.json* ./
COPY lib/package.json ./lib/package.json
COPY bank-statement/package.json ./bank-statement/package.json
COPY server/package.json ./server/package.json

RUN npm install --omit=dev

COPY lib ./lib
COPY bank-statement ./bank-statement
COPY server ./server

WORKDIR /app/server
EXPOSE 8084

CMD ["./scripts/start.sh", "--prod"]
