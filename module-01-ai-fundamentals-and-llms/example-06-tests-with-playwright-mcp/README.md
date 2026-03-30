# Playwright tests (Chromium only)

Local setup:

```bash
cd module-01-ai-fundamentals-and-llms/example-06-tests-with-playwright-mcp
npm i -D @playwright/test
npx playwright install --with-deps chromium
npm test
```

Notes:

- The Playwright config sets `baseURL` to the target app and test timeout to 5000ms.
- CI workflow installs only Chromium and runs `npm test`. On failure the HTML report is uploaded as an artifact.
