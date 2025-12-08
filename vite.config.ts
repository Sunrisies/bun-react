import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    open: true,
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
    minify: "terser",
    // rollup 配置
    rollupOptions: {
      output: {
        chunkFileNames: "js/[name]-[hash].js", // 引入文件名的名称
        entryFileNames: "js/[name]-[hash].js", // 包的入口文件名称
        assetFileNames: "[ext]/[name]-[hash].[ext]", // 资源文件像 字体，图片等
        manualChunks(id) {
          // 将 node_modules 中的包分组
          if (id.includes("node_modules")) {
            // dayjs 相关
            if (id.toString().includes("dayjs")) {
              return "dayjs";
            }
            // PDF 相关
            if (
              id.toString().includes("pdf-lib") ||
              id.toString().includes("pdf2pic")
            ) {
              return "pdf";
            }
            // 图片处理相关
            if (
              id.toString().includes("html2canvas") ||
              id.toString().includes("jsqr")
            ) {
              return "image";
            }
            // SCSS 相关
            if (id.toString().includes("sass")) {
              return "converter";
            }
            // 其他工具库
            if (id.toString().includes("lodash")) {
              return "utils";
            }
          }
        },
      },
      plugins: [
        visualizer({
          open: false, // 直接在浏览器中打开分析报告
          filename: "stats.html", // 输出文件的名称
          gzipSize: true, // 显示gzip后的大小
          brotliSize: true, // 显示brotli压缩后的大小
        }),
        viteCompression({
          verbose: true, // 是否在控制台中输出压缩结果
          disable: false,
          threshold: 1024, // 如果体积大于阈值，将被压缩，单位为b，体积过小时请不要压缩，以免适得其反
          algorithm: "gzip", // 压缩算法，可选['gzip'，' brotliccompress '，'deflate '，'deflateRaw']
          ext: ".gz",
          deleteOriginFile: false, // 源文件压缩后是否删除
        }),
      ],
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
});
