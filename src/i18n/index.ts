// en.json / zh.json are the Shopify theme's locales/en.default.json and zh-CN.json
// (Jolin-ma/dewstick), plus a "site" block for strings only this build needs.
import en from "./en.json";
import zh from "./zh.json";

const dictionaries = { en, zh };

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** URL prefix: English lives at the root, 中文 under /zh. */
export const prefix = (lang: Locale) => (lang === "zh" ? "/zh" : "");

/** Path for a page in a language: href("zh", "/cart") -> "/zh/cart". */
export const href = (lang: Locale, path = "/") =>
  prefix(lang) + (path === "/" ? "" : path) || "/";

export const htmlLang = (lang: Locale) => (lang === "zh" ? "zh-CN" : "en");

/** Storefront API LanguageCode for @inContext. */
export const shopifyLanguage = (lang: Locale) => (lang === "zh" ? "ZH_CN" : "EN");

export type T = (key: string, vars?: Record<string, string | number>) => string;

/** Dotted-key lookup into the dictionary; {{ name }} placeholders are filled from vars. */
export function getT(lang: Locale): T {
  return (key, vars) => {
    let value: unknown = dictionaries[lang];
    for (const part of key.split(".")) {
      value = (value as Record<string, unknown> | undefined)?.[part];
    }
    if (typeof value !== "string") return key;
    return value.replace(/\{\{ (\w+) \}\}/g, (_, name) => String(vars?.[name] ?? ""));
  };
}
