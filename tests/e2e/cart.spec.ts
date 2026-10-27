import { expect, test } from "@playwright/test";
import en from "../../src/i18n/en.json";
import zh from "../../src/i18n/zh.json";
import { waitForHydration } from "./helpers";

// These create real (throwaway) carts on the dev store through the Storefront API.
// Each test gets a fresh browser context, so it starts with no cart cookie.

test("add, change quantity and remove (en)", async ({ page }) => {
  await page.goto("/products/dewstick-tinted-lip-balm?variant=peony");
  await waitForHydration(page, ".buy-row");
  await page.getByRole("button", { name: en.product.qty_up }).click();
  await page.getByRole("button", { name: en.product.add_to_cart }).click();

  await expect(page).toHaveURL(/\/cart$/);
  const qty = page.getByRole("spinbutton", { name: en.product.quantity });
  await expect(qty).toHaveValue("2");
  await expect(page.locator(".cart-line").getByText("peony", { exact: true })).toBeVisible();
  await expect(page.locator(".cart-count").first()).toHaveText("2");
  await expect(page.getByRole("link", { name: en.cart.checkout })).toHaveAttribute("href", /myshopify\.com|\/cart\/c\//);

  await page.getByRole("button", { name: en.product.qty_up }).click();
  await expect(qty).toHaveValue("3");
  await page.getByRole("button", { name: en.product.qty_down }).click();
  await expect(qty).toHaveValue("2");

  await page.getByRole("button", { name: en.cart.remove }).click();
  await expect(page.getByText(en.cart.empty)).toBeVisible();
  await expect(page.locator(".cart-count").first()).toBeHidden();
});

test("the cart is shared across languages and shown in 中文", async ({ page }) => {
  await page.goto("/zh/products/the-set-of-five");
  await page.getByRole("button", { name: zh.product.add_to_cart }).click();

  await expect(page).toHaveURL(/\/zh\/cart$/);
  await expect(page.getByRole("heading", { name: zh.cart.title })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: zh.product.quantity })).toHaveValue("1");

  await page.goto("/cart");
  await expect(page.getByRole("spinbutton", { name: en.product.quantity })).toHaveValue("1");
});
