from ares.views import _cell_changes_summary, _extract_active_grid


def test_extract_active_grid_from_plain_grid():
    grid = [["A1", "B1"], ["A2", "B2"]]
    assert _extract_active_grid(grid) == grid


def test_extract_active_grid_from_workbook_payload():
    payload = {
        "activeSheetIndex": 1,
        "sheets": [
            {"name": "S1", "grid": [["x"]]},
            {"name": "S2", "grid": [["ok", "2"]]},
        ],
    }
    assert _extract_active_grid(payload) == [["ok", "2"]]


def test_extract_active_grid_fallback_on_invalid_payload():
    payload = {"activeSheetIndex": 0, "sheets": [{"name": "S1"}]}
    assert _extract_active_grid(payload, fallback=[["fallback"]]) == [["fallback"]]


def test_cell_changes_summary_detects_address_and_values():
    before = [["1", ""], ["", "A"]]
    after = [["2", ""], ["", "B"]]
    changes = _cell_changes_summary(before, after)
    assert {"cell": "A1", "before": "1", "after": "2"} in changes
    assert {"cell": "B2", "before": "A", "after": "B"} in changes


def test_cell_changes_summary_respects_limit():
    before = [["1", "2"], ["3", "4"]]
    after = [["9", "9"], ["9", "9"]]
    changes = _cell_changes_summary(before, after, limit=2)
    assert len(changes) == 2

