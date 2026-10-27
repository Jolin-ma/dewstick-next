import { NextResponse, type NextRequest } from "next/server";

// English is served at the root and 中文 under /zh, as on the static site. Every route
// lives under app/[lang], so unprefixed URLs are rewritten to /en internally, and
// /en/... is redirected to the unprefixed URL so each page has one address.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return;

  return NextResponse.rewrite(new URL(`/en${pathname}${search}`, request.url));
}

export const config = {
  // skip Next internals, public/shop assets and anything with a file extension
  matcher: ["/((?!_next/|shop/|.*\\.[\\w]+$).*)"],
};
