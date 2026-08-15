import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * The suite runs against the production build, not the dev server: most of what it covers
 * only exists there — prerendered HTML, hydration, and the browser-only fallbacks that
 * replace it. `bun run start` is `vite preview`, which serves `dist/client` as-is, so the
 * web server builds first rather than risking a run against stale output.
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: 'bun run build && bun run start',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        // The build prerenders every route in the manifest before the server comes up.
        timeout: 300_000,
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
