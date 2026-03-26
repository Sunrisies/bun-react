import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240,
      algorithm: "brotliCompress",
      ext: ".br",
      deleteOriginFile: false,
    }),
  ],
  server: {
    open: true,
    port: 12002,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("tanstack")) {
              return "router";
            }
            if (id.includes("pdf-lib") || id.includes("pdfjs-dist")) {
              return "pdf";
            }
            if (id.includes("html2canvas") || id.includes("jspdf")) {
              return "image";
            }
            if (id.includes("leaflet")) {
              return "map";
            }
            if (id.includes("radix-ui")) {
              return "ui";
            }
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    include: ["react", "react-dom"],
  },
});
