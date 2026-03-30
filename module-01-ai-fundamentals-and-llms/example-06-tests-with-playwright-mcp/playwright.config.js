const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "https://erickwendel.github.io/vanilla-js-web-app-example/",
    headless: false,
    browserName: "chromium",
    actionTimeout: 50000,
    navigationTimeout: 50000,
    launchOptions: {
      slowMo: 100,
    },
  },
  reporter: [["html", { open: "never" }]],
});
