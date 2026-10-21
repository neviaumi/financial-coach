import { serve } from "@hono/node-server";
import app from "./app.ts";

const port = Number(process.env.PORT) || 8084;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
