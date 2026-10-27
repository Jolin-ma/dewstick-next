# dewstick-next

The fourth build of [dewstick](https://github.com/Jolin-ma/dewstick): the same
bilingual (EN / 中文) storefront, rebuilt in Next.js + TypeScript on the
Shopify Storefront API. Catalog, cart and checkout come from the Shopify
development store `dewstick.myshopify.com`; the design is the one from the other
builds.

**Preview:** https://dewstick-next.vercel.app

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
- **Product edits** reach the site through a Shopify webhook. `/api/shopify/webhook`
  checks the HMAC signature, then expires the `products` cache tag, and once more
  10 s later, because Shopify can send the webhook before the Storefront API serves
  the change. Without the webhook, edits show up within the hour.
- **Unknown product URLs** are caught in the proxy, which checks the handle against
  the store's product list (`src/lib/shopify/handles.ts`) and serves the 404 page
  with a real 404 status. Left to the page, the first visit would stream the
  prerendered shell with a 200 before `notFound()` ran.
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

For instant product updates: Shopify admin → **Settings → Notifications → Webhooks**
→ add *Product creation*, *Product update*, *Product deletion* and *Inventory level
update*, format JSON, URL `https://<your-site>/api/shopify/webhook`. Copy the key
shown under "Your webhooks will be signed with" into `SHOPIFY_WEBHOOK_SECRET`.

## Tests

```bash
npm test           # unit tests (Vitest): i18n, metadata, proxy routing, Shopify mapping
npm run test:e2e   # end-to-end (Playwright) against a production build on :3100
SHOPIFY_WEBHOOK_SECRET=any-test-key npm run test:e2e   # also runs the signed-webhook test
PLAYWRIGHT_BASE_URL=https://dewstick-next.vercel.app npm run test:e2e   # against the preview
```

The unit tests mock Shopify and need no token. The end-to-end tests use the real
Storefront API, so they need `.env.local`. They check every page in both languages,
the 404 status codes, the shade picker, and the cart flow (which creates throwaway
carts on the dev store). Run `npx playwright install chromium` once first. CI
(`.github/workflows/ci.yml`) runs lint, type checks and the unit tests on every push.

## Still to do

- Lighthouse numbers.
