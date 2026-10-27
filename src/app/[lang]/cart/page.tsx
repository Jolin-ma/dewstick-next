import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PendingButton } from "@/components/PendingButton";
import { getT, hasLocale, href, type Locale } from "@/i18n";
import { SWATCH } from "@/lib/editorial";
import { setLineQuantity } from "@/lib/cart-actions";
import { pageMetadata } from "@/lib/metadata";
import { getCart, type CartLine } from "@/lib/shopify/cart";
import { formatMoney } from "@/lib/shopify/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/cart">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getT(lang);
  return { ...pageMetadata(lang, "/cart", `${t("cart.title")} — dewstick`, t("hero.body")), robots: { index: false } };
}

export default async function CartPage({ params }: PageProps<"/[lang]/cart">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getT(lang);

  return (
    <section className="section">
      <div className="container page-narrow">
        <h1 className="h2">{t("cart.title")}</h1>
        {/* the cart belongs to the visitor (cookie), so it streams in at request time */}
        <Suspense fallback={<div className="mt-3" aria-busy="true" style={{ minHeight: "12rem" }} />}>
          <CartContents lang={lang} />
        </Suspense>
      </div>
    </section>
  );
}

async function CartContents({ lang }: { lang: Locale }) {
  const t = getT(lang);
  const cart = await getCart(lang);

  if (!cart || cart.lines.length === 0) {
    return (
      <div>
        <p className="mt-2 muted">{t("cart.empty")}</p>
        <Link className="link-cta mt-3" href={href(lang, "/collections/shades")}>
          {t("cart.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-3">
        {cart.lines.map((line) => (
          <Line key={line.id} lang={lang} line={line} />
        ))}
      </div>
      <div className="cart-footer">
        <p>
          <span className="u-mini muted">{t("cart.subtotal")}</span>&nbsp;{" "}
          <span className="medium">{formatMoney(cart.cost.subtotalAmount)}</span>
        </p>
        <p className="small muted">{t("cart.taxes")}</p>
        <a className="btn" href={cart.checkoutUrl}>
          {t("cart.checkout")}
        </a>
      </div>
      <div className="demo-panel">
        <p className="u-mini accent">{t("site.checkout_title")}</p>
        <p className="small mt-1">{t("site.checkout_body")}</p>
      </div>
    </div>
  );
}

function Line({ lang, line }: { lang: Locale; line: CartLine }) {
  const t = getT(lang);
  const { merchandise: m } = line;
  const shade = m.selectedOptions.find((o) => o.name === "Shade")?.value;
  const url = href(lang, `/products/${m.product.handle}${shade ? `?variant=${shade}` : ""}`);

  return (
    <div className="cart-line">
      <Link href={url}>
        <div className="well well--square">
          {m.image && <Image src={m.image.url} alt="" width={m.image.width} height={m.image.height} sizes="6rem" />}
        </div>
      </Link>
      <div>
        <Link href={url} className="medium">
          {m.product.title}
        </Link>
        {shade && (
          <p className="small muted">
            <span className="swatch-dot" style={{ background: SWATCH[shade] }} aria-hidden="true" />
            {shade}
          </p>
        )}
        <form action={setLineQuantity}>
          <input type="hidden" name="lineId" value={line.id} />
          <div className="qty mt-1">
            <PendingButton name="quantity" value={line.quantity - 1} aria-label={t("product.qty_down")}>
              −
            </PendingButton>
            <input type="number" value={line.quantity} readOnly aria-label={t("product.quantity")} />
            <PendingButton name="quantity" value={line.quantity + 1} aria-label={t("product.qty_up")}>
              +
            </PendingButton>
          </div>
          <div>
            <PendingButton name="quantity" value={0} className="cart-line__remove muted">
              {t("cart.remove")}
            </PendingButton>
          </div>
        </form>
      </div>
      <p className="small">{formatMoney(line.cost.totalAmount)}</p>
    </div>
  );
}
