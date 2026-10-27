import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getT, href, type Locale } from "@/i18n";
import { BALM, SET, SWATCH } from "@/lib/editorial";
import type { Product } from "@/lib/shopify/products";
import { formatMoney, type Money, type ShopifyImage } from "@/lib/shopify/types";

type CardProps = {
  href: string;
  image: ShopifyImage | null;
  title: ReactNode;
  alt: string;
  price: Money;
  compare?: Money | null;
  desc?: string;
  badge?: string;
  /** h3 under a section's h2 (home); h2 directly under the page's h1 (collection). */
  heading?: "h2" | "h3";
};

function ProductCard({ href, image, title, alt, price, compare, desc, badge, heading: Heading = "h3" }: CardProps) {
  return (
    <Link className="pcard" href={href}>
      <div className="pcard__media">
        {image && (
          <Image src={image.url} alt={image.altText ?? alt} width={image.width} height={image.height} sizes="(min-width: 768px) 25vw, 50vw" />
        )}
        {badge && <span className="pcard__badge">{badge}</span>}
      </div>
      <Heading className="pcard__title t-xl">{title}</Heading>
      <p className="pcard__price">
        {formatMoney(price)}
        {compare && <span className="faint pcard__compare">{formatMoney(compare)}</span>}
      </p>
      {desc && <p className="pcard__desc">{desc}</p>}
    </Link>
  );
}

export function Swatch({ shade }: { shade: string }) {
  return <span className="swatch-dot" style={{ background: SWATCH[shade] ?? "#e4e2dd" }} aria-hidden="true" />;
}

/** One card per shade of the balm, linking to the product page with that shade selected. */
export function ShadeCard({ lang, balm, shade, heading }: { lang: Locale; balm: Product; shade: string; heading?: CardProps["heading"] }) {
  const t = getT(lang);
  const variant = balm.variants.find((v) => v.shade === shade);
  if (!variant) return null;
  return (
    <ProductCard
      href={href(lang, `/products/${BALM}?variant=${shade}`)}
      image={variant.image}
      alt={`${balm.title} — ${shade}`}
      title={
        <>
          <Swatch shade={shade} />
          {shade} <span className="faint">/ {t(`shades.${shade}.tone`)}</span>
        </>
      }
      price={variant.price}
      desc={t(`shades.${shade}.line`)}
      heading={heading}
    />
  );
}

export function SetCard({ lang, set, heading }: { lang: Locale; set: Product; heading?: CardProps["heading"] }) {
  const t = getT(lang);
  const v = set.variants[0];
  const saving = v.compareAtPrice ? Number(v.compareAtPrice.amount) - Number(v.price.amount) : 0;
  return (
    <ProductCard
      href={href(lang, `/products/${SET}`)}
      image={set.images[0] ?? null}
      alt={set.title}
      title={set.title}
      price={v.price}
      compare={v.compareAtPrice}
      desc={t("set.body")}
      badge={saving > 0 ? t("home.badge_save", { amount: `$${saving}` }) : undefined}
      heading={heading}
    />
  );
}
