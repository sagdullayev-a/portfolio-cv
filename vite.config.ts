import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("three") ||
              id.includes("meshline") ||
              id.includes("rapier") ||
              id.includes("dimforge") ||
              id.includes("troika") ||
              id.includes("suspend-react")
            ) {
              return "vendor-3d";
            }
            if (id.includes("framer-motion") || id.includes("gsap")) {
              return "vendor-animation";
            }
            return "vendor-core";
          }
        },
      },
    },
  },
});
