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
    time.sleep(2)

    bubbles = page.evaluate('''() => {
        const result = [];
        document.querySelectorAll('.brand-bubble').forEach((el, i) => {
            const parent = el.parentElement?.className || 'unknown';
            const rect = el.getBoundingClientRect();
            const computed = window.getComputedStyle(el);
            result.push({
                index: i,
                parent: parent,
                dataColor: el.getAttribute('data-color'),
                className: el.className,
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height,
                boxShadow: computed.boxShadow,
                background: computed.background
            });
        });
        return result;
    }''')

    for b in bubbles:
        print(f"Bubble {b['index']}: parent={b['parent']}, color={b['dataColor']}, pos=({b['x']:.0f},{b['y']:.0f}), size={b['width']:.0f}x{b['height']:.0f}")
        print(f"  class={b['className']}")
        print(f"  boxShadow={b['boxShadow'][:80]}...")
        print()

    browser.close()
