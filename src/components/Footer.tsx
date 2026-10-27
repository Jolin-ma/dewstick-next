import Image from "next/image";
import Link from "next/link";
import { getT, href, type Locale } from "@/i18n";
import { ALT, GITHUB_URL, SET, SHOPIFY_URL, WALL, photo } from "@/lib/editorial";
import { LangSwitch } from "./LangSwitch";
import { NewsletterForm } from "./Newsletter";

export function Footer({ lang }: { lang: Locale }) {
  const t = getT(lang);
  const shop = href(lang, "/collections/shades");
  const home = href(lang);

  return (
    <footer className="site-footer">
      <section className="g12 news" aria-labelledby="news-title">
        <div className="news__form">
          <h2 id="news-title" className="h2">
            {t("newsletter.heading")}
          </h2>
          <p className="mt-3 measure">{t("newsletter.privacy")}</p>
          <NewsletterForm
            strings={{
              label: t("newsletter.label"),
              placeholder: t("newsletter.placeholder"),
              submit: t("newsletter.submit"),
              invalid: t("site.newsletter_invalid"),
              demo: t("site.newsletter_demo"),
            }}
          />
        </div>
        <div className="wall" aria-label="@dewstick">
          {WALL.map((n) => (
            <div key={n} className="wall__tile">
              <Image src={photo(n)} alt={ALT[n]} width={1000} height={1000} sizes="(min-width: 768px) 20vw, 33vw" />
            </div>
          ))}
        </div>
      </section>
      <div className="site-footer__rule" style={{ marginTop: "var(--section)" }} />
      <div className="g12 site-footer__grid">
        <div className="site-footer__col">
          <p className="site-footer__label">{t("home.footer_shop")}</p>
          <ul>
            <li><Link href={shop}>{t("home.tile_shades")}</Link></li>
            <li><Link href={href(lang, `/products/${SET}`)}>{t("set.title")}</Link></li>
            <li><Link href={href(lang, "/cart")}>{t("general.cart")}</Link></li>
          </ul>
        </div>
        <div className="site-footer__col">
          <p className="site-footer__label">{t("footer.about")}</p>
          <ul>
            <li><Link href={`${home}#note`}>{t("nav.idea")}</Link></li>
            <li><Link href={`${home}#why`}>{t("nav.ingredients")}</Link></li>
          </ul>
        </div>
        <div className="site-footer__col">
          <p className="site-footer__label">{t("site.footer_project")}</p>
          <ul>
            <li><a href={SHOPIFY_URL} target="_blank" rel="noopener">{t("site.footer_store")}</a></li>
            <li><a href={GITHUB_URL} target="_blank" rel="noopener">{t("site.footer_source")}</a></li>
          </ul>
        </div>
        <div className="site-footer__switch">
          <p>{t("home.lang_q")}</p>
          <LangSwitch />
        </div>
      </div>
      <div className="site-footer__base">
        <p>© 2026 dewstick</p>
        <p className="muted">{t("site.footer_note")}</p>
      </div>
    </footer>
  );
}
