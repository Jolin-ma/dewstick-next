import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));
const after = vi.fn();
vi.mock("next/server", () => ({ after }));

const { POST } = await import("@/app/api/shopify/webhook/route");

const SECRET = "test-signing-key";
const sign = (body: string, secret = SECRET) => createHmac("sha256", secret).update(body, "utf8").digest("base64");

function webhook(topic: string, body = '{"id":1,"title":"Balm"}', signature: string | null = sign(body)) {
  const headers = new Headers({ "content-type": "application/json", "x-shopify-topic": topic });
  if (signature !== null) headers.set("x-shopify-hmac-sha256", signature);
  return POST(new Request("https://dewstick.test/api/shopify/webhook", { method: "POST", headers, body }));
}

beforeEach(() => {
  revalidateTag.mockReset();
  after.mockReset();
  vi.stubEnv("SHOPIFY_WEBHOOK_SECRET", SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("Shopify webhook", () => {
  it.each(["products/create", "products/update", "products/delete", "inventory_levels/update"])(
    "expires the catalog on %s",
    async (topic) => {
      const res = await webhook(topic);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ revalidated: true, topic });
      expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
    },
  );

  it("sends itself a signed recheck a few seconds later, in case the Storefront API lags", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();
    try {
      const body = '{"id":1}';
      await webhook("products/update", body);
      const later = after.mock.calls[0][0]();
      await vi.advanceTimersByTimeAsync(10_000);
      await later;

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://dewstick.test/api/shopify/webhook");
      expect(init.body).toBe(body);
      expect(init.headers["x-shopify-hmac-sha256"]).toBe(sign(body));
      expect(init.headers["x-shopify-topic"]).toBe("products/update");
      expect(init.headers["x-dewstick-recheck"]).toBe("1");
    } finally {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  });

  it("doesn't schedule another recheck from the recheck itself", async () => {
    const body = "{}";
    const headers = new Headers({ "x-shopify-topic": "products/update", "x-shopify-hmac-sha256": sign(body), "x-dewstick-recheck": "1" });
    const res = await POST(new Request("https://dewstick.test/api/shopify/webhook", { method: "POST", headers, body }));
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(after).not.toHaveBeenCalled();
  });

  it("acknowledges other topics without revalidating", async () => {
    const res = await webhook("orders/create");
    expect(res.status).toBe(200);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a missing, wrong or tampered signature", async () => {
    expect((await webhook("products/update", "{}", null)).status).toBe(401);
    expect((await webhook("products/update", "{}", sign("{}", "other-key"))).status).toBe(401);
    expect((await webhook("products/update", '{"price":"1"}', sign('{"price":"99"}'))).status).toBe(401);
    expect((await webhook("products/update", "{}", "not base64!")).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects everything when no signing key is configured", async () => {
    vi.stubEnv("SHOPIFY_WEBHOOK_SECRET", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await webhook("products/update")).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
