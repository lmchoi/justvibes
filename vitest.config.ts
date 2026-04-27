import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
  },
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify('test-key'),
    'process.env.API_KEY': JSON.stringify('test-key'),
  },
});
