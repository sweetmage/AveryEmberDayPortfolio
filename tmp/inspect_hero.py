import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8080
DIRECTORY = r"D:\My Stuff\Git\CometGit\portfoliowebsite"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

server = socketserver.TCPServer(("", PORT), Handler)
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
time.sleep(1)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(f"http://localhost:{PORT}/index.html")
    time.sleep(3)  # let bubbles settle

    # Find a hero bubble and screenshot it
    info = page.evaluate('''() => {
        const heroContainer = document.querySelector('.brand-bubbles-hero');
        if (!heroContainer) return {error: 'no hero container'};
        const bubbles = heroContainer.querySelectorAll('.brand-bubble');
        if (!bubbles.length) return {error: 'no hero bubbles'};
        const b = bubbles[0];
        const rect = b.getBoundingClientRect();
        const styles = window.getComputedStyle(b);
        const before = window.getComputedStyle(b, '::before');
        return {
            x: rect.x, y: rect.y, w: rect.width, h: rect.height,
            color: b.getAttribute('data-color'),
            boxShadow: styles.boxShadow,
            beforeBg: before.background,
            parentOverflow: window.getComputedStyle(heroContainer).overflow
        };
    }''')
    print(info)

    # Screenshot full hero
    page.screenshot(path=r"D:\My Stuff\Git\CometGit\portfoliowebsite\tmp\hero-full.png")
    browser.close()
