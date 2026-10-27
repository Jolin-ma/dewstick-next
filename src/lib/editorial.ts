// Editorial content that isn't commerce data: swatch colours, lifestyle photos and
// their alt text. Product titles, prices, variants, descriptions and product photos
// come from Shopify (lib/shopify); everything here mirrors scripts/build_shop.py
// in Jolin-ma/dewstick.

export const BALM = "dewstick-tinted-lip-balm";
export const SET = "the-set-of-five";
export const SHADES = ["nectar", "poppy", "peony", "blush", "orchid"] as const;

export const SWATCH: Record<string, string> = {
  nectar: "#f3b52f",
  poppy: "#e2392f",
  peony: "#f4a9bd",
  blush: "#b6c935",
  orchid: "#8dbde6",
};

/** Store photos in public/shop/img (1000px squares). */
export const photo = (n: string) => `/shop/img/dewstick-${n}-1000.jpg`;

export const ALT: Record<string, string> = {
  "01": "dewstick in poppy — red tube beside its box, with squalane, shea butter and ceramides",
  "02": "dewstick in peony — pink tube over a swatch: half lipstick, half lip balm",
  "03": "dewstick in orchid — blue tube beside squalane, shea butter and ceramide swatches",
  "04": "The set of five in its red gift box: happy shades, happy days",
  "05": "dewstick in blush — green tube beside squalane, shea butter and ceramide swatches",
  "06": "A red dewstick over balm swatches: juicy, glossy, balmy",
  "07": "Get ready with me: applying dewstick — hydrating, tinted, effortless",
  "08": "Unboxing a dewstick from its shipping box",
  "09": "Macro of a dewy red bullet: the sound, the texture, the dew",
  "10": "A pile of dewsticks in every colourway",
  "11": "All five dewstick shades lined up with their swatches",
  "12": "Close-up of glossy tinted lips with a dewstick",
  "13": "dewstick in nectar — a luxury lip mask in a stick: hydrate, nourish, protect, glow",
};

/** "Why it works" cards: dictionary key, benefit key, photo, alt. */
export const INGREDIENTS = [
  { key: "squalane", benefit: "hydrate", src: "/shop/img/ing-squalane.jpg", alt: "Squalane", w: 600, h: 796 },
  { key: "shea", benefit: "nourish", src: "/shop/img/ing-shea.jpg", alt: "Shea butter", w: 600, h: 879 },
  { key: "ceramides", benefit: "protect", src: "/shop/img/ing-ceramide.jpg", alt: "Ceramide cream", w: 600, h: 750 },
  { key: "colour", benefit: "glow", src: "/shop/img/ing-swatches.jpg", alt: "Tinted lip balm swatches", w: 600, h: 900 },
] as const;

/** Photos on the newsletter wall above the footer. */
export const WALL = ["06", "02", "01", "13"];

export const SHOPIFY_URL = "https://dewstick.myshopify.com";
export const GITHUB_URL = "https://github.com/Jolin-ma/dewstick-next";
