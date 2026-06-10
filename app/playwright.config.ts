import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for T-PAK E2E tests.
 * Targets the Next.js dev server at http://localhost:3000.
 * We use API-route mocking (page.route) to avoid real DB mutations.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Sequential to avoid cookie collisions between scenarios
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Automatically spin up the dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
