export type Money = { amount: string; currencyCode: string };

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

/** "$22 CAD": whole amounts drop the decimals, as on the other builds. */
export function formatMoney({ amount, currencyCode }: Money) {
  const n = Number(amount);
  return `$${Number.isInteger(n) ? n : n.toFixed(2)} ${currencyCode}`;
}
