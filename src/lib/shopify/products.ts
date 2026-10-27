import { cacheLife, cacheTag } from "next/cache";
import { shopifyLanguage, type Locale } from "@/i18n";
import { storefrontFetch } from "./client";
import type { Money, ShopifyImage } from "./types";

export type Variant = {
  id: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  /** The "Shade" option value (nectar, poppy, ...), or null for single-variant products. */
  shade: string | null;
  image: ShopifyImage | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  description: string;
  descriptionHtml: string;
  images: ShopifyImage[];
  variants: Variant[];
};

const IMAGE = "url altText width height";

const CATALOG_QUERY = /* GraphQL */ `
  query Catalog($language: LanguageCode) @inContext(language: $language) {
    products(first: 20) {
      nodes {
        id
        handle
        title
        productType
        description
        descriptionHtml
        images(first: 12) { nodes { ${IMAGE} } }
        variants(first: 20) {
          nodes {
            id
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
            image { ${IMAGE} }
          }
        }
      }
    }
  }
`;

type CatalogResponse = {
  products: {
    nodes: (Omit<Product, "images" | "variants"> & {
      images: { nodes: ShopifyImage[] };
      variants: {
        nodes: (Omit<Variant, "shade"> & {
          selectedOptions: { name: string; value: string }[];
        })[];
      };
    })[];
  };
};

/** Every product, in one language. The store has two, so one cached query serves all pages. */
export async function getCatalog(lang: Locale): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const data = await storefrontFetch<CatalogResponse>(CATALOG_QUERY, {
    language: shopifyLanguage(lang),
  });

  return data.products.nodes.map((p) => ({
    ...p,
    images: p.images.nodes,
    variants: p.variants.nodes.map(({ selectedOptions, ...v }) => ({
      ...v,
      shade: selectedOptions.find((o) => o.name === "Shade")?.value ?? null,
    })),
  }));
}

export async function getProduct(lang: Locale, handle: string) {
  return (await getCatalog(lang)).find((p) => p.handle === handle) ?? null;
}
