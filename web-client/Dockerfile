FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY lib/package.json ./lib/package.json
COPY bank-statement/package.json ./bank-statement/package.json
COPY web-client/package.json ./web-client/package.json

RUN npm install

COPY lib ./lib
COPY bank-statement ./bank-statement
COPY web-client ./web-client

WORKDIR /app/web-client
EXPOSE 8081

CMD ["./scripts/start.sh", "--prod"]
