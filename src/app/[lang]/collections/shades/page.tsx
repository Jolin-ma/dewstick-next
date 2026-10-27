import { notFound } from "next/navigation";
import { SetCard, ShadeCard } from "@/components/ProductCard";
import { getT, hasLocale } from "@/i18n";
import { BALM, SET } from "@/lib/editorial";
import { pageMetadata } from "@/lib/metadata";
import { getProduct } from "@/lib/shopify/products";

export async function generateMetadata({ params }: PageProps<"/[lang]/collections/shades">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getT(lang);
  return pageMetadata(lang, "/collections/shades", `${t("site.collection_title")} — dewstick`, t("site.collection_desc"));
}

export default async function Shades({ params }: PageProps<"/[lang]/collections/shades">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getT(lang);
  const [balm, set] = await Promise.all([getProduct(lang, BALM), getProduct(lang, SET)]);
  if (!balm || !set) throw new Error("Catalog is missing the balm or the set");

  return (
    <section className="section" style={{ paddingTop: "3.6rem" }}>
      <div className="sec-head">
        <h1 className="h2">{t("site.collection_title")}</h1>
        <p className="muted">{t("site.collection_desc")}</p>
      </div>
      <div className="g12 pgrid">
        {balm.variants.map((v) => v.shade && <ShadeCard key={v.id} lang={lang} balm={balm} shade={v.shade} heading="h2" />)}
        <SetCard lang={lang} set={set} heading="h2" />
      </div>
    </section>
  );
}
