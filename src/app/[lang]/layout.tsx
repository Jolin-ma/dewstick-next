import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk, Newsreader, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CartLink, CartLinkView } from "@/components/CartLink";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getT, hasLocale, href, htmlLang, locales } from "@/i18n";
import { SET } from "@/lib/editorial";
import { metadataBase } from "@/lib/metadata";
import "../globals.css";

const newsreader = Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--f-newsreader" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--f-hanken" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: "700", variable: "--f-bodoni" });
// CJK fonts are split by unicode-range; preloading them would fetch far more than a page needs
const notoSans = Noto_Sans_SC({ weight: ["400", "500"], variable: "--f-noto-sans-sc", preload: false });
const notoSerif = Noto_Serif_SC({ weight: ["400", "700"], variable: "--f-noto-serif-sc", preload: false });
const fonts = [newsreader, hanken, bodoni, notoSans, notoSerif].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  metadataBase,
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%23E94B3C'/%3E%3Cpath d='M16 7c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C11 13.5 13 11 16 7Z' fill='%23fff'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = { themeColor: "#f4efe9", viewportFit: "cover" };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getT(lang);
  const shop = href(lang, "/collections/shades");
  const home = href(lang);

  return (
    <html lang={htmlLang(lang)} className={fonts}>
      <body>
        <a className="skip-link" href="#main">
          {t("general.skip")}
        </a>
        <div className="announcement">
          <p>
            <a href={shop}>{t("announcement.text")}</a>
          </p>
        </div>
        <Header
          homeHref={home}
          homeLabel={t("general.home")}
          navLabel={t("general.nav")}
          menuLabel={t("general.menu")}
          links={[
            { href: shop, label: t("nav.shop") },
            { href: href(lang, `/products/${SET}`), label: t("set.title") },
            { href: `${home}#why`, label: t("nav.ingredients") },
            { href: `${home}#note`, label: t("nav.idea") },
          ]}
          cartLink={
            <Suspense fallback={<CartLinkView lang={lang} variant="header" count={0} />}>
              <CartLink lang={lang} variant="header" />
            </Suspense>
          }
          mobileCartLink={
            <Suspense fallback={<CartLinkView lang={lang} variant="menu" count={0} />}>
              <CartLink lang={lang} variant="menu" />
            </Suspense>
          }
        />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
