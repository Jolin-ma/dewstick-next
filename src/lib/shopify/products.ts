import { cacheLife, cacheTag } from "next/cache";
import { storefrontFetch } from "./client";

export type ProductSummary = {
  id: string;
  handle: string;
  title: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    shop {
      name
    }
    products(first: $first) {
      nodes {
        id
        handle
        title
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export async function getProducts(first = 10) {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const data = await storefrontFetch<{
    shop: { name: string };
    products: { nodes: ProductSummary[] };
  }>(PRODUCTS_QUERY, { first });

  return { shopName: data.shop.name, products: data.products.nodes };
}
