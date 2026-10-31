import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-404-fallback",
      closeBundle() {
        try {
          const distDir = path.resolve(__dirname, "dist");
          const indexPath = path.join(distDir, "index.html");
          const fallbackPath = path.join(distDir, "404.html");
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, fallbackPath);
            console.log("✅ Successfully created dist/404.html SPA fallback");
          }
        } catch (e) {
          console.warn("Could not copy 404.html:", e.message);
        }
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://localhost:5001",
        changeOrigin: true
      },
      "/images": {
        target: "http://localhost:5001",
        changeOrigin: true
      }
    }
  }
});
