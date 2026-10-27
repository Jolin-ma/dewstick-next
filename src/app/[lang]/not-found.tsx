import { NotFoundView } from "@/components/NotFoundView";
import { getT, href, locales } from "@/i18n";

// not-found.tsx gets no params, so both languages' strings go to the client, which picks by URL.
export default function NotFound() {
  const strings = Object.fromEntries(
    locales.map((lang) => {
      const t = getT(lang);
      return [lang, { title: t("not_found.title"), cta: t("cart.continue"), href: href(lang, "/collections/shades") }];
    }),
  );
  return <NotFoundView strings={strings} />;
}
