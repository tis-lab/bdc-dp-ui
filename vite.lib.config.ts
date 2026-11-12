import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      entryRoot: "src",
      exclude: ["src/main.tsx", "src/**/*.test.*"],
    }),
  ],
  build: {
    outDir: "lib",
    copyPublicDir: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      // Peer dependencies and their subpaths, e.g. @mui/icons-material/Close
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^react-router($|\/)/,
        /^@emotion\//,
        /^@mui\//,
        /^echarts($|\/)/,
        /^echarts-for-react($|\/)/,
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
