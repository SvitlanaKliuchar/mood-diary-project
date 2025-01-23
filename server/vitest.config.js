import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    threads: false,
    //make sure to only run tests sequentially
    sequence: {
      concurrency: 1,
    },
    //also do not isolate the environment between test files
    isolate: false,
    globals: true,
    environment: "node",
    include: ["src/**/*.test.js", "tests/**/*.test.js"],
  },
});
