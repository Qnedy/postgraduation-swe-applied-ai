const { test, expect } = require("@playwright/test");

test("homepage form submits and appends a new card on /vanilla-js-web-app-example/", async ({
  page,
}) => {
  const homepage = "https://erickwendel.github.io/vanilla-js-web-app-example/";
  await page.goto(homepage);

  // Ensure initial structure is present
  await expect(page.locator("form.needs-validation")).toHaveCount(1);
  await expect(page.locator("#title")).toHaveCount(1);
  await expect(page.locator("#imageUrl")).toHaveCount(1);
  await expect(page.locator("#btnSubmit")).toHaveCount(1);

  const list = page.locator("#card-list > article");
  const initialCount = await list.count();
  expect(initialCount).toBeGreaterThanOrEqual(1);

  // Fill and submit the form
  const newTitle = "Test Image From Playwright";
  const newUrl = "https://mpost.io/wp-content/uploads/image-74-7-1024x1024.jpg";

  await page.fill("#title", newTitle);
  await page.fill("#imageUrl", newUrl);
  await page.click("#btnSubmit");

  // Wait for a new article to appear (or for DOM update)
  const newArticleSelector = `#card-list > article:nth-child(${initialCount + 1})`;
  await page.waitForSelector(newArticleSelector, { timeout: 5000 });

  const finalCount = await list.count();
  expect(finalCount).toBe(initialCount + 1);

  // Verify the last card contains the submitted title and image src
  const last = list.nth(finalCount - 1);
  await expect(last.locator(".card-title")).toHaveText(newTitle);
  const imgSrc = await last.locator("img").getAttribute("src");
  expect(imgSrc).toContain("mpost.io");
});

test("form validation prevents submitting when required fields are missing", async ({
  page,
}) => {
  const homepage = "https://erickwendel.github.io/vanilla-js-web-app-example/";
  await page.goto(homepage);

  const form = page.locator("form.needs-validation");
  const list = page.locator("#card-list > article");
  const initialCount = await list.count();

  // 1) Submit with both fields empty
  await page.fill("#title", "");
  await page.fill("#imageUrl", "");
  await page.click("#btnSubmit");

  // Expect no new card was added
  await page.waitForTimeout(250);
  const countAfterEmpty = await list.count();
  expect(countAfterEmpty).toBe(initialCount);

  // Form should show validation state (Bootstrap pattern: was-validated class)
  const formClassAfter = await form.getAttribute("class");
  expect(formClassAfter).toContain("was-validated");

  // 2) Submit with only title filled -> should still be blocked
  await page.fill("#title", "Only title");
  await page.fill("#imageUrl", "");
  await page.click("#btnSubmit");
  await page.waitForTimeout(250);
  const countAfterTitleOnly = await list.count();
  expect(countAfterTitleOnly).toBe(initialCount);

  // 3) Submit with only image URL filled -> should still be blocked
  await page.fill("#title", "");
  await page.fill("#imageUrl", "https://example.com/image.jpg");
  await page.click("#btnSubmit");
  await page.waitForTimeout(250);
  const countAfterUrlOnly = await list.count();
  expect(countAfterUrlOnly).toBe(initialCount);
});
