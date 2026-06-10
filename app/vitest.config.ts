import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest configuration with two test environments:
 *
 *  1. "node"  — API integration tests under tests/api/
 *     Pure Node.js environment, no DOM, no React transformation needed.
 *
 *  2. "jsdom" — Component tests under tests/components/
 *     Browser-like DOM with React JSX transformation. Uses jest-dom matchers
 *     via the global setupFiles import.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [react()],
  test: {
    projects: [
      // ── 1. Existing service/repository unit tests + new API integration tests ──
      {
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/services/**/*.test.{ts,tsx}',
            'src/repositories/**/*.test.{ts,tsx}',
            'tests/api/**/*.test.{ts,tsx}',
          ],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, 'src'),
          },
        },
      },
      // ── 2. Component tests (React Testing Library + jest-dom) ──────────────
      {
        plugins: [react()],
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['tests/components/**/*.test.{ts,tsx}'],
          setupFiles: ['./tests/setup.ts'],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, 'src'),
          },
        },
      },
    ],
  },
});
