import { defineConfig } from "vitest/config";
import { mcplug } from "@mcplug/vite";

export default defineConfig({
  plugins: mcplug(),
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"]
  }
});
