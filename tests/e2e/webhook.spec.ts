import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

const URL = "/api/shopify/webhook";

test("rejects an unsigned webhook", async ({ request }) => {
  const res = await request.post(URL, { headers: { "x-shopify-topic": "products/update" }, data: "{}" });
  expect(res.status()).toBe(401);
});

// Needs the server's signing key in this process's env too, e.g.
// SHOPIFY_WEBHOOK_SECRET=... npm run test:e2e
test("accepts a signed product webhook", async ({ request }) => {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  test.skip(!secret, "SHOPIFY_WEBHOOK_SECRET not set");
  const body = JSON.stringify({ id: 1, handle: "dewstick-tinted-lip-balm" });
  const res = await request.post(URL, {
    headers: {
      "content-type": "application/json",
      "x-shopify-topic": "products/update",
      "x-shopify-hmac-sha256": createHmac("sha256", secret!).update(body).digest("base64"),
    },
    data: body,
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ revalidated: true, topic: "products/update" });
});
