import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 120000,
  testDir: './tests',
  testMatch: /.*\.e2e\.js$/,
  retries: 0,
  use: {
    actionTimeout: 30000,
    navigationTimeout: 60000,
    baseURL: 'http://localhost:3001',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
