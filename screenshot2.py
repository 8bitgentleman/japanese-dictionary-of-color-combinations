from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    # Palette tab zoomed
    page.locator('.tabs button').nth(1).click()
    page.wait_for_timeout(1500)
    page.screenshot(path='screenshot_palette_top.png', clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    browser.close()
    print("done")
