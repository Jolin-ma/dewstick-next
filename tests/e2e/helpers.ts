import type { Page } from "@playwright/test";

/** Waits until React has hydrated the element, so clicks reach its handlers instead of being dropped. */
export async function waitForHydration(page: Page, selector: string) {
  await page.waitForFunction(
    (sel) => [...document.querySelectorAll(sel)].some((el) => Object.keys(el).some((k) => k.startsWith("__reactFiber"))),
    selector,
  );
}
