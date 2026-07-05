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

    # Check which stylesheet provides the winning box-shadow for a cyan bubble
    bubbles = page.evaluate('''() => {
        const el = document.querySelector('.brand-bubble[data-color="cyan"]');
        if (!el) return {error: 'no cyan bubble found'};
        const rules = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText && rule.selectorText.includes('brand-bubble') && rule.selectorText.includes('cyan')) {
                        rules.push({
                            href: sheet.href || 'inline',
                            selector: rule.selectorText,
                            boxShadow: rule.style.boxShadow,
                            cssText: rule.cssText.substring(0, 200)
                        });
                    }
                }
            } catch(e) {}
        }
        const computed = window.getComputedStyle(el);
        return {
            rules: rules,
            winningBoxShadow: computed.boxShadow,
            winningBeforeBg: window.getComputedStyle(el, '::before').background
        };
    }''')

    print("Cyan bubble rules:")
    for r in bubbles.get('rules', []):
        print(f"  {r['href']} | {r['selector']}")
        print(f"    boxShadow={r.get('boxShadow','none')}")
    print(f"\nWinning boxShadow: {bubbles.get('winningBoxShadow')}")
    print(f"Winning ::before bg: {bubbles.get('winningBeforeBg','')[:100]}")

    browser.close()
