from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone

from ares.models import Addon, HistoryEntry, Sheet, UserReport, WorkspaceOrganization, WorkspaceGroup
from users.models import BugReport, PasswordResetCode, PendingRegistration, UserProfile


def make_user(username="stasi", email="stasi@example.com"):
    return User(username=username, email=email)


def test_sheet_grid_and_scripts_roundtrip():
    sheet = Sheet(user=make_user(), name="Arkusz", category="Test")
    sheet.set_grid([["A1", "B1"], ["A2", "B2"]])
    sheet.set_scripts([{"name": "S1", "code": "api.notify('ok')"}])
    assert sheet.get_grid() == [["A1", "B1"], ["A2", "B2"]]
    assert sheet.get_scripts() == [{"name": "S1", "code": "api.notify('ok')"}]


def test_sheet_getters_are_safe_for_invalid_json():
    sheet = Sheet(user=make_user(), name="Arkusz", category="Test")
    sheet.grid_data = "{bad"
    sheet.scripts_data = "{bad"
    assert sheet.get_grid() == []
    assert sheet.get_scripts() == []


def test_history_entry_details_roundtrip_and_invalid_fallback():
    entry = HistoryEntry(user=make_user(), action="Akcja")
    entry.set_details({"type": "save_sheet", "changesCount": 3})
    assert entry.get_details() == {"type": "save_sheet", "changesCount": 3}
    entry.details_data = "broken-json"
    assert entry.get_details() == {}


def test_addon_public_payload_basic_fields():
    author = make_user("ania", "ania@example.com")
    addon = Addon(
        title="Walidator",
        summary="Sprawdza dane",
        kind=Addon.KIND_SCRIPT,
        version="1.2.3",
        script_body="api.notify('ok')",
        instructions="Uruchom na zakresie",
        author=author,
    )
    payload = addon.to_public_payload()
    assert payload["title"] == "Walidator"
    assert payload["kind"] == Addon.KIND_SCRIPT
    assert payload["kindLabel"] == "Skrypt"
    assert payload["author"] == "ania"


def test_addon_public_payload_includes_workspace_metadata():
    addon = Addon(
        title="Menu raportow",
        summary="Buduje menu",
        kind=Addon.KIND_TOOL,
        category="Raportowanie",
        host=Addon.HOST_REPORTS,
        script_body="api.notify('ok')",
        entry_point="onOpen",
        auth_mode="user",
        scopes="sheet.read\nreport.write",
        menu_items=[{"label": "Start"}],
        installation_count=3,
    )
    payload = addon.to_public_payload()
    assert payload["host"] == Addon.HOST_REPORTS
    assert payload["category"] == "Raportowanie"
    assert payload["scopes"] == ["sheet.read", "report.write"]
    assert payload["installationCount"] == 3


def test_pending_registration_and_password_reset_expiry_flags():
    now = timezone.now()
    pending = PendingRegistration(
        username="u1",
        email="u1@example.com",
        password_hash="hash",
        verification_code="123456",
        expires_at=now - timedelta(minutes=1),
    )
    reset = PasswordResetCode(
        user=make_user(),
        code="123456",
        expires_at=now - timedelta(minutes=1),
    )
    assert pending.is_expired is True
    assert reset.is_expired is True


def test_user_profile_defaults_and_payload_merge():
    user = make_user("ola", "ola@example.com")
    profile = UserProfile(
        user=user,
        display_name="",
        avatar_text="",
        avatar_style="",
        avatar_shape="rounded",
        avatar_image="",
        theme="",
        shortcuts={"reports": False},
        preferences={"showClock": False},
    )
    payload = profile.to_payload()
    assert payload["profile"]["displayName"] == "ola"
    assert payload["shortcuts"]["reports"] is False
    assert payload["shortcuts"]["worksheets"] is True
    assert payload["preferences"]["showClock"] is False


def test_user_profile_apply_payload_basic_updates():
    user = make_user("ola", "ola@example.com")
    profile = UserProfile(user=user)
    profile.apply_payload(
        {
            "profile": {
                "displayName": "Ola K.",
                "avatarText": "OK",
                "avatarStyle": "linear-gradient(135deg,#000,#fff)",
                "avatarShape": "circle",
                "avatarImage": "",
            },
            "theme": "sand-light",
            "shortcuts": {"history": False},
            "preferences": {"ribbonMode": "click"},
        }
    )
    assert profile.display_name == "Ola K."
    assert profile.avatar_text == "OK"
    assert profile.avatar_shape == "circle"
    assert profile.theme == "sand-light"
    assert profile.shortcuts["history"] is False
    assert profile.preferences["ribbonMode"] == "click"


def test_bug_report_mark_resolved_switches_timestamp():
    report = BugReport(status=BugReport.STATUS_NEW, title="t", description="d")
    report.mark_resolved_if_needed()
    assert report.resolved_at is None
    report.status = BugReport.STATUS_DONE
    report.mark_resolved_if_needed()
    assert report.resolved_at is not None
    report.status = BugReport.STATUS_IN_PROGRESS
    report.mark_resolved_if_needed()
    assert report.resolved_at is None


def test_user_report_payload_includes_scope_names():
    user = make_user("ola", "ola@example.com")
    organization = WorkspaceOrganization(name="ARES Labs", slug="ares-labs", owner=user)
    group = WorkspaceGroup(name="Core", slug="core", owner=user, organization=organization)
    sheet = Sheet(user=user, name="Analiza", category="Raport")
    report = UserReport(
        owner=user,
        sheet=sheet,
        group=group,
        organization=organization,
        title="Raport",
        report_type=UserReport.TYPE_NOTEBOOK,
        visibility=UserReport.VISIBILITY_ORG,
        config_json={"format": "quarto-like"},
        snapshot_json={"kpis": [{"label": "A", "value": "1"}]},
    )
    payload = report.to_payload()
    assert payload["reportType"] == UserReport.TYPE_NOTEBOOK
    assert payload["organizationName"] == "ARES Labs"
    assert payload["groupName"] == "Core"
    assert payload["sheetName"] == "Analiza"
