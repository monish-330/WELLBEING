import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "generate-spa-route-pages",
      closeBundle() {
        try {
          const distDir = path.resolve(__dirname, "dist");
          const indexPath = path.join(distDir, "index.html");
          if (!fs.existsSync(indexPath)) return;

          // 1. Create standard 404 fallback
          fs.copyFileSync(indexPath, path.join(distDir, "404.html"));

          // 2. Pre-generate physical route folders and files for zero-config static server routing
          const routes = [
            "login",
            "admin",
            "counselor",
            "assessment",
            "mood",
            "mood-entry",
            "mood-history",
            "calendar",
            "graph",
            "journal",
            "journal-history",
            "selfcare",
            "forum",
            "appointments",
            "crisis"
          ];

          routes.forEach((route) => {
            const routeDir = path.join(distDir, route);
            if (!fs.existsSync(routeDir)) {
              fs.mkdirSync(routeDir, { recursive: true });
            }
            fs.copyFileSync(indexPath, path.join(routeDir, "index.html"));
            fs.copyFileSync(indexPath, path.join(distDir, `${route}.html`));
          });

          console.log("✅ Successfully pre-generated all SPA route HTML files (zero 404s guaranteed)");
        } catch (e) {
          console.warn("Could not copy SPA route files:", e.message);
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
