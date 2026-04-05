import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    root: path.resolve(__dirname, "frontend"),
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      /** Base da API Plux no bundle (ex.: .env com VITE_API_URL=http://localhost:3001/api). */
      "process.env.REACT_APP_API_URL": JSON.stringify(
        env.VITE_API_URL || env.REACT_APP_API_URL || "",
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./frontend"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});
