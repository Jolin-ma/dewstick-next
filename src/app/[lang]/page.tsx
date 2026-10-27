import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollerNav } from "@/components/ScrollerNav";
import { SetCard, ShadeCard } from "@/components/ProductCard";
import { getT, hasLocale, href } from "@/i18n";
import { ALT, BALM, INGREDIENTS, SET, photo } from "@/lib/editorial";
import { pageMetadata } from "@/lib/metadata";
import { getProduct } from "@/lib/shopify/products";

const CHECK = (
  <svg viewBox="0 0 10 10" aria-hidden="true">
    <path d="M1.5 5.2 4 7.6 8.6 2.4" />
  </svg>
);

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getT(lang);
  return pageMetadata(lang, "/", `dewstick — ${t("hero.title_html").replace("<br>", " ")}`, t("hero.body"));
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getT(lang);
  const [balm, set] = await Promise.all([getProduct(lang, BALM), getProduct(lang, SET)]);
  if (!balm || !set) throw new Error("Catalog is missing the balm or the set");

  const home = href(lang);
  const shop = href(lang, "/collections/shades");
  const tiles = [
    { href: shop, src: photo("11"), caption: t("home.tile_shades") },
    { href: `${home}#why`, src: photo("03"), caption: t("nav.ingredients") },
    { href: href(lang, `/products/${SET}`), src: photo("10"), caption: t("set.title") },
    { href: `${home}#note`, src: photo("08"), caption: t("nav.idea") },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero__media">
          <video autoPlay loop muted playsInline preload="metadata" poster="/shop/video/hero-poster.jpg" aria-hidden="true">
            <source src="/shop/video/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero__content">
          <h1 className="h1" dangerouslySetInnerHTML={{ __html: t("hero.title_html").replace("<br>", "<br> ") }} />
          <div className="hero__copy">
            <p>{t("home.hero_p1")}</p>
            <p>{t("home.hero_p2")}</p>
            <div className="btn-stack">
              <Link className="btn btn--light" href={shop}>
                {t("hero.cta")}
              </Link>
              <a className="btn btn--outline" href="#why">
                {t("hero.cta_secondary")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <ul className="usp">
        {["usp_formula", "usp_shades", "usp_set"].map((k) => (
          <li key={k}>
            {CHECK}
            {t(`home.${k}`)}
          </li>
        ))}
      </ul>

      <section id="shades" className="section">
        <div className="sec-head">
          <h2 className="h2">{t("home.shop_title")}</h2>
          <Link className="link-u" href={shop}>
            {t("shades.see_all")}
          </Link>
        </div>
        <div className="g12 pgrid">
          {["nectar", "poppy", "blush"].map((s) => (
            <ShadeCard key={s} lang={lang} balm={balm} shade={s} />
          ))}
          <SetCard lang={lang} set={set} />
        </div>
      </section>

      <section id="feel" className="section g12 gallery">
        <div className="gallery__text">
          <h2 className="t-xl">{t("feel.title")}</h2>
          <div className="prose measure" style={{ marginTop: "1.3rem" }}>
            <p>{t("home.feel_lead")}</p>
            <p>{t("home.feel_p1")}</p>
            <p>{t("home.feel_p2")}</p>
          </div>
          <Link className="btn btn--outline" href={shop}>
            {t("home.feel_cta")}
          </Link>
        </div>
        <div className="gallery__img gallery__img--a">
          <Image src={photo("09")} alt={ALT["09"]} width={1000} height={996} sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
      </section>

      <section className="band">
        <Image className="band__img" src="/shop/img/band-lips-square.jpg" alt={ALT["12"]} width={1200} height={1200} sizes="(min-width: 768px) 50vw, 100vw" />
        <div className="g12">
          <div className="band__copy">
            <p className="t-3xl">{t("home.story")}</p>
            <a className="btn btn--outline" href="#why">
              {t("hero.cta_secondary")}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sec-head">
          <h2 className="h2">{t("home.tiles_title")}</h2>
        </div>
        <div className="tiles">
          {tiles.map((tile) => (
            <Link key={tile.caption} className="tile" href={tile.href}>
              <div className="tile__media">
                <Image src={tile.src} alt="" width={1000} height={1000} sizes="(min-width: 768px) 25vw, 70vw" />
              </div>
              <p className="tile__caption">{tile.caption}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="why" className="section" aria-labelledby="why-title">
        <div className="sec-head">
          <h2 id="why-title" className="h2">
            {t("why.title")}
          </h2>
          <ScrollerNav trackId="whyTrack" prev={t("home.why_prev")} next={t("home.why_next")} />
        </div>
        <div id="whyTrack" className="scroller" tabIndex={0} aria-label={t("why.title")}>
          {INGREDIENTS.map((ing) => (
            <article key={ing.key} className="scard">
              <h3 className="t-xl">{t(`home.why_${ing.key}`)}</h3>
              <p className="scard__label">{t(`why.${ing.benefit}.title`)}</p>
              <p className="scard__body">{t(`home.why_${ing.key}_body`)}</p>
              <Image className="scard__img" src={ing.src} alt={ing.alt} width={ing.w} height={ing.h} sizes="(min-width: 768px) 15vw, 50vw" />
            </article>
          ))}
        </div>
      </section>

      <section id="note" className="section g12 founder">
        <h2 className="h2 founder__head">{t("note.title")}</h2>
        <div className="founder__body">
          <div className="prose measure">
            <p>{t("note.sub")}</p>
            <p>{t("note.body")}</p>
            <p>{t("home.note_sign")}</p>
          </div>
          <Link className="btn btn--outline" href={shop}>
            {t("hero.cta")}
          </Link>
        </div>
        <div className="founder__img">
          <Image src={photo("07")} alt={ALT["07"]} width={1000} height={1000} sizes="(min-width: 768px) 33vw, 100vw" />
        </div>
      </section>
    </>
  );
}
