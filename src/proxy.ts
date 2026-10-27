import { NextResponse, type NextRequest } from "next/server";
import { getProductHandles } from "@/lib/shopify/handles";

// English is served at the root and 中文 under /zh, as on the static site. Every route
// lives under app/[lang], so unprefixed URLs are rewritten to /en internally, and
// /en/... is redirected to the unprefixed URL so each page has one address.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const zh = pathname === "/zh" || pathname.startsWith("/zh/");
  const lang = zh ? "zh" : "en";
  const path = zh ? pathname.slice(3) || "/" : pathname;

  // An unknown product handle would stream the page's static shell with a 200 before
  // notFound() runs, so it's caught here and sent to the catch-all route, which 404s.
  const handle = path.match(/^\/products\/([^/]+)$/)?.[1];
  if (handle) {
    const handles = await getProductHandles();
    if (handles && !handles.has(handle)) {
      return NextResponse.rewrite(new URL(`/${lang}/not-found${search}`, request.url));
    }
  }

  if (zh) return;
  return NextResponse.rewrite(new URL(`/en${pathname}${search}`, request.url));
}

export const config = {
  // skip Next internals, public/shop assets and anything with a file extension
  matcher: ["/((?!_next/|shop/|.*\\.[\\w]+$).*)"],
};
