import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { isValidSignature } from "@/lib/shopify/webhook";

// Shopify calls this when a product or its stock changes (Settings → Notifications → Webhooks).
// The catalog is cached for an hour under the "products" tag; this expires it right away.

/** Topics that change what the catalog query returns: titles, prices, photos, availability. */
const CATALOG_TOPICS = /^(products|inventory_levels)\//;

/** Shopify can send the webhook before the Storefront API serves the change, so expire twice. */
const RECHECK_MS = 10_000;

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET?.trim();
  const body = await request.text();

  if (!secret) {
    console.error("Shopify webhook received, but SHOPIFY_WEBHOOK_SECRET isn't set");
    return new Response("Webhook signing key not configured", { status: 401 });
  }
  if (!isValidSignature(body, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  if (!CATALOG_TOPICS.test(topic)) {
    return Response.json({ revalidated: false, topic });
  }

  // expire: 0 rather than "max": nothing stale is kept to fall back on. The first page view
  // after this can still get the old page while the new one renders; the next gets the edit.
  revalidateTag("products", { expire: 0 });
  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, RECHECK_MS));
    revalidateTag("products", { expire: 0 });
  });
  return Response.json({ revalidated: true, topic });
}
