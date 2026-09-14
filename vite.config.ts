import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages 部署在 /bee-museum/ 子路径(CI 里设 GHPAGES=1);其他环境仍是根路径
  base: process.env.GHPAGES ? "/bee-museum/" : "/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
});
