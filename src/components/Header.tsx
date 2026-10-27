"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { LangSwitch } from "./LangSwitch";

type NavLink = { href: string; label: string };

type Props = {
  homeHref: string;
  homeLabel: string;
  navLabel: string;
  menuLabel: string;
  links: NavLink[];
  /** Cart link with its live count, rendered on the server (it reads the cart cookie). */
  cartLink: ReactNode;
  mobileCartLink: ReactNode;
};

export function Header({ homeHref, homeLabel, navLabel, menuLabel, links, cartLink, mobileCartLink }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = links.map((l) => (
    <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
      {l.label}
    </Link>
  ));

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="g12 site-header__bar">
        <Link href={homeHref} className="wordmark" aria-label={homeLabel}>
          dewstick
        </Link>
        <nav className="site-header__nav u-caps" aria-label={navLabel}>
          {nav}
        </nav>
        <div className="site-header__tools u-caps">
          <span className="hide-mobile">
            <LangSwitch />
          </span>
          {cartLink}
          <button
            className="menu-toggle"
            aria-label={menuLabel}
            aria-expanded={open}
            aria-controls="menuPanel"
            onClick={() => setOpen(!open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </button>
        </div>
      </div>
      <nav id="menuPanel" className="mobile-nav" hidden={!open} aria-label={navLabel}>
        {nav}
        {mobileCartLink}
        <div className="u-caps">
          <LangSwitch />
        </div>
      </nav>
    </header>
  );
}
