const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 5000,
  use: {
    baseURL: "https://erickwendel.github.io/vanilla-js-web-app-example/",
    headless: true,
    browserName: "chromium",
    actionTimeout: 5000,
    navigationTimeout: 5000,
  },
  reporter: [["html", { open: "never" }]],
});
