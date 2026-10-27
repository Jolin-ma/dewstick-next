import { storefrontFetch } from "./client";

// Product handles for the proxy's 404 check. Proxy runs before the "use cache" layer, so the
// list is kept in memory per server instance and refetched after a few minutes.
const HANDLES_QUERY = /* GraphQL */ `
  query Handles {
    products(first: 250) { nodes { handle } }
  }
`;

const TTL = 5 * 60 * 1000;
let cached: { handles: Set<string>; at: number } | null = null;

/** Every product handle, or null if the Storefront API can't be reached. */
export async function getProductHandles(): Promise<Set<string> | null> {
  if (cached && Date.now() - cached.at < TTL) return cached.handles;
  try {
    const data = await storefrontFetch<{ products: { nodes: { handle: string }[] } }>(HANDLES_QUERY);
    cached = { handles: new Set(data.products.nodes.map((p) => p.handle)), at: Date.now() };
    return cached.handles;
  } catch {
    return cached?.handles ?? null;
  }
}
