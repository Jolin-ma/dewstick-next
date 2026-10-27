"use client";

import { usePathname } from "next/navigation";

/** EN / 中文 links to the same page in the other language. On a product page the
 *  selected shade (?variant=) carries over. */
export function LangSwitch() {
  // the proxy rewrites English URLs to /en/..., so strip either prefix
  const pathname = usePathname();
  const path = pathname.replace(/^\/(en|zh)(?=\/|$)/, "") || "/";
  const current = pathname.startsWith("/zh") ? "zh" : "en";
  const targets = [
    { lang: "en", label: "EN", htmlLang: "en", href: path },
    { lang: "zh", label: "中文", htmlLang: "zh-CN", href: path === "/" ? "/zh" : `/zh${path}` },
  ];

  return (
    <div className="lang-switch u-mini">
      {targets.map((t, i) => (
        <span key={t.lang} style={{ display: "contents" }}>
          {i > 0 && (
            <span className="sep" aria-hidden="true">
              /
            </span>
          )}
          {/* a plain <a>: switching language reloads with the other <html lang> */}
          <a
            href={t.href}
            lang={t.htmlLang}
            aria-current={t.lang === current}
            onClick={(e) => {
              if (path.startsWith("/products/") && location.search) {
                e.currentTarget.href = t.href + location.search;
              }
            }}
          >
            {t.label}
          </a>
        </span>
      ))}
    </div>
  );
}
