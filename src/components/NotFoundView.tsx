"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Strings = Record<string, { title: string; cta: string; href: string }>;

export function NotFoundView({ strings }: { strings: Strings }) {
  const s = strings[usePathname().startsWith("/zh") ? "zh" : "en"];
  return (
    <section className="section">
      <div className="container page-narrow center">
        <p className="u-mini muted">404</p>
        <h1 className="h2 mt-1">{s.title}</h1>
        <Link className="link-cta mt-3" href={s.href}>
          {s.cta}
        </Link>
      </div>
    </section>
  );
}
