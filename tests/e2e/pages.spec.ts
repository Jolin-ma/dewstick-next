import { expect, test, type Page } from "@playwright/test";
import en from "../../src/i18n/en.json";
import zh from "../../src/i18n/zh.json";
import { waitForHydration } from "./helpers";

const SET = "/products/the-set-of-five";
const BALM = "/products/dewstick-tinted-lip-balm";

/** Fails the test on any console error or uncaught exception. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));
  return () => expect(errors).toEqual([]);
}

for (const [prefix, lang, t] of [
  ["", "en", en],
  ["/zh", "zh-CN", zh],
] as const) {
  test.describe(`pages (${lang})`, () => {
    for (const path of ["/", "/collections/shades", SET, BALM, "/cart"]) {
      test(`${prefix + path || "/"} renders`, async ({ page }) => {
        const noErrors = watchErrors(page);
        const res = await page.goto(prefix + path);
        expect(res?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
        await expect(page.getByRole("link", { name: t.nav.shop }).first()).toBeAttached();
        noErrors();
      });
    }

    test("unknown product shows the 404 page", async ({ page }) => {
      // a fresh handle each run: the first visit is the one that used to slip through with a 200
      const res = await page.goto(`${prefix}/products/no-such-${Date.now()}`);
      expect(res?.status()).toBe(404);
      await expect(page.getByText(t.not_found.title)).toBeVisible();
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    });

    test("unknown page shows the 404 page", async ({ page }) => {
      const res = await page.goto(`${prefix}/no/such/page`);
      expect(res?.status()).toBe(404);
      await expect(page.getByText(t.not_found.title)).toBeVisible();
    });
  });
}

test("/en/... redirects to the unprefixed address", async ({ page }) => {
  await page.goto("/en/collections/shades");
  await expect(page).toHaveURL(/\/collections\/shades$/);
  expect(new URL(page.url()).pathname).toBe("/collections/shades");
});

test("picking a shade updates the URL, and ?variant= opens on that shade", async ({ page }) => {
  await page.goto(BALM);
  await waitForHydration(page, ".shade-picker");
  // the radios are visually hidden; the label is what gets clicked
  await page.locator('label[for="shade-poppy"]:visible').click();
  await expect(page).toHaveURL(/variant=poppy/);
  await expect(page.getByRole("radio", { name: /^poppy/ })).toBeChecked();

  await page.goto(`${BALM}?variant=orchid`);
  await expect(page.getByRole("radio", { name: /^orchid/ })).toBeChecked();
});

test("language switch keeps the page", async ({ page }) => {
  await page.goto(SET);
  await page.getByRole("link", { name: "中文" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/zh${SET}$`));
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("old .html addresses from the static build redirect", async ({ request }) => {
  for (const [from, to] of [
    ["/index.html", "/"],
    ["/cart.html", "/cart"],
    ["/products/the-set-of-five.html", "/products/the-set-of-five"],
    ["/zh/index.html", "/zh"],
    ["/zh/collections/shades.html", "/zh/collections/shades"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(res.headers().location, from).toBe(to);
  }
});
