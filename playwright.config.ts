import { defineConfig, devices } from '@playwright/test';

const port = 4330;

// Phone projects are device emulation: they do not replace a real iPhone check.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    command: `npm run build && npx astro preview --port ${port} --host 127.0.0.1 --ignore-lock`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-chromium', use: devices['Desktop Chrome'] },
    { name: 'desktop-webkit', use: devices['Desktop Safari'] },
    { name: 'phone-chromium', use: devices['Pixel 7'] },
    { name: 'phone-webkit', use: devices['iPhone 14'] },
  ],
});
