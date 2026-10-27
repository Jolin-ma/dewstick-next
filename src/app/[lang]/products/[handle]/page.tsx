import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductView, ProductViewFromUrl } from "@/components/ProductView";
import { getT, hasLocale, href, type Locale } from "@/i18n";
import { ALT, SET, SHADES, photo } from "@/lib/editorial";
import { pageMetadata } from "@/lib/metadata";
import { getCatalog, getProduct } from "@/lib/shopify/products";

type Params = PageProps<"/[lang]/products/[handle]">;

export async function generateStaticParams() {
  return (await getCatalog("en")).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Params) {
  const { lang, handle } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProduct(lang, handle);
  if (!product) return {};
  return pageMetadata(lang, `/products/${handle}`, `${product.title} — dewstick`, product.description.slice(0, 160));
}

export default async function ProductPage({ params }: Params) {
  const { lang, handle } = await params;
  if (!hasLocale(lang)) notFound();
  const product = await getProduct(lang, handle);
  if (!product) notFound();
  const t = getT(lang);

  const props = {
    lang,
    product,
    tones: Object.fromEntries(SHADES.map((s) => [s, t(`shades.${s}.tone`)])),
    strings: {
      shade: t("product.shade"),
      addToCart: t("product.add_to_cart"),
      soldOut: t("product.sold_out"),
      quantity: t("product.quantity"),
      qtyUp: t("product.qty_up"),
      qtyDown: t("product.qty_down"),
    },
  };
  const hasShades = product.variants.some((v) => v.shade);

  return (
    <>
      <section className="section">
        {/* the shell renders the first shade; ?variant= is read in the browser */}
        <Suspense fallback={<ProductView {...props} />}>
          <ProductViewFromUrl {...props} />
        </Suspense>
      </section>
      {hasShades && (
        <>
          <SetUpsell lang={lang} />
          <WhyItWorks lang={lang} />
        </>
      )}
    </>
  );
}

function SetUpsell({ lang }: { lang: Locale }) {
  const t = getT(lang);
  return (
    <section className="border-top">
      <div className="split split--mist">
        <div className="split__media">
          <div className="well well--square">
            <Image src={photo("04")} alt={ALT["04"]} width={1000} height={1000} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </div>
        <div className="split__copy">
          <h2 className="h2">{t("set.title")}</h2>
          <p className="lede mt-2" style={{ maxWidth: "26rem" }}>
            {t("set.body")}
          </p>
          <Link className="link-cta mt-3" style={{ alignSelf: "flex-start" }} href={href(lang, `/products/${SET}`)}>
            {t("set.details")}
          </Link>
        </div>
      </div>
    </section>
  );
}

const ICONS = {
  hydrate: <path d="M12 3c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C7 9.5 9 7 12 3Z" />,
  nourish: (
    <>
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
      <path d="M5 19 13 11" />
    </>
  ),
  protect: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  glow: <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />,
};

function WhyItWorks({ lang }: { lang: Locale }) {
  const t = getT(lang);
  return (
    <section id="why" className="border-top">
      <div className="split split--reverse">
        <div className="split__media">
          <div className="well well--square">
            <Image src={photo("05")} alt={ALT["05"]} width={1000} height={1000} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </div>
        <div className="split__copy">
          <h2 className="h2">{t("why.title")}</h2>
          <p className="lede mt-2" style={{ maxWidth: "28rem" }}>
            {t("why.body")}
          </p>
          <div className="benefits">
            {Object.entries(ICONS).map(([k, icon]) => (
              <div key={k} className="benefit">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {icon}
                </svg>
                <h3>{t(`why.${k}.title`)}</h3>
                <p className="small muted">{t(`why.${k}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
