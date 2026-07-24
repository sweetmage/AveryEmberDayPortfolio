'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BubbleLogo from './BubbleLogo';

const navLinks = [
  { href: '/projects/', label: 'Projects' },
  { href: '/gallery/', label: 'Gallery' },
  // Hidden until Netlify form detection is enabled (LOGBOOK Entry 077):
  // { href: '/contact/', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Resolve hashless path for comparison, normalize trailing slashes
    const resolved = new URL(href, 'http://localhost').pathname;
    const normalizedPath = pathname.replace(/\/$/, '') || '/';
    const normalizedHref = resolved.replace(/\/$/, '') || '/';
    return normalizedPath === normalizedHref;
  };

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    // Logos are inline SVG using currentColor — they follow the theme with no swap.
  }

  return (
    <nav className="brand-nav" id="brandNav" aria-label="Primary navigation">
      <div className="brand-container brand-nav-inner">
        <Link
          href="/"
          aria-current={isActive('/') ? 'page' : undefined}
          className={`brand-nav-logo whitespace-nowrap text-[clamp(16px,4.4vw,22px)] ${isActive('/') ? 'is-active' : ''}`}
        >
          <BubbleLogo notxt size={36} />
          <span className="hidden sm:inline">Avery Ember Day</span>
        </Link>

        <ul className="brand-nav-links flex" id="brand-nav-links">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'is-active' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="brand-nav-actions">
          <button
            className="brand-theme-toggle"
            id="theme-toggle"
            aria-label="Toggle light/dark mode"
            onClick={toggleTheme}
          >
            <svg
              className="icon-sun"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm0-14a1 1 0 0 1-1-1V3a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1zM4.22 5.64a1 1 0 0 1 1.42-1.42l.7.71a1 1 0 0 1-1.41 1.41l-.71-.7zm14.14 12.72a1 1 0 0 1 1.42 1.42l-.71.7a1 1 0 1 1-1.41-1.41l.7-.71zM3 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1zM5.64 19.78l-.7.71a1 1 0 1 1-1.42-1.42l.71-.7a1 1 0 0 1 1.41 1.41zm12.72-14.14.71-.71a1 1 0 1 1 1.42 1.42l-.71.7a1 1 0 0 1-1.42-1.41z" />
            </svg>
            <svg
              className="icon-moon"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
