import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts", "shared/**/*.test.ts"],
    environment: "node",
  },
});
