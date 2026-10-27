"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { hasLocale, href } from "@/i18n";
import {
  CART_COOKIE,
  addCartLines,
  createCart,
  getCartId,
  removeCartLine,
  updateCartLine,
} from "@/lib/shopify/cart";

const quantityFrom = (formData: FormData, fallback: number) => {
  const n = Number.parseInt(String(formData.get("quantity")), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 99) : fallback;
};

/** Add a variant, then go to the cart (the same flow as the other builds). */
export async function addToCart(formData: FormData) {
  const merchandiseId = String(formData.get("merchandiseId"));
  const lang = String(formData.get("lang"));
  const quantity = Math.max(1, quantityFrom(formData, 1));
  if (!merchandiseId.startsWith("gid://shopify/ProductVariant/") || !hasLocale(lang)) {
    throw new Error("Invalid add-to-cart request");
  }

  const lines = [{ merchandiseId, quantity }];
  const cartId = await getCartId();
  const cart = (cartId && (await addCartLines(cartId, lines))) || (await createCart(lines));

  (await cookies()).set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 10, // Shopify keeps an untouched cart for 10 days
  });
  redirect(href(lang, "/cart"));
}

/** Set a line's quantity; 0 removes it. */
export async function setLineQuantity(formData: FormData) {
  const lineId = String(formData.get("lineId"));
  const quantity = quantityFrom(formData, 1);
  const cartId = await getCartId();
  if (!cartId || !lineId.startsWith("gid://shopify/CartLine/")) return;

  if (quantity === 0) await removeCartLine(cartId, lineId);
  else await updateCartLine(cartId, lineId, quantity);
  refresh();
}
