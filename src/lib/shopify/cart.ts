// Storefront API cart. The cart id lives in an httpOnly cookie; every read is
// per-request (no "use cache"), since a cart belongs to one visitor.
import { cookies } from "next/headers";
import { shopifyLanguage, type Locale } from "@/i18n";
import { storefrontFetch } from "./client";
import type { Money, ShopifyImage } from "./types";

export const CART_COOKIE = "dewstick_cart";

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    selectedOptions: { name: string; value: string }[];
    image: ShopifyImage | null;
    product: { handle: string; title: string };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money };
  lines: CartLine[];
};

type RawCart = Omit<Cart, "lines"> & { lines: { nodes: CartLine[] } };
type UserError = { message: string };

const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            selectedOptions { name value }
            image { url altText width height }
            product { handle title }
          }
        }
      }
    }
  }
`;

const normalize = (cart: RawCart): Cart => ({ ...cart, lines: cart.lines.nodes });

function assertOk(errors: UserError[]) {
  if (errors.length) throw new Error(errors.map((e) => e.message).join("; "));
}

export async function getCartId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

export async function getCart(lang: Locale): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  const data = await storefrontFetch<{ cart: RawCart | null }>(
    `${CART_FIELDS}
    query Cart($id: ID!, $language: LanguageCode) @inContext(language: $language) {
      cart(id: $id) { ...CartFields }
    }`,
    { id, language: shopifyLanguage(lang) },
  );
  return data.cart ? normalize(data.cart) : null;
}

export async function getCartQuantity() {
  const id = await getCartId();
  if (!id) return 0;
  const data = await storefrontFetch<{ cart: { totalQuantity: number } | null }>(
    `query CartQuantity($id: ID!) { cart(id: $id) { totalQuantity } }`,
    { id },
  );
  return data.cart?.totalQuantity ?? 0;
}

type Line = { merchandiseId: string; quantity: number };

export async function createCart(lines: Line[]) {
  const data = await storefrontFetch<{
    cartCreate: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    `${CART_FIELDS}
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) { cart { ...CartFields } userErrors { message } }
    }`,
    { lines },
  );
  assertOk(data.cartCreate.userErrors);
  return normalize(data.cartCreate.cart!);
}

/** Adds lines to an existing cart; null if that cart no longer exists (expired or completed). */
export async function addCartLines(cartId: string, lines: Line[]) {
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    `${CART_FIELDS}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
    }`,
    { cartId, lines },
  );
  if (!data.cartLinesAdd.cart) return null;
  assertOk(data.cartLinesAdd.userErrors);
  return normalize(data.cartLinesAdd.cart);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontFetch<{ cartLinesUpdate: { userErrors: UserError[] } }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { userErrors { message } }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  assertOk(data.cartLinesUpdate.userErrors);
}

export async function removeCartLine(cartId: string, lineId: string) {
  const data = await storefrontFetch<{ cartLinesRemove: { userErrors: UserError[] } }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { userErrors { message } }
    }`,
    { cartId, lineIds: [lineId] },
  );
  assertOk(data.cartLinesRemove.userErrors);
}
