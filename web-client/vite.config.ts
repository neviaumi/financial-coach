import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
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
        find: "@/",
        replacement: `${resolve(import.meta.dirname, "./src")}/`,
      },
      {
        find: "@public/",
        replacement: "/",
      },
      {
        find: "@wa/",
        replacement: `${resolve(import.meta.dirname, "../node_modules/@awesome.me/webawesome/dist")}/`,
      },
    ],
  },
});
