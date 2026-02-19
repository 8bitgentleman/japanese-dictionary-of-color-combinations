from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    # Main tab
    page.screenshot(path='ss_main.png', clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    # Colors tab — top portion showing controls
    page.locator('.tabs button').nth(2).click()
    page.wait_for_timeout(1200)
    page.screenshot(path='ss_colors_top.png', clip={"x": 0, "y": 0, "width": 1280, "height": 400})
    # Palette tab — top portion
    page.locator('.tabs button').nth(1).click()
    page.wait_for_timeout(1200)
    page.screenshot(path='ss_palette_top.png', clip={"x": 0, "y": 300, "width": 1280, "height": 600})
    browser.close()
    print("done")
