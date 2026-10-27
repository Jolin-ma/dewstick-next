import { beforeEach, describe, expect, it, vi } from "vitest";

const storefrontFetch = vi.fn();
vi.mock("@/lib/shopify/client", () => ({ storefrontFetch }));
// "use cache" is just a string outside Next's compiler; the cache-profile calls are no-ops here
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

beforeEach(() => {
  storefrontFetch.mockReset();
  vi.resetModules(); // handles.ts keeps its list in module state
});

const variant = (id: string, shade: string | null) => ({
  id,
  availableForSale: true,
  price: { amount: "22.0", currencyCode: "CAD" },
  compareAtPrice: null,
  selectedOptions: shade ? [{ name: "Shade", value: shade }] : [{ name: "Title", value: "Default Title" }],
  image: null,
});

describe("getCatalog", () => {
  it("flattens connections and reads the Shade option", async () => {
    storefrontFetch.mockResolvedValue({
      products: {
        nodes: [
          {
            id: "p1",
            handle: "dewstick-tinted-lip-balm",
            title: "Balm",
            productType: "Lip",
            description: "",
            descriptionHtml: "",
            images: { nodes: [] },
            variants: { nodes: [variant("v1", "nectar"), variant("v2", "poppy")] },
          },
          {
            id: "p2",
            handle: "the-set-of-five",
            title: "Set",
            productType: "Set",
            description: "",
            descriptionHtml: "",
            images: { nodes: [] },
            variants: { nodes: [variant("v3", null)] },
          },
        ],
      },
    });
    const { getCatalog, getProduct } = await import("@/lib/shopify/products");

    const catalog = await getCatalog("zh");
    expect(storefrontFetch).toHaveBeenCalledWith(expect.any(String), { language: "ZH_CN" });
    expect(catalog[0].variants.map((v) => v.shade)).toEqual(["nectar", "poppy"]);
    expect(catalog[1].variants[0].shade).toBeNull();
    expect(catalog[0].variants[0]).not.toHaveProperty("selectedOptions");

    expect((await getProduct("en", "the-set-of-five"))?.id).toBe("p2");
    expect(await getProduct("en", "nope")).toBeNull();
  });
});

describe("getProductHandles", () => {
  const response = (...handles: string[]) => ({ products: { nodes: handles.map((handle) => ({ handle })) } });

  it("fetches once and reuses the list", async () => {
    storefrontFetch.mockResolvedValue(response("a", "b"));
    const { getProductHandles } = await import("@/lib/shopify/handles");

    expect(await getProductHandles()).toEqual(new Set(["a", "b"]));
    await getProductHandles();
    expect(storefrontFetch).toHaveBeenCalledTimes(1);
  });

  it("refetches after five minutes", async () => {
    vi.useFakeTimers();
    try {
      storefrontFetch.mockResolvedValueOnce(response("a")).mockResolvedValueOnce(response("a", "c"));
      const { getProductHandles } = await import("@/lib/shopify/handles");

      await getProductHandles();
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      expect(await getProductHandles()).toEqual(new Set(["a", "c"]));
    } finally {
      vi.useRealTimers();
    }
  });

  it("refetches early when asked for a fresher list", async () => {
    storefrontFetch.mockResolvedValueOnce(response("a")).mockResolvedValueOnce(response("a", "new"));
    const { getProductHandles } = await import("@/lib/shopify/handles");

    await getProductHandles();
    expect(await getProductHandles(0)).toEqual(new Set(["a", "new"]));
  });

  it("returns null when Shopify can't be reached and nothing is cached", async () => {
    storefrontFetch.mockRejectedValue(new Error("Storefront API 503"));
    const { getProductHandles } = await import("@/lib/shopify/handles");
    expect(await getProductHandles()).toBeNull();
  });

  it("keeps serving the last list when a refetch fails", async () => {
    vi.useFakeTimers();
    try {
      storefrontFetch.mockResolvedValueOnce(response("a")).mockRejectedValueOnce(new Error("down"));
      const { getProductHandles } = await import("@/lib/shopify/handles");

      await getProductHandles();
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      expect(await getProductHandles()).toEqual(new Set(["a"]));
    } finally {
      vi.useRealTimers();
    }
  });
});
