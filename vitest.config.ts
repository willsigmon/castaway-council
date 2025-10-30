import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@game-logic": path.resolve(__dirname, "./packages/game-logic"),
      "@schemas": path.resolve(__dirname, "./packages/schemas"),
    },
  },
});
