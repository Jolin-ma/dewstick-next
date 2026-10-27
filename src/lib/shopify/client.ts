// Server-side Storefront API client. The token is read from server env only
// (no NEXT_PUBLIC_ prefix), so it never ships in the client bundle.

// trimmed: a value pasted into a dashboard with a stray space breaks the URL
const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2026-10";

export const isStorefrontConfigured = Boolean(domain && token);

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!domain || !token) {
    throw new Error(
      "Storefront API is not configured: set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local",
    );
  }

  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Storefront API ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data as T;
}
