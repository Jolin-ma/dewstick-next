"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addToCart } from "@/lib/cart-actions";
import { SWATCH } from "@/lib/editorial";
import type { Product } from "@/lib/shopify/products";
import { formatMoney } from "@/lib/shopify/types";

type Strings = {
  shade: string;
  addToCart: string;
  soldOut: string;
  quantity: string;
  qtyUp: string;
  qtyDown: string;
};

type Props = {
  lang: string;
  product: Pick<Product, "title" | "productType" | "descriptionHtml" | "images" | "variants">;
  /** Shade → tone label ("coral", "珊瑚色"). */
  tones: Record<string, string>;
  strings: Strings;
};

/** Reads ?variant= so a shade card can open the page on its shade. */
export function ProductViewFromUrl(props: Props) {
  const shade = useSearchParams().get("variant");
  return <ProductView key={shade} {...props} initialShade={shade} />;
}

export function ProductView({ lang, product, tones, strings, initialShade = null }: Props & { initialShade?: string | null }) {
  const { variants, images } = product;
  const [variant, setVariant] = useState(() => variants.find((v) => v.shade === initialShade) ?? variants[0]);
  const imageIndex = (url?: string) => Math.max(0, images.findIndex((i) => i.url === url));
  const [media, setMedia] = useState(() => imageIndex(variant.image?.url));
  const [qty, setQty] = useState(1);
  const hasShades = variants.some((v) => v.shade);

  const selectShade = (shade: string) => {
    const next = variants.find((v) => v.shade === shade);
    if (!next) return;
    setVariant(next);
    setMedia(imageIndex(next.image?.url));
    const url = new URL(location.href);
    url.searchParams.set("variant", shade);
    history.replaceState(null, "", url);
  };

  return (
    <div className="container product">
      <div className="product__gallery">
        {images[media] && (
          <div className="well well--square">
            <Image
              src={images[media].url}
              alt={images[media].altText ?? product.title}
              width={images[media].width}
              height={images[media].height}
              sizes="(min-width: 900px) 55vw, 100vw"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        )}
        <div className="product__thumbs">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={img.altText ?? ""}
              aria-current={i === media}
              onClick={() => setMedia(i)}
            >
              <Image src={img.url} alt="" width={500} height={500} sizes="10vw" />
            </button>
          ))}
        </div>
      </div>

      <div className="product__info">
        <p className="u-mini muted">{product.productType}</p>
        <h1 className="h2 mt-1" style={{ textTransform: "none" }}>
          {product.title}
        </h1>
        <p className="product__price">
          <span>{formatMoney(variant.price)}</span>
          {variant.compareAtPrice && <span className="faint card__compare">{formatMoney(variant.compareAtPrice)}</span>}
        </p>

        <form action={addToCart}>
          <input type="hidden" name="merchandiseId" value={variant.id} />
          <input type="hidden" name="lang" value={lang} />
          {hasShades && (
            <fieldset className="shade-picker">
              <legend className="u-mini">{strings.shade}</legend>
              <div className="shade-picker__options">
                {variants.map((v) =>
                  v.shade ? (
                    <span key={v.id} style={{ display: "contents" }}>
                      <input
                        type="radio"
                        id={`shade-${v.shade}`}
                        name="shade"
                        value={v.shade}
                        checked={v.id === variant.id}
                        onChange={() => selectShade(v.shade!)}
                      />
                      <label htmlFor={`shade-${v.shade}`}>
                        <span className="swatch-dot" style={{ background: SWATCH[v.shade] }} aria-hidden="true" />
                        {v.shade}
                        <span className="faint">&nbsp;/ {tones[v.shade]}</span>
                      </label>
                    </span>
                  ) : null,
                )}
              </div>
            </fieldset>
          )}
          <div className="buy-row">
            <div className="qty">
              <button type="button" aria-label={strings.qtyDown} onClick={() => setQty(Math.max(1, qty - 1))}>
                −
              </button>
              <label className="visually-hidden" htmlFor="Quantity">
                {strings.quantity}
              </label>
              <input
                id="Quantity"
                type="number"
                name="quantity"
                min={1}
                max={99}
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
              />
              <button type="button" aria-label={strings.qtyUp} onClick={() => setQty(Math.min(99, qty + 1))}>
                +
              </button>
            </div>
            <AddButton available={variant.availableForSale} strings={strings} />
          </div>
        </form>

        <div className="product__desc rte" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      </div>
    </div>
  );
}

function AddButton({ available, strings }: { available: boolean; strings: Strings }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={!available || pending} aria-busy={pending}>
      <span>{available ? strings.addToCart : strings.soldOut}</span>
    </button>
  );
}
