import { describe, expect, it } from "vitest";
import { getT, hasLocale, href, htmlLang, shopifyLanguage } from "@/i18n";
import en from "@/i18n/en.json";
import zh from "@/i18n/zh.json";
import { pageMetadata } from "@/lib/metadata";
import { formatMoney } from "@/lib/shopify/types";

/** Every dotted key that holds a string. */
function keys(dict: object, path = ""): string[] {
  return Object.entries(dict).flatMap(([k, v]) =>
    typeof v === "string" ? [path + k] : keys(v as object, `${path}${k}.`),
  );
}

describe("href", () => {
  it("serves English at the root and 中文 under /zh", () => {
    expect(href("en")).toBe("/");
    expect(href("zh")).toBe("/zh");
    expect(href("en", "/cart")).toBe("/cart");
    expect(href("zh", "/products/the-set-of-five")).toBe("/zh/products/the-set-of-five");
  });
});

describe("locale helpers", () => {
  it("accepts only en and zh", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("zh")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("")).toBe(false);
  });

  it("maps to html lang and Shopify language codes", () => {
    expect(htmlLang("zh")).toBe("zh-CN");
    expect(htmlLang("en")).toBe("en");
    expect(shopifyLanguage("zh")).toBe("ZH_CN");
    expect(shopifyLanguage("en")).toBe("EN");
  });
});

describe("getT", () => {
  it("looks up dotted keys per language", () => {
    expect(getT("en")("cart.title")).toBe(en.cart.title);
    expect(getT("zh")("cart.title")).toBe(zh.cart.title);
  });

  it("fills {{ placeholders }}", () => {
    expect(getT("en")("general.cart_count.other", { count: 3 })).toContain("3");
  });

  it("falls back to the key when it's missing", () => {
    expect(getT("en")("no.such.key")).toBe("no.such.key");
    expect(getT("en")("cart")).toBe("cart"); // a group, not a string
  });
});

describe("dictionaries", () => {
  it("zh has every string en has, and the reverse", () => {
    const enKeys = keys(en);
    const zhKeys = new Set(keys(zh));
    expect(enKeys.filter((k) => !zhKeys.has(k))).toEqual([]);
    expect([...zhKeys].filter((k) => !enKeys.includes(k))).toEqual([]);
  });
});

describe("pageMetadata", () => {
  it("sets the canonical and both hreflang alternates", () => {
    const meta = pageMetadata("zh", "/cart", "Cart", "desc");
    expect(meta.alternates?.canonical).toBe("/zh/cart");
    expect(meta.alternates?.languages).toEqual({ en: "/cart", "zh-CN": "/zh/cart" });
  });
});

describe("formatMoney", () => {
  it("drops decimals on whole amounts", () => {
    expect(formatMoney({ amount: "22.0", currencyCode: "CAD" })).toBe("$22 CAD");
    expect(formatMoney({ amount: "19.5", currencyCode: "CAD" })).toBe("$19.50 CAD");
  });
});
