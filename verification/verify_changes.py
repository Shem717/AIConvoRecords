from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Dashboard
        try:
            page.goto("http://localhost:5173", timeout=30000)
            page.wait_for_load_state("networkidle")

            # 1. Take screenshot of Dashboard
            page.screenshot(path="verification/1_dashboard.png")
            print("Dashboard screenshot taken")

            # Click on ChatGPT Card 'View Conversations' button
            # Find the card containing "ChatGPT"
            card = page.locator(".llm-card", has_text="ChatGPT")
            if card.count() > 0:
                # Click the View Conversations button
                # The button text is "VIEW CONVERSATIONS ->"
                card.get_by_text("VIEW CONVERSATIONS").click()
                print("Clicked View Conversations")
            else:
                print("Could not find ChatGPT card")
                return

            page.wait_for_timeout(1000)

            # 2. Take screenshot of Conversation List (Should show list now)
            page.screenshot(path="verification/2_list_view.png")
            print("List view screenshot taken")

            # Find the Edit button and click it
            # Using class selector based on my changes: .action-btn.edit-btn
            edit_btns = page.locator(".action-btn.edit-btn")
            count = edit_btns.count()
            print(f"Found {count} edit buttons")

            if count > 0:
                edit_btns.first.click()
                page.wait_for_timeout(500)

                # 3. Take screenshot of Edit Mode
                page.screenshot(path="verification/3_edit_mode.png")
                print("Edit mode screenshot taken")

                # Change title
                input_field = page.locator(".title-input").first
                if input_field.is_visible():
                    input_field.fill("Updated Title Test")

                    # Save
                    page.locator(".action-btn.save-btn").click()
                    page.wait_for_timeout(500)

                    # 4. Take screenshot after Save
                    page.screenshot(path="verification/4_after_save.png")
                    print("After save screenshot taken")

                    # Verify title text
                    content = page.content()
                    if "Updated Title Test" in content:
                        print("Title updated successfully in List View")
                    else:
                        print("Title update FAILED in List View")

                    # Click View on the SAME conversation (it should be the first one still)
                    page.locator(".action-btn.view-btn").first.click()
                    page.wait_for_timeout(2000) # Wait for iframe and styles

                    # 5. Take screenshot of Viewer (Should be fullscreen)
                    page.screenshot(path="verification/5_viewer_fullscreen.png")
                    print("Viewer screenshot taken")

                    # Verify fullscreen class presence or style
                    # The viewer component root div should have 'fullscreen' class
                    viewer_div = page.locator(".conversation-viewer")
                    classes = viewer_div.get_attribute("class")
                    if "fullscreen" in classes:
                        print("Viewer has fullscreen class")
                    else:
                        print(f"Viewer MISSING fullscreen class: {classes}")

                else:
                    print("Input field not visible!")

            else:
                print("No Edit button found in list view!")
                # Dump page content to see what's wrong
                # print(page.content())

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_changes()
