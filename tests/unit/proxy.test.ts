// the docs call it unstable_doesProxyMatch; 16.4 still exports the middleware-era name
import { getRedirectUrl, getRewrittenUrl, unstable_doesMiddlewareMatch as doesProxyMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

const getProductHandles = vi.fn();
vi.mock("@/lib/shopify/handles", () => ({ getProductHandles }));

const { config, proxy } = await import("@/proxy");

const ORIGIN = "https://dewstick.test";
const run = (path: string) => proxy(new NextRequest(ORIGIN + path));
const rewrittenTo = async (path: string) => getRewrittenUrl((await run(path))!)?.replace(ORIGIN, "");

beforeEach(() => {
  getProductHandles.mockReset().mockResolvedValue(new Set(["the-set-of-five", "dewstick-tinted-lip-balm"]));
});

describe("matcher", () => {
  it.each(["/", "/cart", "/zh", "/products/the-set-of-five"])("runs on %s", (url) => {
    expect(doesProxyMatch({ config, nextConfig, url })).toBe(true);
  });

  it.each(["/_next/static/chunk.js", "/shop/img/og-hero.jpg", "/favicon.ico"])("skips %s", (url) => {
    expect(doesProxyMatch({ config, nextConfig, url })).toBe(false);
  });
});

describe("language routing", () => {
  it("rewrites unprefixed URLs to /en, keeping the query", async () => {
    expect(await rewrittenTo("/")).toBe("/en/");
    expect(await rewrittenTo("/collections/shades")).toBe("/en/collections/shades");
    expect(await rewrittenTo("/products/the-set-of-five?variant=poppy")).toBe("/en/products/the-set-of-five?variant=poppy");
  });

  it("passes /zh URLs through", async () => {
    expect(await run("/zh")).toBeUndefined();
    expect(await run("/zh/cart")).toBeUndefined();
    expect(await run("/zh/products/the-set-of-five")).toBeUndefined();
  });

  it("redirects /en/... to the unprefixed address", async () => {
    const res = (await run("/en/cart?x=1"))!;
    expect(res.status).toBe(308);
    expect(getRedirectUrl(res)).toBe(`${ORIGIN}/cart?x=1`);
    expect(getRedirectUrl((await run("/en"))!)).toBe(`${ORIGIN}/`);
  });

  it("doesn't treat /zhx or /english as a language prefix", async () => {
    expect(await rewrittenTo("/zhx")).toBe("/en/zhx");
    expect(await rewrittenTo("/english")).toBe("/en/english");
  });
});

describe("unknown product handles", () => {
  it("sends them to the not-found route in the right language", async () => {
    expect(await rewrittenTo("/products/nope")).toBe("/en/not-found");
    expect(await rewrittenTo("/zh/products/nope")).toBe("/zh/not-found");
  });

  it("only checks product pages", async () => {
    await run("/cart");
    await run("/products/a/b"); // deeper paths already 404 via the catch-all
    expect(getProductHandles).not.toHaveBeenCalled();
  });

  it("lets the request through when the handle list is unavailable", async () => {
    getProductHandles.mockResolvedValue(null);
    expect(await rewrittenTo("/products/nope")).toBe("/en/products/nope");
    expect(await run("/zh/products/nope")).toBeUndefined();
  });
});
