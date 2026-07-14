import Link from 'next/link';

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
            <li>
              <Link href="/contact/">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="brand-footer-connect">
          <div className="brand-footer-icons">
            <a
              href="mailto:averyemberday@gmail.com"
              className="icon-link inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line bg-surface-2 text-text-muted transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
              aria-label="Email"
            >
              <svg
                className="icon block h-6 w-6 shrink-0"
                viewBox="0 0 800 800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinejoin="round"
                  strokeWidth={60}
                  strokeLinecap="round"
                  d="M133.33,230.33l206.67,155c35.56,26.67,84.44,26.67,120,0l206.67-155"
                />
                <rect
                  strokeMiterlimit={133.33}
                  strokeWidth={65}
                  strokeLinecap="round"
                  x={100}
                  y={166.67}
                  width={600}
                  height={466.67}
                  rx={66.67}
                  ry={66.67}
                />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/averyemberday/"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line bg-surface-2 text-text-muted transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
              aria-label="LinkedIn"
            >
              <svg
                className="icon block h-6 w-6 shrink-0"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                stroke="none"
                aria-hidden="true"
              >
                <g transform="translate(-124, -7319)">
                  <path d="M144,7339 L140,7339 L140,7332.001 C140,7330.081 139.153,7329.01 137.634,7329.01 C135.981,7329.01 135,7330.126 135,7332.001 L135,7339 L131,7339 L131,7326 L135,7326 L135,7327.462 C135,7327.462 136.255,7325.26 139.083,7325.26 C141.912,7325.26 144,7326.986 144,7330.558 L144,7339 L144,7339 Z M126.442,7323.921 C125.093,7323.921 124,7322.819 124,7321.46 C124,7320.102 125.093,7319 126.442,7319 C127.79,7319 128.883,7320.102 128.884,7321.46 C128.884,7322.819 127.79,7323.921 126.442,7323.921 L126.442,7323.921 Z M124,7339 L129,7339 L129,7326 L124,7326 L124,7339 Z" />
                </g>
              </svg>
            </a>
            <a
              href="https://github.com/sweetmage"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line bg-surface-2 text-text-muted transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
              aria-label="GitHub"
            >
              <svg
                className="icon block h-6 w-6 shrink-0"
                viewBox="0 0 800 800"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                stroke="none"
                aria-hidden="true"
              >
                <path d="M622.38,87.55c-3.62-8.73-10.6-15.4-19.18-18.35l-.06-.02-.06-.02-.13-.04-.26-.09-.56-.18c-.39-.12-.82-.24-1.28-.37-.92-.25-1.97-.49-3.16-.72-2.37-.46-5.26-.84-8.66-1.01-6.83-.34-15.57.19-26.3,2.59-17.9,4-41.14,13.14-70.31,31.86-1.91,1.22-3.84,2.49-5.8,3.8-1.96-.48-3.92-.95-5.88-1.41-53.2-12.24-108.26-12.24-161.46,0-1.96.45-3.93.92-5.88,1.41-1.96-1.31-3.89-2.57-5.8-3.8-29.2-18.73-52.49-27.87-70.44-31.86-10.76-2.4-19.52-2.93-26.35-2.59-3.4.17-6.29.55-8.66,1.01-1.18.23-2.23.47-3.15.72-.46.12-.88.24-1.27.36l-.56.17-.26.09-.13.04-.06.02-.06.02c-8.66,2.95-15.69,9.69-19.3,18.5-13.44,32.83-17.01,69.02-10.54,103.75.31,1.69.65,3.37,1.01,5.05-1.39,1.97-2.74,3.97-4.05,5.99-20.19,31.22-30.93,68.45-30.43,106.68.05,81.89,23.97,137.97,64.42,174.05,22.9,20.43,49.47,32.93,76.18,40.81,3.06.9,6.11,1.74,9.17,2.53-.45,1.55-.86,3.11-1.25,4.69-1.62,6.61-2.69,13.4-3.19,20.29-.05.62-.07,1.25-.08,1.87l-1.13,60.63v.66c0,.19,0,.38,0,.57-2.05.51-4.14.89-6.25,1.13-6.49.75-13.07.2-19.36-1.61-6.29-1.81-12.16-4.85-17.29-8.95s-9.4-9.18-12.57-14.96l-.33-.58c-8.74-15.17-20.81-28.16-35.3-37.97-14.5-9.82-31.03-16.2-48.37-18.65-18.23-2.58-35.1,10.1-37.68,28.33-2.58,18.23,10.1,35.1,28.33,37.68,7.28,1.03,14.24,3.71,20.34,7.85,6.04,4.09,11.09,9.49,14.78,15.81,7.37,13.31,17.27,25.05,29.15,34.55,11.98,9.59,25.74,16.71,40.49,20.96,14.36,4.13,29.37,5.46,44.23,3.91.03,8,.05,14.13.05,17.25,0,18.41,14.14,33.33,31.58,33.33h182.58c17.44,0,31.58-14.92,31.58-33.33v-126.35c.86-14.31-.61-28.65-4.31-42.41-.51-1.89-1.06-3.78-1.66-5.65,1.99-.5,3.98-1.02,5.97-1.57,27.48-7.57,54.94-19.95,78.52-40.75,40.68-35.89,64.65-92.01,64.69-174.11.5-38.23-10.24-75.47-30.43-106.68-1.31-2.03-2.66-4.03-4.05-6,.36-1.68.7-3.36,1.01-5.04,6.46-34.79,2.8-71.05-10.81-103.88Z" />
              </svg>
            </a>
          </div>
          <p className="brand-footer-email">averyemberday@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
