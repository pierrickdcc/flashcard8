import os
from playwright.sync_api import sync_playwright, expect

def verify_ui_revamp():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # 1. Verify Auth Page (Animated Background)
        print("Navigating to Auth page...")
        page.goto("http://localhost:5173")

        # Wait for Auth component to load
        page.wait_for_selector("text=Bienvenue sur Flash")

        # Take screenshot of Auth page
        if not os.path.exists("verification_screenshots"):
            os.makedirs("verification_screenshots")
        page.screenshot(path="verification_screenshots/auth_page.png")
        print("Auth page screenshot captured.")

        # 2. Login to access Dashboard
        print("Logging in...")
        page.fill("input[type='email']", "jules@example.com")
        page.fill("input[type='password']", "MDPSECURISE")
        page.click("button[type='submit']")

        # Wait for dashboard
        # Look for "Tableau de bord" in sidebar or header
        page.wait_for_selector("text=Tableau de bord")
        print("Logged in successfully.")

        # 3. Verify Sidebar (Sync Status)
        # Check for the sync status element in sidebar (Cloud/Wifi icon or text)
        # The text might be "En ligne" or "Hors ligne" depending on network simulation,
        # but we can check for the container.
        # The new sidebar has a specific structure.

        # Expand sidebar if collapsed (it shouldn't be by default based on code, but check)
        # The default state in Sidebar.jsx: localStorage.getItem('sidebar_collapsed') === 'true'
        # Since it's a fresh context, it should be false (expanded).

        # Take screenshot of Dashboard with Sidebar
        page.screenshot(path="verification_screenshots/dashboard.png")
        print("Dashboard screenshot captured.")

        # 4. Verify Header (Dropdown)
        # Click the profile avatar to open dropdown
        print("Opening profile dropdown...")
        # The avatar is a button with initials, e.g., "JU" inside a div with class user-profile or similar.
        # In the new AppHeader.jsx:
        # <Menu.Button ...> <div ...> <span ...>{userInitials}</span> </div> </Menu.Button>
        # It's a Menu.Button. We can find it by the initials "JU".

        page.locator("text=JU").click()

        # Wait for dropdown items
        page.wait_for_selector("text=Mon Profil")
        page.wait_for_selector("text=Données & Export")

        # Take screenshot of Dropdown
        page.screenshot(path="verification_screenshots/header_dropdown.png")
        print("Header dropdown screenshot captured.")

        browser.close()

if __name__ == "__main__":
    verify_ui_revamp()
