FROM denoland/deno:latest

WORKDIR /app

COPY deno.json ./
RUN deno eval 'const cfg = JSON.parse(Deno.readTextFileSync("deno.json")); cfg.workspace = ["./server", "./lib", "./bank-statement"]; Deno.writeTextFileSync("deno.json", JSON.stringify(cfg, null, 2));'

COPY lib/deno.json ./lib/deno.json
COPY bank-statement/deno.json ./bank-statement/deno.json
COPY server/deno.json ./server/deno.json

RUN deno install

COPY lib ./lib
COPY bank-statement ./bank-statement
COPY server ./server

WORKDIR /app/server
EXPOSE 8084

CMD ["./scripts/start.sh", "--prod"]
