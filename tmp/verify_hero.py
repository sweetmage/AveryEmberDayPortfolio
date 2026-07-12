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
    time.sleep(3)

    hero = page.evaluate('''() => {
        const container = document.querySelector('.brand-bubbles-hero');
        if (!container) return {error: 'no hero container'};
        const bubbles = container.querySelectorAll('.brand-bubble');
        const result = [];
        bubbles.forEach((b, i) => {
            const s = window.getComputedStyle(b);
            result.push({
                index: i,
                color: b.getAttribute('data-color'),
                boxShadow: s.boxShadow,
                beforeBg: window.getComputedStyle(b, '::before').background,
                overflow: window.getComputedStyle(container).overflow
            });
        });
        return {count: bubbles.length, bubbles: result, containerOverflow: window.getComputedStyle(container).overflow};
    }''')

    print(f"Hero container overflow: {hero['containerOverflow']}")
    for b in hero['bubbles']:
        print(f"Bubble {b['index']} ({b['color']}):")
        print(f"  boxShadow: {b['boxShadow'][:100]}...")
        print(f"  ::before bg: {b['beforeBg'][:100]}...")
        print()

    browser.close()
