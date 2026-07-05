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
    page.screenshot(path=r"D:\My Stuff\Git\CometGit\portfoliowebsite\tmp\hero-after.png", full_page=False)
    browser.close()

print("Screenshot saved")
