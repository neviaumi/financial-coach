import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";

export default defineConfig({
  plugins: [deno()],
  server: {
    port: 8080,
    strictPort: true,
    allowedHosts: ["finance.home.handy-david.dev"],
    proxy: {
      "/api": "http://localhost:8084",
    },
  },
  preview: {
    port: 8081,
    strictPort: true,
    allowedHosts: ["finance.home.handy-david.dev"],
  },
  resolve: {
    alias: [
      {
        find: "@public/",
        replacement: "/",
      },
      {
        find: "@wa/",
        replacement: "@awesome.me/webawesome/dist/",
      },
    ],
  },
});
