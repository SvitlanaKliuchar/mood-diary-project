import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest.setup.js',
    include: ['src/**/*.test.js', 'tests/**/*.test.js'],
  },
});
