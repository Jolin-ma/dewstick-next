# dewstick-next

The fourth build of [dewstick](https://github.com/Jolin-ma/dewstick): the same
bilingual (EN / 中文) storefront, rebuilt in Next.js + TypeScript on the
Shopify Storefront API. Catalog, cart and checkout come from the Shopify
development store `dewstick.myshopify.com`; the design is the one from the other
builds.

## What comes from where

| | Source |
|---|---|
| Product titles, prices, variants, descriptions, product photos | Shopify Storefront API (`src/lib/shopify/products.ts`) |
| 中文 product copy | Shopify's own translations, via `@inContext(language: ZH_CN)` |
| Cart and checkout | Storefront API cart (`src/lib/shopify/cart.ts`), checkout on Shopify |
| Page copy (EN / 中文) | The Shopify theme's locale files, copied to `src/i18n/` |
| Lifestyle photos, hero video, swatch colours | `public/shop/`, `src/lib/editorial.ts` |
| Styles | `src/app/globals.css`, the shared `dewstick.css` |

## How it works

- **Routes** live under `app/[lang]`. `src/proxy.ts` serves English at the root
  (`/`, `/products/...`) by rewriting to `/en/...`, and 中文 under `/zh`, so URLs
  match the static site.
- **Rendering** uses Cache Components: pages are prerendered, and the catalog query
  is cached for an hour per language (`"use cache"`, tag `products`). Only the cart
  and the header's cart count read the visitor's cookie and stream in at request time.
- **Cart** changes are Server Actions (`src/lib/cart-actions.ts`). The cart id is kept
  in an httpOnly cookie. Cart-page buttons are plain form submits, so they work
  before JavaScript loads.
- **Checkout** links to Shopify's checkout (test mode, no real payment). The store is
  a password-protected development store, so checkout asks for that password first.

## Setup

```bash
npm install
cp .env.example .env.local   # then add the Storefront access token
npm run dev                  # http://localhost:3000
```

To get the token: Shopify admin → **Sales channels → Headless** → create a
storefront → **Storefront API** → copy the *public access token*.

## Still to do

- Tests and Lighthouse numbers.
- On-demand revalidation: a Shopify product webhook calling `revalidateTag("products")`.
- Unknown product URLs show the 404 page but return HTTP 200 (Cache Components
  streams them; `dynamicParams = false` isn't available with it).
