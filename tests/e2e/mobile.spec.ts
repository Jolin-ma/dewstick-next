import { expect, test } from "@playwright/test";
import en from "../../src/i18n/en.json";
import { waitForHydration } from "./helpers";

// Runs in the "mobile" project: 320px wide, touch.

const PAGES = ["/", "/collections/shades", "/products/dewstick-tinted-lip-balm", "/products/the-set-of-five", "/cart", "/no-such-page"];

for (const path of [...PAGES, ...PAGES.map((p) => `/zh${p === "/" ? "" : p}`)]) {
  test(`${path} doesn't scroll sideways`, async ({ page }) => {
    await page.goto(path);
    const { scrollWidth, clientWidth } = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return { scrollWidth, clientWidth };
    });
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}

test("menu opens and navigates", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page, ".menu-toggle");
  await page.getByRole("button", { name: en.general.menu }).tap();
  const link = page.getByRole("link", { name: en.set.title, exact: true }).locator("visible=true").first();
  await expect(link).toBeVisible();
  await link.tap();
  await expect(page).toHaveURL(/\/products\/the-set-of-five$/);
});

test("header controls are big enough to tap", async ({ page }) => {
  await page.goto("/");
  for (const control of [page.locator(".cart-link:visible"), page.getByRole("button", { name: en.general.menu })]) {
    const box = (await control.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
});
