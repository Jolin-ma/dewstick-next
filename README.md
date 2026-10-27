# dewstick-next

The fourth build of [dewstick](https://github.com/Jolin-ma/dewstick): the same
bilingual (EN / 中文) storefront, rebuilt in Next.js + TypeScript on the
Shopify Storefront API. The catalog, cart and checkout come from the Shopify
development store `dewstick.myshopify.com`.

**Status:** scaffold. The homepage is a connection check that lists the store's
products. Next: port the design, product and collection pages, a Storefront API
cart, EN / 中文 routes, tests and Lighthouse numbers.

## Stack

- Next.js 16 (App Router, Cache Components) and TypeScript in strict mode
- Shopify Storefront API (GraphQL), queried only on the server

## Setup

```bash
npm install
cp .env.example .env.local   # then add the Storefront access token
npm run dev                  # http://localhost:3000
```

To get the token: Shopify admin → **Sales channels → Headless** → create a
storefront → **Storefront API** → copy the *public access token*.

## Layout

```
src/
  app/              routes
  lib/shopify/      Storefront API client (client.ts) and queries (products.ts)
```
