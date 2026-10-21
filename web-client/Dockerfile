FROM denoland/deno:latest

WORKDIR /app

COPY deno.json ./
RUN deno eval 'const cfg = JSON.parse(Deno.readTextFileSync("deno.json")); cfg.workspace = ["./lib", "./bank-statement", "./web-client"]; Deno.writeTextFileSync("deno.json", JSON.stringify(cfg, null, 2));'

COPY lib/deno.json ./lib/deno.json
COPY bank-statement/deno.json ./bank-statement/deno.json
COPY web-client/deno.json ./web-client/deno.json

RUN deno install

COPY lib ./lib
COPY bank-statement ./bank-statement
COPY web-client ./web-client

WORKDIR /app/web-client
EXPOSE 8081

CMD ["./scripts/start.sh", "--prod"]
