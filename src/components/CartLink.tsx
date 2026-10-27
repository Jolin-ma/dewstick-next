import Link from "next/link";
import { getT, href, type Locale } from "@/i18n";
import { getCartQuantity } from "@/lib/shopify/cart";

type Props = { lang: Locale; variant: "header" | "menu" };

/** Header cart link. Reads the cart cookie, so it renders behind <Suspense> with count 0 as fallback. */
export async function CartLink({ lang, variant }: Props) {
  return <CartLinkView lang={lang} variant={variant} count={await getCartQuantity()} />;
}

export function CartLinkView({ lang, variant, count }: Props & { count: number }) {
  const t = getT(lang);
  if (variant === "menu") {
    return (
      <Link href={href(lang, "/cart")}>
        {t("general.cart")} ({count})
      </Link>
    );
  }
  return (
    <Link
      href={href(lang, "/cart")}
      className="cart-link"
      aria-label={t(count === 1 ? "general.cart_count.one" : "general.cart_count.other", { count })}
    >
      <span className="hide-mobile">{t("general.cart")}</span>
      <svg className="only-mobile" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span className="cart-count" hidden={count === 0}>
        {count}
      </span>
    </Link>
  );
}
