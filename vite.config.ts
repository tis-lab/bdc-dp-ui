import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const middleware = env.MIDDLEWARE_URL;

  if (command === "serve" && !/^https?:\/\//.test(middleware ?? "")) {
    throw new Error(
      `MIDDLEWARE_URL must be an http(s) URL, got: ${middleware}`,
    );
  }

  return {
    plugins: [react()],
    server: {
      allowedHosts: process.env.VITE_ALLOWED_HOST
        ? process.env.VITE_ALLOWED_HOST.split(",").map((host) => host.trim())
        : [],
      port: 3000,
      proxy: {
        "^/api/cb/open/query$": {
          target: middleware,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
