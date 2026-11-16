import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      allowedHosts: process.env.VITE_ALLOWED_HOST
        ? process.env.VITE_ALLOWED_HOST.split(",").map((host) => host.trim())
        : [],
      port: 3000,
      proxy: {
        "/cb": {
          target: env.CB_MIDDLEWARE_URL,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
