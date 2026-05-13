"""Canonical permission names.

AUTH-009 will turn this into a richer registry (with a helper to add new ones
and a migration step). For AUTH-001 we just need a list of names so the
seed routine can populate the `permissions` table and grant them all to the
seeded admin user.
"""
from __future__ import annotations

PERMISSION_NAMES: tuple[str, ...] = (
    "developer_mode",
    "daily_report_adder",
    "daily_report_editor",
    "daily_report_delete",
    "change_user_permission",
    "use_simple_chat",
    "use_data_science_chat",
    "add_user",
    "delete_user",
    "dashboard_manager",
)
