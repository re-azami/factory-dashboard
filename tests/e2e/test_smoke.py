"""Smoke test — frontend loads, title resolves, sidebar nav is present."""
from playwright.sync_api import Page, expect


def test_frontend_loads_with_title(page: Page):
    page.goto("/")
    expect(page).to_have_title("Factory Dashboard")


def test_main_heading_visible(page: Page):
    page.goto("/")
    expect(page.get_by_role("heading", level=1)).to_contain_text("Factory Dashboard")


def test_sidebar_navigation_present(page: Page):
    page.goto("/")
    # Streamlit hides the underlying <input type=radio>; the visible label is a sibling paragraph.
    nav = page.get_by_role("radiogroup", name="Navigation")
    expect(nav.get_by_text("Chat")).to_be_visible()
    expect(nav.get_by_text("Query History")).to_be_visible()


def test_chat_input_visible(page: Page):
    page.goto("/")
    expect(page.get_by_placeholder("Type your question (Persian or English)...")).to_be_visible()
