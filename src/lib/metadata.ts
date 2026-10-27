import type { Metadata } from "next";
import { href, locales, type Locale } from "@/i18n";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

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
