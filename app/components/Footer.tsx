import Link from 'next/link';
import ConnectLinks from './ConnectLinks';

export default function Footer() {
  return (
    <footer className="brand-footer">
      <div className="brand-container">
        <div className="brand-footer-inner">
          <span className="brand-footer-credit">&copy; 2026 Avery Ember Day</span>
          <ul className="brand-footer-links">
            <li>
              <Link href="/projects/">Projects</Link>
            </li>
            <li>
              <Link href="/gallery/">Gallery</Link>
            </li>
            {/* Hidden until Netlify form detection is enabled (LOGBOOK Entry 077):
            <li>
              <Link href="/contact/">Contact</Link>
            </li> */}
          </ul>
        </div>
        <div className="brand-footer-connect">
          <ConnectLinks />
          <p className="brand-footer-email">averyemberday@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
