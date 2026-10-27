import { isStorefrontConfigured } from "@/lib/shopify/client";
import { getProducts } from "@/lib/shopify/products";

// Connection check until the real homepage is ported from the static site.
export default async function Home() {
  if (!isStorefrontConfigured) {
    return (
      <main>
        <h1>dewstick</h1>
        <p>
          Storefront API not connected yet. Copy <code>.env.example</code> to{" "}
          <code>.env.local</code> and add the token.
        </p>
      </main>
    );
  }

  const { shopName, products } = await getProducts();

  return (
    <main>
      <h1>{shopName}</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.title} ({p.priceRange.minVariantPrice.amount}{" "}
            {p.priceRange.minVariantPrice.currencyCode})
          </li>
        ))}
      </ul>
    </main>
  );
}
