import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));

function chromeExtensionPlugin() {
  return {
    name: "chrome-extension",
    closeBundle() {
      const dist = resolve(configDir, "dist");
      const publicDir = resolve(configDir, "public");

      cpSync(resolve(configDir, "manifest.json"), resolve(dist, "manifest.json"));

      for (const asset of ["logo.svg", "icons"]) {
        const source = resolve(publicDir, asset);
        if (!existsSync(source)) continue;
        cpSync(source, resolve(dist, asset), { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), chromeExtensionPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(configDir, "index.html"),
      },
    },
  },
});
