import type { Metadata } from "next";
import { href, locales, type Locale } from "@/i18n";

// Canonical, hreflang and Open Graph URLs. On Vercel that's the public address; the
// project's own *.vercel.app name (dewstick-next) still answers but isn't canonical.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL ? "https://dewstick.vercel.app" : "http://localhost:3000");

export const metadataBase = new URL(siteUrl);

/** Title, description, canonical + hreflang alternates and Open Graph for one page. */
export function pageMetadata(
  lang: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: href(lang, path),
      languages: Object.fromEntries(
        locales.map((l) => [l === "zh" ? "zh-CN" : "en", href(l, path)]),
      ),
    },
    openGraph: {
      siteName: "dewstick",
      title,
      description,
      type: "website",
      images: [{ url: "/shop/img/og-hero.jpg", width: 1004, height: 656 }],
    },
    twitter: { card: "summary_large_image" },
  };
}
