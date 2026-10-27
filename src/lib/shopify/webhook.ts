import { createHmac, timingSafeEqual } from "node:crypto";

/** Shopify signs a webhook's raw body with the signing key: base64 HMAC-SHA256 in X-Shopify-Hmac-Sha256. */
export function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(body, "utf8").digest("base64");
}

export function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = Buffer.from(sign(body, secret), "base64");
  const given = Buffer.from(signature, "base64");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
