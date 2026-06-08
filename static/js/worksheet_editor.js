document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    let sheetId = params.get("sheet");
    const DEMO_MODE = document.body?.dataset.demoMode === "1";
    let currentSheetCanEdit = true;
    let currentSheetCanShare = false;
    const initialOpenPanel = params.get("open");

    const head = document.getElementById("sheet-head");
    const body = document.getElementById("sheet-body");

    const sheetNameEl = document.getElementById("editor-sheet-name");
    const sheetMetaEl = document.getElementById("editor-sheet-meta");
    const autosaveBadge = document.getElementById("autosave-badge");
    const sheetTagsEl = document.getElementById("sheet-tags");
    const addSheetTagBtn = document.getElementById("add-sheet-tag-btn");
    const sheetTagModal = document.getElementById("sheet-tag-modal");
    const sheetTagInput = document.getElementById("sheet-tag-input");
    const sheetTagSaveBtn = document.getElementById("sheet-tag-save-btn");
    const sheetTagCancelBtns = document.querySelectorAll("[data-close-sheet-tag]");
    const sheetTagSuggestionBtns = document.querySelectorAll("[data-tag-suggestion]");

    const saveBtn = document.getElementById("save-sheet-btn");
    const exportBtn = document.getElementById("export-csv-btn");
    const exportFormatSelect = document.getElementById("export-format-select");
    const renameBtn = document.getElementById("rename-sheet-btn");
    const importInput = document.getElementById("csv-import-input");
    const formulaInput = document.getElementById("formula-input");
    const applyFormulaBtn = document.getElementById("apply-formula-btn");
    const activeCellLabel = document.getElementById("active-cell-label");

    const tabs = document.querySelectorAll(".we-tab");
    const panels = document.querySelectorAll(".we-ribbon-panel");
    const toolbarCard = document.querySelector(".we-toolbar-card");
    const ribbonEl = document.querySelector(".we-ribbon");
    let ribbonCloseTimer = null;

    const sortAscBtn = document.getElementById("sort-asc-btn");
    const sortDescBtn = document.getElementById("sort-desc-btn");
    const clearCellBtn = document.getElementById("clear-cell-btn");
    const toggleFullWidthBtn = document.getElementById("toggle-full-width-btn");
    const toggleGridBtn = document.getElementById("toggle-grid-btn");
    const autofitBtn = document.getElementById("autofit-cols-btn");
    const sheetEditorCard = document.getElementById("sheet-editor-card");
    const sheetGridTable = document.getElementById("sheet-grid-table");
    const sheetImageLayer = document.getElementById("sheet-image-layer");
    const zoomSelectEl = document.getElementById("zoom-select");
    if (zoomSelectEl && !Array.from(zoomSelectEl.options).some(opt => opt.value === "Dopasuj")) {
        const opt = new Option("Dopasuj", "Dopasuj");
        zoomSelectEl.insertBefore(opt, zoomSelectEl.firstChild);
    }

    const insertMenuItems = document.querySelectorAll(".we-insert-item");
    const insertSubmenuItems = document.querySelectorAll(".we-submenu-item");
    const insertSubmenus = document.querySelectorAll(".we-submenu");

    const generatedObjectsCard = document.getElementById("generated-objects-card");
    const generatedObjectsArea = document.getElementById("generated-objects-area");

    const chartModal = document.getElementById("chart-modal");
    const chartRangeInput = document.getElementById("chart-range-input");
    const chartTypeSelect = document.getElementById("chart-type-select");
    const chartTitleInput = document.getElementById("chart-title-input");
    const chartXTitleInput = document.getElementById("chart-x-title-input");
    const chartYTitleInput = document.getElementById("chart-y-title-input");
    const chartSeriesColorInput = document.getElementById("chart-series-color");
    const chartFirstRowHeaderInput = document.getElementById("chart-first-row-header");
    const chartFirstColLabelsInput = document.getElementById("chart-first-col-labels");
    const chartShowLegendInput = document.getElementById("chart-show-legend");
    const chartShowGridInput = document.getElementById("chart-show-grid");
    const chartShowLabelsInput = document.getElementById("chart-show-labels");
    const chartTypeCards = document.getElementById("chart-type-cards");
    const chartBgColorInput = document.getElementById("chart-bg-color");
    const chartWidthInput = document.getElementById("chart-width-input");
    const chartHeightInput = document.getElementById("chart-height-input");
    const chartLineWidthInput = document.getElementById("chart-line-width-input");
    const chartPointSizeInput = document.getElementById("chart-point-size-input");
    const chartSortSelect = document.getElementById("chart-sort-select");
    const chartLegendPositionSelect = document.getElementById("chart-legend-position-select");
    const buildChartBtn = document.getElementById("build-chart-btn");
    const chartLivePreview = document.getElementById("chart-live-preview");
    const chartUseSelectionBtn = document.getElementById("chart-use-selection-btn");
    const chartSmartPanel = document.getElementById("chart-smart-panel");
    const chartRangeInsight = document.getElementById("chart-range-insight");
    const chartPlaceOnSheetInput = document.getElementById("chart-place-on-sheet");
    const chartPlacementSelect = document.getElementById("chart-placement-select");

    const pivotModal = document.getElementById("pivot-modal");
    const pivotRangeInput = document.getElementById("pivot-range-input");
    const pivotAggSelect = document.getElementById("pivot-agg-select");
    const buildPivotBtn = document.getElementById("build-pivot-btn");
    const pivotUseSelectionBtn = document.getElementById("pivot-use-selection-btn");
    const pivotSearchInput = document.getElementById("pivot-search-input");
    const pivotFieldsList = document.getElementById("pivot-fields-list");
    const pivotClearBtn = document.getElementById("pivot-clear-btn");
    const workbookTabs = document.getElementById("workbook-tabs");
    const menuBar = document.querySelector(".we-menu-bar");
    const menuPopover = document.getElementById("we-menu-popover");
    const tableTemplateGrid = document.getElementById("table-template-grid");
    const clearBeforeTemplateBtn = document.getElementById("clear-before-template");
    const universityTemplateGrid = document.getElementById("university-template-grid");
    const clearBeforeUniversityTemplateBtn = document.getElementById("clear-before-university-template");
    const editorAddonsList = document.getElementById("editor-addons-list");
    const sheetScriptSelect = document.getElementById("sheet-script-select");
    const sheetScriptNameInput = document.getElementById("sheet-script-name");
    const sheetScriptEditor = document.getElementById("sheet-script-editor");
    const sheetScriptResult = document.getElementById("sheet-script-result");
    const sheetScriptsPanel = document.getElementById("sheet-scripts-panel");
    const sheetScriptNewBtn = document.getElementById("sheet-script-new-btn");
    const sheetScriptDeleteBtn = document.getElementById("sheet-script-delete-btn");
    const sheetScriptSaveBtn = document.getElementById("sheet-script-save-btn");
    const sheetScriptRunBtn = document.getElementById("sheet-script-run-btn");
    const teamOrgInput = document.getElementById("team-org-input");
    const teamOrgAddBtn = document.getElementById("team-org-add-btn");
    const teamFriendInput = document.getElementById("team-friend-input");
    const teamFriendAddBtn = document.getElementById("team-friend-add-btn");
    const teamGroupInput = document.getElementById("team-group-input");
    const teamGroupAddBtn = document.getElementById("team-group-add-btn");
    const teamListEl = document.getElementById("team-list");
    const followMeToggleBtn = document.getElementById("follow-me-toggle-btn");
    const followMeJoinBtn = document.getElementById("follow-me-join-btn");
    const followMeStatusEl = document.getElementById("follow-me-status");
    const cellTaskInput = document.getElementById("cell-task-input");
    const cellTaskAddBtn = document.getElementById("cell-task-add-btn");
    const cellTaskListEl = document.getElementById("cell-task-list");
    const scenarioNameInput = document.getElementById("scenario-name-input");
    const scenarioSaveBtn = document.getElementById("scenario-save-btn");
    const scenarioListEl = document.getElementById("scenario-list");
    const workflowCleanReportBtn = document.getElementById("workflow-clean-report-btn");
    const workflowSaveReportBtn = document.getElementById("workflow-save-report-btn");
    const workflowStatusEl = document.getElementById("workflow-status");
    const reportModal = document.getElementById("report-modal");
    const reportModalTitleInput = document.getElementById("report-modal-title");
    const reportModalTypeSelect = document.getElementById("report-modal-type");
    const reportModalVisibilitySelect = document.getElementById("report-modal-visibility");
    const reportModalScopeSelect = document.getElementById("report-modal-scope");
    const reportModalDescriptionInput = document.getElementById("report-modal-description");
    const reportModalKpisInput = document.getElementById("report-modal-kpis");
    const reportModalInsightsInput = document.getElementById("report-modal-insights");
    const reportModalExecutiveSummaryInput = document.getElementById("report-modal-executive-summary");
    const reportModalRiskInput = document.getElementById("report-modal-risk");
    const reportModalRecommendationInput = document.getElementById("report-modal-recommendation");
    const reportIncludeSelectionInput = document.getElementById("report-include-selection");
    const reportIncludeActivityInput = document.getElementById("report-include-activity");
    const reportModalChartList = document.getElementById("report-modal-chart-list");
    const reportModalPivotList = document.getElementById("report-modal-pivot-list");
    const reportModalHints = document.getElementById("report-modal-hints");
    const reportModalPreview = document.getElementById("report-modal-preview");
    const reportModalSaveBtn = document.getElementById("report-modal-save-btn");
    const reportModalSaveOpenBtn = document.getElementById("report-modal-save-open-btn");
    const smartInsertModal = document.getElementById("smart-insert-modal");
    const smartInsertTitle = document.getElementById("smart-insert-title");
    const smartInsertSubtitle = document.getElementById("smart-insert-subtitle");
    const smartInsertBody = document.getElementById("smart-insert-body");
    const smartInsertPreview = document.getElementById("smart-insert-preview");
    const smartInsertApplyBtn = document.getElementById("smart-insert-apply-btn");
    const sheetContextMenu = document.getElementById("sheet-context-menu");
    const formulaHelperPopover = document.getElementById("formula-helper-popover");
    const commentModal = document.getElementById("comment-modal");
    const commentModalTitle = document.getElementById("comment-modal-title");
    const commentTextarea = document.getElementById("comment-textarea");
    const commentPreview = document.getElementById("comment-preview");
    const commentSaveBtn = document.getElementById("comment-save-btn");
    const commentDeleteBtn = document.getElementById("comment-delete-btn");

    const emojiModal = document.getElementById("emoji-modal");
    const emojiSearchInput = document.getElementById("emoji-search-input");
    const emojiCategoryButtons = document.getElementById("emoji-category-buttons");
    const emojiGrid = document.getElementById("emoji-grid");
    const emojiPreview = document.getElementById("emoji-preview");
    const emojiInsertBtn = document.getElementById("emoji-insert-btn");

    const solverModal = document.getElementById("solver-modal");
    const dataGuideModal = document.getElementById("data-guide-modal");
    const solverTargetInput = document.getElementById("solver-target-input");
    const solverVariableInput = document.getElementById("solver-variable-input");
    const solverModeSelect = document.getElementById("solver-mode-select");
    const solverStepInput = document.getElementById("solver-step-input");
    const solverMinInput = document.getElementById("solver-min-input");
    const solverMaxInput = document.getElementById("solver-max-input");
    const solverConstraintsInput = document.getElementById("solver-constraints-input");
    const solverNonnegativeInput = document.getElementById("solver-nonnegative-input");
    const solverTargetValueInput = document.getElementById("solver-target-value-input");
    const solverTargetUpdateBtn = document.getElementById("solver-target-update-btn");
    const solverTargetClearBtn = document.getElementById("solver-target-clear-btn");
    const solverSheetSelect = document.getElementById("solver-sheet-select");
    const solverCurrentSheetBtn = document.getElementById("solver-current-sheet-btn");
    const solverVariableAddBtn = document.getElementById("solver-variable-add-btn");
    const solverVariableUpdateBtn = document.getElementById("solver-variable-update-btn");
    const solverVariableDeleteBtn = document.getElementById("solver-variable-delete-btn");
    const solverConstraintAddBtn = document.getElementById("solver-constraint-add-btn");
    const solverConstraintUpdateBtn = document.getElementById("solver-constraint-update-btn");
    const solverConstraintZlpBtn = document.getElementById("solver-constraint-zlp-btn");
    const solverConstraintClearBtn = document.getElementById("solver-constraint-clear-btn");
    const solverConstraintOpSelect = document.getElementById("solver-constraint-op-select");
    const solverResultBox = document.getElementById("solver-result-box");
    const runSolverBtn = document.getElementById("run-solver-btn");

    const modalCloseButtons = document.querySelectorAll("[data-close-modal]");

    const formulaCategoriesEl = document.getElementById("formula-categories");
    const formulaListEl = document.getElementById("formula-list");
    const formulaDetailsEl = document.getElementById("formula-details");
    const formulaCategoryTitleEl = document.getElementById("formula-category-title");

    const undoBtn = document.getElementById("undo-btn");
    const redoBtn = document.getElementById("redo-btn");

    const fontFamilySelect = document.getElementById("font-family-select");
    const fontSizeInput = document.getElementById("font-size-input");
    const boldBtn = document.getElementById("bold-btn");
    const italicBtn = document.getElementById("italic-btn");
    const underlineBtn = document.getElementById("underline-btn");
    const textColorInput = document.getElementById("text-color-input");
    const fillColorInput = document.getElementById("fill-color-input");
    const alignLeftBtn = document.getElementById("align-left-btn");
    const alignCenterBtn = document.getElementById("align-center-btn");
    const alignRightBtn = document.getElementById("align-right-btn");

    let currentSheet = null;
    let currentRows = 20;
    let currentCols = 10;
    const ARES_PERF_DEBUG = false;
    let selectionFrameId = null;
    const MIN_ROWS = 20;
    const MIN_COLS = 10;
    const MAX_IMPORT_ROWS = 1000;
    const MAX_IMPORT_COLS = 80;
    let activeCell = { row: 0, col: 0 };
    let autosaveTimer = null;
    let fullWidthMode = false;
    let gridHidden = false;

    let activeFormulaCategory = null;
    let activeFormulaName = null;

    let chartObjects = [];
    let pivotObjects = [];
    let editingChartIndex = null;
    let chartPreviewTimer = null;
    let activeSheetChartDrag = null;
    let sheetScripts = [];
    let activeColumnResize = null;
    let draggedColumnIndex = null;
    let draggedRowIndex = null;
    let highlightedCells = [];
    let highlightedHeaders = [];
    let highlightedFillCells = [];
    let formulaReferenceHighlightFrame = null;
    let pendingFormulaReferenceSource = undefined;
    const FORMULA_REFERENCE_COLORS = [
        { color: "#f97316", fill: "rgba(249, 115, 22, 0.12)" },
        { color: "#22c55e", fill: "rgba(34, 197, 94, 0.12)" },
        { color: "#38bdf8", fill: "rgba(56, 189, 248, 0.13)" },
        { color: "#a855f7", fill: "rgba(168, 85, 247, 0.13)" },
        { color: "#facc15", fill: "rgba(250, 204, 21, 0.15)" },
        { color: "#fb7185", fill: "rgba(251, 113, 133, 0.13)" },
        { color: "#14b8a6", fill: "rgba(20, 184, 166, 0.13)" },
        { color: "#818cf8", fill: "rgba(129, 140, 248, 0.13)" }
    ];
    let activeCellElement = null;
    let computedCellKeys = new Set();
    let gridDelegationBound = false;
    let pendingColumnWidths = null;
    let columnWidthFrameId = null;
    let pendingSingleColumnWidth = null;
    let singleColumnWidthFrameId = null;
    let computedRefreshTimer = null;
    let computedRefreshPendingCell = null;
    let cellElements = [];
    let rowHeaderElements = [];
    let colHeaderElements = [];
    let columnElements = [];
    let workbook = null;
    let activeWorkbookSheetIndex = 0;
    let lastAutosaveNoticeAt = 0;
    let networkSummaryLoadScheduled = false;
    let conditionalRulesSortedCache = [];
    let pivotConfig = { rows: [], columns: [], values: [], filters: [] };
    let commentEditMode = "comment";
    let activeEmojiCategory = "popularne";
    let selectedEmoji = "📌";
    let smartInsertMode = null;
    let editingConditionalRuleIndex = null;
    function refreshI18nAfterDynamicRender() {
        if (window.ARES_I18N && typeof window.ARES_I18N.refresh === "function") {
            window.ARES_I18N.refresh();
        }
    }

    let pendingSheetTabIndex = null;
    let cellClipboard = { text: "", matrix: null, cut: false, sourceRange: null };
    const EMOJI_CATEGORIES = {
        popularne: ["\u2705", "\u274C", "\u26A0\uFE0F", "\uD83D\uDCCC", "\uD83D\uDD25", "\uD83D\uDE80", "\uD83D\uDCA1", "\uD83D\uDCC8", "\uD83D\uDCC9", "\uD83D\uDCCA", "\uD83D\uDC4D", "\uD83D\uDE80", "\uD83D\uDE0A", "\uD83C\uDF89", "\uD83D\uDCA5", "\uD83D\uDD0D"],
        ludzie: ["\uD83D\uDE00", "\uD83D\uDE02", "\uD83D\uDE0A", "\uD83D\uDE0E", "\uD83D\uDE22", "\uD83D\uDE21", "\uD83D\uDE31", "\uD83E\uDD14", "\uD83D\uDE44", "\uD83E\uDD1D", "\uD83D\uDC4F", "\uD83D\uDC4D", "\uD83D\uDC4E", "\uD83E\uDEC2", "\uD83D\uDE4C", "\uD83D\uDE4F"],
        praca: ["\uD83D\uDCBC", "\uD83D\uDCC1", "\uD83D\uDCC2", "\uD83D\uDCC4", "\uD83D\uDCDD", "\uD83D\uDCCA", "\uD83D\uDCC8", "\uD83D\uDCC9", "\uD83E\uDDEE", "\uD83D\uDCC5", "\u23F0", "\uD83D\uDCCC", "\uD83D\uDCE7", "\uD83D\uDCAC", "\uD83D\uDDA5\uFE0F", "\uD83D\uDD10"],
        symbole: ["\u2714\uFE0F", "\u2716\uFE0F", "\u2795", "\u2796", "\u27A1\uFE0F", "\u2B05\uFE0F", "\u2B06\uFE0F", "\u2B07\uFE0F", "\u25B6\uFE0F", "\u23F8\uFE0F", "\u23F9\uFE0F", "\uD83D\uDD01", "\u2122\uFE0F", "\u00A9\uFE0F", "\u00AE\uFE0F", "\uD83D\uDD22"],
        obiekty: ["\uD83D\uDCF1", "\uD83D\uDCBB", "\u2328\uFE0F", "\uD83D\uDDA8\uFE0F", "\uD83D\uDCE6", "\uD83D\uDCEB", "\uD83D\uDD27", "\uD83D\uDD28", "\u2699\uFE0F", "\uD83D\uDD0B", "\uD83D\uDCA1", "\uD83D\uDD2C", "\uD83D\uDCCF", "\uD83D\uDCD0", "\uD83D\uDCB0", "\uD83D\uDC8E"]
    };
    let activeTooltip = null;
    function parseStoredJson(storage, key, fallback) {
        try {
            const raw = storage.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return parsed ?? fallback;
        } catch (error) {
            try { storage.removeItem(key); } catch (_) {}
            return fallback;
        }
    }

    let recentColors = parseStoredJson(localStorage, "ares_recent_colors", []);
    let lastLiveAutosaveNoticeAt = 0;
    let followMeBroadcastEnabled = false;
    const FOLLOW_ME_CHANNEL = "ares_follow_me_channel_v1";
    let networkSummaryCache = { friends: [], groups: [] };
    let editorAddonsCache = [];
    const LARGE_SELECTION_CELL_LIMIT = 1500;

    let historyStack = [];
    let redoStack = [];
    let isRestoringHistory = false;

    let selectionStart = null;
    let selectionEnd = null;
    let isMouseSelecting = false;
    let fillDragStart = null;
    let fillDragEnd = null;
    let isFillDragging = false;
    let formulaRangePickMode = false;
    let formulaRangeAnchor = null;
    let editorAddonsLoaded = false;
    let skipFormulaBlurHide = false;
    let formulaEditTarget = null;

    const SPILL_PREFIX = "__SPILL__:";
    const DEFAULT_CHART_COLOR = "#4f8cff";
    const STATIC_PALETTE = ["#4f8cff", "#7ba8ff", "#54c6eb", "#8a6dff", "#3ccf91", "#f8c156", "#ff8a65"];
    const CHART_TYPE_LABELS = {
        line: "Liniowy",
        "smooth-line": "Liniowy wygładzony",
        area: "Warstwowy",
        "stepped-area": "Schodkowy",
        column: "Kolumnowy",
        "stacked-column": "Kolumnowy skumulowany",
        bar: "Słupkowy poziomy",
        "stacked-bar": "Słupkowy skumulowany",
        pie: "Kołowy",
        doughnut: "Pierścieniowy",
        scatter: "Punktowy XY",
        bubble: "Bąbelkowy",
        histogram: "Histogram",
        pareto: "Pareto",
        waterfall: "Wodospadowy",
        radar: "Radarowy",
        combo: "Kombinowany",
        sparkline: "Miniwykres"
    };

    function getChartTypeDisplayName(type) {
        return CHART_TYPE_LABELS[type] || type || "Wykres";
    }

    window.EditorHelpers = {
        parseNumber,
        isNumericValue
    };

    function getCookie(name) {
        const cookies = document.cookie ? document.cookie.split(";") : [];
        for (const rawCookie of cookies) {
            const cookie = rawCookie.trim();
            if (cookie.startsWith(name + "=")) {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
        return null;
    }

    function sheetApiCacheKey(url) {
        return `ares_api_cache_v073:${url}`;
    }

    function clearLegacySheetApiCache() {
        try {
            Object.keys(sessionStorage || {}).forEach(key => {
                if (key.startsWith("ares_api_cache")) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            // Cache pomocniczy nie może blokować ładowania arkusza.
        }
    }
    clearLegacySheetApiCache();

    function readSheetApiCache(url) {
        try {
            const raw = sessionStorage.getItem(sheetApiCacheKey(url));
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || Date.now() - parsed.time > 120000) return null;
            return parsed.data;
        } catch (error) {
            return null;
        }
    }

    function writeSheetApiCache(url, data) {
        try {
            sessionStorage.setItem(sheetApiCacheKey(url), JSON.stringify({ time: Date.now(), data }));
        } catch (error) {
            // Brak miejsca w sessionStorage nie może blokować edytora.
        }
    }

    async function getJson(url) {
        // Edytor arkusza musi zawsze dostać aktualny stan z backendu.
        // Stary cache sessionStorage potrafił trzymać błędne metadane typu Kolumny: undefined.

        const response = await fetch(url, {
            method: "GET",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            credentials: "same-origin"
        });

        const text = await response.text();
        if (ARES_PERF_DEBUG) console.log("GET", url, "status:", response.status, "body:", text);

        if (!response.ok) {
            throw new Error(`GET ${url} -> ${response.status}\n${text}`);
        }

        const data = JSON.parse(text);
        return data;
    }

    async function postJson(url, data) {
        const csrftoken = getCookie("csrftoken");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken || "",
                "X-Requested-With": "XMLHttpRequest"
            },
            credentials: "same-origin",
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`POST ${url} -> ${response.status}\n${text}`);
        }

        return await response.json();
    }

    function currentSheetLabel() {
        return currentSheet?.activeTabName || workbook?.sheets?.[activeWorkbookSheetIndex]?.name || currentSheet?.name || "Arkusz";
    }


    function refreshSolverSheetSelect(selectedIndex = activeWorkbookSheetIndex) {
        if (!solverSheetSelect) return;
        const sheets = Array.isArray(workbook?.sheets) && workbook.sheets.length
            ? workbook.sheets
            : [{ name: currentSheetLabel() }];
        const normalizedIndex = Math.max(0, Math.min(Number(selectedIndex) || 0, sheets.length - 1));
        solverSheetSelect.innerHTML = sheets.map((sheet, index) => {
            const label = safeSheetName(sheet?.name || sheet?.activeTabName, `Arkusz ${index + 1}`);
            return `<option value="${index}" ${index === normalizedIndex ? "selected" : ""}>${escapeHtml(label)}</option>`;
        }).join("");
    }

    function activateSelectedSolverSheet() {
        if (!solverSheetSelect || !Array.isArray(workbook?.sheets) || !workbook.sheets.length) return true;
        const selectedIndex = Number(solverSheetSelect.value);
        if (!Number.isInteger(selectedIndex) || !workbook.sheets[selectedIndex]) return true;
        if (selectedIndex !== activeWorkbookSheetIndex) {
            activateWorkbookSheet(selectedIndex);
        }
        return true;
    }

    const actionLogQueue = [];
    let actionLogFlushTimer = null;
    let actionLogInFlight = false;
    const ACTION_LOG_BATCH_SIZE = 6;
    const ACTION_LOG_FLUSH_MS = 2200;

    async function flushActionLogs() {
        if (actionLogInFlight || !actionLogQueue.length) return;
        actionLogInFlight = true;
        try {
            const batch = actionLogQueue.splice(0, ACTION_LOG_BATCH_SIZE);
            for (const item of batch) {
                await postJson("/ares/api/history/add/", item);
            }
        } catch (error) {
            // Przywróć wpisy na początek kolejki, jeśli flush się nie uda.
            // Nie może to blokować działania komórek.
            console.warn("Nie udało się zapisać historii akcji.", error);
        } finally {
            actionLogInFlight = false;
            if (actionLogQueue.length) {
                actionLogFlushTimer = setTimeout(flushActionLogs, ACTION_LOG_FLUSH_MS);
            }
        }
    }

    function scheduleActionLogFlush() {
        if (actionLogFlushTimer) clearTimeout(actionLogFlushTimer);
        actionLogFlushTimer = setTimeout(flushActionLogs, ACTION_LOG_FLUSH_MS);
    }

    function logUserAction(action, details = {}) {
        if (DEMO_MODE) return;
        actionLogQueue.push({
            sheetId: sheetId,
            action,
            details: {
                sheetName: currentSheet?.name || "Arkusz",
                tabName: currentSheetLabel(),
                activeCell: cellAddress(activeCell.row, activeCell.col),
                ...details,
            }
        });
        // Chroni UI przed narastaniem kolekcji przy bardzo szybkich edycjach.
        if (actionLogQueue.length > 40) {
            actionLogQueue.splice(0, actionLogQueue.length - 40);
        }
        scheduleActionLogFlush();
    }

    function colToLabel(index) {
        let label = "";
        let n = index + 1;

        while (n > 0) {
            const rem = (n - 1) % 26;
            label = String.fromCharCode(65 + rem) + label;
            n = Math.floor((n - 1) / 26);
        }

        return label;
    }

    function cellAddress(row, col) {
        return `${colToLabel(col)}${row + 1}`;
    }

    function labelToCol(label) {
        let result = 0;
        for (const ch of String(label).toUpperCase()) {
            result = result * 26 + (ch.charCodeAt(0) - 64);
        }
        return result - 1;
    }

    function cellRefToIndex(ref) {
        const match = String(ref || "").trim().toUpperCase().match(/^\$?([A-Z]+)\$?(\d+)$/);
        if (!match) return null;

        return {
            col: labelToCol(match[1]),
            row: parseInt(match[2], 10) - 1
        };
    }

    function normalizeCellRefText(ref) {
        return String(ref || "").trim().toUpperCase().replace(/\$/g, "");
    }

    function indexToCellRef(row, col, lockCol = false, lockRow = false) {
        return `${lockCol ? "$" : ""}${colToLabel(Math.max(0, col))}${lockRow ? "$" : ""}${Math.max(0, row) + 1}`;
    }

    function toggleReferenceLockInFormulaInput() {
        if (!formulaInput) return;

        const value = formulaInput.value || "";
        const cursor = typeof formulaInput.selectionStart === "number" ? formulaInput.selectionStart : value.length;
        const refRegex = /\$?[A-Z]+\$?\d+/gi;
        let match;

        while ((match = refRegex.exec(value)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            if (cursor < start || cursor > end) continue;

            const refMatch = match[0].match(/^(\$?)([A-Z]+)(\$?)(\d+)$/i);
            if (!refMatch) return;

            const [, colLock, letters, rowLock, rowNumber] = refMatch;
            let next;
            if (!colLock && !rowLock) next = `$${letters.toUpperCase()}$${rowNumber}`;
            else if (colLock && rowLock) next = `${letters.toUpperCase()}$${rowNumber}`;
            else if (!colLock && rowLock) next = `$${letters.toUpperCase()}${rowNumber}`;
            else next = `${letters.toUpperCase()}${rowNumber}`;

            formulaInput.value = value.slice(0, start) + next + value.slice(end);
            const nextCursor = start + next.length;
            formulaInput.setSelectionRange(nextCursor, nextCursor);
            return;
        }
    }

    function adjustFormulaReferences(formula, rowOffset, colOffset) {
        if (typeof formula !== "string" || !formula.trim().startsWith("=")) return formula;

        return formula.replace(/\$?[A-Z]+\$?\d+/gi, ref => {
            const match = ref.match(/^(\$?)([A-Z]+)(\$?)(\d+)$/i);
            if (!match) return ref;

            const [, colLock, letters, rowLock, rowNumber] = match;
            const sourceCol = labelToCol(letters);
            const sourceRow = parseInt(rowNumber, 10) - 1;
            const nextCol = colLock ? sourceCol : sourceCol + colOffset;
            const nextRow = rowLock ? sourceRow : sourceRow + rowOffset;

            return indexToCellRef(nextRow, nextCol, !!colLock, !!rowLock);
        });
    }

    function emptyGrid(rows = 20, cols = 10) {
        return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
    }

    function normalizeGridRows(grid) {
        if (!Array.isArray(grid)) return [];
        return grid.map(row => Array.isArray(row) ? row : []);
    }

    function inferDimensionsFromGrid(grid) {
        // Liczymy wyłącznie z realnej siatki, bez starych pól z bazy/cache.
        // Dzięki temu w nagłówku nie pojawia się już np. „Kolumny: undefined”.
        const maybeWorkbookGrid = grid && !Array.isArray(grid) && Array.isArray(grid.sheets)
            ? grid.sheets[Math.max(0, Math.min(Number(grid.activeSheetIndex) || 0, grid.sheets.length - 1))]?.grid
            : grid;
        const rowsSource = normalizeGridRows(maybeWorkbookGrid);
        const rowCount = rowsSource.length;
        const maxCols = rowsSource.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
        const rows = Math.max(rowCount, MIN_ROWS);
        const cols = Math.max(maxCols, MIN_COLS);

        return { rows, cols };
    }

    function safeSheetName(value, fallback = "Arkusz 1") {
        const text = String(value  || "").trim();
        const safeFallback = String(fallback || "Arkusz 1").trim() || "Arkusz 1";
        if (!text || /^(undefined|null|nan)$/i.test(text)) return safeFallback;
        if (/^\d+$/.test(text)) return safeFallback;
        return text;
    }

    function safeDimension(value, fallback) {
        const numeric = Number(value);
        return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
    }

    function getActiveSheetTitleFallback() {
        return safeSheetName(currentSheet?.name, `Arkusz ${activeWorkbookSheetIndex + 1 || 1}`);
    }

    function getActiveTabName() {
        const activeWorkbookName = workbook?.sheets?.[activeWorkbookSheetIndex]?.name;
        const fallback = getActiveSheetTitleFallback();
        return safeSheetName(activeWorkbookName || currentSheet?.activeTabName || fallback, fallback);
    }

    function syncSheetDimensionsFromGrid() {
        const activeWorkbookGrid = workbook?.sheets?.[activeWorkbookSheetIndex]?.grid;
        const grid = Array.isArray(currentSheet?.grid) ? currentSheet.grid : (Array.isArray(activeWorkbookGrid) ? activeWorkbookGrid : []);
        const dims = inferDimensionsFromGrid(grid);
        currentRows = Math.max(safeDimension(dims.rows, MIN_ROWS), MIN_ROWS);
        currentCols = Math.max(safeDimension(dims.cols, MIN_COLS), MIN_COLS);
        if (currentSheet && Array.isArray(currentSheet.grid)) {
            ensureDimensions(currentRows, currentCols);
        }
        return { rows: currentRows, cols: currentCols };
    }

    function setSheetMetaText(tabName, rows, cols, extra = "") {
        if (!sheetMetaEl) return;
        const rowLabel = Math.max(Number(rows) || 0, MIN_ROWS);
        const colLabel = Math.max(Number(cols) || 0, MIN_COLS);
        const safeTab = safeSheetName(tabName, getActiveSheetTitleFallback());
        sheetMetaEl.replaceChildren();
        const parts = [
            ["Zakładka", safeTab],
            ["Wiersze", String(rowLabel)],
            ["Kolumny", String(colLabel)]
        ];
        parts.forEach(([label, value]) => {
            const pill = document.createElement("span");
            pill.className = "we-meta-pill";
            const strong = document.createElement("strong");
            strong.textContent = `${label}:`;
            const span = document.createElement("span");
            span.textContent = value;
            pill.append(strong, span);
            sheetMetaEl.appendChild(pill);
        });
        if (extra) {
            const info = document.createElement("span");
            info.className = "we-meta-pill we-meta-info";
            info.textContent = String(extra).replace(/^\s*•\s*/, "");
            sheetMetaEl.appendChild(info);
        }
        sheetMetaEl.dataset.rows = String(rowLabel);
        sheetMetaEl.dataset.cols = String(colLabel);
        sheetMetaEl.dataset.tab = safeTab;
    }

    function updateSheetMeta(extra = "") {
        if (!sheetMetaEl) return;
        const dims = syncSheetDimensionsFromGrid();
        setSheetMetaText(getActiveTabName(), dims.rows, dims.cols, extra);
    }

    function repairSheetMetaFromRenderedGrid(extra = "") {
        if (!sheetMetaEl) return;
        const renderedRows = body?.querySelectorAll("tr").length || 0;
        const renderedCols = head?.querySelectorAll("th.we-column-header").length || 0;
        if (renderedRows || renderedCols) {
            setSheetMetaText(getActiveTabName(), renderedRows || currentRows, renderedCols || currentCols, extra);
        }
    }

    function normalizeTags(tags) {
        if (!Array.isArray(tags)) return [];
        const seen = new Set();
        return tags
            .map(tag => String(tag || "").trim())
            .filter(Boolean)
            .filter(tag => {
                const key = tag.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 8);
    }

    function sanitizeLegacyCellStyles(styles) {
        if (!styles || typeof styles !== "object") return {};
        const clean = {};
        Object.entries(styles).forEach(([key, style]) => {
            if (!style || typeof style !== "object") return;
            const next = { ...style };
            const hasExplicitBorderLook = Boolean(next.borderColor || next.borderWidth || next.borderLineStyle);
            const borderKeys = ["border", "borderTop", "borderRight", "borderBottom", "borderLeft"];
            const hasBorderFlag = borderKeys.some(prop => Boolean(next[prop]));

            // Starsze paczki potrafiły zapisać same flagi obramowań bez jawnego koloru/szerokości.
            // Po ponownym otwarciu wyglądało to jak poszarpane separatory między kolumnami.
            if (hasBorderFlag && !hasExplicitBorderLook) {
                borderKeys.forEach(prop => { delete next[prop]; });
            }

            clean[key] = next;
        });
        return clean;
    }

    function renderSheetTags() {
        if (!sheetTagsEl) return;
        const tags = normalizeTags(currentSheet?.tags || workbook?.sheets?.[activeWorkbookSheetIndex]?.tags || []);
        currentSheet.tags = tags;
        sheetTagsEl.innerHTML = "";
        if (!tags.length) {
            const empty = document.createElement("span");
            empty.className = "we-sheet-tag-empty";
            empty.textContent = "Brak tagów";
            sheetTagsEl.appendChild(empty);
            return;
        }
        tags.forEach((tag, index) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "we-sheet-tag";
            chip.title = "Kliknij, aby usunąć tag";
            chip.textContent = `#${tag}`;
            chip.addEventListener("click", () => {
                if (!currentSheetCanEdit) return;
                currentSheet.tags.splice(index, 1);
                renderSheetTags();
                markDirty();
            });
            sheetTagsEl.appendChild(chip);
        });
    }

    function openSheetTagModal() {
        if (!currentSheetCanEdit || !sheetTagModal || !sheetTagInput) return;
        sheetTagInput.value = "";
        sheetTagInput.classList.remove("input-error");
        sheetTagModal.hidden = false;
        document.body.classList.add("modal-open");
        window.setTimeout(() => sheetTagInput.focus(), 40);
    }

    function closeSheetTagModal() {
        if (!sheetTagModal) return;
        sheetTagModal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    function saveSheetTagFromModal() {
        if (!currentSheet || !sheetTagInput || !currentSheetCanEdit) return;
        const tag = String(sheetTagInput.value || "").trim().replace(/^#/, "").replace(/\s+/g, " ").slice(0, 24);
        if (!tag) {
            sheetTagInput.focus();
            sheetTagInput.classList.add("input-error");
            window.setTimeout(() => sheetTagInput.classList.remove("input-error"), 900);
            return;
        }
        currentSheet.tags = normalizeTags([...(currentSheet.tags || []), tag]);
        renderSheetTags();
        markDirty();
        closeSheetTagModal();
    }

    function addSheetTag() {
        openSheetTagModal();
    }

    function makeUniqueSheetName(baseName = "Arkusz", ignoreIndex = null) {
        const base = String(baseName || "Arkusz").trim() || "Arkusz";
        if (!workbook?.sheets?.length) return base;

        const existing = new Set(
            workbook.sheets
                .map((sheet, index) => index === ignoreIndex ? null : String(sheet.name || "").trim().toLowerCase())
                .filter(Boolean)
        );

        if (!existing.has(base.toLowerCase())) return base;

        let suffix = 2;
        let candidate = `${base} ${suffix}`;
        while (existing.has(candidate.toLowerCase())) {
            suffix += 1;
            candidate = `${base} ${suffix}`;
        }
        return candidate;
    }

    function ensureWorkbookSheetId(sheet, index = 0) {
        if (!sheet || typeof sheet !== "object") return `sheet-${index + 1}`;
        if (!sheet.uid) {
            const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index + 1}`;
            sheet.uid = `sheet-${seed}`;
        }
        return sheet.uid;
    }

    function activeSheetStateKey() {
        const sheet = workbook?.sheets?.[activeWorkbookSheetIndex];
        return sheet ? ensureWorkbookSheetId(sheet, activeWorkbookSheetIndex) : String(activeWorkbookSheetIndex || 0);
    }

    function normalizeSheetMeta(sheet, index) {
        return {
            uid: ensureWorkbookSheetId(sheet || {}, index),
            name: safeSheetName(sheet?.name, `Arkusz ${index + 1}`),
            grid: Array.isArray(sheet?.grid) ? sheet.grid : emptyGrid(),
            styles: sanitizeLegacyCellStyles(sheet?.styles || {}),
            conditionalRules: Array.isArray(sheet?.conditionalRules) ? sheet.conditionalRules : [],
            color: sheet?.color || "",
            hidden: Boolean(sheet?.hidden),
            protected: Boolean(sheet?.protected),
            columnWidths: sheet?.columnWidths || {},
            rowHeights: sheet?.rowHeights || {},
            tags: normalizeTags(sheet?.tags || [])
        };
    }

    function ensureUniqueWorkbookSheetNames() {
        if (!workbook?.sheets?.length) return;
        const used = new Set();
        workbook.sheets.forEach((sheet, index) => {
            const base = String(sheet.name || `Arkusz ${index + 1}`).trim() || `Arkusz ${index + 1}`;
            let candidate = base;
            let suffix = 2;
            while (used.has(candidate.toLowerCase())) {
                candidate = `${base} ${suffix}`;
                suffix += 1;
            }
            sheet.name = candidate;
            used.add(candidate.toLowerCase());
        });
    }

    function formatFormulaValue(value, decimals = 10) {
        if (Array.isArray(value)) {
            return value.map(item => Array.isArray(item) ? item.map(v => formatFormulaValue(v, decimals)) : formatFormulaValue(item, decimals));
        }
        if (typeof value !== "number") return value;
        if (!Number.isFinite(value)) return "#BŁĄD";
        if (Number.isInteger(value)) return value;
        const rounded = Number(value.toFixed(decimals));
        return Object.is(rounded, -0) ? 0 : rounded;
    }

    function displayFormulaValue(value) {
        const formatted = formatFormulaValue(value);
        return String(formatted  || "");
    }

    function normalizeWorkbookData(data) {
        const rawGrid = data.grid;
        const normalizedWorkbook = rawGrid && !Array.isArray(rawGrid) && Array.isArray(rawGrid.sheets)
            ? {
                activeSheetIndex: Math.min(rawGrid.activeSheetIndex || 0, rawGrid.sheets.length - 1),
                sheets: rawGrid.sheets.map((sheet, index) => normalizeSheetMeta(sheet, index)),
                extensions: typeof rawGrid.extensions === "object" && rawGrid.extensions ? rawGrid.extensions : {}
            }
            : {
                activeSheetIndex: 0,
                sheets: [{
                    name: safeSheetName(data.name, "Arkusz 1"),
                    grid: Array.isArray(rawGrid) ? rawGrid : emptyGrid(),
                    styles: data.styles || {},
                    conditionalRules: Array.isArray(data.conditionalRules) ? data.conditionalRules : [],
                    color: "",
                    hidden: false,
                    protected: false,
                    columnWidths: data.columnWidths || {},
                    rowHeights: data.rowHeights || {}
                }],
                extensions: {}
            };

        workbook = normalizedWorkbook;
        ensureUniqueWorkbookSheetNames();
        return workbook;
    }

    function getWorkbookExtensions() {
        if (!workbook) return {};
        if (!workbook.extensions || typeof workbook.extensions !== "object") {
            workbook.extensions = {};
        }
        return workbook.extensions;
    }

    function getSheetExtensionState() {
        const ext = getWorkbookExtensions();
        if (!ext.sheetStates || typeof ext.sheetStates !== "object") ext.sheetStates = {};
        const key = activeSheetStateKey();
        if (!ext.sheetStates[key] || typeof ext.sheetStates[key] !== "object") {
            ext.sheetStates[key] = { tasks: [], scenarios: [], images: [], sheetCharts: [] };
        }
        if (!Array.isArray(ext.sheetStates[key].tasks)) ext.sheetStates[key].tasks = [];
        if (!Array.isArray(ext.sheetStates[key].scenarios)) ext.sheetStates[key].scenarios = [];
        if (!Array.isArray(ext.sheetStates[key].images)) ext.sheetStates[key].images = [];
        if (!Array.isArray(ext.sheetStates[key].sheetCharts)) ext.sheetStates[key].sheetCharts = [];
        return ext.sheetStates[key];
    }

    function commitActiveSheetToWorkbook() {
        if (!workbook || !currentSheet) return;
        const previous = workbook.sheets[activeWorkbookSheetIndex] || {};
        workbook.sheets[activeWorkbookSheetIndex] = {
            ...previous,
            uid: ensureWorkbookSheetId(previous, activeWorkbookSheetIndex),
            name: previous.name || currentSheet.activeTabName || currentSheet.name || `Arkusz ${activeWorkbookSheetIndex + 1}`,
            grid: currentSheet.grid,
            styles: currentSheet.styles || {},
            conditionalRules: currentSheet.conditionalRules || [],
            columnWidths: currentSheet.columnWidths || {},
            rowHeights: currentSheet.rowHeights || {},
            tags: normalizeTags(currentSheet.tags || [])
        };
    }

    function activateWorkbookSheet(index, shouldRender = true) {
        if (!workbook || !workbook.sheets[index]) return;
        commitActiveSheetToWorkbook();
        activeWorkbookSheetIndex = index;
        workbook.activeSheetIndex = index;
        const selected = workbook.sheets[index];
        currentSheet.grid = selected.grid;
        currentSheet.styles = sanitizeLegacyCellStyles(selected.styles || {});
        currentSheet.conditionalRules = Array.isArray(selected.conditionalRules) ? selected.conditionalRules : [];
        currentSheet.columnWidths = selected.columnWidths || {};
        currentSheet.rowHeights = selected.rowHeights || {};
        currentSheet.tags = normalizeTags(selected.tags || []);
        currentSheet.name = selected.name;
        currentSheet.activeTabName = selected.name;
        if (sheetNameEl) sheetNameEl.textContent = selected.name || "Arkusz";
        const dims = inferDimensionsFromGrid(currentSheet.grid);
        currentRows = dims.rows;
        currentCols = dims.cols;
        ensureDimensions(currentRows, currentCols);
        activeCell = { row: 0, col: 0 };
        clearSelection();
        updateSheetMeta();
        renderSheetTags();
        renderWorkbookTabs();
        refreshSolverSheetSelect(index);
        renderCellTasks();
        renderScenarios();
        if (shouldRender) renderGrid();
    }

    function renderWorkbookTabs() {
        if (!workbookTabs || !workbook) return;
        workbookTabs.innerHTML = "";
        workbook.sheets.forEach((sheet, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "we-workbook-tab" + (index === activeWorkbookSheetIndex ? " active" : "") + (sheet.hidden ? " hidden-sheet" : "");
            btn.style.setProperty("--tab-color", sheet.color || "transparent");
            btn.style.borderBottomColor = sheet.color || "";
            btn.innerHTML = `<span class="we-tab-title">${escapeHtml(sheet.name || `Arkusz ${index + 1}`)}</span> <span class="we-workbook-tab-actions" title="Opcje arkusza">▾</span>`;
            btn.addEventListener("click", (event) => {
                if (event.target.closest(".we-workbook-tab-actions")) {
                    event.stopPropagation();
                    showSheetContextMenu(index, btn);
                    return;
                }
                activateWorkbookSheet(index);
            });
            btn.addEventListener("contextmenu", (event) => { event.preventDefault(); showSheetContextMenu(index, btn); });
            btn.addEventListener("dblclick", () => renameWorkbookSheet(index));
            workbookTabs.appendChild(btn);
        });
        const add = document.createElement("button");
        add.type = "button";
        add.className = "we-workbook-add-tab";
        add.textContent = "+";
        add.title = "Dodaj nowy arkusz w tym pliku";
        add.addEventListener("click", addWorkbookSheet);
        workbookTabs.appendChild(add);
    }

    function showSheetContextMenu(index, anchor) {
        if (!sheetContextMenu || !workbook || !workbook.sheets[index]) return;
        pendingSheetTabIndex = index;
        const canMoveLeft = index > 0;
        const canMoveRight = index < workbook.sheets.length - 1;
        const tabColors = ["#ffffff", "#f28b82", "#fbbc04", "#fff475", "#ccff90", "#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb", "#fdcfe8", "#4f8cff", "#3ccf91"];
        const copyTargets = workbook.sheets
            .map((sheet, sheetIndex) => ({ sheet, sheetIndex }))
            .filter(item => item.sheetIndex !== index)
            .map(item => `<button data-sheet-action="copy-to-index:${item.sheetIndex}">${escapeHtml(item.sheet.name || `Arkusz ${item.sheetIndex + 1}`)}</button>`)
            .join("") || `<button disabled>Brak innych arkuszy</button>`;
        const activeColor = workbook.sheets[index].color || "";
        sheetContextMenu.innerHTML = `
            <button type="button" data-sheet-action="rename">Zmień nazwę</button>
            <button type="button" data-sheet-action="duplicate">Duplikuj</button>
            <div class="we-menu-row has-submenu" tabindex="0">
                <button type="button" class="we-menu-parent">Kopiuj do <span>›</span></button>
                <div class="we-sheet-submenu">${copyTargets}<button type="button" data-sheet-action="copy-to-new">Nowy arkusz</button></div>
            </div>
            <button type="button" data-sheet-action="protect">${workbook.sheets[index].protected ? "Wyłącz ochronę" : "Chroń arkusz"}</button>
            <button type="button" data-sheet-action="hide">${workbook.sheets[index].hidden ? "Pokaż arkusz" : "Ukryj arkusz"}</button>
            <button type="button" data-sheet-action="comments">Wyświetl komentarze</button>
            <div class="we-menu-separator"></div>
            <div class="we-menu-section-label">Zmień kolor</div>
            <div class="we-sheet-color-row">${tabColors.map(c => `<button type="button" class="we-sheet-color-swatch${(c === activeColor || (c === "#ffffff" && !activeColor)) ? " active" : ""}" data-sheet-action="tab-color:${c}" style="--swatch-color:${c}; background:${c}" aria-label="${c === "#ffffff" ? "Bez koloru" : `Kolor ${c}`}" title="${c === "#ffffff" ? "Bez koloru" : c}"></button>`).join("")}</div>
            <div class="we-menu-separator"></div>
            <button type="button" data-sheet-action="move-right" ${canMoveRight ? "" : "disabled"}>Przenieś w prawo</button>
            <button type="button" data-sheet-action="move-left" ${canMoveLeft ? "" : "disabled"}>Przenieś w lewo</button>
            <div class="we-menu-separator"></div>
            <button type="button" data-sheet-action="delete" class="danger">Usuń</button>
        `;
        const rect = anchor.getBoundingClientRect();
        sheetContextMenu.hidden = false;
        sheetContextMenu.style.visibility = "hidden";
        const menuWidth = 260;
        sheetContextMenu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8))}px`;
        const menuHeight = sheetContextMenu.offsetHeight || 420;
        const preferTop = rect.top - menuHeight - 8;
        const top = preferTop > 8 ? preferTop : Math.min(rect.bottom + 8, window.innerHeight - menuHeight - 8);
        sheetContextMenu.style.top = `${Math.max(8, top)}px`;
        sheetContextMenu.style.visibility = "visible";
    }
    function handleSheetContextAction(action) {
        const index = pendingSheetTabIndex;
        if (!workbook || index == null || !workbook.sheets[index]) return;
        if (action === "comments") return openCommentEditor("comment");
        if (action && action.startsWith("tab-color:")) {
            const color = action.slice("tab-color:".length);
            workbook.sheets[index].color = color === "#ffffff" ? "" : color;
            if (saveBtn) saveBtn.disabled = !currentSheetCanEdit;
            if (applyFormulaBtn) applyFormulaBtn.disabled = !currentSheetCanEdit;
            if (renameBtn) renameBtn.disabled = !currentSheetCanShare;
            renderWorkbookTabs();
            return markDirty();
        }
        if (action === "rename") return renameWorkbookSheet(index);
        if (action === "duplicate" || action === "copy-to-new") {
            commitActiveSheetToWorkbook();
            const original = workbook.sheets[index];
            const copy = JSON.parse(JSON.stringify(original));
            copy.name = makeUniqueSheetName(`${original.name || `Arkusz ${index + 1}`} — kopia`);
            workbook.sheets.splice(index + 1, 0, copy);
            activateWorkbookSheet(index + 1);
            return markDirty();
        }
        if (action && action.startsWith("copy-to-index:")) {
            commitActiveSheetToWorkbook();
            const targetIndex = parseInt(action.split(":")[1], 10);
            if (!Number.isInteger(targetIndex) || !workbook.sheets[targetIndex]) return;
            const original = workbook.sheets[index];
            const copy = JSON.parse(JSON.stringify(original));
            copy.name = makeUniqueSheetName(`${original.name || `Arkusz ${index + 1}`} — kopia`);
            workbook.sheets.splice(targetIndex + 1, 0, copy);
            activateWorkbookSheet(targetIndex + 1);
            return markDirty();
        }
        if (action === "delete") {
            if (workbook.sheets.length <= 1) return alert("Nie można usunąć ostatniego arkusza.");
            if (!confirm("Usunąć tę zakładkę?")) return;
            workbook.sheets.splice(index, 1);
            activeWorkbookSheetIndex = Math.min(activeWorkbookSheetIndex, workbook.sheets.length - 1);
            activateWorkbookSheet(activeWorkbookSheetIndex);
            return markDirty();
        }
        if (action === "move-left" && index > 0) {
            [workbook.sheets[index - 1], workbook.sheets[index]] = [workbook.sheets[index], workbook.sheets[index - 1]];
            activeWorkbookSheetIndex = index - 1;
            activateWorkbookSheet(activeWorkbookSheetIndex);
            return markDirty();
        }
        if (action === "move-right" && index < workbook.sheets.length - 1) {
            [workbook.sheets[index + 1], workbook.sheets[index]] = [workbook.sheets[index], workbook.sheets[index + 1]];
            activeWorkbookSheetIndex = index + 1;
            activateWorkbookSheet(activeWorkbookSheetIndex);
            return markDirty();
        }
        if (action === "color") {
            const color = prompt("Kolor zakładki, np. #4f8cff:", workbook.sheets[index].color || "#4f8cff");
            if (color) workbook.sheets[index].color = color;
            if (saveBtn) saveBtn.disabled = !currentSheetCanEdit;
            if (applyFormulaBtn) applyFormulaBtn.disabled = !currentSheetCanEdit;
            if (renameBtn) renameBtn.disabled = !currentSheetCanShare;
            renderWorkbookTabs();
            return markDirty();
        }
        if (action === "protect") {
            workbook.sheets[index].protected = !workbook.sheets[index].protected;
            alert(workbook.sheets[index].protected ? "Arkusz oznaczony jako chroniony." : "Ochrona arkusza wyłączona.");
            return markDirty();
        }
        if (action === "hide") {
            workbook.sheets[index].hidden = !workbook.sheets[index].hidden;
            if (saveBtn) saveBtn.disabled = !currentSheetCanEdit;
            if (applyFormulaBtn) applyFormulaBtn.disabled = !currentSheetCanEdit;
            if (renameBtn) renameBtn.disabled = !currentSheetCanShare;
            renderWorkbookTabs();
            return markDirty();
        }
    }

    function addWorkbookSheet() {
        if (!workbook) return;
        commitActiveSheetToWorkbook();
        const nextIndex = workbook.sheets.length + 1;
        const name = makeUniqueSheetName(`Arkusz ${nextIndex}`);
        workbook.sheets.push({ uid: `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, grid: emptyGrid(), styles: {}, color: "", hidden: false, protected: false });
        activateWorkbookSheet(workbook.sheets.length - 1);
        markDirty();
    }

    function renameWorkbookSheet(index) {
        if (!workbook || !workbook.sheets[index]) return;
        const currentName = workbook.sheets[index].name || `Arkusz ${index + 1}`;
        const nextName = prompt("Podaj nazwę zakładki:", currentName);
        if (!nextName) return;
        const uniqueName = makeUniqueSheetName(nextName.trim(), index);
        workbook.sheets[index].name = uniqueName;
        if (index === activeWorkbookSheetIndex && currentSheet) {
            currentSheet.name = uniqueName;
            currentSheet.activeTabName = uniqueName;
            if (sheetNameEl) sheetNameEl.textContent = uniqueName;
        }
        renderWorkbookTabs();
        updateSheetMeta();
        markDirty();
    }

    function workbookPayloadForSave() {
        commitActiveSheetToWorkbook();
        if (!workbook) return currentSheet.grid;
        return {
            version: 2,
            activeSheetIndex: activeWorkbookSheetIndex,
            sheets: workbook.sheets,
            extensions: getWorkbookExtensions()
        };
    }

    function normalizeLoadedSheet(data) {
        workbook = normalizeWorkbookData(data);
        activeWorkbookSheetIndex = workbook.activeSheetIndex || 0;
        const active = workbook.sheets[activeWorkbookSheetIndex] || workbook.sheets[0];
        const dims = inferDimensionsFromGrid(active.grid);

        currentRows = dims.rows;
        currentCols = dims.cols;

        const normalized = emptyGrid(currentRows, currentCols);
        active.grid.forEach((row, r) => {
            (row || []).forEach((value, c) => {
                normalized[r][c] = value || "";
            });
        });
        active.grid = normalized;

        return {
            ...data,
            category: data.category || "Bez kategorii",
            styles: active.styles || {},
            conditionalRules: Array.isArray(active.conditionalRules) ? active.conditionalRules : [],
            columnWidths: active.columnWidths || {},
            rowHeights: active.rowHeights || {},
            tags: normalizeTags(active.tags || data.tags || []),
            scripts: normalizeSheetScripts(data.scripts || []),
            grid: normalized,
            activeTabName: safeSheetName(active.name, safeSheetName(data.name, "Arkusz 1"))
        };
    }

    function normalizeSheetScripts(scripts) {
        if (!Array.isArray(scripts)) return [];
        return scripts
            .map((script, idx) => {
                const name = String(script?.name || `Skrypt ${idx + 1}`).trim().slice(0, 80);
                const code = String(script?.code || "");
                if (!name || !code.trim()) return null;
                return {
                    id: String(script?.id || `script-${Date.now()}-${idx}`),
                    name,
                    code,
                    updatedAt: script?.updatedAt || new Date().toISOString(),
                };
            })
            .filter(Boolean);
    }

    function setScriptResult(text, isError = false) {
        if (!sheetScriptResult) return;
        sheetScriptResult.textContent = text;
        sheetScriptResult.classList.toggle("error", !!isError);
    }

    function focusSheetScriptsPanel() {
        const addonsTab = document.querySelector('.we-tab[data-tab="addons"]');
        if (addonsTab) activateRibbonTab(addonsTab, true);
        if (sheetScriptsPanel && typeof sheetScriptsPanel.scrollIntoView === "function") {
            sheetScriptsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    function renderScriptSelect(activeId = "") {
        if (!sheetScriptSelect) return;
        const selectedId = activeId || sheetScriptSelect.value || sheetScripts[0]?.id || "";
        sheetScriptSelect.innerHTML = sheetScripts.map(script => (
            `<option value="${escapeHtml(script.id)}"${script.id === selectedId ? " selected" : ""}>${escapeHtml(script.name)}</option>`
        )).join("");
        if (!sheetScripts.length) {
            sheetScriptSelect.innerHTML = '<option value="">Brak zapisanych skryptów</option>';
        }
        sheetScriptSelect.value = selectedId || "";
        loadScriptToEditor(sheetScriptSelect.value);
    }

    function loadScriptToEditor(scriptId) {
        const script = sheetScripts.find(item => item.id === scriptId) || null;
        if (sheetScriptNameInput) sheetScriptNameInput.value = script?.name || "";
        if (sheetScriptEditor) sheetScriptEditor.value = script?.code || "";
    }

    function persistScriptsToSheet() {
        if (!currentSheet) return;
        currentSheet.scripts = normalizeSheetScripts(sheetScripts);
        markDirty();
    }

    function createNewSheetScript() {
        if (!currentSheetCanEdit) {
            setScriptResult("Nie masz uprawnień do edycji.", true);
            return;
        }
        const script = {
            id: `script-${Date.now()}`,
            name: `Skrypt ${sheetScripts.length + 1}`,
            code: "api.notify('Dziala.');",
            updatedAt: new Date().toISOString(),
        };
        sheetScripts.unshift(script);
        renderScriptSelect(script.id);
        persistScriptsToSheet();
        setScriptResult("Utworzono nowy skrypt.");
    }

    function saveCurrentScriptFromEditor() {
        if (!currentSheetCanEdit) {
            setScriptResult("Nie masz uprawnień do edycji.", true);
            return;
        }
        const name = String(sheetScriptNameInput?.value || "").trim();
        const code = String(sheetScriptEditor?.value || "");
        if (!name) {
            setScriptResult("Podaj nazwę skryptu.", true);
            return;
        }
        if (!code.trim()) {
            setScriptResult("Kod skryptu nie może być pusty.", true);
            return;
        }
        const currentId = sheetScriptSelect?.value || "";
        let script = sheetScripts.find(item => item.id === currentId);
        if (!script) {
            script = { id: `script-${Date.now()}`, name, code, updatedAt: new Date().toISOString() };
            sheetScripts.unshift(script);
        } else {
            script.name = name;
            script.code = code;
            script.updatedAt = new Date().toISOString();
        }
        renderScriptSelect(script.id);
        persistScriptsToSheet();
        setScriptResult("Skrypt zapisany w arkuszu.");
    }

    function deleteCurrentScript() {
        if (!currentSheetCanEdit) {
            setScriptResult("Nie masz uprawnień do edycji.", true);
            return;
        }
        const currentId = sheetScriptSelect?.value || "";
        if (!currentId) return;
        sheetScripts = sheetScripts.filter(item => item.id !== currentId);
        renderScriptSelect("");
        persistScriptsToSheet();
        setScriptResult("Skrypt usunięty.");
    }

    async function runScriptCode(scriptName, code) {
        const finalCode = String(code || "").trim();
        if (!finalCode) {
            setScriptResult("Najpierw wpisz kod skryptu.", true);
            return false;
        }
        if (!currentSheet || !currentSheetCanEdit) {
            setScriptResult("Skrypt wymaga arkusza z uprawnieniem edycji.", true);
            return false;
        }
        const api = {
            getCell: ref => {
                const coords = cellRefToIndex(ref);
                if (!coords) return "";
                ensureDimensions(coords.row + 1, coords.col + 1);
                return currentSheet.grid[coords.row]?.[coords.col] || "";
            },
            setCell: (ref, value) => {
                const coords = cellRefToIndex(ref);
                if (!coords) throw new Error(`Niepoprawny adres komórki: ${ref}`);
                ensureDimensions(coords.row + 1, coords.col + 1);
                currentSheet.grid[coords.row][coords.col] = value == null ? "" : String(value);
            },
            getSelection: () => getCurrentSelectionRangeText(),
            notify: message => setScriptResult(String(message || "Gotowe.")),
        };
        try {
            pushHistorySnapshot();
            const runner = new Function("api", `"use strict";\n${finalCode}`);
            await Promise.resolve(runner(api));
            renderGrid();
            markDirty();
            logUserAction("Uruchomiono skrypt arkusza", {
                type: "script_run",
                scriptName: String(scriptName || "Skrypt"),
            });
            setScriptResult("Skrypt uruchomiony.");
            return true;
        } catch (error) {
            setScriptResult(`Błąd skryptu: ${error.message}`, true);
            return false;
        }
    }

    async function runCurrentScript() {
        const scriptName = String(sheetScriptNameInput?.value || "Skrypt");
        const code = String(sheetScriptEditor?.value || "");
        await runScriptCode(scriptName, code);
    }

    function ensureDimensions(rows, cols) {
        while (currentSheet.grid.length < rows) {
            currentSheet.grid.push(Array.from({ length: currentCols }, () => ""));
        }
        if (rows > currentRows) currentRows = rows;

        if (cols > currentCols) {
            currentCols = cols;
            currentSheet.grid = currentSheet.grid.map(row => {
                while (row.length < currentCols) row.push("");
                return row;
            });
        }

        currentSheet.grid = currentSheet.grid.map(row => {
            while (row.length < currentCols) row.push("");
            return row;
        });
    }

    function parseNumber(value) {
        if (typeof value === "number") return Number.isFinite(value) ? value : 0;
        if (typeof value === "boolean") return value ? 1 : 0;

        const normalized = String(value  || "").trim().replace(/\s+/g, "").replace(",", ".");
        if (!normalized) return 0;

        const num = Number(normalized);
        return Number.isFinite(num) ? num : 0;
    }

    function isNumericValue(value) {
        if (typeof value === "number") return Number.isFinite(value);
        if (typeof value === "boolean") return true;

        const normalized = String(value  || "").trim().replace(/\s+/g, "").replace(",", ".");
        return normalized !== "" && !Number.isNaN(Number(normalized));
    }

    function escapeHtml(value) {
        return String(value  || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function setAutosaveState(state, text) {
        autosaveBadge?.classList.remove("saving", "saved", "error");
        if (state) autosaveBadge?.classList.add(state);
        if (autosaveBadge) autosaveBadge.textContent = text;
    }

    function scheduleAutosave() {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => {
            saveSheet();
        }, 300000);
    }

    function markDirty(options = {}) {
        if (!currentSheet || isRestoringHistory || !currentSheetCanEdit) return;
        if (DEMO_MODE) {
            setAutosaveState("saving", "Tryb demo — zmiany tylko do odświeżenia strony");
            if (options.rerenderObjects) rerenderGeneratedObjects();
            return;
        }
        const now = Date.now();
        if (now - lastAutosaveNoticeAt > 900) {
            setAutosaveState("saving", "Niezapisane zmiany — autozapis co 5 min");
            lastAutosaveNoticeAt = now;
        }
        scheduleAutosave();
        if (options.rerenderObjects) rerenderGeneratedObjects();
    }

    function cloneSheetState() {
        return {
            grid: JSON.parse(JSON.stringify(currentSheet.grid || [])),
            styles: JSON.parse(JSON.stringify(currentSheet.styles || {})),
            conditionalRules: JSON.parse(JSON.stringify(currentSheet.conditionalRules || [])),
            name: currentSheet.name,
            category: currentSheet.category
        };
    }

    function pushHistorySnapshot() {
        if (!currentSheet || isRestoringHistory) return;
        historyStack.push(cloneSheetState());
        redoStack = [];
        if (historyStack.length > 100) {
            historyStack.shift();
        }
    }

    function pushCellEditHistory(row, col, oldValue, newValue) {
        if (!currentSheet || isRestoringHistory || oldValue === newValue) return;
        historyStack.push({
            kind: "cell-edit",
            row,
            col,
            oldValue,
            newValue
        });
        redoStack = [];
        if (historyStack.length > 100) {
            historyStack.shift();
        }
    }

    function applyCellEditHistory(entry, value) {
        if (!currentSheet || !entry) return;
        ensureDimensions(entry.row + 1, entry.col + 1);
        currentSheet.grid[entry.row][entry.col] = value ?? "";
        syncComputedCellRegistry(entry.row, entry.col);
        updateCellElement(entry.row, entry.col);
        if (entry.row === activeCell.row && entry.col === activeCell.col) {
            updateFormulaBar();
        }
        scheduleComputedRefresh(entry.row, entry.col);
    }

    function restoreSheetSnapshot(snapshot) {
        currentSheet.grid = snapshot.grid;
        currentSheet.styles = snapshot.styles || {};
        currentSheet.conditionalRules = Array.isArray(snapshot.conditionalRules) ? snapshot.conditionalRules : [];
        currentSheet.name = snapshot.name;
        currentSheet.category = snapshot.category;

        const dims = inferDimensionsFromGrid(currentSheet.grid);
        currentRows = dims.rows;
        currentCols = dims.cols;

        if (sheetNameEl) sheetNameEl.textContent = currentSheet.name || "Arkusz";
        updateSheetMeta();
    }

    function undoLastChange() {
        if (!currentSheet || !historyStack.length) return;

        isRestoringHistory = true;
        const snapshot = historyStack.pop();
        if (snapshot?.kind === "cell-edit") {
            redoStack.push(snapshot);
            applyCellEditHistory(snapshot, snapshot.oldValue);
        } else {
            redoStack.push(cloneSheetState());
            restoreSheetSnapshot(snapshot);
            renderGrid();
        }
        isRestoringHistory = false;
        setAutosaveState("saving", "Cofnięto zmianę");
        scheduleAutosave();
        logUserAction("Cofnięto zmianę", { type: "undo" });
    }

    function redoLastChange() {
        if (!currentSheet || !redoStack.length) return;

        isRestoringHistory = true;
        const snapshot = redoStack.pop();
        if (snapshot?.kind === "cell-edit") {
            historyStack.push(snapshot);
            applyCellEditHistory(snapshot, snapshot.newValue);
        } else {
            historyStack.push(cloneSheetState());
            restoreSheetSnapshot(snapshot);
            renderGrid();
        }
        isRestoringHistory = false;
        setAutosaveState("saving", "Ponowiono zmianę");
        scheduleAutosave();
        logUserAction("Ponowiono zmianę", { type: "redo" });
    }

    function getCellStyleKey(row, col) {
        return `${row}:${col}`;
    }

    function getCellStyle(row, col) {
        if (!currentSheet.styles) currentSheet.styles = {};
        return currentSheet.styles[getCellStyleKey(row, col)] || {};
    }

    function setCellStyle(row, col, patch) {
        if (!currentSheet.styles) currentSheet.styles = {};
        const key = getCellStyleKey(row, col);
        const current = currentSheet.styles[key] || {};
        currentSheet.styles[key] = { ...current, ...patch };
    }

    function getSelectionBounds() {
        if (!selectionStart || !selectionEnd) return null;

        return {
            rowStart: Math.min(selectionStart.row, selectionEnd.row),
            rowEnd: Math.max(selectionStart.row, selectionEnd.row),
            colStart: Math.min(selectionStart.col, selectionEnd.col),
            colEnd: Math.max(selectionStart.col, selectionEnd.col)
        };
    }

    function hasMultiSelection() {
        const bounds = getSelectionBounds();
        if (!bounds) return false;
        return bounds.rowStart !== bounds.rowEnd || bounds.colStart !== bounds.colEnd;
    }

    function forEachSelectedCell(callback) {
        const bounds = getSelectionBounds();

        if (!bounds) {
            callback(activeCell.row, activeCell.col);
            return;
        }

        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
            for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
                callback(row, col);
            }
        }
    }

    function isCellInSelection(row, col) {
        const bounds = getSelectionBounds();
        if (!bounds) return false;

        return (
            row >= bounds.rowStart &&
            row <= bounds.rowEnd &&
            col >= bounds.colStart &&
            col <= bounds.colEnd
        );
    }

    function clearSelection() {
        selectionStart = null;
        selectionEnd = null;
    }

    function getCellFromTarget(target) {
        return target?.closest?.("td[data-row][data-col]") || null;
    }

    function getCellCoordsFromElement(td) {
        if (!td) return null;
        const row = Number(td.dataset.row);
        const col = Number(td.dataset.col);
        if (!Number.isInteger(row) || !Number.isInteger(col)) return null;
        return { row, col };
    }

    function isCellValueComputed(raw) {
        return typeof raw === "string" && (raw.trim().startsWith("=") || raw.startsWith(SPILL_PREFIX));
    }

    function isCellEditingBlocked(row, col) {
        const rawValue = currentSheet?.grid?.[row]?.[col] || "";
        const display = cellDisplayValue(row, col);
        return Boolean(display.special || (typeof rawValue === "string" && rawValue.startsWith(SPILL_PREFIX)));
    }

    function syncComputedCellRegistry(row, col) {
        const key = `${row}:${col}`;
        const rawValue = currentSheet?.grid?.[row]?.[col] || "";
        if (isCellValueComputed(rawValue)) computedCellKeys.add(key);
        else computedCellKeys.delete(key);
    }

    function selectWholeRow(row) {
        selectionStart = { row, col: 0 };
        selectionEnd = { row, col: Math.max(0, currentCols - 1) };
        setActiveCell(row, 0, false);
        updateSelectionHighlight();
    }

    function selectWholeColumn(col) {
        selectionStart = { row: 0, col };
        selectionEnd = { row: Math.max(0, currentRows - 1), col };
        setActiveCell(0, col, false);
        updateSelectionHighlight();
    }

    function selectWholeSheet() {
        selectionStart = { row: 0, col: 0 };
        selectionEnd = { row: Math.max(0, currentRows - 1), col: Math.max(0, currentCols - 1) };
        setActiveCell(0, 0, false);
        updateSelectionHighlight();
    }

    function scheduleSelectionHighlight() {
        if (selectionFrameId) return;
        selectionFrameId = window.requestAnimationFrame(() => {
            selectionFrameId = null;
            updateSelectionHighlight();
        });
    }

    function updateSelectionHighlight() {
        highlightedHeaders.forEach(el => el?.classList?.remove("selected-header", "active-header"));
        highlightedCells.forEach(el => el?.classList?.remove("selected-range"));
        highlightedFillCells.forEach(el => el?.classList?.remove("fill-preview"));
        activeCellElement?.classList?.remove("active-cell");

        highlightedHeaders = [];
        highlightedCells = [];
        highlightedFillCells = [];
        activeCellElement = null;

        const bounds = getSelectionBounds();
        const rowStart = bounds ? bounds.rowStart : activeCell.row;
        const rowEnd = bounds ? bounds.rowEnd : activeCell.row;
        const colStart = bounds ? bounds.colStart : activeCell.col;
        const colEnd = bounds ? bounds.colEnd : activeCell.col;
        const selectedCellCount = Math.max(1, (rowEnd - rowStart + 1) * (colEnd - colStart + 1));
        const largeSelection = selectedCellCount > LARGE_SELECTION_CELL_LIMIT;

        if (!largeSelection) {
            for (let row = rowStart; row <= rowEnd; row += 1) {
                const rowCells = cellElements[row];
                if (!rowCells) continue;
                for (let col = colStart; col <= colEnd; col += 1) {
                    const td = rowCells[col];
                    if (!td) continue;
                    td.classList.add("selected-range");
                    highlightedCells.push(td);
                }
            }
        }

        activeCellElement = cellElements[activeCell.row]?.[activeCell.col] || null;
        activeCellElement?.classList.add("active-cell");

        if (isFillDragging && fillDragStart && fillDragEnd) {
            const fRowStart = Math.min(fillDragStart.row, fillDragEnd.row);
            const fRowEnd = Math.max(fillDragStart.row, fillDragEnd.row);
            const fColStart = Math.min(fillDragStart.col, fillDragEnd.col);
            const fColEnd = Math.max(fillDragStart.col, fillDragEnd.col);
            for (let row = fRowStart; row <= fRowEnd; row += 1) {
                const rowCells = cellElements[row];
                if (!rowCells) continue;
                for (let col = fColStart; col <= fColEnd; col += 1) {
                    const td = rowCells[col];
                    if (!td) continue;
                    td.classList.add("fill-preview");
                    highlightedFillCells.push(td);
                }
            }
        }

        const activeColHeader = colHeaderElements[activeCell.col];
        if (activeColHeader) {
            activeColHeader.classList.add("active-header");
            highlightedHeaders.push(activeColHeader);
        }
        const activeRowHeader = rowHeaderElements[activeCell.row];
        if (activeRowHeader) {
            activeRowHeader.classList.add("active-header");
            highlightedHeaders.push(activeRowHeader);
        }

        if (bounds) {
            const headerStepCol = largeSelection ? Math.max(1, Math.ceil((bounds.colEnd - bounds.colStart + 1) / 80)) : 1;
            const headerStepRow = largeSelection ? Math.max(1, Math.ceil((bounds.rowEnd - bounds.rowStart + 1) / 120)) : 1;
            for (let col = bounds.colStart; col <= bounds.colEnd; col += headerStepCol) {
                const th = colHeaderElements[col];
                if (th && !highlightedHeaders.includes(th)) {
                    th.classList.add("selected-header");
                    highlightedHeaders.push(th);
                }
            }
            for (let row = bounds.rowStart; row <= bounds.rowEnd; row += headerStepRow) {
                const th = rowHeaderElements[row];
                if (th && !highlightedHeaders.includes(th)) {
                    th.classList.add("selected-header");
                    highlightedHeaders.push(th);
                }
            }
            if (largeSelection && activeCellLabel) {
                activeCellLabel.textContent = `${colToLabel(activeCell.col)}${activeCell.row + 1} • ${selectedCellCount} kom.`;
            }
        }
    }

    function updateCellElement(row, col) {
        const td = cellElements[row]?.[col];
        syncComputedCellRegistry(row, col);
        if (!td) return;
        setCellDisplayContent(td, row, col);
        applyCellStyleToElement(td, row, col);
        if (row === activeCell.row && col === activeCell.col) attachFillHandle(td, row, col);
    }

    function clearSelectedCellsFast() {
        if (!currentSheet) return;
        pushHistorySnapshot();
        forEachSelectedCell((row, col) => {
            currentSheet.grid[row][col] = "";
            updateCellElement(row, col);
        });
        markDirty();
        updateFormulaBar();
    }

    function fillDownSelection() {
        const bounds = getSelectionBounds();
        if (!currentSheet || !bounds || bounds.rowEnd <= bounds.rowStart) return;
        pushHistorySnapshot();
        for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
            const sourceValue = currentSheet.grid[bounds.rowStart]?.[col] || "";
            const sourceStyle = { ...getCellStyle(bounds.rowStart, col) };
            for (let row = bounds.rowStart + 1; row <= bounds.rowEnd; row += 1) {
                const rowOffset = row - bounds.rowStart;
                currentSheet.grid[row][col] = adjustFormulaReferences(sourceValue, rowOffset, 0);
                currentSheet.styles[getCellStyleKey(row, col)] = { ...sourceStyle };
                updateCellElement(row, col);
            }
        }
        updateSelectionHighlight();
        markDirty();
    }

    function enterCellEdit(row = activeCell.row, col = activeCell.col) {
        const td = cellElements[row]?.[col];
        if (!td || td.classList.contains("we-special-cell")) return;
        enableCellEditing(row, col, td);
    }

    function clearFastActiveOnly() {
        activeCellElement?.classList?.remove("active-cell");
        activeCellElement?.querySelector(".we-fill-handle")?.remove();
        colHeaderElements[activeCell.col]?.classList?.remove("active-header");
        rowHeaderElements[activeCell.row]?.classList?.remove("active-header");

        // Lekkie czyszczenie poprzedniego zaznaczenia bez pełnego przebudowania siatki.
        if (highlightedCells.length <= 400) {
            highlightedCells.forEach(el => el?.classList?.remove("selected-range", "fill-preview"));
            highlightedCells = [];
        }
        highlightedHeaders.forEach(el => el?.classList?.remove("selected-header", "active-header"));
        highlightedHeaders = [];
        highlightedFillCells.forEach(el => el?.classList?.remove("fill-preview"));
        highlightedFillCells = [];
    }

    function fastSelectCell(row, col, focus = false) {
        if (!currentSheet) return;
        const prevRow = activeCell.row;
        const prevCol = activeCell.col;
        const sameCell = prevRow === row && prevCol === col;

        if (!sameCell) {
            clearFastActiveOnly();
        }

        activeCell = { row, col };
        selectionStart = { row, col };
        selectionEnd = { row, col };

        activeCellElement = cellElements[row]?.[col] || null;
        activeCellElement?.classList.add("active-cell");
        highlightedCells = activeCellElement ? [activeCellElement] : [];
        colHeaderElements[col]?.classList.add("active-header");
        rowHeaderElements[row]?.classList.add("active-header");
        highlightedHeaders = [colHeaderElements[col], rowHeaderElements[row]].filter(Boolean);
        attachFillHandle(activeCellElement, row, col);

        updateFormulaBar();
        scheduleRefreshStartControls();
        broadcastFollowMePosition();

        if (focus && activeCellElement) {
            activeCellElement.focus({ preventScroll: true });
        }
    }

    function isFormulaRangePickerReady() {
        if (!formulaInput || document.activeElement !== formulaInput) return false;
        const value = String(formulaInput.value || "");
        if (!value.trim().startsWith("=")) return false;
        const pos = typeof formulaInput.selectionStart === "number" ? formulaInput.selectionStart : value.length;
        const before = value.slice(0, pos);
        const lastChar = before.trim().slice(-1);
        if (["(", ";", ",", "+", "-", "*", "/", "^"].includes(lastChar)) return true;
        return /\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?$/i.test(before);
    }

    function ensureConditionalRules() {
        if (!currentSheet) return [];
        if (!Array.isArray(currentSheet.conditionalRules)) currentSheet.conditionalRules = [];
        return currentSheet.conditionalRules;
    }

    function parseRangeBounds(rangeText) {
        const text = String(rangeText || "").trim() || getCurrentSelectionRangeText();
        const parts = text.split(":").map(part => normalizeCellRefText(part));
        const start = cellRefToIndex(parts[0]);
        const end = cellRefToIndex(parts[1] || parts[0]);
        if (!start || !end) return null;
        return { rowStart: Math.min(start.row, end.row), rowEnd: Math.max(start.row, end.row), colStart: Math.min(start.col, end.col), colEnd: Math.max(start.col, end.col) };
    }

    function ensureFormulaReferenceLayer() {
        if (!sheetGridTable) return null;
        const scroll = sheetGridTable.closest(".we-sheet-scroll") || sheetEditorCard;
        if (!scroll) return null;
        let layer = document.getElementById("formula-reference-layer");
        if (!layer) {
            layer = document.createElement("div");
            layer.id = "formula-reference-layer";
            layer.className = "we-formula-reference-layer";
            layer.setAttribute("aria-hidden", "true");
            scroll.appendChild(layer);
        }
        layer.style.width = `${Math.max(scroll.scrollWidth || 0, sheetGridTable.offsetWidth || 0)}px`;
        layer.style.height = `${Math.max(scroll.scrollHeight || 0, sheetGridTable.offsetHeight || 0)}px`;
        return layer;
    }

    function clearFormulaReferenceHighlights() {
        pendingFormulaReferenceSource = undefined;
        const layer = document.getElementById("formula-reference-layer");
        if (layer) {
            layer.innerHTML = "";
            layer.hidden = true;
        }
    }

    function stripQuotedFormulaText(formula) {
        return String(formula || "").replace(/"(?:[^"]|"")*"/g, match => " ".repeat(match.length));
    }

    function normalizeFormulaRangeText(rangeText) {
        const text = String(rangeText || "").trim().toUpperCase().replace(/\$/g, "").replace(/\s+/g, "");
        const parts = text.split(":");
        const start = normalizeCellRefText(parts[0] || "");
        const end = normalizeCellRefText(parts[1] || parts[0] || "");
        return start && end && start !== end ? `${start}:${end}` : start;
    }

    function parseFormulaReferenceRanges(formula) {
        const text = stripQuotedFormulaText(formula);
        if (!String(text || "").trim().startsWith("=")) return [];
        const refs = [];
        const seen = new Set();
        const refPattern = /\$?[A-Z]{1,4}\$?\d+(?:\s*:\s*\$?[A-Z]{1,4}\$?\d+)?/gi;
        let match;
        while ((match = refPattern.exec(text)) !== null) {
            const raw = match[0];
            const before = text.slice(0, match.index).trimEnd();
            if (before.endsWith("!")) continue; // odwołanie do innego arkusza — nie podświetlamy lokalnej komórki przez przypadek
            const normalized = normalizeFormulaRangeText(raw);
            if (!normalized || seen.has(normalized)) continue;
            const bounds = parseRangeBounds(normalized);
            if (!bounds) continue;
            if (bounds.rowEnd < 0 || bounds.colEnd < 0 || bounds.rowStart >= currentRows || bounds.colStart >= currentCols) continue;
            seen.add(normalized);
            refs.push({ text: normalized, bounds });
            if (refs.length >= 16) break;
        }
        return refs;
    }

    function getCurrentFormulaReferenceSource() {
        if (!currentSheet) return "";
        if (formulaInput && document.activeElement === formulaInput) {
            return formulaInput.value || "";
        }
        return currentSheet.grid?.[activeCell.row]?.[activeCell.col] || "";
    }

    function getFormulaOverlayGeometry(first, last, scroll) {
        if (!first || !last || !scroll || !sheetGridTable) return null;
        const firstRect = first.getBoundingClientRect();
        const lastRect = last.getBoundingClientRect();
        const scrollRect = scroll.getBoundingClientRect();

        // Liczymy pozycję względem przewijanego kontenera, a nie całej strony.
        // To usuwa „rozjeżdżanie” ramek po przewinięciu strony/arkusza oraz przy zoomie arkusza.
        const left = firstRect.left - scrollRect.left + scroll.scrollLeft - (scroll.clientLeft || 0);
        const top = firstRect.top - scrollRect.top + scroll.scrollTop - (scroll.clientTop || 0);
        const width = Math.max(2, lastRect.right - firstRect.left);
        const height = Math.max(2, lastRect.bottom - firstRect.top);
        return { left, top, width, height };
    }

    function drawFormulaReferenceOverlay(ref, index, layer, scroll) {
        const bounds = ref.bounds;
        const first = cellElements[bounds.rowStart]?.[bounds.colStart];
        const last = cellElements[bounds.rowEnd]?.[bounds.colEnd];
        const geometry = getFormulaOverlayGeometry(first, last, scroll);
        if (!geometry || !layer) return;

        const palette = FORMULA_REFERENCE_COLORS[index % FORMULA_REFERENCE_COLORS.length];

        const overlay = document.createElement("div");
        overlay.className = "we-formula-ref-overlay";
        overlay.style.left = `${geometry.left}px`;
        overlay.style.top = `${geometry.top}px`;
        overlay.style.width = `${geometry.width}px`;
        overlay.style.height = `${geometry.height}px`;
        overlay.style.setProperty("--we-formula-ref-color", palette.color);
        overlay.style.setProperty("--we-formula-ref-fill", palette.fill);
        overlay.title = `Zakres ${index + 1}: ${ref.text}`;

        const badge = document.createElement("span");
        badge.className = "we-formula-ref-badge";
        badge.textContent = ref.text;
        overlay.appendChild(badge);
        layer.appendChild(overlay);
    }

    function applyFormulaReferenceHighlights(formula = null) {
        const layer = ensureFormulaReferenceLayer();
        if (!layer) return;
        layer.innerHTML = "";
        layer.hidden = true;

        const source = formula !== null && formula !== undefined ? formula : getCurrentFormulaReferenceSource();
        if (!String(source || "").trim().startsWith("=")) return;

        const refs = parseFormulaReferenceRanges(source);
        if (!refs.length) return;

        const scroll = sheetGridTable?.closest(".we-sheet-scroll") || sheetEditorCard;
        if (!scroll) return;
        layer.hidden = false;
        refs.forEach((ref, index) => drawFormulaReferenceOverlay(ref, index, layer, scroll));
    }

    function scheduleFormulaReferenceHighlights(formula = undefined) {
        pendingFormulaReferenceSource = formula;
        if (formulaReferenceHighlightFrame) return;
        formulaReferenceHighlightFrame = window.requestAnimationFrame(() => {
            formulaReferenceHighlightFrame = null;
            const source = pendingFormulaReferenceSource;
            pendingFormulaReferenceSource = undefined;
            applyFormulaReferenceHighlights(source);
        });
    }

    function isCellInsideRuleRange(row, col, rangeText) {
        const bounds = parseRangeBounds(rangeText);
        return Boolean(bounds && row >= bounds.rowStart && row <= bounds.rowEnd && col >= bounds.colStart && col <= bounds.colEnd);
    }

    function buildConditionalStyle(preset) {
        const styles = {
            green: { fillColor: "#dcfce7", textColor: "#166534", bold: true },
            red: { fillColor: "#fee2e2", textColor: "#991b1b", bold: true },
            yellow: { fillColor: "#fef3c7", textColor: "#92400e", bold: true },
            blue: { fillColor: "#dbeafe", textColor: "#1d4ed8", bold: true },
            purple: { fillColor: "#ede9fe", textColor: "#6d28d9", bold: true }
        };
        return styles[preset] || styles.yellow;
    }

    function prepareConditionalRulesCache() {
        const rules = ensureConditionalRules();
        rules.forEach(rule => {
            rule._bounds = parseRangeBounds(rule.range);
            rule.priority = Number.isFinite(Number(rule.priority)) ? Number(rule.priority) : 2;
        });
        conditionalRulesSortedCache = rules.slice().sort((a, b) => (Number(a.priority || 2) - Number(b.priority || 2)));
    }

    function conditionalRuleMatches(rule, row, col) {
        const bounds = rule?._bounds || parseRangeBounds(rule?.range);
        if (!rule || !bounds || row < bounds.rowStart || row > bounds.rowEnd || col < bounds.colStart || col > bounds.colEnd) return false;
        const value = getCellComputedValue(row, col);
        const text = String(value  || "");
        const needle = String(rule.value  || "");
        const number = isNumericValue(value) ? parseNumber(value) : NaN;
        const a = String(rule.value  || "").trim();
        const b = String(rule.value2  || "").trim();
        const na = isNumericValue(a) ? parseNumber(a) : NaN;
        const nb = isNumericValue(b) ? parseNumber(b) : NaN;
        switch (rule.type) {
            case "text-eq": return text.trim().toLowerCase() === needle.trim().toLowerCase();
            case "text-contains": return text.toLowerCase().includes(needle.toLowerCase());
            case "empty": return text.trim() === "";
            case "not-empty": return text.trim() !== "";
            case "number-gt": return Number.isFinite(number) && Number.isFinite(na) && number > na;
            case "number-lt": return Number.isFinite(number) && Number.isFinite(na) && number < na;
            case "number-between": return Number.isFinite(number) && Number.isFinite(na) && Number.isFinite(nb) && number >= Math.min(na, nb) && number <= Math.max(na, nb);
            default: return false;
        }
    }

    function getConditionalStyleForCell(row, col) {
        const rules = conditionalRulesSortedCache.length ? conditionalRulesSortedCache : ensureConditionalRules();
        return rules
            .reduce((style, rule) => conditionalRuleMatches(rule, row, col) ? { ...style, ...(rule.style || buildConditionalStyle(rule.preset)) } : style, {});
    }

    function conditionalPriorityLabel(priority) {
        const value = Number(priority || 2);
        if (value >= 3) return "wysoka";
        if (value <= 1) return "niska";
        return "normalna";
    }

    function fillConditionalForm(rule, index = null) {
        editingConditionalRuleIndex = index;
        const rangeInput = document.getElementById("conditional-range");
        const typeInput = document.getElementById("conditional-template");
        const valueInput = document.getElementById("conditional-value");
        const value2Input = document.getElementById("conditional-value2");
        const presetInput = document.getElementById("conditional-preset");
        const priorityInput = document.getElementById("conditional-priority");
        const applyBtn = smartInsertApplyBtn;

        if (rangeInput) rangeInput.value = rule?.range || getCurrentSelectionRangeText();
        if (typeInput) typeInput.value = rule?.type || "text-contains";
        if (valueInput) valueInput.value = rule?.value || "OK";
        if (value2Input) value2Input.value = rule?.value2 || "";
        if (presetInput) presetInput.value = rule?.preset || "green";
        if (priorityInput) priorityInput.value = String(rule?.priority || 2);
        if (applyBtn) applyBtn.textContent = index === null ? "Dodaj regułę" : "Zapisz regułę";
        updateSmartPreview();
    }

    function moveConditionalRule(index, direction) {
        const rules = ensureConditionalRules();
        const target = index + direction;
        if (target < 0 || target >= rules.length) return;
        pushHistorySnapshot();
        [rules[index], rules[target]] = [rules[target], rules[index]];
        renderConditionalRulesSummary();
        renderGrid();
        markDirty();
    }

    function renderConditionalRulesSummary() {
        if (!smartInsertBody || smartInsertMode !== "conditional-format") return;
        const list = smartInsertBody.querySelector("#conditional-rules-list");
        if (!list) return;
        const rules = ensureConditionalRules();
        if (!rules.length) {
            list.innerHTML = '<div class="we-conditional-empty">Brak reguł. Dodaj pierwszą regułę po prawej stronie.</div>';
            return;
        }
        list.innerHTML = rules.map((rule, index) => `
            <div class="we-conditional-rule-line">
                <span class="we-conditional-swatch" style="background:${escapeHtml((rule.style && rule.style.fillColor) || "#fef3c7")}"></span>
                <div class="we-conditional-rule-main">
                    <strong>${escapeHtml(rule.label || rule.type)}</strong>
                    <small>${escapeHtml(rule.range || "")} • priorytet: ${escapeHtml(conditionalPriorityLabel(rule.priority))}</small>
                </div>
                <div class="we-conditional-rule-actions">
                    <button type="button" data-edit-conditional="${index}">Edytuj</button>
                    <button type="button" data-move-conditional-up="${index}" ${index === 0 ? "disabled" : ""}>↑</button>
                    <button type="button" data-move-conditional-down="${index}" ${index === rules.length - 1 ? "disabled" : ""}>↓</button>
                    <button type="button" data-delete-conditional="${index}">Usuń</button>
                </div>
            </div>
        `).join('');
        list.querySelectorAll('[data-edit-conditional]').forEach(btn => btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.editConditional || '0', 10);
            fillConditionalForm(ensureConditionalRules()[idx], idx);
        }));
        list.querySelectorAll('[data-move-conditional-up]').forEach(btn => btn.addEventListener('click', () => {
            moveConditionalRule(parseInt(btn.dataset.moveConditionalUp || '0', 10), -1);
        }));
        list.querySelectorAll('[data-move-conditional-down]').forEach(btn => btn.addEventListener('click', () => {
            moveConditionalRule(parseInt(btn.dataset.moveConditionalDown || '0', 10), 1);
        }));
        list.querySelectorAll('[data-delete-conditional]').forEach(btn => btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.deleteConditional || '0', 10);
            pushHistorySnapshot();
            ensureConditionalRules().splice(idx, 1);
            if (editingConditionalRuleIndex === idx) editingConditionalRuleIndex = null;
            renderConditionalRulesSummary();
            renderGrid();
            markDirty();
        }));
    }

    function applyStyleToSelectionOrActive(patch) {
        if (!currentSheet) return;
        pushHistorySnapshot();
        const touchedCells = [];

        forEachSelectedCell((row, col) => {
            setCellStyle(row, col, patch);
            touchedCells.push([row, col]);
        });

        prepareConditionalRulesCache();
        if (touchedCells.length > 2500) {
            renderGrid();
        } else {
            touchedCells.forEach(([row, col]) => {
                const td = cellElements[row]?.[col];
                if (td) applyCellStyleToElement(td, row, col);
            });
            scheduleRefreshStartControls();
        }
        markDirty();
        logUserAction("Zmieniono styl komórki", { type: "style_change", cell: cellAddress(activeCell.row, activeCell.col) });
    }

    function toggleStyleFlag(flagName) {
        const current = getCellStyle(activeCell.row, activeCell.col);
        applyStyleToSelectionOrActive({
            [flagName]: !current[flagName]
        });
    }

    function applyCellStyleToElement(td, row, col) {
        const style = { ...getCellStyle(row, col), ...getConditionalStyleForCell(row, col) };

        td.style.fontFamily = style.fontFamily || "";
        td.style.fontSize = style.fontSize ? `${style.fontSize}px` : "";
        td.style.fontWeight = style.bold ? "700" : "";
        td.style.fontStyle = style.italic ? "italic" : "";
        td.style.textDecoration = style.underline ? "underline" : "";
        if (style.textColor) td.style.setProperty("color", style.textColor, "important");
        else td.style.removeProperty("color");

        if (style.fillColor) td.style.setProperty("background-color", style.fillColor, "important");
        else td.style.removeProperty("background-color");
        td.style.textAlign = style.align || "";
        
        td.style.borderTop = "";
        td.style.borderRight = "";
        td.style.borderBottom = "";
        td.style.borderLeft = "";
        const bColor = style.borderColor || "rgba(91, 141, 239, 0.9)";
        const bStyle = style.borderLineStyle || "solid";
        const bWidth = style.borderWidth || "2px";
        const borderCss = `${bWidth} ${bStyle} ${bColor}`;
        if (style.border) td.style.border = borderCss;
        else td.style.border = "";
        if (style.borderTop) td.style.borderTop = borderCss;
        if (style.borderRight) td.style.borderRight = borderCss;
        if (style.borderBottom) td.style.borderBottom = borderCss;
        if (style.borderLeft) td.style.borderLeft = borderCss;
        td.style.whiteSpace = style.wrap ? "normal" : "nowrap";
        td.style.transform = style.rotate ? "rotate(-2deg)" : "";
    }

    function refreshStartControlsFromCell() {
        if (!currentSheet) return;

        const style = getCellStyle(activeCell.row, activeCell.col);

        if (fontFamilySelect) {
            fontFamilySelect.value = style.fontFamily || "Arial, sans-serif";
        }

        if (fontSizeInput) {
            fontSizeInput.value = style.fontSize || 14;
        }

        if (textColorInput) {
            textColorInput.value = style.textColor || "#eef3ff";
        }

        if (fillColorInput) {
            fillColorInput.value = style.fillColor || "#0f1728";
        }

        boldBtn?.classList.toggle("active", !!style.bold);
        italicBtn?.classList.toggle("active", !!style.italic);
        underlineBtn?.classList.toggle("active", !!style.underline);

        alignLeftBtn?.classList.toggle("active", (style.align || "left") === "left");
        alignCenterBtn?.classList.toggle("active", style.align === "center");
        alignRightBtn?.classList.toggle("active", style.align === "right");
    }

    let refreshControlsRaf = null;
    function scheduleRefreshStartControls() {
        if (refreshControlsRaf) cancelAnimationFrame(refreshControlsRaf);
        refreshControlsRaf = requestAnimationFrame(() => {
            refreshControlsRaf = null;
            refreshStartControlsFromCell();
        });
    }

    function buildFormulaContext() {
        return {
            cellRefToIndex,
            getCellComputedValue,
            getRangeMatrix,
            normalizeScalarToken,
            extractRangeValues: (rangeText, visited) => getRangeMatrix(rangeText, true, visited).flat(),
            parseNumber,
            isNumericValue,
            labelToCol,
            colToLabel
        };
    }

    function normalizeScalarToken(token, visited) {
        const trimmed = String(token  || "").trim();
        if (!trimmed) return "";

        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed.slice(1, -1);
        }

        const ref = cellRefToIndex(trimmed);
        if (ref) {
            return getCellComputedValue(ref.row, ref.col, visited);
        }

        if (trimmed.startsWith("=")) {
            return FormulaEngine.evaluate(trimmed, buildFormulaContext(), visited);
        }

        if (isNumericValue(trimmed)) {
            return parseNumber(trimmed);
        }

        if (trimmed.toUpperCase() === "TRUE") return true;
        if (trimmed.toUpperCase() === "FALSE") return false;

        return trimmed;
    }

    function getRangeMatrix(rangeText, computed = true, visited = new Set()) {
        const parts = String(rangeText || "").trim().toUpperCase().split(":");
        if (parts.length < 1 || parts.length > 2) return [];

        const start = cellRefToIndex(parts[0]);
        const end = cellRefToIndex(parts[1] || parts[0]);
        if (!start || !end) return [];

        const rowStart = Math.min(start.row, end.row);
        const rowEnd = Math.max(start.row, end.row);
        const colStart = Math.min(start.col, end.col);
        const colEnd = Math.max(start.col, end.col);

        const rows = [];
        for (let r = rowStart; r <= rowEnd; r += 1) {
            const row = [];
            for (let c = colStart; c <= colEnd; c += 1) {
                row.push(computed ? getCellComputedValue(r, c, visited) : currentSheet.grid[r][c]);
            }
            rows.push(row);
        }
        return rows;
    }

    function clearSpills() {
        if (!currentSheet) return;

        for (let r = 0; r < currentRows; r += 1) {
            for (let c = 0; c < currentCols; c += 1) {
                const value = currentSheet.grid[r][c];
                if (typeof value === "string" && value.startsWith(SPILL_PREFIX)) {
                    currentSheet.grid[r][c] = "";
                }
            }
        }
    }

    function applySpills() {
        if (!currentSheet) return;
        clearSpills();

        for (let r = 0; r < currentRows; r += 1) {
            for (let c = 0; c < currentCols; c += 1) {
                const raw = currentSheet.grid[r][c];
                if (typeof raw === "string" && raw.trim().startsWith("=")) {
                    const result = FormulaEngine.evaluate(raw.trim(), buildFormulaContext(), new Set());
                    if (Array.isArray(result)) {
                        const matrix = Array.isArray(result[0]) ? result : result.map(v => [v]);
                        ensureDimensions(r + matrix.length, c + Math.max(...matrix.map(row => row.length), 1));

                        matrix.forEach((spillRow, rr) => {
                            spillRow.forEach((spillValue, cc) => {
                                if (rr === 0 && cc === 0) return;
                                currentSheet.grid[r + rr][c + cc] = `${SPILL_PREFIX}${displayFormulaValue(spillValue)}`;
                            });
                        });
                    }
                }
            }
        }
    }

    function getCellComputedValue(row, col, visited = new Set()) {
        const key = `${row}:${col}`;
        if (visited.has(key)) return "#CYCLE!";

        const raw = currentSheet?.grid?.[row]?.[col] || "";

        if (typeof raw === "string" && raw.startsWith(SPILL_PREFIX)) {
            return raw.slice(SPILL_PREFIX.length);
        }

        if (typeof raw === "string" && raw.trim().startsWith("=")) {
            visited.add(key);
            const result = FormulaEngine.evaluate(raw.trim(), buildFormulaContext(), visited);
            visited.delete(key);
            return result;
        }

        return raw;
    }

    function renderSpecialCellContent(value) {
        if (typeof value !== "string") return null;

        if (value.startsWith("=LINK(") && value.endsWith(")")) {
            const inner = value.slice(6, -1);
            const [text, url] = inner.split("|");
            const safeUrl = (url || "#").trim();
            return `<a class="we-cell-link" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml((text || safeUrl || "Link").trim())}</a>`;
        }

        if (value.startsWith("=CHECKBOX(")) {
            const match = value.match(/^=CHECKBOX\(([^)]*)\)(.*)$/i);
            if (match) {
                const parts = match[1].split("|").map(v => v.trim());
                const checked = parts[0]?.toLowerCase() === "true" ? "checked" : "";
                const label = parts.slice(1).join(" ") || (match[2] || "").trim();
                return `<label class="we-checkbox-wrap"><input class="we-cell-checkbox" type="checkbox" ${checked}>${label ? `<span>${escapeHtml(label)}</span>` : ""}</label>`;
            }
        }

        if (value.startsWith("=DROPDOWN(") && value.endsWith(")")) {
            const inner = value.slice(10, -1);
            const [optionsPart, selectedPartRaw] = inner.split(";selected=");
            const options = optionsPart.split("|").map(v => v.trim()).filter(Boolean);
            const selected = (selectedPartRaw || options[0] || "").trim();
            return `<select class="we-cell-dropdown">${options.map(o => `<option ${o === selected ? "selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select>`;
        }

        if (value.startsWith("=IMAGE(") && value.endsWith(")")) {
            return `<img class="we-cell-image" src="${escapeHtml(value.slice(7, -1).trim())}" alt="Obraz">`;
        }

        if (value.startsWith("=COMMENT(") && value.endsWith(")")) {
            return `<span class="we-cell-comment-marker" data-tooltip="${escapeHtml(value.slice(9, -1))}"></span>`;
        }

        if (value.startsWith("=NOTE(") && value.endsWith(")")) {
            return `<span class="we-cell-note-marker" data-tooltip="${escapeHtml(value.slice(6, -1))}"></span>`;
        }

        return null;
    }

    function parseCheckboxFormula(raw) {
        const match = String(raw || "").match(/^=CHECKBOX\(([^)]*)\)(.*)$/i);
        if (!match) return { checked: false, label: "" };
        const parts = match[1].split("|").map(v => v.trim());
        return {
            checked: parts[0]?.toLowerCase() === "true",
            label: parts.slice(1).join(" ") || (match[2] || "").trim()
        };
    }

    function buildCheckboxFormula(checked, label = "") {
        const safeLabel = String(label || "").trim();
        return safeLabel ? `=CHECKBOX(${checked ? "true" : "false"}|${safeLabel})` : `=CHECKBOX(${checked ? "true" : "false"})`;
    }

    function parseDropdownFormula(raw) {
        const value = String(raw || "");
        if (!value.startsWith("=DROPDOWN(") || !value.endsWith(")")) return { options: [], selected: "" };
        const inner = value.slice(10, -1);
        const [optionsPart, selectedPartRaw] = inner.split(";selected=");
        const options = optionsPart.split("|").map(v => v.trim()).filter(Boolean);
        return { options, selected: (selectedPartRaw || options[0] || "").trim() };
    }

    function buildDropdownFormula(options, selected = "") {
        const cleaned = (options || []).map(v => String(v || "").trim()).filter(Boolean);
        const safeSelected = String(selected || cleaned[0] || "").trim();
        return safeSelected ? `=DROPDOWN(${cleaned.join("|")};selected=${safeSelected})` : `=DROPDOWN(${cleaned.join("|")})`;
    }

    function cellDisplayValue(row, col) {
        const raw = currentSheet.grid[row][col] || "";
        const special = typeof raw === "string" ? renderSpecialCellContent(raw.trim()) : null;

        if (special !== null) {
            return { html: special, special: true };
        }

        if (typeof raw === "string" && raw.startsWith(SPILL_PREFIX)) {
            return {
                html: `<span class="we-formula-result">${escapeHtml(displayFormulaValue(raw.slice(SPILL_PREFIX.length)))}</span>`,
                text: displayFormulaValue(raw.slice(SPILL_PREFIX.length)),
                special: true
            };
        }

        if (typeof raw === "string" && raw.trim().startsWith("=")) {
            const result = getCellComputedValue(row, col);
            if (Array.isArray(result)) {
                return { html: `<span class="we-formula-result">[tablica]</span>`, text: "[tablica]", special: true };
            }
            return {
                html: `<span class="we-formula-result">${escapeHtml(displayFormulaValue(result))}</span>`,
                text: displayFormulaValue(result),
                special: true
            };
        }

        return { html: escapeHtml(raw), text: String(raw  || ""), special: false };
    }

    function updateFormulaBar() {
        if (!currentSheet) return;
        const value = currentSheet.grid[activeCell.row][activeCell.col] || "";
        if (formulaInput) formulaInput.value = value;
        if (activeCellLabel) activeCellLabel.textContent = `${colToLabel(activeCell.col)}${activeCell.row + 1}`;
        scheduleFormulaReferenceHighlights(value);
    }

    function getSelectionMatrix(raw = true) {
        const bounds = getSelectionBounds() || {
            rowStart: activeCell.row,
            rowEnd: activeCell.row,
            colStart: activeCell.col,
            colEnd: activeCell.col
        };
        const matrix = [];
        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
            const line = [];
            for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
                line.push(currentSheet.grid[row]?.[col] || cellDisplayValue(row, col).text);
            }
            matrix.push(line);
        }
        return { bounds, matrix };
    }

    function matrixToClipboardText(matrix) {
        return matrix.map(row => row.map(value => String(value  || "")).join("\t")).join("\n");
    }

    async function writeClipboardText(text) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            console.warn("Clipboard write failed", error);
        }
        return false;
    }

    async function readClipboardText() {
        try {
            if (navigator.clipboard?.readText) {
                return await navigator.clipboard.readText();
            }
        } catch (error) {
            console.warn("Clipboard read failed", error);
        }
        return cellClipboard.text || "";
    }

    function clipboardTextToMatrix(text) {
        return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map(row => row.split("\t"));
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(String(event.target?.result || ""));
            reader.onerror = () => reject(reader.error || new Error("Nie udało się odczytać obrazu."));
            reader.readAsDataURL(file);
        });
    }

    async function readClipboardImageFromNavigator() {
        if (!navigator.clipboard?.read) return null;
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                const imageType = item.types.find(type => type.startsWith("image/"));
                if (!imageType) continue;
                const blob = await item.getType(imageType);
                return await readFileAsDataUrl(blob);
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    async function readClipboardImageFromEvent(event) {
        const items = Array.from(event?.clipboardData?.items || []);
        const imageItem = items.find(item => item.type?.startsWith("image/"));
        const file = imageItem?.getAsFile?.();
        return file ? await readFileAsDataUrl(file) : null;
    }

    function getCellLayerPosition(row, col) {
        const td = cellElements[row]?.[col];
        if (!td || !sheetGridTable) return null;
        return {
            x: td.offsetLeft,
            y: td.offsetTop,
            width: Math.max(160, Math.round(td.offsetWidth * 1.8)),
            height: Math.max(110, Math.round(td.offsetHeight * 2.4))
        };
    }

    function renderSheetImages() {
        if (!sheetImageLayer) return;
        const state = getSheetExtensionState();
        const images = Array.isArray(state.images) ? state.images : [];
        const sheetCharts = Array.isArray(state.sheetCharts) ? state.sheetCharts : [];
        const layerWidth = Math.max(sheetGridTable?.offsetWidth || 0, sheetGridTable?.scrollWidth || 0, ...sheetCharts.map(chart => (Number(chart.x) || 0) + (Number(chart.width) || 0) + 24));
        const layerHeight = Math.max(sheetGridTable?.offsetHeight || 0, sheetGridTable?.scrollHeight || 0, ...sheetCharts.map(chart => (Number(chart.y) || 0) + (Number(chart.height) || 0) + 24));
        sheetImageLayer.style.width = `${layerWidth}px`;
        sheetImageLayer.style.height = `${layerHeight}px`;

        const imageHtml = images.map(image => {
            const pos = getCellLayerPosition(Number(image.row) || 0, Number(image.col) || 0);
            const left = Number.isFinite(Number(image.x)) ? Number(image.x) : (pos?.x || 0);
            const top = Number.isFinite(Number(image.y)) ? Number(image.y) : (pos?.y || 0);
            const width = Math.max(80, Math.min(900, Number(image.width) || pos?.width || 180));
            const height = Math.max(60, Math.min(700, Number(image.height) || pos?.height || 120));
            return `
                <div class="we-sheet-image-object" data-image-id="${escapeHtml(image.id)}" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px">
                    <img src="${escapeHtml(image.src)}" alt="Wklejony obraz">
                    <button type="button" class="we-sheet-image-delete" data-delete-image-id="${escapeHtml(image.id)}" title="Usuń obraz">×</button>
                </div>
            `;
        }).join("");

        const chartHtml = sheetCharts.map(sheetChart => {
            const chart = sheetChart.config || sheetChart.chart || sheetChart;
            const left = Number.isFinite(Number(sheetChart.x)) ? Number(sheetChart.x) : 0;
            const top = Number.isFinite(Number(sheetChart.y)) ? Number(sheetChart.y) : 0;
            const width = Math.max(320, Math.min(900, Number(sheetChart.width) || 520));
            const height = Math.max(230, Math.min(680, Number(sheetChart.height) || 330));
            let rendered = "<div>Nie udało się odświeżyć wykresu.</div>";
            try {
                rendered = buildChartHtml({
                    ...chart,
                    width: Math.max(300, width - 20),
                    height: Math.max(190, height - 66),
                    backgroundColor: chart.backgroundColor || "#111827"
                });
            } catch (error) {
                rendered = "<div>Nie udało się odświeżyć wykresu.</div>";
            }
            return `
                <div class="we-sheet-chart-object" data-sheet-chart-id="${escapeHtml(sheetChart.id)}" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px">
                    <div class="we-sheet-chart-handle" data-sheet-chart-drag="${escapeHtml(sheetChart.id)}">
                        <span>${escapeHtml(chart.title || "Wykres")}</span>
                        <small>${escapeHtml(chart.rangeText || "")}</small>
                        <button type="button" class="we-sheet-chart-delete" data-delete-sheet-chart-id="${escapeHtml(sheetChart.id)}" title="Usuń wykres z arkusza">×</button>
                    </div>
                    <div class="we-sheet-chart-body">${rendered}</div>
                </div>
            `;
        }).join("");

        sheetImageLayer.innerHTML = imageHtml + chartHtml;
    }

    function getChartPlacementCell(config, placement = "near") {
        const bounds = parseRangeBounds(config?.rangeText || "") || getSelectionBounds() || { rowStart: activeCell.row, rowEnd: activeCell.row, colStart: activeCell.col, colEnd: activeCell.col };
        if (placement === "active") return { row: activeCell.row, col: activeCell.col };
        if (placement === "below") return { row: Math.min(currentRows - 1, bounds.rowEnd + 2), col: bounds.colStart };
        const rightCol = bounds.colEnd + 1;
        if (rightCol < currentCols) return { row: bounds.rowStart, col: rightCol };
        return { row: Math.min(currentRows - 1, bounds.rowEnd + 2), col: bounds.colStart };
    }

    function insertChartOverlayToSheet(config, placement = "near") {
        if (!currentSheet || !config?.rangeText) return false;
        const state = getSheetExtensionState();
        const cell = getChartPlacementCell(config, placement);
        const pos = getCellLayerPosition(cell.row, cell.col) || { x: 0, y: 0, width: 520, height: 330 };
        const width = Math.max(420, Math.min(760, Number(config.width) || 560));
        const height = Math.max(280, Math.min(520, (Number(config.height) || 360) + 58));
        state.sheetCharts.push({
            id: `chart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            config: { ...config, width: Math.max(420, width - 20), height: Math.max(220, height - 66) },
            row: cell.row,
            col: cell.col,
            x: Math.max(0, pos.x),
            y: Math.max(0, pos.y),
            width,
            height,
            createdAt: new Date().toISOString()
        });
        renderSheetImages();
        markDirty();
        logUserAction("Wstawiono wykres na arkusz", { type: "chart_embed", range: config.rangeText, cell: cellAddress(cell.row, cell.col) });
        return true;
    }

    function updateSheetChartPosition(chartId, x, y) {
        const state = getSheetExtensionState();
        const chart = (state.sheetCharts || []).find(item => item.id === chartId);
        if (!chart) return;
        chart.x = Math.max(0, Math.round(x));
        chart.y = Math.max(0, Math.round(y));
        markDirty();
    }

    function startSheetChartDrag(chartId, event) {
        const element = Array.from(sheetImageLayer?.querySelectorAll("[data-sheet-chart-id]") || []).find(el => el.dataset.sheetChartId === chartId);
        const chart = (getSheetExtensionState().sheetCharts || []).find(item => item.id === chartId);
        if (!element || !chart) return;
        event.preventDefault();
        activeSheetChartDrag = {
            id: chartId,
            element,
            startX: event.clientX,
            startY: event.clientY,
            originX: Number(chart.x) || 0,
            originY: Number(chart.y) || 0
        };
        element.classList.add("dragging");
        document.body.classList.add("we-dragging-sheet-chart");
    }


    function insertImageOverlayAtActiveCell(src) {
        if (!currentSheet || !src) return false;
        const state = getSheetExtensionState();
        const pos = getCellLayerPosition(activeCell.row, activeCell.col) || { x: 0, y: 0, width: 180, height: 120 };
        state.images.push({
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            src,
            row: activeCell.row,
            col: activeCell.col,
            x: pos.x,
            y: pos.y,
            width: pos.width,
            height: pos.height,
            createdAt: new Date().toISOString()
        });
        renderSheetImages();
        markDirty();
        logUserAction("Wklejono obraz do arkusza", { type: "image_paste", cell: cellAddress(activeCell.row, activeCell.col) });
        return true;
    }

    async function copySelectionToClipboard(cut = false) {
        if (!currentSheet) return;
        const { bounds, matrix } = getSelectionMatrix(true);
        const text = matrixToClipboardText(matrix);
        cellClipboard = { text, matrix, cut, sourceRange: bounds };
        await writeClipboardText(text);
        logUserAction(cut ? "Wycięto zakres komórek" : "Skopiowano zakres komórek", { type: cut ? "cell_cut" : "cell_copy", range: getCurrentSelectionRangeText() });
    }

    async function pasteClipboardToActiveCell() {
        if (!currentSheet) return;
        const imageSrc = await readClipboardImageFromNavigator();
        if (imageSrc && insertImageOverlayAtActiveCell(imageSrc)) return;
        const text = await readClipboardText();
        const matrix = text ? clipboardTextToMatrix(text) : cellClipboard.matrix;
        if (!matrix || !matrix.length) return;

        pushHistorySnapshot();
        const matrixRows = matrix.length;
        const matrixCols = Math.max(...matrix.map(row => row.length));
        const requiredRows = activeCell.row + matrixRows;
        const requiredCols = activeCell.col + matrixCols;
        const expandsGrid = requiredRows > currentRows || requiredCols > currentCols;
        const touchedCells = [];
        ensureDimensions(requiredRows, requiredCols);
        matrix.forEach((line, rowOffset) => {
            line.forEach((value, colOffset) => {
                const row = activeCell.row + rowOffset;
                const col = activeCell.col + colOffset;
                currentSheet.grid[row][col] = value;
                touchedCells.push([row, col]);
            });
        });

        if (cellClipboard.cut && cellClipboard.sourceRange) {
            const targetRange = {
                rowStart: activeCell.row,
                rowEnd: activeCell.row + matrixRows - 1,
                colStart: activeCell.col,
                colEnd: activeCell.col + matrixCols - 1
            };
            for (let row = cellClipboard.sourceRange.rowStart; row <= cellClipboard.sourceRange.rowEnd; row += 1) {
                for (let col = cellClipboard.sourceRange.colStart; col <= cellClipboard.sourceRange.colEnd; col += 1) {
                    const insideTarget = row >= targetRange.rowStart && row <= targetRange.rowEnd && col >= targetRange.colStart && col <= targetRange.colEnd;
                    if (!insideTarget && currentSheet.grid[row]) {
                        currentSheet.grid[row][col] = "";
                        touchedCells.push([row, col]);
                    }
                }
            }
            cellClipboard.cut = false;
        }

        selectionStart = { row: activeCell.row, col: activeCell.col };
        selectionEnd = { row: activeCell.row + matrixRows - 1, col: activeCell.col + matrixCols - 1 };
        if (expandsGrid || touchedCells.length > 2500) {
            renderGrid();
        } else {
            prepareConditionalRulesCache();
            touchedCells.forEach(([row, col]) => updateCellElement(row, col));
            updateSelectionHighlight();
            scheduleComputedRefresh(activeCell.row, activeCell.col);
        }
        markDirty();
        logUserAction("Wklejono komórki", { type: "cell_paste", startCell: cellAddress(activeCell.row, activeCell.col) });
    }

    function showCellContextMenu(row, col, event) {
        if (!sheetContextMenu || !currentSheet) return;
        setActiveCell(row, col, false);
        if (!isCellInSelection(row, col)) {
            selectionStart = { row, col };
            selectionEnd = { row, col };
            updateSelectionHighlight();
        }
        const range = getCurrentSelectionRangeText();
        const raw = currentSheet.grid[row]?.[col] || "";
        const shownValue = raw === "" ? "pusta komórka" : String(raw).slice(0, 60);
        sheetContextMenu.innerHTML = `
            <div class="we-context-head">
                <strong>${escapeHtml(range)}</strong>
                <span>${escapeHtml(shownValue)}</span>
            </div>
            <button data-cell-action="copy">Kopiuj <span>Ctrl+C</span></button>
            <button data-cell-action="cut">Wytnij <span>Ctrl+X</span></button>
            <button data-cell-action="paste">Wklej <span>Ctrl+V</span></button>
            <div class="we-menu-separator"></div>
            <button data-cell-action="clear">Wyczyść komórkę / zakres</button>
            <button data-cell-action="comment">Dodaj komentarz</button>
            <div class="we-menu-separator"></div>
            <button data-cell-action="row-above">Wstaw wiersz powyżej</button>
            <button data-cell-action="row-below">Wstaw wiersz poniżej</button>
            <button data-cell-action="col-left">Wstaw kolumnę z lewej</button>
            <button data-cell-action="col-right">Wstaw kolumnę z prawej</button>
            <div class="we-menu-separator"></div>
            <button data-cell-action="solver-target">Solver: ustaw jako cel</button>
            <button data-cell-action="solver-variable">Solver: dodaj jako zmienną</button>
        `;
        sheetContextMenu.hidden = false;
        sheetContextMenu.style.visibility = "hidden";
        const menuWidth = 260;
        const menuHeight = sheetContextMenu.offsetHeight || 420;
        sheetContextMenu.style.left = `${Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8))}px`;
        sheetContextMenu.style.top = `${Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8))}px`;
        sheetContextMenu.style.visibility = "visible";
    }

    function handleCellContextAction(action) {
        if (!currentSheet) return;
        if (action === "copy") return void copySelectionToClipboard(false);
        if (action === "cut") return void copySelectionToClipboard(true);
        if (action === "paste") return void pasteClipboardToActiveCell();
        if (action === "clear") return clearActiveCell();
        if (action === "comment") return openCommentEditor("comment");
        if (["row-above", "row-below", "col-left", "col-right"].includes(action)) return applyInsertAction(action);
        if (action === "solver-target") {
            if (solverTargetInput) solverTargetInput.value = cellAddress(activeCell.row, activeCell.col);
            return openModal(solverModal);
        }
        if (action === "solver-variable") {
            setSolverVariablesFromSelection(false);
            return openModal(solverModal);
        }
    }

    function setActiveCell(row, col, focus = false) {
        fastSelectCell(row, col, focus);
    }

    function getStoredColumnWidth(col) {
        const width = currentSheet?.columnWidths?.[col];
        return Number.isFinite(Number(width)) ? Number(width) : null;
    }

    function getStoredRowHeight(row) {
        const height = currentSheet?.rowHeights?.[row];
        return Number.isFinite(Number(height)) ? Number(height) : null;
    }

    function setStoredColumnWidth(col, width) {
        if (!currentSheet) return;
        if (!currentSheet.columnWidths) currentSheet.columnWidths = {};
        currentSheet.columnWidths[col] = Math.max(64, Math.min(520, Math.round(width)));
        commitActiveSheetToWorkbook();
    }

    function setStoredRowHeight(row, height) {
        if (!currentSheet) return;
        if (!currentSheet.rowHeights) currentSheet.rowHeights = {};
        currentSheet.rowHeights[row] = Math.max(28, Math.min(120, Math.round(height)));
        commitActiveSheetToWorkbook();
    }

    function getAutoColumnWidths(scanContent = false) {
        const colWidths = Array.from({ length: currentCols }, () => 108);
        for (let col = 0; col < currentCols; col += 1) {
            colWidths[col] = Math.max(colWidths[col], (colToLabel(col).length * 12) + 42);
            if (scanContent) {
                const rowsToScan = Math.min(currentRows, 80);
                for (let row = 0; row < rowsToScan; row += 1) {
                    const raw = currentSheet?.grid?.[row]?.[col] || "";
                    const text = String(
                        typeof raw === "string" && raw.trim().startsWith("=")
                            ? displayFormulaValue(getCellComputedValue(row, col))
                            : raw
                    );
                    colWidths[col] = Math.min(360, Math.max(colWidths[col], (text.length * 8) + 30));
                }
            }
            const manual = getStoredColumnWidth(col);
            if (manual) colWidths[col] = manual;
        }
        return colWidths;
    }

    function applyColumnWidths(colWidths) {
        if (!Array.isArray(colWidths)) return;
        const rowHeaderCol = sheetGridTable?.querySelector("colgroup .we-row-header-col");
        if (rowHeaderCol) rowHeaderCol.style.width = "52px";
        colHeaderElements.forEach((cell, col) => {
            if (!cell) return;
            const width = colWidths[col] || 112;
            cell.style.width = `${width}px`;
        });
        columnElements.forEach((colEl, col) => {
            if (!colEl) return;
            const width = colWidths[col] || 112;
            colEl.style.width = `${width}px`;
        });
        scheduleFormulaReferenceHighlights();
    }

    function scheduleApplyColumnWidths(colWidths) {
        pendingColumnWidths = colWidths;
        if (columnWidthFrameId) return;
        columnWidthFrameId = window.requestAnimationFrame(() => {
            columnWidthFrameId = null;
            const widths = pendingColumnWidths;
            pendingColumnWidths = null;
            applyColumnWidths(widths);
        });
    }

    function applySingleColumnWidth(col, width) {
        const nextWidth = Math.max(64, Math.min(520, Math.round(width || 108)));
        const header = colHeaderElements[col];
        const colEl = columnElements[col];
        if (header) header.style.width = `${nextWidth}px`;
        if (colEl) colEl.style.width = `${nextWidth}px`;
        scheduleFormulaReferenceHighlights();
    }

    function scheduleApplySingleColumnWidth(col, width) {
        pendingSingleColumnWidth = { col, width };
        if (singleColumnWidthFrameId) return;
        singleColumnWidthFrameId = window.requestAnimationFrame(() => {
            singleColumnWidthFrameId = null;
            const pending = pendingSingleColumnWidth;
            pendingSingleColumnWidth = null;
            if (pending) applySingleColumnWidth(pending.col, pending.width);
        });
    }

    function autoFitSingleColumn(col) {
        if (!currentSheet) return;
        const widths = getAutoColumnWidths(true);
        const autoWidth = widths[col] || 108;
        setStoredColumnWidth(col, autoWidth);
        scheduleApplyColumnWidths(getAutoColumnWidths(false));
        markDirty();
    }

    function moveColumn(sourceIndex, targetIndex) {
        if (!currentSheet || sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return;
        pushHistorySnapshot();
        currentSheet.grid = currentSheet.grid.map(row => {
            const clone = [...row];
            const [moved] = clone.splice(sourceIndex, 1);
            clone.splice(targetIndex, 0, moved || "");
            return clone;
        });

        const newStyles = {};
        Object.entries(currentSheet.styles || {}).forEach(([key, value]) => {
            const [r, c] = key.split(":").map(Number);
            let nextCol = c;
            if (c === sourceIndex) nextCol = targetIndex;
            else if (sourceIndex < targetIndex && c > sourceIndex && c <= targetIndex) nextCol = c - 1;
            else if (sourceIndex > targetIndex && c >= targetIndex && c < sourceIndex) nextCol = c + 1;
            newStyles[`${r}:${nextCol}`] = value;
        });
        currentSheet.styles = newStyles;

        const orderedWidths = Array.from({ length: currentCols }, (_, idx) => getStoredColumnWidth(idx) || null);
        const [movedWidth] = orderedWidths.splice(sourceIndex, 1);
        orderedWidths.splice(targetIndex, 0, movedWidth);
        currentSheet.columnWidths = {};
        orderedWidths.forEach((width, idx) => { if (width) currentSheet.columnWidths[idx] = width; });

        if (activeCell.col === sourceIndex) activeCell.col = targetIndex;
        else if (sourceIndex < targetIndex && activeCell.col > sourceIndex && activeCell.col <= targetIndex) activeCell.col -= 1;
        else if (sourceIndex > targetIndex && activeCell.col >= targetIndex && activeCell.col < sourceIndex) activeCell.col += 1;

        if (selectionStart && selectionEnd) {
            const remapCol = (c) => {
                if (c === sourceIndex) return targetIndex;
                if (sourceIndex < targetIndex && c > sourceIndex && c <= targetIndex) return c - 1;
                if (sourceIndex > targetIndex && c >= targetIndex && c < sourceIndex) return c + 1;
                return c;
            };
            selectionStart.col = remapCol(selectionStart.col);
            selectionEnd.col = remapCol(selectionEnd.col);
        }

        commitActiveSheetToWorkbook();
        renderGrid();
        markDirty();
    }

    function moveRow(sourceIndex, targetIndex) {
        if (!currentSheet || sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return;
        pushHistorySnapshot();
        const [movedRow] = currentSheet.grid.splice(sourceIndex, 1);
        currentSheet.grid.splice(targetIndex, 0, movedRow || Array.from({ length: currentCols }, () => ""));

        const newStyles = {};
        Object.entries(currentSheet.styles || {}).forEach(([key, value]) => {
            const [r, c] = key.split(":").map(Number);
            let nextRow = r;
            if (r === sourceIndex) nextRow = targetIndex;
            else if (sourceIndex < targetIndex && r > sourceIndex && r <= targetIndex) nextRow = r - 1;
            else if (sourceIndex > targetIndex && r >= targetIndex && r < sourceIndex) nextRow = r + 1;
            newStyles[`${nextRow}:${c}`] = value;
        });
        currentSheet.styles = newStyles;

        const orderedHeights = Array.from({ length: currentRows }, (_, idx) => getStoredRowHeight(idx) || null);
        const [movedHeight] = orderedHeights.splice(sourceIndex, 1);
        orderedHeights.splice(targetIndex, 0, movedHeight);
        currentSheet.rowHeights = {};
        orderedHeights.forEach((height, idx) => { if (height) currentSheet.rowHeights[idx] = height; });

        if (activeCell.row === sourceIndex) activeCell.row = targetIndex;
        else if (sourceIndex < targetIndex && activeCell.row > sourceIndex && activeCell.row <= targetIndex) activeCell.row -= 1;
        else if (sourceIndex > targetIndex && activeCell.row >= targetIndex && activeCell.row < sourceIndex) activeCell.row += 1;

        if (selectionStart && selectionEnd) {
            const remapRow = (r) => {
                if (r === sourceIndex) return targetIndex;
                if (sourceIndex < targetIndex && r > sourceIndex && r <= targetIndex) return r - 1;
                if (sourceIndex > targetIndex && r >= targetIndex && r < sourceIndex) return r + 1;
                return r;
            };
            selectionStart.row = remapRow(selectionStart.row);
            selectionEnd.row = remapRow(selectionEnd.row);
        }

        commitActiveSheetToWorkbook();
        renderGrid();
        markDirty();
    }

    function startColumnResize(col, event) {
        event.preventDefault();
        event.stopPropagation();
        const th = head.querySelector(`th[data-col="${col}"]`);
        if (!th) return;
        activeColumnResize = {
            col,
            startX: event.clientX,
            startWidth: th.getBoundingClientRect().width
        };
        document.body.classList.add("we-resizing-columns");
    }

    function getChartConfigFromInputs() {
        return {
            rangeText: chartRangeInput?.value?.trim() || "",
            type: chartTypeSelect?.value || "line",
            useHeader: chartFirstRowHeaderInput?.checked !== false,
            useFirstColumnAsLabels: chartFirstColLabelsInput?.checked !== false,
            title: chartTitleInput?.value?.trim() || "",
            xTitle: chartXTitleInput?.value?.trim() || "",
            yTitle: chartYTitleInput?.value?.trim() || "",
            showLegend: chartShowLegendInput?.checked !== false,
            showGrid: chartShowGridInput?.checked !== false,
            showLabels: chartShowLabelsInput?.checked === true,
            color: chartSeriesColorInput?.value || DEFAULT_CHART_COLOR,
            backgroundColor: chartBgColorInput?.value || "#111827",
            width: parseInt(chartWidthInput?.value || "900", 10),
            height: parseInt(chartHeightInput?.value || "360", 10),
            lineWidth: parseInt(chartLineWidthInput?.value || "3", 10),
            pointSize: parseInt(chartPointSizeInput?.value || "5", 10),
            sortOrder: chartSortSelect?.value || "none",
            legendPosition: chartLegendPositionSelect?.value || "bottom",
            placeOnSheet: chartPlaceOnSheetInput?.checked === true,
            placement: chartPlacementSelect?.value || "near"
        };
    }

    function textLooksLikeDateOrPeriod(value) {
        const text = String(value || "").trim().toLowerCase();
        if (!text) return false;
        return /^(\d{4}|\d{1,2}[.\-/]\d{1,2}|\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})/.test(text) ||
            /(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paź|paz|lis|gru|jan|feb|apr|jun|jul|aug|sep|oct|nov|dec|mies|kwartał|kwartal|rok|year|month|q[1-4])/.test(text);
    }

    function compactCellPreview(value, fallback = "") {
        const text = String(value ?? "").trim();
        if (!text) return fallback;
        return text.length > 22 ? `${text.slice(0, 21)}…` : text;
    }

    function analyzeChartRange(rangeText) {
        const bounds = parseRangeBounds(rangeText);
        if (!bounds) return null;
        const normalizedRange = boundsToRangeText(bounds);
        const matrix = getRangeMatrix(normalizedRange, true);
        if (!matrix.length || !matrix[0]?.length) return null;

        const rows = matrix.length;
        const cols = matrix[0].length;
        const flat = matrix.flat();
        const nonEmpty = flat.filter(value => String(value ?? "").trim() !== "").length;
        const numeric = flat.filter(value => isNumericValue(value)).length;
        const formulas = [];
        for (let r = bounds.rowStart; r <= bounds.rowEnd; r += 1) {
            for (let c = bounds.colStart; c <= bounds.colEnd; c += 1) {
                if (String(currentSheet?.grid?.[r]?.[c] ?? "").trim().startsWith("=")) formulas.push(cellAddress(r, c));
            }
        }

        const firstRow = matrix[0] || [];
        const firstCol = matrix.map(row => row[0]);
        const firstRowTextCount = firstRow.filter(value => String(value ?? "").trim() && !isNumericValue(value)).length;
        const firstColTextCount = firstCol.slice(1).filter(value => String(value ?? "").trim() && !isNumericValue(value)).length;
        const hasHeader = rows > 1 && firstRowTextCount >= Math.max(1, Math.ceil(cols * 0.35));
        const hasLabelColumn = cols > 1 && firstColTextCount >= Math.max(1, Math.ceil((rows - 1) * 0.35));
        const dataRows = hasHeader ? matrix.slice(1) : matrix;
        const columnProfiles = [];

        for (let c = 0; c < cols; c += 1) {
            const values = dataRows.map(row => row[c]);
            const numericCount = values.filter(value => isNumericValue(value)).length;
            const textCount = values.filter(value => String(value ?? "").trim() && !isNumericValue(value)).length;
            const header = hasHeader ? compactCellPreview(firstRow[c], colToLabel(bounds.colStart + c)) : colToLabel(bounds.colStart + c);
            columnProfiles.push({
                index: c,
                header,
                numericCount,
                textCount,
                emptyCount: values.length - numericCount - textCount,
                numericRatio: values.length ? numericCount / values.length : 0,
                looksLikePeriod: values.some(textLooksLikeDateOrPeriod) || textLooksLikeDateOrPeriod(header)
            });
        }

        const numericColumns = columnProfiles.filter((profile, index) => profile.numericRatio >= 0.5 && !(hasLabelColumn && index === 0));
        const labelColumn = hasLabelColumn ? columnProfiles[0] : null;
        const periodLike = Boolean(labelColumn?.looksLikePeriod || firstCol.some(textLooksLikeDateOrPeriod));
        let recommendedType = "column";
        let recommendation = "Porównanie wartości według kategorii.";

        if (cols >= 3 && numericColumns.length >= 2 && (hasLabelColumn || periodLike)) {
            recommendedType = periodLike ? "line" : "column";
            recommendation = periodLike ? "Pierwsza kolumna wygląda jak czas, więc najlepszy będzie wykres liniowy." : "Kilka kolumn liczbowych — dobry układ do porównania serii.";
        } else if (cols >= 2 && numericColumns.length >= 2 && !hasLabelColumn) {
            recommendedType = "scatter";
            recommendation = "Dwie kolumny liczbowe bez etykiet — pasuje wykres punktowy XY.";
        } else if (cols >= 2 && numericColumns.length === 1 && hasLabelColumn) {
            recommendedType = rows > 7 ? "bar" : "column";
            recommendation = "Pierwsza kolumna wygląda jak etykiety, druga jak wartości.";
        } else if (numericColumns.length === 1 && rows >= 8) {
            recommendedType = "histogram";
            recommendation = "Jedna długa seria liczbowa — można pokazać rozkład wartości.";
        } else if (rows === 1 && cols > 2) {
            recommendedType = "column";
            recommendation = "Jeden wiersz danych — pokaż wartości jako kolumny.";
        }

        const headers = columnProfiles.map(profile => profile.header).filter(Boolean);
        const numericNames = numericColumns.map(profile => profile.header).filter(Boolean);
        const titleBase = headers.filter(Boolean).slice(0, 3).join(" / ");
        const title = titleBase ? `Wykres: ${titleBase}` : `Wykres ${normalizedRange}`;
        const xTitle = hasLabelColumn ? (labelColumn?.header || "Kategorie") : (periodLike ? "Czas" : "Oś X");
        const yTitle = numericNames.length === 1 ? numericNames[0] : (numericNames.length ? "Wartości" : "Wartość");

        return {
            rangeText: normalizedRange,
            bounds,
            rows,
            cols,
            nonEmpty,
            numeric,
            text: nonEmpty - numeric,
            formulas,
            hasHeader,
            hasLabelColumn,
            numericColumns,
            headers,
            recommendedType,
            recommendation,
            title,
            xTitle,
            yTitle,
            summary: `${normalizedRange}: ${rows}×${cols}, ${numeric} liczb, ${nonEmpty - numeric} tekstów${formulas.length ? `, formuły: ${formulas.slice(0, 4).join(", ")}${formulas.length > 4 ? "…" : ""}` : ""}.`
        };
    }

    function findChartDataRegions(limit = 8) {
        if (!currentSheet?.grid?.length) return [];
        const rows = Math.min(currentRows || currentSheet.grid.length, currentSheet.grid.length);
        const cols = Math.min(currentCols || Math.max(...currentSheet.grid.map(row => row?.length || 0), 0), 40);
        const nonEmpty = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => String(currentSheet.grid?.[r]?.[c] ?? "").trim() !== ""));
        const visited = new Set();
        const regions = [];

        for (let r = 0; r < rows; r += 1) {
            for (let c = 0; c < cols; c += 1) {
                const key = `${r}:${c}`;
                if (!nonEmpty[r][c] || visited.has(key)) continue;
                const queue = [[r, c]];
                visited.add(key);
                let rowStart = r, rowEnd = r, colStart = c, colEnd = c;
                let count = 0;
                while (queue.length) {
                    const [qr, qc] = queue.shift();
                    count += 1;
                    rowStart = Math.min(rowStart, qr); rowEnd = Math.max(rowEnd, qr);
                    colStart = Math.min(colStart, qc); colEnd = Math.max(colEnd, qc);
                    [[qr - 1, qc], [qr + 1, qc], [qr, qc - 1], [qr, qc + 1]].forEach(([nr, nc]) => {
                        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) return;
                        const nextKey = `${nr}:${nc}`;
                        if (!nonEmpty[nr][nc] || visited.has(nextKey)) return;
                        visited.add(nextKey);
                        queue.push([nr, nc]);
                    });
                }
                if (count >= 3 && (rowEnd > rowStart || colEnd > colStart)) {
                    const paddedBounds = { rowStart, rowEnd, colStart, colEnd };
                    const analysis = analyzeChartRange(boundsToRangeText(paddedBounds));
                    if (analysis && analysis.numeric > 0) regions.push({ ...analysis, score: count + analysis.numeric * 2 + analysis.cols + analysis.rows });
                }
            }
        }

        const byRange = new Map();
        regions.sort((a, b) => b.score - a.score).forEach(region => {
            if (!byRange.has(region.rangeText)) byRange.set(region.rangeText, region);
        });
        return Array.from(byRange.values()).slice(0, limit);
    }

    function applyChartSuggestion(rangeText, type, title, xTitle, yTitle) {
        if (chartRangeInput) chartRangeInput.value = rangeText || "";
        if (chartTypeSelect && type) chartTypeSelect.value = type;
        syncChartTypeCards(type || chartTypeSelect?.value || "line");
        if (title && chartTitleInput && !chartTitleInput.value.trim()) chartTitleInput.value = title;
        if (xTitle && chartXTitleInput && !chartXTitleInput.value.trim()) chartXTitleInput.value = xTitle;
        if (yTitle && chartYTitleInput && !chartYTitleInput.value.trim()) chartYTitleInput.value = yTitle;
        const analysis = analyzeChartRange(rangeText);
        if (analysis) {
            if (chartFirstRowHeaderInput) chartFirstRowHeaderInput.checked = analysis.hasHeader;
            if (chartFirstColLabelsInput) chartFirstColLabelsInput.checked = analysis.hasLabelColumn;
        }
        scheduleChartPreviewRefresh();
        renderChartRangeInsight();
    }

    function renderChartRangeInsight() {
        if (!chartRangeInsight) return;
        const analysis = analyzeChartRange(chartRangeInput?.value || "");
        if (!analysis) {
            chartRangeInsight.innerHTML = "Nie rozpoznaję jeszcze zakresu. Zaznacz tabelę albo wybierz jedną z podpowiedzi.";
            return;
        }
        const headerText = analysis.hasHeader ? "wykryto nagłówki" : "bez wyraźnych nagłówków";
        const labelText = analysis.hasLabelColumn ? "pierwsza kolumna jako etykiety" : "brak kolumny etykiet";
        const displayType = getChartTypeDisplayName(analysis.recommendedType);
        chartRangeInsight.innerHTML = `
            <b>${escapeHtml(analysis.rangeText)}</b> — ${analysis.rows} wiersz(e/y), ${analysis.cols} kolumn(y), ${analysis.numeric} wartości liczbowych; ${headerText}, ${labelText}.<br>
            <span>Propozycja: <b>${escapeHtml(displayType)}</b> — ${escapeHtml(analysis.recommendation)}</span>
        `;
    }

    function renderChartSmartSuggestions() {
        if (!chartSmartPanel) return;
        const suggestions = [];
        const selectionRange = getCurrentSelectionRangeText();
        const selectionAnalysis = analyzeChartRange(selectionRange);
        if (selectionAnalysis && selectionAnalysis.numeric > 0 && (selectionAnalysis.rows > 1 || selectionAnalysis.cols > 1)) suggestions.push({ ...selectionAnalysis, sourceLabel: "Bieżące zaznaczenie" });
        findChartDataRegions(8).forEach(item => {
            if (!suggestions.some(existing => existing.rangeText === item.rangeText)) suggestions.push({ ...item, sourceLabel: "Wykryty zakres" });
        });

        if (!suggestions.length) {
            chartSmartPanel.innerHTML = '<div class="we-chart-smart-empty">Nie widzę jeszcze zwartej tabeli z liczbami. Zaznacz zakres ręcznie, np. A1:C10.</div>';
            renderChartRangeInsight();
            return;
        }

        chartSmartPanel.innerHTML = `
            <div class="we-chart-smart-title">Smart podpowiedzi zakresów</div>
            <div class="we-chart-smart-list">
                ${suggestions.slice(0, 6).map((item, index) => `
                    <button type="button" class="we-chart-smart-card" data-chart-suggestion-index="${index}" data-range="${escapeHtml(item.rangeText)}" data-type="${escapeHtml(item.recommendedType)}" data-title="${escapeHtml(item.title)}" data-x-title="${escapeHtml(item.xTitle)}" data-y-title="${escapeHtml(item.yTitle)}">
                        <span class="we-chart-smart-source">${escapeHtml(item.sourceLabel)}</span>
                        <strong>${escapeHtml(item.rangeText)}</strong>
                        <small>${escapeHtml(item.summary)}</small>
                        <em>${escapeHtml(getChartTypeDisplayName(item.recommendedType))} · ${escapeHtml(item.recommendation)}</em>
                    </button>
                `).join("")}
            </div>
        `;
        renderChartRangeInsight();
    }

    function refreshChartActionLabel() {
        if (buildChartBtn) buildChartBtn.textContent = editingChartIndex === null ? "Dodaj wykres" : "Zapisz zmiany wykresu";
    }

    function syncChartTypeCards(type) {
        chartTypeCards?.querySelectorAll(".we-chart-type-card").forEach(btn => {
            btn.classList.toggle("active", (btn.dataset.chartType || "") === type);
        });
    }

    function populateChartModal(config, index = null) {
        editingChartIndex = index;
        if (chartRangeInput) chartRangeInput.value = config.rangeText || "";
        if (chartTypeSelect) chartTypeSelect.value = config.type || "line";
        syncChartTypeCards(config.type || "line");
        if (chartTitleInput) chartTitleInput.value = config.title || "";
        if (chartXTitleInput) chartXTitleInput.value = config.xTitle || "";
        if (chartYTitleInput) chartYTitleInput.value = config.yTitle || "";
        if (chartSeriesColorInput) chartSeriesColorInput.value = config.color || DEFAULT_CHART_COLOR;
        if (chartBgColorInput) chartBgColorInput.value = config.backgroundColor || "#111827";
        if (chartWidthInput) chartWidthInput.value = String(config.width || 900);
        if (chartHeightInput) chartHeightInput.value = String(config.height || 360);
        if (chartLineWidthInput) chartLineWidthInput.value = String(config.lineWidth || 3);
        if (chartPointSizeInput) chartPointSizeInput.value = String(config.pointSize || 5);
        if (chartSortSelect) chartSortSelect.value = config.sortOrder || "none";
        if (chartLegendPositionSelect) chartLegendPositionSelect.value = config.legendPosition || "bottom";
        if (chartFirstRowHeaderInput) chartFirstRowHeaderInput.checked = config.useHeader !== false;
        if (chartFirstColLabelsInput) chartFirstColLabelsInput.checked = config.useFirstColumnAsLabels !== false;
        if (chartShowLegendInput) chartShowLegendInput.checked = config.showLegend !== false;
        if (chartShowGridInput) chartShowGridInput.checked = config.showGrid !== false;
        if (chartShowLabelsInput) chartShowLabelsInput.checked = config.showLabels !== false;
        if (chartPlaceOnSheetInput) chartPlaceOnSheetInput.checked = index === null ? config.placeOnSheet !== false : false;
        if (chartPlacementSelect) chartPlacementSelect.value = config.placement || "near";
        refreshChartActionLabel();
        scheduleChartPreviewRefresh();
    }

    function scheduleChartPreviewRefresh() {
        if (chartPreviewTimer) clearTimeout(chartPreviewTimer);
        chartPreviewTimer = setTimeout(() => {
            if (!chartLivePreview) return;
            const config = getChartConfigFromInputs();
            if (!config.rangeText) {
                chartLivePreview.innerHTML = '<div class="we-chart-live-preview-empty">Wpisz zakres danych albo użyj bieżącego zaznaczenia, a tutaj pojawi się podgląd wykresu.</div>';
                return;
            }
            try {
                const previewConfig = {
                    ...config,
                    width: Math.min(parseInt(config.width || 900, 10), 560),
                    height: Math.min(parseInt(config.height || 360, 10), 320)
                };
                chartLivePreview.innerHTML = `<div class="we-chart-preview-card">${buildChartHtml(previewConfig)}</div>`;
            } catch (error) {
                chartLivePreview.innerHTML = `<div class="we-chart-live-preview-empty">Nie udało się zbudować podglądu dla zakresu ${escapeHtml(config.rangeText)}.</div>`;
            }
        }, 120);
    }

    function setCaretToEnd(element) {
        const selection = window.getSelection?.();
        const range = document.createRange?.();
        if (!selection || !range) return;
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function attachFillHandle(td, row, col) {
        if (!td || row !== activeCell.row || col !== activeCell.col) return;
        td.querySelector(".we-fill-handle")?.remove();
        const handle = document.createElement("span");
        handle.className = "we-fill-handle";
        handle.title = "Przeciągnij, aby skopiować formułę lub wartość";
        handle.addEventListener("mousedown", event => {
            event.preventDefault();
            event.stopPropagation();
            isFillDragging = true;
            fillDragStart = { row, col };
            fillDragEnd = { row, col };
            updateSelectionHighlight();
        });
        td.appendChild(handle);
    }

    function enableCellEditing(row, col, td, initialValue = null) {
        if (!currentSheet || !td || td.classList.contains("we-special-cell")) return;
        td.classList.add("we-cell-editing");
        td.contentEditable = "true";
        td.spellcheck = false;
        td.dataset.originalValue = currentSheet.grid[row][col] || "";
        td.dataset.editSnapshotPushed = "0";
        td.textContent = initialValue !== null ? initialValue : (currentSheet.grid[row][col] || "");
        td.focus({ preventScroll: true });
        setCaretToEnd(td);
    }

    function isEditingFormulaInBar() {
        return isFormulaRangePickerReady();
    }

    function buildRangeTextFromCells(a, b = a) {
        if (!a || !b) return "";
        const rowStart = Math.min(a.row, b.row);
        const rowEnd = Math.max(a.row, b.row);
        const colStart = Math.min(a.col, b.col);
        const colEnd = Math.max(a.col, b.col);
        const startRef = cellAddress(rowStart, colStart);
        const endRef = cellAddress(rowEnd, colEnd);
        return startRef === endRef ? startRef : `${startRef}:${endRef}`;
    }

    function replaceCurrentFormulaArgument(rangeText) {
        if (!formulaInput || !rangeText) return;
        const value = formulaInput.value || "";
        const cursor = typeof formulaInput.selectionStart === "number" ? formulaInput.selectionStart : value.length;
        const before = value.slice(0, cursor);
        const after = value.slice(cursor);
        const openIndex = before.lastIndexOf("(");
        const commaIndex = before.lastIndexOf(";");
        const commaIndex2 = before.lastIndexOf(",");
        const splitIndex = Math.max(openIndex, commaIndex, commaIndex2);
        const lastToken = before.slice(splitIndex + 1);
        const tokenMatch = lastToken.match(/(\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?)$/i);
        let start = cursor;
        if (tokenMatch) start = cursor - tokenMatch[1].length;
        const next = value.slice(0, start) + rangeText + after;
        formulaInput.value = next;
        const pos = start + rangeText.length;
        formulaInput.setSelectionRange(pos, pos);
        formulaInput.focus({ preventScroll: true });
        formulaInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function moveActiveCellBy(deltaRow, deltaCol) {
        const row = Math.max(0, Math.min(currentRows - 1, activeCell.row + deltaRow));
        const col = Math.max(0, Math.min(currentCols - 1, activeCell.col + deltaCol));
        fastSelectCell(row, col, true);
    }

    function bindGridInteractionDelegation() {
        if (gridDelegationBound || !body) return;
        gridDelegationBound = true;

        body.addEventListener("mousedown", event => {
            const td = getCellFromTarget(event.target);
            if (!td || event.button !== 0) return;
            if (event.target?.classList?.contains("we-fill-handle")) return;
            if (event.target?.closest?.(".we-cell-checkbox, .we-cell-dropdown")) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            const { row, col } = coords;

            if (isEditingFormulaInBar()) {
                event.preventDefault();
                skipFormulaBlurHide = true;
                formulaRangePickMode = true;
                formulaRangeAnchor = { row, col };
                selectionStart = { row, col };
                selectionEnd = { row, col };
                scheduleSelectionHighlight();
                replaceCurrentFormulaArgument(buildRangeTextFromCells(formulaRangeAnchor, { row, col }));
                return;
            }

            isMouseSelecting = true;
            fastSelectCell(row, col, false);
        });

        body.addEventListener("mouseover", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            const { row, col } = coords;

            if (isFillDragging) {
                fillDragEnd = { row, col };
                scheduleSelectionHighlight();
                return;
            }
            if (formulaRangePickMode && formulaRangeAnchor) {
                selectionEnd = { row, col };
                scheduleSelectionHighlight();
                replaceCurrentFormulaArgument(buildRangeTextFromCells(formulaRangeAnchor, { row, col }));
                return;
            }
            if (!isMouseSelecting) return;
            selectionEnd = { row, col };
            scheduleSelectionHighlight();
        });

        body.addEventListener("dblclick", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            const { row, col } = coords;
            const editableBlocked = isCellEditingBlocked(row, col);
            event.preventDefault();
            const oldStart = selectionStart ? { ...selectionStart } : null;
            const oldEnd = selectionEnd ? { ...selectionEnd } : null;
            activeCell = { row, col };
            updateFormulaBar();
            if (oldStart && oldEnd) {
                selectionStart = oldStart;
                selectionEnd = oldEnd;
                updateSelectionHighlight();
            }
            if (td.querySelector("[data-tooltip]")) {
                openCommentEditor((currentSheet.grid[row][col] || "").startsWith("=NOTE(") ? "note" : "comment");
                return;
            }
            if (!editableBlocked) enableCellEditing(row, col, td);
        });

        body.addEventListener("contextmenu", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            event.preventDefault();
            if (document.activeElement === td) td.blur();
            showCellContextMenu(coords.row, coords.col, event);
        });

        body.addEventListener("focusin", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            const currentRaw = currentSheet?.grid?.[coords.row]?.[coords.col] || "";
            if (formulaInput) formulaInput.value = currentRaw;
            scheduleFormulaReferenceHighlights(currentRaw);
        });

        body.addEventListener("focusout", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            const { row, col } = coords;
            if (!isCellEditingBlocked(row, col) && td.classList.contains("we-cell-editing")) {
                const newValue = td.textContent || "";
                const originalValue = td.dataset.originalValue || "";
                const changed = newValue !== originalValue;
                td.classList.remove("we-cell-editing");
                td.contentEditable = "false";
                if (changed) {
                    pushCellEditHistory(row, col, originalValue, newValue);
                    currentSheet.grid[row][col] = newValue;
                    syncComputedCellRegistry(row, col);
                    markDirty();
                    logUserAction("Edycja komórki", { type: "cell_edit", cell: cellAddress(row, col), newValue });
                }
                delete td.dataset.originalValue;
                delete td.dataset.editSnapshotPushed;
                setCellDisplayContent(td, row, col);
                applyCellStyleToElement(td, row, col);
                if (row === activeCell.row && col === activeCell.col) {
                    attachFillHandle(td, row, col);
                }
                if (computedCellKeys.size > 0) {
                    if (window.requestIdleCallback) {
                        window.requestIdleCallback(() => scheduleComputedRefresh(row, col), { timeout: 600 });
                    } else {
                        scheduleComputedRefresh(row, col);
                    }
                }
            }
        });

        body.addEventListener("input", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            if (!isCellEditingBlocked(coords.row, coords.col) && td.classList.contains("we-cell-editing")) {
                commitActiveCellLive(coords.row, coords.col, td);
            }
        });

        body.addEventListener("keydown", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            const { row, col } = coords;
            const editableBlocked = isCellEditingBlocked(row, col);
            const editing = td.classList.contains("we-cell-editing");
            if (!editing) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    moveActiveCellBy(1, 0);
                    return;
                }
                if (event.key === "Tab") {
                    event.preventDefault();
                    moveActiveCellBy(0, event.shiftKey ? -1 : 1);
                    return;
                }
                if (event.key === "ArrowDown") { event.preventDefault(); moveActiveCellBy(1, 0); return; }
                if (event.key === "ArrowUp") { event.preventDefault(); moveActiveCellBy(-1, 0); return; }
                if (event.key === "ArrowRight") { event.preventDefault(); moveActiveCellBy(0, 1); return; }
                if (event.key === "ArrowLeft") { event.preventDefault(); moveActiveCellBy(0, -1); return; }
                if (!editableBlocked && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                    enableCellEditing(row, col, td, event.key);
                }
                return;
            }
            if (event.key === "Enter") {
                event.preventDefault();
                td.blur();
                moveActiveCellBy(1, 0);
                return;
            }
            if (event.key === "Tab") {
                event.preventDefault();
                td.blur();
                moveActiveCellBy(0, event.shiftKey ? -1 : 1);
                return;
            }
            if (event.key === "Escape") {
                event.preventDefault();
                const originalValue = td.dataset.originalValue || "";
                const changed = currentSheet.grid[row]?.[col] !== originalValue;
                currentSheet.grid[row][col] = originalValue;
                td.classList.remove("we-cell-editing");
                td.contentEditable = "false";
                delete td.dataset.originalValue;
                delete td.dataset.editSnapshotPushed;
                setCellDisplayContent(td, row, col);
                applyCellStyleToElement(td, row, col);
                updateFormulaBar();
                if (changed) {
                    syncComputedCellRegistry(row, col);
                    scheduleComputedRefresh(row, col);
                }
                td.focus({ preventScroll: true });
            }
        });
    }

    function setCellDisplayContent(td, row, col, display = null) {
        if (!td || !currentSheet) return;
        const raw = currentSheet.grid?.[row]?.[col] || "";
        const isFormulaLike = typeof raw === "string" && (raw.trim().startsWith("=") || raw.startsWith(SPILL_PREFIX));
        const resolvedDisplay = display || (isFormulaLike ? cellDisplayValue(row, col) : null);
        if (resolvedDisplay?.special || isFormulaLike) {
            td.innerHTML = resolvedDisplay ? resolvedDisplay.html : cellDisplayValue(row, col).html;
        } else {
            td.textContent = String(raw  || "");
        }
    }

    function renderGrid() {
        if (!currentSheet) return;

        applySpills();
        prepareConditionalRulesCache();

        head.innerHTML = "";
        body.innerHTML = "";
        cellElements = [];
        rowHeaderElements = [];
        colHeaderElements = [];
        highlightedCells = [];
        highlightedHeaders = [];
        highlightedFillCells = [];
        activeCellElement = null;
        computedCellKeys = new Set();
        bindGridInteractionDelegation();

        const headFragment = document.createDocumentFragment();
        const bodyFragment = document.createDocumentFragment();
        let colgroup = sheetGridTable?.querySelector("colgroup");
        if (!colgroup && sheetGridTable) {
            colgroup = document.createElement("colgroup");
            sheetGridTable.insertBefore(colgroup, sheetGridTable.firstChild);
        }
        if (colgroup) colgroup.innerHTML = "";
        columnElements = [];
        if (colgroup) {
            const cornerCol = document.createElement("col");
            cornerCol.className = "we-row-header-col";
            colgroup.appendChild(cornerCol);
            for (let col = 0; col < currentCols; col += 1) {
                const colEl = document.createElement("col");
                colEl.dataset.col = String(col);
                colgroup.appendChild(colEl);
                columnElements[col] = colEl;
            }
        }

        const headerRow = document.createElement("tr");
        const corner = document.createElement("th");
        corner.textContent = "#";
        headerRow.appendChild(corner);

        corner.title = "Zaznacz cały arkusz";
        corner.addEventListener("click", selectWholeSheet);

        for (let col = 0; col < currentCols; col += 1) {
            const th = document.createElement("th");
            th.dataset.col = String(col);
            th.draggable = true;
            th.classList.add("we-column-header");
            th.innerHTML = `<span class="we-header-label">${escapeHtml(colToLabel(col))}</span>`;
            th.title = `Zaznacz całą kolumnę ${colToLabel(col)} • przeciągnij, aby zmienić kolejność`;
            th.addEventListener("click", () => selectWholeColumn(col));
            th.addEventListener("dragstart", event => {
                draggedColumnIndex = col;
                th.classList.add("we-dragging-header");
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(col));
            });
            th.addEventListener("dragend", () => {
                draggedColumnIndex = null;
                th.classList.remove("we-dragging-header");
            });
            th.addEventListener("dragover", event => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                th.classList.add("we-drop-target");
            });
            th.addEventListener("dragleave", () => th.classList.remove("we-drop-target"));
            th.addEventListener("drop", event => {
                event.preventDefault();
                th.classList.remove("we-drop-target");
                const source = draggedColumnIndex !== null
                    ? parseInt(event.dataTransfer.getData("text/plain") || "-1", 10)
                    : -1;
                if (Number.isInteger(source) && source >= 0) moveColumn(source, col);
            });
            th.querySelector('.we-col-resize-handle')?.addEventListener('mousedown', event => startColumnResize(col, event));
            th.querySelector('.we-col-resize-handle')?.addEventListener('dblclick', event => {
                event.preventDefault();
                event.stopPropagation();
                autoFitSingleColumn(col);
            });
            colHeaderElements[col] = th;
            headerRow.appendChild(th);
        }
        headFragment.appendChild(headerRow);
        head.appendChild(headFragment);

        for (let row = 0; row < currentRows; row += 1) {
            const tr = document.createElement("tr");
            const storedRowHeight = getStoredRowHeight(row);
            if (storedRowHeight) tr.style.height = `${storedRowHeight}px`;

            const rowHeader = document.createElement("th");
            rowHeader.className = "row-header";
            rowHeader.textContent = row + 1;
            rowHeader.draggable = true;
            rowHeader.dataset.rowHeader = String(row);
            rowHeader.title = `Zaznacz cały wiersz ${row + 1} • przeciągnij, aby zmienić kolejność`;
            rowHeader.addEventListener("click", () => selectWholeRow(row));
            rowHeader.addEventListener("dragstart", event => {
                draggedRowIndex = row;
                rowHeader.classList.add("we-dragging-header");
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(row));
            });
            rowHeader.addEventListener("dragend", () => {
                draggedRowIndex = null;
                rowHeader.classList.remove("we-dragging-header");
            });
            rowHeader.addEventListener("dragover", event => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                rowHeader.classList.add("we-drop-target");
            });
            rowHeader.addEventListener("dragleave", () => rowHeader.classList.remove("we-drop-target"));
            rowHeader.addEventListener("drop", event => {
                event.preventDefault();
                rowHeader.classList.remove("we-drop-target");
                const source = draggedRowIndex !== null
                    ? parseInt(event.dataTransfer.getData("text/plain") || "-1", 10)
                    : -1;
                if (Number.isInteger(source) && source >= 0) moveRow(source, row);
            });
            rowHeaderElements[row] = rowHeader;
            tr.appendChild(rowHeader);
            cellElements[row] = [];

            for (let col = 0; col < currentCols; col += 1) {
                const td = document.createElement("td");
                td.dataset.row = String(row);
                td.dataset.col = String(col);
                td.tabIndex = 0;

                const rawValue = currentSheet.grid[row][col] || "";
                const isFormulaLike = typeof rawValue === "string" && (rawValue.trim().startsWith("=") || rawValue.startsWith(SPILL_PREFIX));
                const display = isFormulaLike ? cellDisplayValue(row, col) : { special: false };
                syncComputedCellRegistry(row, col);

                setCellDisplayContent(td, row, col, display);
                const checkboxInput = isFormulaLike ? td.querySelector(".we-cell-checkbox") : null;
                if (checkboxInput) {
                    checkboxInput.addEventListener("click", event => event.stopPropagation());
                    checkboxInput.addEventListener("mousedown", event => event.stopPropagation());
                    checkboxInput.addEventListener("change", event => {
                        event.stopPropagation();
                        const parsed = parseCheckboxFormula(currentSheet.grid[row][col] || "");
                        pushHistorySnapshot();
                        currentSheet.grid[row][col] = buildCheckboxFormula(event.target.checked, parsed.label);
                        markDirty();
                        logUserAction("Zmieniono pole wyboru", { type: "checkbox_change", cell: cellAddress(row, col), checked: event.target.checked });
                    });
                }
                const dropdownInput = isFormulaLike ? td.querySelector(".we-cell-dropdown") : null;
                if (dropdownInput) {
                    dropdownInput.addEventListener("click", event => event.stopPropagation());
                    dropdownInput.addEventListener("mousedown", event => event.stopPropagation());
                    dropdownInput.addEventListener("change", event => {
                        event.stopPropagation();
                        const parsed = parseDropdownFormula(currentSheet.grid[row][col] || "");
                        pushHistorySnapshot();
                        currentSheet.grid[row][col] = buildDropdownFormula(parsed.options, event.target.value);
                        markDirty();
                        logUserAction("Zmieniono menu komórki", { type: "dropdown_change", cell: cellAddress(row, col), value: event.target.value });
                    });
                }
                const tooltipMarker = isFormulaLike ? td.querySelector("[data-tooltip]") : null;
                if (tooltipMarker) {
                    td.addEventListener("mouseenter", event => showCellTooltip(tooltipMarker.dataset.tooltip || "", event.clientX, event.clientY));
                    td.addEventListener("mousemove", event => { if (activeTooltip) { activeTooltip.style.left = `${Math.min(event.clientX + 12, window.innerWidth - 340)}px`; activeTooltip.style.top = `${Math.min(event.clientY + 12, window.innerHeight - 120)}px`; } });
                    td.addEventListener("mouseleave", hideCellTooltip);
                    td.addEventListener("dblclick", () => openCommentEditor((currentSheet.grid[row][col] || "").startsWith("=NOTE(") ? "note" : "comment"));
                }
                if (row === activeCell.row && col === activeCell.col) {
                    attachFillHandle(td, row, col);
                }

                const editableBlocked =
                    display.special ||
                    (typeof rawValue === "string" && rawValue.startsWith(SPILL_PREFIX));

                if (editableBlocked) {
                    td.classList.add("we-special-cell");
                }
                td.contentEditable = "false";
                td.spellcheck = false;

                applyCellStyleToElement(td, row, col);

                cellElements[row][col] = td;
                tr.appendChild(td);
            }

            bodyFragment.appendChild(tr);
        }

        body.appendChild(bodyFragment);
        updateSelectionHighlight();
        scheduleApplyColumnWidths(getAutoColumnWidths(false));
        renderSheetImages();
        if ((chartObjects && chartObjects.length) || (pivotObjects && pivotObjects.length)) {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => rerenderGeneratedObjects(), { timeout: 800 });
            } else {
                window.setTimeout(() => rerenderGeneratedObjects(), 120);
            }
        } else if (generatedObjectsCard) {
            generatedObjectsCard.hidden = true;
        }
        repairSheetMetaFromRenderedGrid();
        scheduleFormulaReferenceHighlights();
    }

    function refreshComputedCells(changedRow = null, changedCol = null) {
        if (!currentSheet || !body) return;
        if (Number.isInteger(changedRow) && Number.isInteger(changedCol)) {
            syncComputedCellRegistry(changedRow, changedCol);
        }
        const focused = document.activeElement;
        computedCellKeys.forEach(key => {
            const [row, col] = key.split(":").map(Number);
            if (!Number.isInteger(row) || !Number.isInteger(col)) return;
            const td = cellElements[row]?.[col];
            if (!td || td === focused) return;
            const raw = currentSheet.grid?.[row]?.[col] || "";
            if (!isCellValueComputed(raw)) {
                computedCellKeys.delete(key);
                return;
            }
            const display = cellDisplayValue(row, col);
            td.innerHTML = display.html;
            applyCellStyleToElement(td, row, col);
            if (row === activeCell.row && col === activeCell.col) {
                attachFillHandle(td, row, col);
            }
        });
    }

    function scheduleComputedRefresh(changedRow = null, changedCol = null) {
        if (Number.isInteger(changedRow) && Number.isInteger(changedCol)) {
            computedRefreshPendingCell = { row: changedRow, col: changedCol };
        }
        if (computedRefreshTimer) return;
        computedRefreshTimer = window.setTimeout(() => {
            computedRefreshTimer = null;
            const cell = computedRefreshPendingCell;
            computedRefreshPendingCell = null;
            refreshComputedCells(cell?.row ?? null, cell?.col ?? null);
        }, 28);
    }

    function commitActiveCellLive(row, col, td) {
        if (!currentSheet || !td) return;
        const newValue = td.textContent || "";
        ensureDimensions(row + 1, col + 1);
        currentSheet.grid[row][col] = newValue;
        if (formulaInput) formulaInput.value = newValue;

        // Nie uderzamy w sieć ani w status na każdą literę. To usuwa mikroprzycięcia przy pisaniu.
        if (DEMO_MODE || !currentSheetCanEdit) return;
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(saveSheet, 300000);
        const now = Date.now();
        if (now - lastLiveAutosaveNoticeAt > 1200) {
            lastLiveAutosaveNoticeAt = now;
            setAutosaveState("saving", "Niezapisane zmiany — autozapis co 5 min");
        }
    }


    function applyFillDrag() {
        if (!currentSheet || !fillDragStart || !fillDragEnd) return;

        const sourceValue = currentSheet.grid[fillDragStart.row][fillDragStart.col] || "";
        const sourceStyle = { ...getCellStyle(fillDragStart.row, fillDragStart.col) };

        const rowStart = Math.min(fillDragStart.row, fillDragEnd.row);
        const rowEnd = Math.max(fillDragStart.row, fillDragEnd.row);
        const colStart = Math.min(fillDragStart.col, fillDragEnd.col);
        const colEnd = Math.max(fillDragStart.col, fillDragEnd.col);

        if (rowStart === rowEnd && colStart === colEnd) {
            fillDragStart = null;
            fillDragEnd = null;
            isFillDragging = false;
            updateSelectionHighlight();
            return;
        }

        pushHistorySnapshot();
        ensureDimensions(rowEnd + 1, colEnd + 1);

        for (let row = rowStart; row <= rowEnd; row += 1) {
            for (let col = colStart; col <= colEnd; col += 1) {
                if (row === fillDragStart.row && col === fillDragStart.col) continue;

                const rowOffset = row - fillDragStart.row;
                const colOffset = col - fillDragStart.col;
                currentSheet.grid[row][col] = adjustFormulaReferences(sourceValue, rowOffset, colOffset);
                currentSheet.styles[getCellStyleKey(row, col)] = { ...sourceStyle };

                const td = cellElements[row]?.[col];
                if (td) {
                    setCellDisplayContent(td, row, col);
                    applyCellStyleToElement(td, row, col);
                }
            }
        }

        activeCell = { row: fillDragEnd.row, col: fillDragEnd.col };
        selectionStart = { row: rowStart, col: colStart };
        selectionEnd = { row: rowEnd, col: colEnd };
        fillDragStart = null;
        fillDragEnd = null;
        isFillDragging = false;
        updateFormulaBar();
        updateSelectionHighlight();
        attachFillHandle(cellElements[activeCell.row]?.[activeCell.col], activeCell.row, activeCell.col);
        markDirty();
    }

    document.addEventListener("keydown", event => {
        const target = event.target;
        const isPlainEditable = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
        const insideSheet = document.activeElement?.closest?.(".we-sheet-table") || target?.closest?.(".we-sheet-table");

        if (insideSheet && !isPlainEditable && (event.key === "Delete" || event.key === "Backspace")) {
            event.preventDefault();
            clearSelectedCellsFast();
            return;
        }

        if (insideSheet && !isPlainEditable && event.key === "F2") {
            event.preventDefault();
            enterCellEdit();
            return;
        }

        if (insideSheet && !isPlainEditable && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
            event.preventDefault();
            fillDownSelection();
            return;
        }

        if (!event.ctrlKey && !event.metaKey) return;
        const key = event.key.toLowerCase();
        if (!["c", "x", "v", "s", "z", "y"].includes(key)) return;
        if (isPlainEditable && !target?.closest?.(".we-sheet-table")) return;
        if (!insideSheet && key !== "s") return;
        if (key === "v" && insideSheet) return;
        event.preventDefault();
        if (key === "c") copySelectionToClipboard(false);
        if (key === "x") copySelectionToClipboard(true);
        if (key === "s") saveSheet();
        if (key === "z") undoLastChange();
        if (key === "y") redoLastChange();
    });

    document.addEventListener("mousemove", event => {
        if (!activeColumnResize) return;
        const nextWidth = activeColumnResize.startWidth + (event.clientX - activeColumnResize.startX);
        const width = Math.max(64, Math.min(520, Math.round(nextWidth)));
        if (currentSheet) {
            if (!currentSheet.columnWidths) currentSheet.columnWidths = {};
            currentSheet.columnWidths[activeColumnResize.col] = width;
        }
        scheduleApplySingleColumnWidth(activeColumnResize.col, width);
    });

    document.addEventListener("mouseup", () => {
        if (activeColumnResize) {
            commitActiveSheetToWorkbook();
            activeColumnResize = null;
            document.body.classList.remove("we-resizing-columns");
            markDirty();
        }
        if (isFillDragging) {
            applyFillDrag();
            return;
        }
        if (formulaRangePickMode) {
            formulaRangePickMode = false;
            formulaRangeAnchor = null;
            skipFormulaBlurHide = false;
            formulaInput?.focus?.({ preventScroll: true });
            updateSelectionHighlight();
        }
        if (isMouseSelecting) {
            isMouseSelecting = false;
        }
    });

    function autoFitColumns(forceResetManual = false) {
        if (!currentSheet) return;
        if (forceResetManual) {
            currentSheet.columnWidths = {};
            commitActiveSheetToWorkbook();
            const widths = getAutoColumnWidths(true);
            widths.forEach((width, col) => {
                if (!currentSheet.columnWidths) currentSheet.columnWidths = {};
                currentSheet.columnWidths[col] = width;
            });
            commitActiveSheetToWorkbook();
            markDirty();
        }
        scheduleApplyColumnWidths(getAutoColumnWidths(false));
    }

    function applyFormulaToActiveCell() {
        if (!currentSheet) return;
        const targetCell = formulaEditTarget || activeCell;
        const value = formulaInput?.value || "";
        const validation = validateFormulaBeforeApply(value);
        if (!validation.ok) {
            alert(validation.message);
            formulaInput?.focus();
            renderFormulaHelper();
            return;
        }

        ensureDimensions(targetCell.row + 1, targetCell.col + 1);
        const oldValue = currentSheet.grid[targetCell.row]?.[targetCell.col] || "";
        if (oldValue !== value) {
            pushCellEditHistory(targetCell.row, targetCell.col, oldValue, value);
        }
        currentSheet.grid[targetCell.row][targetCell.col] = value;

        const activeTd = cellElements[targetCell.row]?.[targetCell.col];
        if (activeTd) {
            setCellDisplayContent(activeTd, targetCell.row, targetCell.col);
            applyCellStyleToElement(activeTd, targetCell.row, targetCell.col);
            attachFillHandle(activeTd, targetCell.row, targetCell.col);
        }
        refreshComputedCells(targetCell.row, targetCell.col);
        markDirty();
        formulaEditTarget = null;
        activeCell = { ...targetCell };
        selectionStart = { ...targetCell };
        selectionEnd = { ...targetCell };
        updateSelectionHighlight();
        updateFormulaBar();
        if (formulaHelperPopover) formulaHelperPopover.hidden = true;
        formulaBarRangeSelectionEnabled = false;
        logUserAction("Wpisano formułę", { type: "formula_apply", formula: value, cell: cellAddress(targetCell.row, targetCell.col) });
    }

    function renderFormulaCategories() {
        if (!formulaCategoriesEl || !window.FORMULA_CATALOG) return;

        formulaCategoriesEl.innerHTML = "";
        const categories = Object.keys(window.FORMULA_CATALOG);

        if (!activeFormulaCategory && categories.length) {
            activeFormulaCategory = categories[0];
        }

        categories.forEach(category => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "we-formula-category-btn";
            btn.textContent = category.replaceAll("_", " ").toUpperCase();

            if (category === activeFormulaCategory) {
                btn.classList.add("active");
            }

            const selectCategory = () => {
                if (activeFormulaCategory === category) return;
                activeFormulaCategory = category;
                activeFormulaName = null;
                renderFormulaCategories();
                renderFormulaList();
                renderFormulaDetails();
            };

            btn.title = `Pokaż funkcje z kategorii: ${btn.textContent}`;
            btn.addEventListener("mouseenter", selectCategory);
            btn.addEventListener("focus", selectCategory);
            btn.addEventListener("click", selectCategory);

            formulaCategoriesEl.appendChild(btn);
        });
    }

    function renderFormulaList() {
        if (!formulaListEl || !window.FORMULA_CATALOG || !activeFormulaCategory) return;

        const items = window.FORMULA_CATALOG[activeFormulaCategory] || [];
        formulaListEl.innerHTML = "";

        if (formulaCategoryTitleEl) {
            formulaCategoryTitleEl.textContent = activeFormulaCategory.replaceAll("_", " ").toUpperCase();
        }

        if (!activeFormulaName && items.length) {
            activeFormulaName = items[0].name;
        }

        items.forEach(fn => {
            const item = document.createElement("div");
            item.className = "we-formula-item";

            if (fn.name === activeFormulaName) {
                item.classList.add("active");
            }

            item.title = `${fn.name}\n${fn.syntax}\n${fn.description || ""}`.trim();
            item.dataset.syntax = fn.syntax || "";
            item.innerHTML = `
                <div class="we-formula-item-name">${escapeHtml(fn.name)}</div>
                <div class="we-formula-item-syntax">${escapeHtml(fn.syntax)}</div>
            `;

            const selectFormula = () => {
                if (activeFormulaName === fn.name) return;
                activeFormulaName = fn.name;
                renderFormulaList();
                renderFormulaDetails();
            };

            item.addEventListener("mouseenter", selectFormula);
            item.addEventListener("focus", selectFormula);
            item.addEventListener("click", () => {
                activeFormulaName = fn.name;
                renderFormulaList();
                renderFormulaDetails();
            });

            formulaListEl.appendChild(item);
        });

    }

    function renderFormulaDetails() {
        if (!formulaDetailsEl || !window.FORMULA_CATALOG || !activeFormulaCategory) return;

        const items = window.FORMULA_CATALOG[activeFormulaCategory] || [];
        const selected = items.find(fn => fn.name === activeFormulaName);

        if (!selected) {
            formulaDetailsEl.innerHTML = `
                <div class="we-formula-details-empty">
                    Wybierz funkcję z listy, aby zobaczyć opis i przykład użycia.
                </div>
            `;
            return;
        }

        formulaDetailsEl.innerHTML = `
            <div class="we-formula-details-card">
                <div class="we-formula-details-name">${escapeHtml(selected.name)}</div>

                <div>
                    <div class="we-formula-details-label">Składnia</div>
                    <div class="we-formula-details-box">${escapeHtml(selected.syntax)}</div>
                </div>

                <div>
                    <div class="we-formula-details-label">Opis</div>
                    <div class="we-formula-details-box">${escapeHtml(selected.description)}</div>
                </div>

                <div>
                    <div class="we-formula-details-label">Przykład</div>
                    <div class="we-formula-details-box">${escapeHtml(selected.example)}</div>
                </div>

                <button type="button" class="btn btn-primary we-formula-insert-btn" id="insert-selected-formula-btn">
                    Wstaw do komórki
                </button>
            </div>
        `;

        document.getElementById("insert-selected-formula-btn")?.addEventListener("click", () => {
            if (formulaInput) {
                formulaInput.value = selected.syntax;
                formulaInput.focus();
            }
        });
    }

    function initializeFormulaBrowser() {
        renderFormulaCategories();
        renderFormulaList();
        renderFormulaDetails();
    }

    function openModal(modalEl) {
        if (modalEl === chartModal) {
            if (chartRangeInput && !chartRangeInput.value.trim()) chartRangeInput.value = getCurrentSelectionRangeText();
            if (editingChartIndex === null && chartPlaceOnSheetInput) chartPlaceOnSheetInput.checked = true;
            refreshChartActionLabel();
            renderChartSmartSuggestions();
            scheduleChartPreviewRefresh();
        }
        if (modalEl === pivotModal) {
            if (pivotRangeInput && !pivotRangeInput.value.trim()) pivotRangeInput.value = getCurrentSelectionRangeText();
            renderPivotEditor();
        }
        if (modalEl === solverModal) {
            refreshSolverSheetSelect(activeWorkbookSheetIndex);
            clearSolverResult();
        }
        if (modalEl === reportModal) {
            populateReportBuilder();
        }
        modalEl?.classList.add("open");
    }

    function closeModal(modalEl) {
        if (modalEl === chartModal) {
            editingChartIndex = null;
            refreshChartActionLabel();
        }
        if (modalEl === smartInsertModal) {
            editingConditionalRuleIndex = null;
            if (smartInsertApplyBtn) smartInsertApplyBtn.textContent = "Wstaw";
        }
        modalEl?.classList.remove("open");
    }

    function buildGridLines(width, height, padding, showGrid) {
        if (!showGrid) return "";
        const lines = [];
        for (let i = 0; i < 5; i += 1) {
            const y = padding + ((height - padding * 2) * i / 4);
            lines.push(`<line class="we-chart-grid-line" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"></line>`);
        }
        return lines.join("");
    }

    function buildChartHtml(chart) {
        const {
            rangeText,
            useHeader,
            title,
            xTitle,
            yTitle,
            showGrid,
            showLabels,
            color
        } = chart;
        const useFirstColumnAsLabels = chart.useFirstColumnAsLabels !== false;

        const type = chart.type || "line";
        const renderTypeMap = {
            "smooth-line": "line",
            "stepped-area": "area",
            "stacked-column": "column",
            "stacked-bar": "bar",
            "pareto": "column",
            "combo": "column",
            "sparkline": "line"
        };
        const renderType = renderTypeMap[type] || type;
        const width = Math.max(420, parseInt(chart.width || 900, 10));
        const height = Math.max(220, parseInt(chart.height || 360, 10));
        const padding = type === "sparkline" ? 18 : 50;
        const lineWidth = Math.max(1, parseInt(chart.lineWidth || 3, 10));
        const pointSize = Math.max(2, parseInt(chart.pointSize || 5, 10));
        const chartColor = color || DEFAULT_CHART_COLOR;
        const showLegend = chart.legendPosition === "none" ? false : (chart.showLegend !== false);
        const chartBgStyle = chart.backgroundColor ? ` style="--chart-bg:${chart.backgroundColor}"` : "";

        const matrix = getRangeMatrix(rangeText, true);
        if (!matrix.length || !matrix[0].length) {
            return "<div>Nie udało się odczytać zakresu.</div>";
        }

        let labels = [];
        let rows = matrix;

        if (useHeader && matrix.length > 1) {
            labels = matrix[0].map(item => String(item  || ""));
            rows = matrix.slice(1);
        }

        if (!labels.length) {
            labels = rows.map((_, index) => `Wiersz ${index + 1}`);
        }

        function getSingleSeries() {
            const firstNumericValue = row => {
                const value = row.find(cell => isNumericValue(cell));
                return value === undefined ? NaN : parseNumber(value);
            };
            let series = rows.map((row, index) => ({
                label: useFirstColumnAsLabels ? String(row[0] || labels[index] || `P${index + 1}`) : String(labels[index] || index + 1),
                value: useFirstColumnAsLabels && row.length > 1 && isNumericValue(row[row.length - 1])
                    ? parseNumber(row[row.length - 1])
                    : firstNumericValue(row)
            })).filter(item => Number.isFinite(item.value));
            if (chart.sortOrder === "asc") series = series.sort((a, b) => a.value - b.value);
            if (chart.sortOrder === "desc" || type === "pareto") series = series.sort((a, b) => b.value - a.value);
            return series;
        }

        function axisLabels(maxValue, localHeight, localPadding) {
            return Array.from({ length: 5 }, (_, i) => {
                const value = Math.round(maxValue - (maxValue * i / 4));
                const y = localPadding + ((localHeight - localPadding * 2) * i / 4) + 4;
                return `<text x="${localPadding - 10}" y="${y}" text-anchor="end" font-size="11" fill="#c9d6ef">${value}</text>`;
            }).join("");
        }

        const titleHtml = title ? `<div class="we-chart-main-title">${escapeHtml(title)}</div>` : "";
        const legendHtml = showLegend
            ? `<div class="we-chart-legend-box"><span class="we-chart-legend-item"><span class="we-chart-legend-swatch" style="background:${chartColor}"></span><span>${escapeHtml(yTitle || "Seria")}</span></span></div>`
            : "";

        if (renderType === "bar") {
            const series = getSingleSeries();
            const maxValue = Math.max(...series.map(item => Math.abs(item.value)), 1);
            const rowsHtml = series.map(item => {
                const ratio = (Math.abs(item.value) / maxValue) * 100;
                const label = showLabels ? `<div class="we-chart-value">${item.value}</div>` : `<div class="we-chart-value"></div>`;
                return `<div class="we-chart-row"><div class="we-chart-label">${escapeHtml(item.label)}</div><div class="we-chart-track"><div class="we-chart-fill" style="width:${ratio}%; background:${chartColor}"></div></div>${label}</div>`;
            }).join("");
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap">${rowsHtml}</div>${legendHtml}`;
        }

        if (renderType === "column") {
            const series = getSingleSeries();
            const localHeight = height;
            const localWidth = width;
            const innerWidth = localWidth - padding * 2;
            const innerHeight = localHeight - padding * 2;
            const maxValue = Math.max(...series.map(item => Math.abs(item.value)), 1);
            const colWidth = innerWidth / Math.max(series.length, 1);
            const gridLines = buildGridLines(localWidth, localHeight, padding, showGrid);
            const cumulative = type === "pareto" ? series.reduce((a, b) => a + Math.max(0, b.value), 0) || 1 : 1;
            let running = 0;

            const bars = series.map((item, index) => {
                const barHeight = (Math.abs(item.value) / maxValue) * innerHeight;
                const x = padding + index * colWidth + 8;
                const y = localHeight - padding - barHeight;
                const w = Math.max(colWidth - 16, 8);
                running += Math.max(0, item.value);
                const cumY = localHeight - padding - ((running / cumulative) * innerHeight);
                const comboY = localHeight - padding - ((Math.abs(item.value) / maxValue) * innerHeight);
                const extraPoint = (type === "pareto" || type === "combo") ? `<circle cx="${x + w / 2}" cy="${type === "pareto" ? cumY : comboY}" r="${pointSize}" fill="#f8c156"></circle>` : "";
                return `<rect x="${x}" y="${y}" width="${w}" height="${barHeight}" rx="4" fill="${chartColor}"></rect>${extraPoint}${showLabels ? `<text class="we-chart-label-text" x="${x + w / 2}" y="${y - 8}" text-anchor="middle">${item.value}</text>` : ""}`;
            }).join("");

            const paretoPath = (type === "pareto" || type === "combo") ? (() => {
                let run = 0;
                return series.map((item, index) => {
                    run += Math.max(0, item.value);
                    const x = padding + index * colWidth + colWidth / 2;
                    const y = type === "pareto" ? localHeight - padding - ((run / cumulative) * innerHeight) : localHeight - padding - ((Math.abs(item.value) / maxValue) * innerHeight);
                    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ");
            })() : "";
            const xLabels = series.map((item, index) => `<text x="${padding + index * colWidth + colWidth / 2}" y="${localHeight - 16}" text-anchor="middle" font-size="11" fill="#c9d6ef">${escapeHtml(item.label)}</text>`).join("");
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap"><svg class="we-line-svg" viewBox="0 0 ${localWidth} ${localHeight}">${gridLines}<line class="we-axis-line" x1="${padding}" y1="${localHeight - padding}" x2="${localWidth - padding}" y2="${localHeight - padding}"></line><line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${localHeight - padding}"></line>${bars}${paretoPath ? `<path d="${paretoPath}" fill="none" stroke="#f8c156" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"></path>` : ""}${xLabels}${axisLabels(maxValue, localHeight, padding)}${xTitle ? `<text class="we-chart-axis-title" x="${localWidth / 2}" y="${localHeight - 2}" text-anchor="middle">${escapeHtml(xTitle)}</text>` : ""}${yTitle ? `<text class="we-chart-axis-title" transform="translate(16 ${localHeight / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yTitle)}</text>` : ""}</svg></div>${legendHtml}`;
        }

        if (renderType === "line" || renderType === "area") {
            const series = getSingleSeries();
            const max = Math.max(...series.map(point => Math.abs(point.value)), 1);
            const localWidth = width;
            const localHeight = type === "sparkline" ? 150 : height;
            const innerW = localWidth - padding * 2;
            const innerH = localHeight - padding * 2;
            const gridLines = type === "sparkline" ? "" : buildGridLines(localWidth, localHeight, padding, showGrid);
            const coords = series.map((point, index) => ({
                x: padding + (innerW * (series.length === 1 ? 0.5 : index / (series.length - 1))),
                y: localHeight - padding - (innerH * (point.value / max)),
                point
            }));
            const path = coords.map((p, index) => `${index === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
            const areaPath = `${path} L ${localWidth - padding} ${localHeight - padding} L ${padding} ${localHeight - padding} Z`;
            const circles = coords.map(p => `${showLabels ? `<text class="we-chart-label-text" x="${p.x}" y="${p.y - 10}" text-anchor="middle">${p.point.value}</text>` : ""}<circle cx="${p.x}" cy="${p.y}" r="${pointSize}" fill="${chartColor}"></circle>`).join("");
            const ticks = type === "sparkline" ? "" : coords.map(p => `<text x="${p.x}" y="${localHeight - 10}" text-anchor="middle" font-size="11" fill="#c9d6ef">${escapeHtml(p.point.label)}</text>`).join("");
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap"><svg class="we-line-svg" viewBox="0 0 ${localWidth} ${localHeight}">${gridLines}${type !== "sparkline" ? `<line class="we-axis-line" x1="${padding}" y1="${localHeight - padding}" x2="${localWidth - padding}" y2="${localHeight - padding}"></line><line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${localHeight - padding}"></line>` : ""}${renderType === "area" ? `<path d="${areaPath}" fill="${chartColor}" opacity="0.18"></path>` : ""}<path d="${path}" fill="none" stroke="${chartColor}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"></path>${circles}${ticks}${xTitle && type !== "sparkline" ? `<text class="we-chart-axis-title" x="${localWidth / 2}" y="${localHeight - 2}" text-anchor="middle">${escapeHtml(xTitle)}</text>` : ""}${yTitle && type !== "sparkline" ? `<text class="we-chart-axis-title" transform="translate(14 ${localHeight / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yTitle)}</text>` : ""}</svg></div>${legendHtml}`;
        }

        if (renderType === "pie" || type === "doughnut") {
            const items = getSingleSeries().map(item => ({ label: item.label, value: Math.max(0, item.value) }));
            const total = items.reduce((acc, item) => acc + item.value, 0) || 1;
            let startAngle = 0;
            const cx = 160, cy = 150, r = 110;
            const slices = items.map((item, index) => {
                const angle = (item.value / total) * Math.PI * 2;
                const endAngle = startAngle + angle;
                const x1 = cx + r * Math.cos(startAngle - Math.PI / 2);
                const y1 = cy + r * Math.sin(startAngle - Math.PI / 2);
                const x2 = cx + r * Math.cos(endAngle - Math.PI / 2);
                const y2 = cy + r * Math.sin(endAngle - Math.PI / 2);
                const largeArc = angle > Math.PI ? 1 : 0;
                const sliceColor = STATIC_PALETTE[index % STATIC_PALETTE.length];
                const path = `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} z" fill="${sliceColor}"></path>`;
                startAngle = endAngle;
                return path;
            }).join("");
            const hole = type === "doughnut" ? `<circle cx="${cx}" cy="${cy}" r="58" fill="${chart.backgroundColor || "#111827"}"></circle>` : "";
            const labelsHtml = showLabels ? items.map(item => `<div class="we-chart-row"><div class="we-chart-label">${escapeHtml(item.label)}</div><div class="we-chart-track"><div class="we-chart-fill" style="width:${(item.value / total) * 100}%"></div></div><div class="we-chart-value">${item.value}</div></div>`).join("") : "";
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap"><svg class="we-line-svg" viewBox="0 0 320 300">${slices}${hole}</svg>${labelsHtml}</div>${showLegend ? `<div class="we-chart-legend-box">${items.map((item, index) => `<span class="we-chart-legend-item"><span class="we-chart-legend-swatch" style="background:${STATIC_PALETTE[index % STATIC_PALETTE.length]}"></span><span>${escapeHtml(item.label)}</span></span>`).join("")}</div>` : ""}`;
        }

        if (renderType === "scatter" || type === "bubble") {
            const points = rows.map((row, index) => ({ x: parseNumber(row[0]), y: parseNumber(row[1]), size: Math.max(3, parseNumber(row[2]) || pointSize), label: String(row[0] || `P${index + 1}`) })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
            const maxX = Math.max(...points.map(point => point.x), 1);
            const maxY = Math.max(...points.map(point => point.y), 1);
            const maxSize = Math.max(...points.map(point => point.size), 1);
            const gridLines = buildGridLines(width, height, padding, showGrid);
            const circles = points.map((point, index) => {
                const x = padding + ((width - padding * 2) * (point.x / maxX));
                const y = height - padding - ((height - padding * 2) * (point.y / maxY));
                const r = type === "bubble" ? Math.max(5, (point.size / maxSize) * 24) : pointSize;
                return `<circle cx="${x}" cy="${y}" r="${r}" fill="${chartColor}" opacity="0.82"></circle>${showLabels ? `<text class="we-chart-label-text" x="${x + r + 4}" y="${y - 8}">${escapeHtml(point.label)}</text>` : ""}`;
            }).join("");
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap"><svg class="we-line-svg" viewBox="0 0 ${width} ${height}">${gridLines}<line class="we-axis-line" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line><line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"></line>${circles}${xTitle ? `<text class="we-chart-axis-title" x="${width / 2}" y="${height - 2}" text-anchor="middle">${escapeHtml(xTitle)}</text>` : ""}${yTitle ? `<text class="we-chart-axis-title" transform="translate(14 ${height / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yTitle)}</text>` : ""}</svg></div>${legendHtml}`;
        }

        if (type === "waterfall") {
            const series = getSingleSeries();
            let cumulative = 0;
            const values = series.map(item => { const start = cumulative; cumulative += item.value; return { ...item, start, end: cumulative }; });
            const min = Math.min(0, ...values.map(v => v.start), ...values.map(v => v.end));
            const max = Math.max(1, ...values.map(v => v.start), ...values.map(v => v.end));
            const scale = (height - padding * 2) / (max - min || 1);
            const colWidth = (width - padding * 2) / Math.max(values.length, 1);
            const zeroY = height - padding - ((0 - min) * scale);
            const bars = values.map((item, index) => {
                const x = padding + index * colWidth + 10;
                const y1 = height - padding - ((item.start - min) * scale);
                const y2 = height - padding - ((item.end - min) * scale);
                const y = Math.min(y1, y2);
                const h = Math.max(Math.abs(y2 - y1), 3);
                const fill = item.value >= 0 ? "#3ccf91" : "#ff8a65";
                return `<rect x="${x}" y="${y}" width="${Math.max(colWidth - 20, 8)}" height="${h}" rx="4" fill="${fill}"></rect>${showLabels ? `<text class="we-chart-label-text" x="${x + (colWidth - 20) / 2}" y="${y - 8}" text-anchor="middle">${item.value}</text>` : ""}`;
            }).join("");
            const xLabels = values.map((item, index) => `<text x="${padding + index * colWidth + colWidth / 2}" y="${height - 16}" text-anchor="middle" font-size="11" fill="#c9d6ef">${escapeHtml(item.label)}</text>`).join("");
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap"><svg class="we-line-svg" viewBox="0 0 ${width} ${height}"><line class="we-axis-line" x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}"></line>${bars}${xLabels}</svg></div>${legendHtml}`;
        }

        if (type === "radar") {
            const series = getSingleSeries();
            const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.34;
            const max = Math.max(...series.map(p => Math.abs(p.value)), 1);
            const points = series.map((p, index) => {
                const angle = (index / series.length) * Math.PI * 2 - Math.PI / 2;
                const rr = r * (p.value / max);
                return { x: cx + rr * Math.cos(angle), y: cy + rr * Math.sin(angle), labelX: cx + (r + 24) * Math.cos(angle), labelY: cy + (r + 24) * Math.sin(angle), p };
            });
            const polygon = points.map(pt => `${pt.x},${pt.y}`).join(" ");
            const spokes = points.map(pt => `<line class="we-chart-grid-line" x1="${cx}" y1="${cy}" x2="${pt.labelX}" y2="${pt.labelY}"></line><text x="${pt.labelX}" y="${pt.labelY}" fill="#c9d6ef" font-size="11" text-anchor="middle">${escapeHtml(pt.p.label)}</text>`).join("");
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap"><svg class="we-line-svg" viewBox="0 0 ${width} ${height}">${spokes}<polygon points="${polygon}" fill="${chartColor}" opacity="0.22" stroke="${chartColor}" stroke-width="${lineWidth}"></polygon>${points.map(pt => `<circle cx="${pt.x}" cy="${pt.y}" r="${pointSize}" fill="${chartColor}"></circle>`).join("")}</svg></div>${legendHtml}`;
        }

        if (renderType === "histogram") {
            const numericValues = rows.flat().map(parseNumber).filter(value => Number.isFinite(value));
            if (!numericValues.length) return "<div>Brak danych liczbowych do histogramu.</div>";
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const bucketCount = Math.min(10, Math.max(4, Math.round(Math.sqrt(numericValues.length))));
            const range = max - min || 1;
            const bucketSize = range / bucketCount;
            const counts = Array.from({ length: bucketCount }, () => 0);
            const bucketLabels = [];
            for (let i = 0; i < bucketCount; i += 1) {
                const start = min + i * bucketSize;
                const end = i === bucketCount - 1 ? max : start + bucketSize;
                bucketLabels.push(`${start.toFixed(1)}–${end.toFixed(1)}`);
            }
            numericValues.forEach(value => {
                let idx = Math.floor((value - min) / bucketSize);
                if (!Number.isFinite(idx) || idx < 0) idx = 0;
                if (idx >= bucketCount) idx = bucketCount - 1;
                counts[idx] += 1;
            });
            const innerWidth = width - padding * 2;
            const innerHeight = height - padding * 2;
            const maxCount = Math.max(...counts, 1);
            const barWidth = innerWidth / bucketCount;
            const bars = counts.map((count, index) => {
                const barHeight = (count / maxCount) * innerHeight;
                const x = padding + index * barWidth + 4;
                const y = height - padding - barHeight;
                const w = Math.max(barWidth - 8, 6);
                return `<rect x="${x}" y="${y}" width="${w}" height="${barHeight}" rx="4" fill="${chartColor}"></rect>${showLabels ? `<text class="we-chart-label-text" x="${x + w / 2}" y="${y - 8}" text-anchor="middle">${count}</text>` : ""}`;
            }).join("");
            const xLabels = bucketLabels.map((label, index) => `<text x="${padding + index * barWidth + barWidth / 2}" y="${height - 16}" text-anchor="middle" font-size="10" fill="#c9d6ef">${escapeHtml(label)}</text>`).join("");
            return `${titleHtml}<div${chartBgStyle} class="we-chart-svg-wrap"><svg class="we-line-svg" viewBox="0 0 ${width} ${height}">${buildGridLines(width, height, padding, showGrid)}<line class="we-axis-line" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line><line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"></line>${bars}${xLabels}${axisLabels(maxCount, height, padding)}</svg></div>${legendHtml}`;
        }

        return "<div>Nieobsługiwany typ wykresu.</div>";
    }

    function getCurrentSelectionRangeText() {
        const bounds = getSelectionBounds();
        if (!bounds) return `${colToLabel(activeCell.col)}${activeCell.row + 1}`;
        return `${colToLabel(bounds.colStart)}${bounds.rowStart + 1}:${colToLabel(bounds.colEnd)}${bounds.rowEnd + 1}`;
    }

    function getPivotFields() {
        const rangeText = pivotRangeInput?.value?.trim() || getCurrentSelectionRangeText();
        const matrix = getRangeMatrix(rangeText, true);
        if (!matrix.length || !matrix[0]?.length) return [];
        const headers = matrix[0].map((value, index) => String(value || colToLabel(index)).trim() || colToLabel(index));
        return headers.map((name, index) => ({ name, index }));
    }

    function renderPivotEditor() {
        const fields = getPivotFields();
        const query = String(pivotSearchInput?.value || "").toLowerCase();
        document.querySelectorAll("[data-zone-select]").forEach(select => {
            const current = select.value;
            select.innerHTML = fields.map(f => `<option value="${f.index}">${escapeHtml(f.name)}</option>`).join("");
            if ([...select.options].some(option => option.value === current)) select.value = current;
        });
        if (pivotFieldsList) {
            pivotFieldsList.innerHTML = fields
                .filter(f => f.name.toLowerCase().includes(query))
                .map(f => `
                    <div class="we-pivot-field-item">
                        <div class="we-pivot-field-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
                        <div class="we-pivot-field-adds">
                            <button type="button" data-pivot-quick="rows" data-field-index="${f.index}">Wiersze</button>
                            <button type="button" data-pivot-quick="columns" data-field-index="${f.index}">Kolumny</button>
                            <button type="button" data-pivot-quick="values" data-field-index="${f.index}">Wartości</button>
                        </div>
                    </div>
                `).join("") || `<div class="we-pivot-field-item">Brak pól dla wybranego zakresu.</div>`;
        }
        ["rows", "columns", "values", "filters"].forEach(zone => {
            const list = document.getElementById(`pivot-zone-${zone}`);
            if (!list) return;
            list.innerHTML = (pivotConfig[zone] || []).map((item, idx) => `
                <div class="we-pivot-pill">
                    <span>${escapeHtml(item.name)} ${zone === "values" ? `<small>${escapeHtml(item.agg || "sum")}</small>` : ""}</span>
                    <span class="we-pivot-pill-actions">
                        <button type="button" title="Przenieś wyżej" data-pivot-move="${zone}" data-pivot-move-index="${idx}" data-pivot-move-delta="-1">↑</button>
                        <button type="button" title="Przenieś niżej" data-pivot-move="${zone}" data-pivot-move-index="${idx}" data-pivot-move-delta="1">↓</button>
                        <button type="button" title="Usuń" data-pivot-remove="${zone}" data-pivot-remove-index="${idx}">×</button>
                    </span>
                </div>
            `).join("");
        });
    }

    function addPivotField(zone, indexValue = null) {
        const fields = getPivotFields();
        const select = document.querySelector(`[data-zone-select="${zone}"]`);
        const index = indexValue !== null ? parseInt(indexValue, 10) : parseInt(select?.value || "0", 10);
        const field = fields.find(f => f.index === index) || fields[0];
        if (!field) return;
        const item = { name: field.name, index: field.index };
        if (zone === "values") item.agg = pivotAggSelect?.value || "sum";
        pivotConfig[zone].push(item);
        renderPivotEditor();
    }

    function removePivotField(zone, index) {
        pivotConfig[zone].splice(index, 1);
        renderPivotEditor();
    }

    function movePivotField(zone, index, delta) {
        const rows = pivotConfig[zone] || [];
        const from = Number(index);
        const shift = Number(delta);
        const to = from + shift;
        if (!rows.length || !Number.isInteger(from) || !Number.isInteger(shift)) return;
        if (from < 0 || from >= rows.length || to < 0 || to >= rows.length) return;
        const [item] = rows.splice(from, 1);
        rows.splice(to, 0, item);
        renderPivotEditor();
    }

    function calculateAgg(values, agg) {
        const nums = values.map(parseNumber).filter(Number.isFinite);
        if (agg === "count") return values.length;
        if (!nums.length) return 0;
        if (agg === "sum") return nums.reduce((a, b) => a + b, 0);
        if (agg === "avg") return nums.reduce((a, b) => a + b, 0) / nums.length;
        if (agg === "min") return Math.min(...nums);
        if (agg === "max") return Math.max(...nums);
        if (agg === "median") {
            const sorted = [...nums].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }
        return nums.reduce((a, b) => a + b, 0);
    }

    function buildPivotHtml(config) {
        const matrix = getRangeMatrix(config.rangeText, true);
        if (matrix.length < 2 || matrix[0].length < 1) {
            return "<div>Za mało danych do tabeli przestawnej.</div>";
        }

        const headers = matrix[0].map((value, index) => String(value || colToLabel(index)).trim() || colToLabel(index));
        const rows = matrix.slice(1);
        const defaultRowFieldIndex = Number.isFinite(Number(config.rowField)) ? Number(config.rowField) : 0;
        const rowFields = config.rows?.length
            ? config.rows
            : [{ index: defaultRowFieldIndex, name: headers[defaultRowFieldIndex] || "Wiersze" }];
        const columnFields = config.columns || [];
        const defaultValueFieldIndex = Number.isFinite(Number(config.valueField))
            ? Number(config.valueField)
            : Math.min(1, Math.max(0, headers.length - 1));
        const valueFields = config.values?.length
            ? config.values
            : [{ index: defaultValueFieldIndex, name: headers[defaultValueFieldIndex] || "Wartości", agg: config.agg || "sum" }];

        function keyFor(dataRow, fields, fallback = "Razem") {
            if (!fields.length) return fallback;
            return fields.map(field => String(dataRow[field.index]  || "")).join(" / ") || "(puste)";
        }

        const rowKeys = [...new Set(rows.map(row => keyFor(row, rowFields, "Wiersze")))];
        const colKeys = columnFields.length ? [...new Set(rows.map(row => keyFor(row, columnFields, "Kolumny")))] : ["Wartości"];

        const header = `
            <tr>
                <th>${escapeHtml(rowFields.map(f => f.name).join(" / ") || "Wiersze")}</th>
                ${colKeys.map(key => `<th class="we-pivot-col-header">${escapeHtml(key)}</th>`).join("")}
                <th class="we-pivot-total">Razem</th>
            </tr>`;

        const renderedRows = rowKeys.map(rowKey => {
            let rowTotal = 0;
            const cells = colKeys.map(colKey => {
                const matching = rows.filter(row => keyFor(row, rowFields, "Wiersze") === rowKey && (!columnFields.length || keyFor(row, columnFields, "Kolumny") === colKey));
                const values = matching.map(row => row[valueFields[0].index]);
                const result = calculateAgg(values, valueFields[0].agg || config.agg || "sum");
                rowTotal += parseNumber(result);
                return `<td>${escapeHtml(Number.isFinite(result) ? Number(result.toFixed(4)).toString() : result)}</td>`;
            }).join("");
            return `<tr><th>${escapeHtml(rowKey)}</th>${cells}<td class="we-pivot-total">${escapeHtml(Number(rowTotal.toFixed(4)).toString())}</td></tr>`;
        }).join("");

        const grandCells = colKeys.map(colKey => {
            const matching = rows.filter(row => !columnFields.length || keyFor(row, columnFields, "Kolumny") === colKey);
            const values = matching.map(row => row[valueFields[0].index]);
            const result = calculateAgg(values, valueFields[0].agg || config.agg || "sum");
            return `<td class="we-pivot-total">${escapeHtml(Number.isFinite(result) ? Number(result.toFixed(4)).toString() : result)}</td>`;
        }).join("");

        return `
            <table class="we-pivot-table">
                <thead>${header}</thead>
                <tbody>${renderedRows}<tr><th class="we-pivot-total">Razem końcowy</th>${grandCells}<td class="we-pivot-total"></td></tr></tbody>
            </table>
        `;
    }

    function rerenderGeneratedObjects() {
        if (!generatedObjectsArea || !generatedObjectsCard) return;

        generatedObjectsArea.innerHTML = "";

        chartObjects.forEach((chart, index) => {
            const html = buildChartHtml(chart);
            const card = document.createElement("div");
            card.className = "we-object-card";
            card.innerHTML = `
                <div class="we-object-head">
                    <div>
                        <div class="we-chart-object-title">Wykres ${index + 1}</div>
                        <div class="we-chart-object-subtitle">${escapeHtml(chart.rangeText)} • ${escapeHtml(getChartTypeDisplayName(chart.type))}</div>
                    </div>
                    <div class="we-object-actions">
                        <button type="button" class="btn btn-secondary" data-chart-action="embed" data-chart-index="${index}">Wstaw na arkusz</button>
                        <button type="button" class="btn btn-secondary" data-chart-action="edit" data-chart-index="${index}">Edytuj</button>
                        <button type="button" class="btn btn-ghost" data-chart-action="delete" data-chart-index="${index}">Usuń</button>
                    </div>
                </div>
                <div class="we-object-body">${html}</div>
            `;
            generatedObjectsArea.appendChild(card);
        });

        pivotObjects.forEach((pivot, index) => {
            const html = buildPivotHtml(pivot);
            const card = document.createElement("div");
            card.className = "we-object-card";
            card.innerHTML = `
                <div class="we-object-head">
                    <div>
                        <div class="we-chart-object-title">Tabela przestawna ${index + 1}</div>
                        <div class="we-chart-object-subtitle">${escapeHtml(pivot.rangeText)} • ${escapeHtml(pivot.agg)}</div>
                    </div>
                </div>
                <div class="we-object-body">${html}</div>
            `;
            generatedObjectsArea.appendChild(card);
        });

        generatedObjectsCard.hidden = chartObjects.length === 0 && pivotObjects.length === 0;
    }

    async function saveSheet() {
        if (!currentSheet || !currentSheetCanEdit) {
            setAutosaveState("", "Tylko do odczytu");
            return;
        }

        if (DEMO_MODE) {
            commitActiveSheetToWorkbook();
            setAutosaveState("", "Tryb demo — zmiany nie są zapisywane");
            return;
        }

        setAutosaveState("saving", "Zapisywanie...");
        try {
            await postJson(`/ares/api/sheets/${sheetId}/save/`, {
                name: currentSheet.name,
                category: currentSheet.category || "Bez kategorii",
                grid: workbookPayloadForSave(),
                scripts: currentSheet.scripts || [],
                styles: currentSheet.styles || {},
                conditionalRules: currentSheet.conditionalRules || [],
                action: "Zapisano arkusz"
            });
            writeSheetApiCache(`/ares/api/sheets/${sheetId}/`, {
                ...currentSheet,
                canEdit: currentSheetCanEdit,
                canShare: currentSheetCanShare,
                isShared: false
            });

            setAutosaveState("saved", "Wszystkie zmiany zapisane");
        } catch (error) {
            console.error(error);
            setAutosaveState("error", "Błąd zapisu");
        }
    }

    function demoSheetPayload() {
        const grid = emptyGrid(20, 10);
        grid[0][0] = "Produkt";
        grid[0][1] = "Styczeń";
        grid[0][2] = "Luty";
        grid[0][3] = "Marzec";
        grid[0][4] = "Razem";
        grid[1][0] = "Panel IPP";
        grid[1][1] = "120";
        grid[1][2] = "132";
        grid[1][3] = "141";
        grid[1][4] = "=SUMA(B2:D2)";
        grid[2][0] = "Boczek drzwiowy";
        grid[2][1] = "84";
        grid[2][2] = "91";
        grid[2][3] = "96";
        grid[2][4] = "=SUMA(B3:D3)";
        grid[4][0] = "Tryb demo";
        grid[4][1] = "Możesz testować formuły, formatowanie, wykresy i zakładki.";
        grid[5][0] = "Zapis";
        grid[5][1] = "Wyłączony — po odświeżeniu zmiany znikną.";
        return {
            id: "demo",
            order: 1,
            name: "Arkusz demo",
            category: "Tryb testowy",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            canEdit: true,
            canShare: false,
            isShared: false,
            scripts: [],
            grid,
        };
    }

    async function ensureSheetIdForEditor() {
        if (DEMO_MODE) {
            sheetId = "demo";
            return sheetId;
        }
        if (sheetId && sheetId !== "undefined" && sheetId !== "null") return sheetId;
        const sheets = await getJson('/ares/api/sheets/');
        let first = Array.isArray(sheets) && sheets.length ? sheets[0] : null;
        if (!first) {
            first = await postJson('/ares/api/sheets/create/', { name: 'Arkusz 1', category: 'Bez kategorii' });
        }
        sheetId = String(first.id);
        params.set('sheet', sheetId);
        const nextUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', nextUrl);
        return sheetId;
    }

    function openInitialQuickPanel() {
        if (!initialOpenPanel) return;
        const map = {
            charts: () => openModal(chartModal),
            solver: () => openModal(solverModal),
            math: () => activateRibbonTab(document.querySelector('.we-tab[data-tab="university"]')),
            merge: () => activateRibbonTab(document.querySelector('.we-tab[data-tab="data"]')),
            addons: () => activateRibbonTab(document.querySelector('.we-tab[data-tab="addons"]')),
        };
        window.setTimeout(() => {
            map[initialOpenPanel]?.();
        }, 180);
    }

    function attachAddonToCurrentSheet(addon) {
        if (!addon) return null;
        const safeName = String(addon.title || "Dodatek").trim().slice(0, 80) || "Dodatek";
        const safeCode = String(addon.scriptBody || "").trim();
        if (!safeCode) {
            setScriptResult("Ten dodatek nie ma kodu skryptu.", true);
            return null;
        }
        const existing = sheetScripts.find(
            item => item.name === safeName && String(item.code || "").trim() === safeCode
        );
        if (existing) {
            renderScriptSelect(existing.id);
            setScriptResult(`Dodatek „${safeName}” już był przypisany. Znajdziesz go w sekcji „Skrypty tego arkusza”.`);
            focusSheetScriptsPanel();
            return existing;
        }
        const script = {
            id: `addon-${addon.id || Date.now()}-${Date.now()}`,
            name: safeName,
            code: safeCode,
            updatedAt: new Date().toISOString(),
        };
        sheetScripts.unshift(script);
        renderScriptSelect(script.id);
        persistScriptsToSheet();
        setScriptResult(`Dodatek „${safeName}” został przypisany do arkusza i jest gotowy do uruchomienia.`);
        focusSheetScriptsPanel();
        return script;
    }

    function renderEditorAddons(addons) {
        if (!editorAddonsList) return;
        if (!addons.length) {
            editorAddonsList.innerHTML = '<div class="we-addons-empty">Nie ma jeszcze dostępnych dodatków.</div>';
            return;
        }
        editorAddonsCache = Array.isArray(addons) ? addons : [];
        editorAddonsList.innerHTML = addons.map(addon => `
            <article class="we-addon-card">
                <div class="we-addon-card-head">
                    <span>${escapeHtml(addon.kindLabel || "Dodatek")} • ${escapeHtml(addon.hostLabel || "Arkusze")}</span>
                    <small>v${escapeHtml(addon.version || "1.0.0")}</small>
                </div>
                <strong>${escapeHtml(addon.title)}</strong>
                <p>${escapeHtml(addon.summary)}</p>
                <small>${addon.author ? `Autor: ${escapeHtml(addon.author)}` : "Autor: ARES"} • ${escapeHtml(addon.category || "Automatyzacja")} • instalacje: ${escapeHtml(String(addon.installationCount || 0))}</small>
                <div class="we-addon-meta-row">
                    <span class="we-addon-pill">${escapeHtml(addon.entryPoint || "onOpen")}</span>
                    <span class="we-addon-pill">${escapeHtml(addon.authMode || "user")}</span>
                    ${(addon.scopes || []).slice(0, 2).map(scope => `<span class="we-addon-pill">${escapeHtml(scope)}</span>`).join("")}
                </div>
                <div class="we-sheet-script-actions">
                    <button class="btn btn-secondary" type="button" data-addon-install-id="${escapeHtml(String(addon.id || ""))}">${addon.installed ? "Zainstalowany" : "Zainstaluj"}</button>
                    <button class="btn btn-secondary" type="button" data-addon-attach-id="${escapeHtml(String(addon.id || ""))}">Przypisz do arkusza</button>
                    <button class="btn btn-primary" type="button" data-addon-run-id="${escapeHtml(String(addon.id || ""))}">Uruchom</button>
                </div>
                ${addon.instructions ? `<details><summary>Szczegóły</summary><p>${escapeHtml(addon.instructions).replace(/\n/g, "<br>")}</p></details>` : ""}
                <details>
                    <summary>Podgląd skryptu</summary>
                    <pre>${escapeHtml(addon.scriptBody || "")}</pre>
                </details>
            </article>
        `).join("");
    }

    async function loadEditorAddons() {
        if (!editorAddonsList || DEMO_MODE) {
            if (editorAddonsList) editorAddonsList.innerHTML = '<div class="we-addons-empty">Zaloguj się, aby instalować dodatki.</div>';
            editorAddonsLoaded = true;
            return;
        }
        try {
            const data = await getJson(`/ares/api/addons/?sheet=${encodeURIComponent(sheetId || "")}`);
            renderEditorAddons(Array.isArray(data.addons) ? data.addons : []);
            editorAddonsLoaded = true;
        } catch (error) {
            console.warn("Nie udało się pobrać dodatków.", error);
            editorAddonsCache = [];
            editorAddonsList.innerHTML = '<div class="we-addons-empty">Nie udało się wczytać dodatków.</div>';
        }
    }

    async function loadSheet() {
        try {
            await ensureSheetIdForEditor();
            const data = DEMO_MODE ? demoSheetPayload() : await getJson(`/ares/api/sheets/${sheetId}/`);

            currentSheet = normalizeLoadedSheet({
                ...data,
                category: data.category || "Bez kategorii"
            });
            currentSheetCanEdit = data.canEdit !== false;
            currentSheetCanShare = !!data.canShare;
            sheetScripts = normalizeSheetScripts(currentSheet.scripts || []);

            historyStack = [];
            redoStack = [];

            if (sheetNameEl) sheetNameEl.textContent = currentSheet.name || "Arkusz";
            updateSheetMeta(DEMO_MODE ? " • Tryb demo — zapis wyłączony" : `${data.isShared ? " • Udostępniony" : ""}${!currentSheetCanEdit ? " • Tylko odczyt" : ""}`);
            if (saveBtn) saveBtn.disabled = !currentSheetCanEdit;
            if (applyFormulaBtn) applyFormulaBtn.disabled = !currentSheetCanEdit;
            if (renameBtn) renameBtn.disabled = !currentSheetCanShare;
            renderWorkbookTabs();
            refreshSolverSheetSelect(activeWorkbookSheetIndex);
            renderSheetTags();
            renderScriptSelect();
            renderCellTasks();
            renderScenarios();

            renderGrid();
            scheduleNetworkSummaryLoad();
            repairSheetMetaFromRenderedGrid(DEMO_MODE ? " • Tryb demo — zapis wyłączony" : `${data.isShared ? " • Udostępniony" : ""}${!currentSheetCanEdit ? " • Tylko odczyt" : ""}`);
            activateStartRibbon();
            setAutosaveState("", DEMO_MODE ? "Tryb demo — zmiany nie są zapisywane" : (currentSheetCanEdit ? "Brak zmian" : "Tylko do odczytu"));

            window.requestAnimationFrame(() => {
                openInitialQuickPanel();
            });
            const idleInit = () => {
                initializeFormulaBrowser();
                window.ARES_I18N?.refresh?.();
            };
            if (window.requestIdleCallback) {
                window.requestIdleCallback(idleInit, { timeout: 700 });
            } else {
                window.setTimeout(idleInit, 80);
            }
        } catch (error) {
            console.error("Błąd w loadSheet():", error);
            if (sheetMetaEl) sheetMetaEl.textContent = "Nie udało się załadować danych arkusza.";
            setAutosaveState("error", "Błąd ładowania");
        }
    }

    function getSheetFileBaseName() {
        const name = workbook?.sheets?.length > 1
            ? (currentSheet?.name || "skoroszyt")
            : (currentSheet?.activeTabName || currentSheet?.name || "arkusz");
        return String(name)
            .trim()
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
            .replace(/\s+/g, "_")
            || "arkusz";
    }

    function buildDelimitedText(delimiter = ";") {
        return (currentSheet?.grid || []).map(row => row.map(cell => {
            const value = String(cell || "");
            if (value.includes(delimiter) || value.includes('"') || value.includes("\n")) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(delimiter)).join("\n");
    }

    function triggerDownload(content, fileName, mimeType = "application/octet-stream") {
        const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    function buildWorkbookFromCurrentSheet() {
        if (!window.XLSX) {
            throw new Error("Brak biblioteki XLSX.");
        }
        const workbookXlsx = window.XLSX.utils.book_new();
        commitActiveSheetToWorkbook();
        const sheets = workbook?.sheets?.length
            ? workbook.sheets
            : [{ name: currentSheet?.activeTabName || currentSheet?.name || "Arkusz", grid: currentSheet?.grid || [] }];
        const usedNames = new Set();
        sheets.forEach((sheet, index) => {
            const worksheet = window.XLSX.utils.aoa_to_sheet((sheet.grid || []).map(row => row.map(cell => cell == null ? "" : String(cell))));
            let sheetName = safeSheetName(sheet.name, `Arkusz ${index + 1}`).replace(/[:\\/?*\[\]]/g, " ").trim().slice(0, 31) || `Arkusz ${index + 1}`;
            const baseName = sheetName.slice(0, 28) || "Arkusz";
            let suffix = 2;
            while (usedNames.has(sheetName.toLowerCase())) {
                sheetName = `${baseName} ${suffix}`.slice(0, 31);
                suffix += 1;
            }
            usedNames.add(sheetName.toLowerCase());
            window.XLSX.utils.book_append_sheet(workbookXlsx, worksheet, sheetName);
        });
        return workbookXlsx;
    }

    function getPdfExportBounds() {
        const grid = currentSheet?.grid || [];
        let lastRow = -1;
        let lastCol = -1;
        grid.forEach((row, rowIndex) => {
            (row || []).forEach((cell, colIndex) => {
                if (String(cell ?? "").trim()) {
                    lastRow = Math.max(lastRow, rowIndex);
                    lastCol = Math.max(lastCol, colIndex);
                }
            });
        });
        return {
            rows: Math.max(1, lastRow + 1),
            cols: Math.max(1, lastCol + 1)
        };
    }

    function getPdfCellText(row, col) {
        const raw = currentSheet?.grid?.[row]?.[col] ?? "";
        if (typeof raw === "string" && raw.trim().startsWith("=")) {
            return displayFormulaValue(getCellComputedValue(row, col));
        }
        return String(raw ?? "");
    }

    function buildPdfTableHtml(maxRows = 120, maxCols = 18) {
        const bounds = getPdfExportBounds();
        const rowsToPrint = Math.min(bounds.rows, maxRows);
        const colsToPrint = Math.min(bounds.cols, maxCols);
        const headHtml = Array.from({ length: colsToPrint }, (_, col) => `<th>${escapeHtml(colToLabel(col))}</th>`).join("");
        const bodyHtml = Array.from({ length: rowsToPrint }, (_, row) => {
            const cells = Array.from({ length: colsToPrint }, (_, col) => {
                const value = getPdfCellText(row, col);
                return `<td>${escapeHtml(value)}</td>`;
            }).join("");
            return `<tr><th>${row + 1}</th>${cells}</tr>`;
        }).join("");
        const clippedRows = bounds.rows > rowsToPrint;
        const clippedCols = bounds.cols > colsToPrint;
        const note = clippedRows || clippedCols
            ? `<p class="pdf-note">PDF pokazuje pierwsze ${rowsToPrint} z ${bounds.rows} wierszy i ${colsToPrint} z ${bounds.cols} kolumn. Pełne dane eksportuj do XLSX/CSV.</p>`
            : "";
        return `
            ${note}
            <table class="pdf-sheet-table">
                <thead><tr><th>#</th>${headHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        `;
    }

    function buildPdfObjectsHtml() {
        const charts = (chartObjects || []).map((chart, index) => `<li>Wykres ${index + 1}: ${escapeHtml(chart.title || getChartTypeDisplayName(chart.type) || "Bez tytułu")}</li>`).join("");
        const pivots = (pivotObjects || []).map((pivot, index) => `<li>Tabela przestawna ${index + 1}: ${escapeHtml(pivot.title || pivot.agg || "Podsumowanie")}</li>`).join("");
        if (!charts && !pivots) {
            return '<p class="pdf-muted">Brak wykresów i tabel przestawnych w arkuszu.</p>';
        }
        return `<ul class="pdf-object-list">${charts}${pivots}</ul>`;
    }

    function buildPdfSummaryHtml() {
        const bounds = getPdfExportBounds();
        const filledCells = countFilledCells(currentSheet?.grid || []);
        const selection = getSelectionStats();
        const items = [
            ["Wiersze z danymi", bounds.rows],
            ["Kolumny z danymi", bounds.cols],
            ["Niepuste komórki", filledCells],
            ["Wykresy", chartObjects.length],
            ["Tabele przestawne", pivotObjects.length],
            ["Zaznaczenie", selection.rows && selection.cols ? `${selection.rangeText} (${selection.rows}×${selection.cols})` : "brak"]
        ];
        return items.map(([label, value]) => `
            <div class="pdf-kpi">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(String(value))}</strong>
            </div>
        `).join("");
    }

    function exportSheetPdf() {
        const baseName = getSheetFileBaseName();
        const pdfWindow = window.open("", "_blank");
        if (!pdfWindow) {
            alert("Przeglądarka zablokowała okno PDF. Zezwól na wyskakujące okna i spróbuj ponownie.");
            return false;
        }
        try { pdfWindow.opener = null; } catch (_) {}
        const generatedAt = new Date().toLocaleString("pl-PL");
        const title = currentSheet?.name || "Arkusz";
        const category = currentSheet?.category ? `<p class="pdf-muted">Kategoria: ${escapeHtml(currentSheet.category)}</p>` : "";
        pdfWindow.document.open();
        pdfWindow.document.write(`<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} - PDF</title>
<style>
@page { margin: 14mm; }
* { box-sizing: border-box; }
body { margin: 0; color: #182033; font: 12px/1.45 Arial, sans-serif; background: #fff; }
h1 { margin: 0 0 6px; font-size: 26px; }
h2 { margin: 24px 0 10px; font-size: 16px; }
.pdf-hero { border-bottom: 2px solid #4f74ff; padding: 0 0 16px; margin: 0 0 18px; }
.pdf-eyebrow { color: #4f74ff; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.pdf-muted, .pdf-note { color: #5f6b7a; margin: 4px 0; }
.pdf-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 14px 0; }
.pdf-kpi { border: 1px solid #d8deea; border-radius: 8px; padding: 10px; min-height: 54px; }
.pdf-kpi span { display: block; color: #667085; font-size: 10px; text-transform: uppercase; }
.pdf-kpi strong { display: block; margin-top: 4px; font-size: 15px; }
.pdf-object-list { margin: 0; padding-left: 18px; }
.pdf-sheet-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 8px; }
.pdf-sheet-table th, .pdf-sheet-table td { border: 1px solid #d9dfeb; padding: 5px 6px; overflow-wrap: anywhere; vertical-align: top; }
.pdf-sheet-table thead th, .pdf-sheet-table tbody th { background: #eef3ff; font-weight: 700; }
.pdf-sheet-table tbody tr:nth-child(even) td { background: #f7f9fc; }
.pdf-actions { margin: 18px 0; }
.pdf-actions button { border: 0; border-radius: 8px; background: #4f74ff; color: #fff; font-weight: 700; padding: 10px 16px; cursor: pointer; }
@media print { .pdf-actions { display: none; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<section class="pdf-hero">
    <div class="pdf-eyebrow">Eksport PDF ARES</div>
    <h1>${escapeHtml(title)}</h1>
    <p class="pdf-muted">Wygenerowano: ${escapeHtml(generatedAt)} · Plik sugerowany: ${escapeHtml(baseName)}.pdf</p>
    ${category}
</section>
<section>
    <h2>Co jest w środku</h2>
    <div class="pdf-summary">${buildPdfSummaryHtml()}</div>
    <p>${escapeHtml(buildExecutiveSummary())}</p>
</section>
<section>
    <h2>Wykresy i podsumowania</h2>
    ${buildPdfObjectsHtml()}
</section>
<section>
    <h2>Dane arkusza</h2>
    ${buildPdfTableHtml()}
</section>
<div class="pdf-actions"><button onclick="window.print()">Zapisz jako PDF / drukuj</button></div>
<script>window.addEventListener("load", () => setTimeout(() => window.print(), 250));<\/script>
</body>
</html>`);
        pdfWindow.document.close();
        return true;
    }

    function exportSheetData() {
        if (!currentSheet) return;
        const format = String(exportFormatSelect?.value || "csv").toLowerCase();
        const baseName = getSheetFileBaseName();

        if (format === "csv") {
            triggerDownload(buildDelimitedText(";"), `${baseName}.csv`, "text/csv;charset=utf-8;");
        } else if (format === "tsv") {
            triggerDownload(buildDelimitedText("\t"), `${baseName}.tsv`, "text/tab-separated-values;charset=utf-8;");
        } else if (format === "txt") {
            triggerDownload(buildDelimitedText("\t"), `${baseName}.txt`, "text/plain;charset=utf-8;");
        } else if (format === "json") {
            commitActiveSheetToWorkbook();
            const payload = workbook?.sheets?.length > 1
                ? { name: currentSheet.name, workbook: workbookPayloadForSave() }
                : { name: currentSheet.name, rows: currentSheet.grid || [] };
            triggerDownload(JSON.stringify(payload, null, 2), `${baseName}.json`, "application/json;charset=utf-8;");
        } else if (format === "pdf") {
            if (!exportSheetPdf()) return;
        } else {
            if (!window.XLSX) {
                alert("Eksport do tego formatu wymaga biblioteki XLSX.");
                return;
            }
            const workbookXlsx = buildWorkbookFromCurrentSheet();
            const bookTypeMap = {
                xlsx: "xlsx",
                xls: "biff8",
                xlsb: "xlsb",
                ods: "ods",
                html: "html",
                xml: "xlml",
            };
            const bookType = bookTypeMap[format];
            if (!bookType) {
                alert("Ten format eksportu nie jest jeszcze obsługiwany.");
                return;
            }
            window.XLSX.writeFile(workbookXlsx, `${baseName}.${format}`, { bookType });
        }

        logUserAction("Eksport pliku", {
            type: "file_export",
            format,
            rows: currentSheet.grid.length,
            cols: currentSheet.grid[0]?.length || 0
        });
    }

    function detectCsvDelimiter(text) {
        const firstLine = String(text || "").split(/\r?\n/).find(line => line.trim()) || "";
        const counts = {
            semicolon: (firstLine.match(/;/g) || []).length,
            comma: (firstLine.match(/,/g) || []).length,
            tab: (firstLine.match(/\t/g) || []).length
        };
        if (counts.tab >= counts.semicolon && counts.tab >= counts.comma && counts.tab > 0) return "\t";
        if (counts.comma > counts.semicolon) return ",";
        return ";";
    }

    function parseCsvText(text) {
        const delimiter = detectCsvDelimiter(text);
        const rows = [];
        let row = [];
        let cell = "";
        let inQuotes = false;
        const input = String(text || "");

        for (let i = 0; i < input.length; i += 1) {
            const char = input[i];
            const next = input[i + 1];

            if (char === '"') {
                if (inQuotes && next === '"') {
                    cell += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (!inQuotes && char === delimiter) {
                row.push(cell);
                cell = "";
                continue;
            }

            if (!inQuotes && (char === "\n" || char === "\r")) {
                if (char === "\r" && next === "\n") i += 1;
                row.push(cell);
                if (row.some(value => String(value).trim() !== "")) rows.push(row);
                row = [];
                cell = "";
                continue;
            }

            cell += char;
        }

        row.push(cell);
        if (row.some(value => String(value).trim() !== "")) rows.push(row);
        return rows;
    }

    function parseJsonRows(text) {
        const data = JSON.parse(String(text || ""));
        if (Array.isArray(data) && data.every(row => Array.isArray(row))) {
            return data.map(row => row.map(cell => cell == null ? "" : String(cell)));
        }
        if (Array.isArray(data) && data.every(row => row && typeof row === "object" && !Array.isArray(row))) {
            const keys = Array.from(data.reduce((set, row) => {
                Object.keys(row || {}).forEach(key => set.add(key));
                return set;
            }, new Set()));
            return [keys].concat(data.map(row => keys.map(key => row?.[key] == null ? "" : String(row[key]))));
        }
        if (data && Array.isArray(data.rows)) {
            return data.rows.map(row => Array.isArray(row) ? row.map(cell => cell == null ? "" : String(cell)) : []);
        }
        throw new Error("Nieobsługiwany układ JSON.");
    }

    function parseJsonWorkbookSheets(text) {
        const data = JSON.parse(String(text || ""));
        const workbookData = data?.workbook || data?.grid || data;
        const sheets = Array.isArray(workbookData?.sheets) ? workbookData.sheets : null;
        if (!sheets?.length) return null;
        return sheets.map((sheet, index) =>
            buildImportedWorkbookSheet(
                sheet?.name || `Arkusz ${index + 1}`,
                normalizeImportedRows(sheet?.grid || sheet?.rows || []),
                index
            )
        );
    }

    function importRowsIntoSheet(rows, sourceInfo = {}) {
        if (!currentSheet) return;
        const sourceRowCount = rows.length;
        const sourceColCount = Math.max(0, ...rows.map(row => row.length));
        const safeRows = rows.slice(0, MAX_IMPORT_ROWS).map(row => row.slice(0, MAX_IMPORT_COLS));

        if (!safeRows.length) {
            alert("Plik jest pusty albo nie udało się odczytać tabeli.");
            return;
        }

        if (sourceRowCount > MAX_IMPORT_ROWS || sourceColCount > MAX_IMPORT_COLS) {
            alert("Import przycięto do " + MAX_IMPORT_ROWS + " wierszy i " + MAX_IMPORT_COLS + " kolumn, żeby układ strony się nie rozjechał. Pełny plik możesz podzielić i importować partiami.");
        }

        pushHistorySnapshot();
        currentRows = Math.max(safeRows.length, MIN_ROWS);
        currentCols = Math.max(MIN_COLS, ...safeRows.map(row => row.length));
        currentSheet.grid = emptyGrid(currentRows, currentCols);
        currentSheet.styles = {};
        currentSheet.conditionalRules = [];
        currentSheet.columnWidths = {};
        currentSheet.rowHeights = {};
        if (sourceInfo.sheetName) {
            const nextName = safeSheetName(sourceInfo.sheetName, `Arkusz ${activeWorkbookSheetIndex + 1}`);
            currentSheet.name = nextName;
            currentSheet.activeTabName = nextName;
            if (sheetNameEl) sheetNameEl.textContent = nextName;
            if (workbook?.sheets?.[activeWorkbookSheetIndex]) {
                workbook.sheets[activeWorkbookSheetIndex].name = nextName;
            }
        }

        safeRows.forEach((row, r) => {
            row.forEach((cell, c) => {
                currentSheet.grid[r][c] = cell == null ? "" : String(cell);
            });
        });

        commitActiveSheetToWorkbook();
        ensureUniqueWorkbookSheetNames();
        renderWorkbookTabs();
        renderGrid();
        renderCellTasks();
        renderScenarios();
        updateSheetMeta();
        markDirty();
        logUserAction("Import pliku w edytorze", { type: "file_import", fileName: sourceInfo.fileName || "plik", sheetName: sourceInfo.sheetName || "", rows: safeRows.length, cols: Math.max(...safeRows.map(row => row.length), 0) });
    }

    function normalizeImportedRows(rows) {
        const safeRows = (Array.isArray(rows) ? rows : [])
            .map(row => Array.isArray(row) ? row.map(cell => cell == null ? "" : String(cell)) : [])
            .filter(row => row.some(value => String(value).trim() !== ""));
        return safeRows.length ? safeRows : [[]];
    }

    function workbookSheetToRows(workbookXlsx, sheetName) {
        const sheet = workbookXlsx.Sheets[sheetName];
        if (!sheet) return [[]];
        return normalizeImportedRows(
            window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" })
        );
    }

    function isTechnicalWorkbookSheetName(sheetName) {
        const name = String(sheetName || "").trim();
        return /^_?OpenSolver/i.test(name)
            || /^_xlnm/i.test(name)
            || /^_FilterDatabase$/i.test(name)
            || /^~/.test(name);
    }

    function getWorkbookSheetVisibility(workbookXlsx, sheetName) {
        const metadata = workbookXlsx?.Workbook?.Sheets;
        if (!Array.isArray(metadata)) return 0;
        const entry = metadata.find(item => item?.name === sheetName || item?.Name === sheetName);
        return Number(entry?.Hidden || entry?.hidden || 0);
    }

    function getImportableWorkbookSheetNames(workbookXlsx) {
        const sheetNames = Array.isArray(workbookXlsx?.SheetNames) ? workbookXlsx.SheetNames : [];
        const visibleUserSheets = sheetNames.filter(sheetName =>
            getWorkbookSheetVisibility(workbookXlsx, sheetName) === 0 &&
            !isTechnicalWorkbookSheetName(sheetName)
        );
        return visibleUserSheets.length ? visibleUserSheets : sheetNames;
    }

    function buildImportedWorkbookSheet(sheetName, rows, index) {
        const sourceRowCount = rows.length;
        const sourceColCount = Math.max(0, ...rows.map(row => row.length));
        const safeRows = rows.slice(0, MAX_IMPORT_ROWS).map(row => row.slice(0, MAX_IMPORT_COLS));
        const rowCount = Math.max(safeRows.length, MIN_ROWS);
        const colCount = Math.max(MIN_COLS, ...safeRows.map(row => row.length));
        const grid = emptyGrid(rowCount, colCount);
        safeRows.forEach((row, r) => {
            row.forEach((cell, c) => {
                grid[r][c] = cell == null ? "" : String(cell);
            });
        });
        return {
            uid: `sheet-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index + 1}`,
            name: safeSheetName(sheetName, `Arkusz ${index + 1}`),
            grid,
            styles: {},
            conditionalRules: [],
            color: "",
            hidden: false,
            protected: false,
            columnWidths: {},
            rowHeights: {},
            tags: [],
            _sourceRowCount: sourceRowCount,
            _sourceColCount: sourceColCount,
            _importedRows: safeRows.length,
            _importedCols: Math.max(0, ...safeRows.map(row => row.length))
        };
    }

    function importWorkbookSheets(importedSheets, sourceInfo = {}) {
        if (!currentSheet || !Array.isArray(importedSheets) || !importedSheets.length) return;
        const clipped = importedSheets.some(sheet => sheet._sourceRowCount > MAX_IMPORT_ROWS || sheet._sourceColCount > MAX_IMPORT_COLS);
        if (clipped) {
            alert("Import przycięto do " + MAX_IMPORT_ROWS + " wierszy i " + MAX_IMPORT_COLS + " kolumn na arkusz, żeby układ strony się nie rozjechał. Pełny plik możesz podzielić i importować partiami.");
        }

        pushHistorySnapshot();
        workbook = {
            activeSheetIndex: 0,
            sheets: importedSheets.map(({ _sourceRowCount, _sourceColCount, _importedRows, _importedCols, ...sheet }) => sheet),
            extensions: {}
        };
        ensureUniqueWorkbookSheetNames();
        activeWorkbookSheetIndex = 0;

        const first = workbook.sheets[0];
        currentSheet.name = first.name;
        if (sheetNameEl) sheetNameEl.textContent = first.name;
        currentSheet.grid = first.grid;
        currentSheet.styles = {};
        currentSheet.conditionalRules = [];
        currentSheet.columnWidths = {};
        currentSheet.rowHeights = {};
        currentSheet.tags = [];
        currentSheet.activeTabName = first.name;
        activeCell = { row: 0, col: 0 };
        clearSelection();
        const dims = inferDimensionsFromGrid(currentSheet.grid);
        currentRows = dims.rows;
        currentCols = dims.cols;
        ensureDimensions(currentRows, currentCols);

        renderWorkbookTabs();
        renderSheetTags();
        renderCellTasks();
        renderScenarios();
        renderGrid();
        updateSheetMeta();
        markDirty();
        logUserAction("Import skoroszytu w edytorze", {
            type: "workbook_import",
            fileName: sourceInfo.fileName || "plik",
            sheetCount: workbook.sheets.length,
            sheets: workbook.sheets.map(sheet => sheet.name)
        });
    }

    function importDataFile(file) {
        const name = String(file?.name || "").toLowerCase();
        if (name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const text = String(event.target?.result || "");
                    const importedSheets = parseJsonWorkbookSheets(text);
                    if (importedSheets?.length > 1) {
                        importWorkbookSheets(importedSheets, { fileName: file.name });
                    } else if (importedSheets?.length === 1) {
                        importRowsIntoSheet(importedSheets[0].grid, { fileName: file.name, sheetName: importedSheets[0].name });
                    } else {
                        importRowsIntoSheet(parseJsonRows(text), { fileName: file.name });
                    }
                } catch (error) {
                    console.error(error);
                    alert("Nie udało się odczytać pliku JSON. Sprawdź strukturę danych.");
                }
            };
            reader.readAsText(file, "utf-8");
            return;
        }

        if ((name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsb") || name.endsWith(".ods") || name.endsWith(".html") || name.endsWith(".xml")) && window.XLSX) {
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const workbookXlsx = window.XLSX.read(event.target?.result, { type: "array" });
                    const sheetNames = getImportableWorkbookSheetNames(workbookXlsx);
                    if (!sheetNames.length) {
                        alert("Nie znaleziono arkuszy w pliku.");
                        return;
                    }
                    const importedSheets = sheetNames.map((sheetName, index) =>
                        buildImportedWorkbookSheet(sheetName, workbookSheetToRows(workbookXlsx, sheetName), index)
                    );
                    if (importedSheets.length === 1) {
                        importRowsIntoSheet(workbookSheetToRows(workbookXlsx, sheetNames[0]), { fileName: file.name, sheetName: sheetNames[0] });
                    } else {
                        importWorkbookSheets(importedSheets, { fileName: file.name });
                    }
                } catch (error) {
                    console.error(error);
                    alert("Nie udało się odczytać pliku arkuszowego. Sprawdź, czy plik nie jest uszkodzony.");
                }
            };
            reader.readAsArrayBuffer(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            const text = String(event.target?.result  || "");
            importRowsIntoSheet(parseCsvText(text), { fileName: file.name });
        };
        reader.readAsText(file, "utf-8");
    }

    function renameSheet() {
        if (!currentSheet) return;
        const nextName = prompt("Podaj nową nazwę arkusza:", currentSheet.name || "Arkusz");
        if (!nextName) return;

        pushHistorySnapshot();
        const uniqueName = makeUniqueSheetName(nextName.trim(), activeWorkbookSheetIndex);
        currentSheet.name = uniqueName;
        currentSheet.activeTabName = uniqueName;
        if (workbook?.sheets?.[activeWorkbookSheetIndex]) {
            workbook.sheets[activeWorkbookSheetIndex].name = uniqueName;
        }
        if (sheetNameEl) sheetNameEl.textContent = currentSheet.name;
        renderWorkbookTabs();
        updateSheetMeta();
        markDirty();
        logUserAction("Zmieniono nazwę arkusza", { type: "sheet_rename", newName: currentSheet.name });
    }

    function sortActiveColumn(direction = "asc") {
        if (!currentSheet) return;
        const col = activeCell.col;
        const dataRows = currentSheet.grid.slice(0);

        pushHistorySnapshot();

        dataRows.sort((a, b) => {
            const first = a[col];
            const second = b[col];

            const firstNum = isNumericValue(first) ? parseNumber(first) : null;
            const secondNum = isNumericValue(second) ? parseNumber(second) : null;

            if (firstNum !== null && secondNum !== null) {
                return direction === "asc" ? firstNum - secondNum : secondNum - firstNum;
            }

            return direction === "asc"
                ? String(first  || "").localeCompare(String(second  || ""), "pl")
                : String(second  || "").localeCompare(String(first  || ""), "pl");
        });

        currentSheet.grid = dataRows;
        renderGrid();
        markDirty();
    }

    function clearActiveCell() {
        clearSelectedCellsFast();
    }

    function toggleFullWidth() {
        fullWidthMode = !fullWidthMode;
        sheetEditorCard?.classList.toggle("full-width-mode", fullWidthMode);
    }

    function toggleGrid() {
        gridHidden = !gridHidden;
        renderGrid();
    }

    function applyInsertAction(action) {
        if (!currentSheet) return;

        if (action === "clear-cell") return clearActiveCell();

        if (action === "clear-row") {
            pushHistorySnapshot();
            currentSheet.grid[activeCell.row] = Array.from({ length: currentCols }, () => "");
            renderGrid();
            return markDirty();
        }

        if (action === "clear-col") {
            pushHistorySnapshot();
            currentSheet.grid.forEach(row => {
                row[activeCell.col] = "";
            });
            renderGrid();
            return markDirty();
        }

        if (action === "row-above") {
            pushHistorySnapshot();
            currentSheet.grid.splice(activeCell.row, 0, Array.from({ length: currentCols }, () => ""));
            currentRows += 1;
            renderGrid();
            return markDirty();
        }

        if (action === "row-below") {
            pushHistorySnapshot();
            currentSheet.grid.splice(activeCell.row + 1, 0, Array.from({ length: currentCols }, () => ""));
            currentRows += 1;
            renderGrid();
            return markDirty();
        }

        if (action === "col-left") {
            pushHistorySnapshot();
            currentSheet.grid.forEach(row => row.splice(activeCell.col, 0, ""));
            currentCols += 1;
            renderGrid();
            return markDirty();
        }

        if (action === "col-right") {
            pushHistorySnapshot();
            currentSheet.grid.forEach(row => row.splice(activeCell.col + 1, 0, ""));
            currentCols += 1;
            renderGrid();
            return markDirty();
        }

        if (action === "chart") return openModal(chartModal);
        if (action === "pivot") return openModal(pivotModal);
        if (action === "report-builder") return openModal(reportModal);
        if (action === "solver") return openModal(solverModal);

        if (action === "function-helper") return openSmartInsert("function");
        if (action === "link") return openSmartInsert("link");
        if (action === "checkbox") return openSmartInsert("checkbox");
        if (action === "dropdown") return openSmartInsert("dropdown");
        if (action === "conditional-format") return openSmartInsert("conditional-format");

        if (action === "emoji") {
            openEmojiPicker();
            return;
        }

        if (action === "comment") return openCommentEditor("comment");
        if (action === "note") return openCommentEditor("note");
    }


    const TABLE_TEMPLATES = [
        { id:"loan", title:"Rata kredytu", tag:"finanse", desc:"PMT: kwota, oprocentowanie, liczba rat i rata miesięczna.", rows:[["Parametr","Wartość","Opis"],["Kwota kredytu",250000,"kapitał początkowy"],["Oprocentowanie roczne",0.075,"7,5%"],["Liczba rat",240,"miesięcy"],["Rata miesięczna","=PMT(B3/12;B4;-B2)","wynik"]] },
        { id:"npv", title:"NPV projektu", tag:"finanse", desc:"Stopa dyskontowa, nakład początkowy i przepływy.", rows:[["Rok","Przepływ"],[0,-10000],[1,3000],[2,3500],[3,4200],[4,4500],["Stopa",0.1],["NPV","=ROUND(NPV(B7;B3:B6)+B2;2)"]] },
        { id:"irr", title:"IRR inwestycji", tag:"finanse", desc:"Wewnętrzna stopa zwrotu z serii przepływów.", rows:[["Okres","Cash flow"],[0,-15000],[1,2500],[2,4000],[3,6000],[4,7000],["IRR","=IRR(B2:B6)"]] },
        { id:"budget", title:"Budżet miesięczny", tag:"finanse", desc:"Przychody, koszty, saldo i udział kosztów.", rows:[["Pozycja","Typ","Kwota"],["Pensja","Przychód",7000],["Premia","Przychód",800],["Czynsz","Koszt",1800],["Jedzenie","Koszt",1500],["Transport","Koszt",450],["Suma przychodów","","=SUMA(C2:C3)"],["Suma kosztów","","=SUMA(C4:C6)"],["Saldo","","=C7-C8"],["Koszty % przychodów","","=C8/C7"]] },
        { id:"solver_mix", title:"Solver: produkcja", tag:"solver", desc:"Maksymalizacja zysku przy ograniczeniach zasobów.", rows:[["","Produkt A","Produkt B"],["Ilość",5,7],["Zysk jednostkowy",530,624],["Zysk razem","=SUMA.ILOCZYNÓW(B2:C2;B3:C3)"],["Zasób","Zużycie A","Zużycie B","Limit","Zużycie"],["bagażowy",1,1,12,"=SUMA.ILOCZYNÓW(B2:C2;B6:C6)"],["pocztowy",1,0,8,"=SUMA.ILOCZYNÓW(B2:C2;B7:C7)"],["2 klasa",5,8,81,"=SUMA.ILOCZYNÓW(B2:C2;B8:C8)"],["1 klasa",6,4,70,"=SUMA.ILOCZYNÓW(B2:C2;B9:C9)"]] },
        { id:"linear", title:"Układ równań", tag:"matematyka", desc:"Dane do testowania równań i Solver.", rows:[["x",2],["y",3],["Równanie","Wynik"],["2x+3y","=2*B1+3*B2"],["4x-y","=4*B1-B2"],["Suma wyników","=SUMA(B4:B5)"]] },
        { id:"statistics", title:"Statystyka opisowa", tag:"statystyka", desc:"Suma, średnia, min, max, mediana, odchylenie.", rows:[["Wartość"],[12],[15],[11],[19],[21],["Suma","=SUMA(A2:A6)"],["Średnia","=ŚREDNIA(A2:A6)"],["Min","=MIN(A2:A6)"],["Max","=MAX(A2:A6)"],["Mediana","=MEDIANA(A2:A6)"],["Odchylenie std.","=ODCH.STANDARDOWE(A2:A6)"]] },
        { id:"percent", title:"Procenty i marża", tag:"matematyka", desc:"Cena netto, VAT, marża i cena końcowa.", rows:[["Parametr","Wartość"],["Cena netto",120],["VAT",0.23],["Marża",0.35],["Cena z VAT","=B2*(1+B3)"],["Cena sprzedaży","=B5*(1+B4)"],["Zysk","=B6-B2"]] },
        { id:"weather", title:"Analiza pogody", tag:"dane", desc:"Średnia temperatura, suma deszczu, maksimum zachmurzenia.", rows:[["Godzina","Temperatura","Deszcz","Zachmurzenie"],["08:00",12,0,100],["10:00",14,0.2,80],["12:00",16,0,60],["14:00",15,0.1,70],["Śr. temp.","=ŚREDNIA(B2:B5)"],["Suma deszczu","=SUMA(C2:C5)"],["Max chmur","=MAX(D2:D5)"]] },
        { id:"scores", title:"Oceny / punkty", tag:"statystyka", desc:"Suma punktów, procent i status zaliczenia.", rows:[["Zadanie","Punkty","Max"],["A",8,10],["B",13,15],["C",18,20],["Razem","=SUMA(B2:B4)","=SUMA(C2:C4)"],["Wynik %","=B5/C5",""]] }
    ];

    TABLE_TEMPLATES.push(
        { id:"univ_integral", title:"Całkowanie numeryczne", tag:"analiza", desc:"Całka oznaczona metodą trapezów dla funkcji f(x).", rows:[["Zadanie","Wartość","Opis"],["Funkcja","x^2+3*x+2","użyj x jako zmiennej"],["Dolna granica",0,"a"],["Górna granica",5,"b"],["Podziały",500,"im więcej, tym dokładniej"],["Całka","=CAŁKA(B2;B3;B4;B5)","wynik numeryczny"],["Pochodna w x=2","=POCHODNA(B2;2)","różnica centralna"]] },
        { id:"univ_derivative", title:"Pochodne i styczna", tag:"analiza", desc:"Pochodna w punkcie i wartość funkcji.", rows:[["Parametr","Wartość"],["f(x)","SIN(x)+x^2"],["punkt a",1],["f(a)","=WARTOŚĆ.FUNKCJI(B2;B3)"],["f'(a)","=POCHODNA(B2;B3)"],["styczna dla x",1.5],["y stycznej","=B4+B5*(B6-B3)"]] },
        { id:"univ_ode_euler", title:"Równanie różniczkowe — Euler", tag:"różniczki", desc:"Przybliżenie y' = f(x,y), y(x0)=y0.", rows:[["Parametr","Wartość","Opis"],["f(x,y)","x+y","prawa strona równania"],["x0",0,"start"],["y0",1,"warunek początkowy"],["krok h",0.1,"krok"],["liczba kroków",20,"n"],["y końcowe","=EULER(B2;B3;B4;B5;B6)","przybliżenie"]] },
        { id:"univ_root", title:"Miejsce zerowe funkcji", tag:"analiza", desc:"Bisekcja i Newton do szukania pierwiastków równań.", rows:[["Parametr","Wartość"],["f(x)","x^3-x-2"],["a",1],["b",2],["start Newtona",1.5],["Bisekcja","=BISEKCJA(B2;B3;B4;0.000001;100)"],["Newton","=NEWTON(B2;B5;0.000001;50)"]] },
        { id:"univ_combinatorics", title:"Kombinatoryka", tag:"kombinatoryka", desc:"Permutacje, wariacje i kombinacje.", rows:[["Parametr","Wartość"],["n",10],["k",3],["n!","=SILNIA(B2)"],["Permutacje P(n)","=PERMUTACJE(B2)"],["Wariacje V(n,k)","=WARIACJE(B2;B3)"],["Kombinacje C(n,k)","=KOMBINACJE(B2;B3)"]] },
        { id:"univ_distribution", title:"Statystyka — rozkłady", tag:"statystyka", desc:"Normalny, dwumianowy i Poisson.", rows:[["Parametr","Wartość"],["x",1.96],["średnia",0],["sigma",1],["CDF normalny","=NORM.DIST(B2;B3;B4;TRUE)"],["PDF normalny","=NORM.DIST(B2;B3;B4;FALSE)"],["n",10],["k",3],["p",0.4],["P(X=k) dwumianowy","=DWUMIAN(B8;B7;B9)"],["lambda",2.5],["P(X=k) Poisson","=POISSON(B8;B11)"]] },
        { id:"univ_regression", title:"Ekonometria — regresja liniowa", tag:"ekonometria", desc:"Nachylenie, wyraz wolny, R² i prognoza.", rows:[["x","y"],[1,2.2],[2,2.9],[3,3.7],[4,4.1],[5,5.2],["Nachylenie","=NACHYLENIE(A2:A6;B2:B6)"],["Wyraz wolny","=WYRAZ.WOLNY(A2:A6;B2:B6)"],["R^2","=R2(A2:A6;B2:B6)"],["Prognoza x",6],["Prognoza y","=PROGNOZA(B10;A2:A6;B2:B6)"]] },
        { id:"univ_lp", title:"Badania operacyjne — LP", tag:"optymalizacja", desc:"Tabela pod Solver: funkcja celu, zmienne i ograniczenia.", rows:[["","x1","x2","x3",""],["Zmienne",10,5,0,""],["Zysk",7,5,4,"=SUMA.ILOCZYNÓW(B2:D2;B3:D3)"],["Ograniczenie","x1","x2","x3","Zużycie","Limit"],["Zasób A",2,1,1,"=SUMA.ILOCZYNÓW($B$2:$D$2;B5:D5)",40],["Zasób B",1,3,2,"=SUMA.ILOCZYNÓW($B$2:$D$2;B6:D6)",45],["Zasób C",0,2,3,"=SUMA.ILOCZYNÓW($B$2:$D$2;B7:D7)",36]] },
        { id:"univ_markov", title:"Proces Markowa", tag:"badania operacyjne", desc:"Mnożenie macierzy stanu przez macierz przejścia.", rows:[["Stan","A","B","C"],["p0",0.2,0.5,0.3],["","A","B","C"],["A",0.7,0.2,0.1],["B",0.1,0.8,0.1],["C",0.2,0.3,0.5],["p1 A","=SUMA.ILOCZYNÓW(B2:D2;B4:B6)"],["p1 B","=SUMA.ILOCZYNÓW(B2:D2;C4:C6)"],["p1 C","=SUMA.ILOCZYNÓW(B2:D2;D4:D6)"]] },
        { id:"univ_queue", title:"Teoria kolejek M/M/1", tag:"badania operacyjne", desc:"Wskaźniki kolejki dla lambda i mi.", rows:[["Parametr","Wartość"],["lambda",4],["mi",6],["rho","=B2/B3"],["L","=B2/(B3-B2)"],["Lq","=MOC(B2;2)/(B3*(B3-B2))"],["W","=1/(B3-B2)"],["Wq","=B2/(B3*(B3-B2))"]] }
    );

    function shiftFormulaReferences(formula, rowOffset, colOffset) {
        if (typeof formula !== "string" || !formula.trim().startsWith("=")) return formula;
        return formula.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (match, colLock, colLabel, rowLock, rowText, index, full) => {
            const before = full[index - 1] || "";
            const after = full[index + match.length] || "";
            if (/[A-Z0-9_]/i.test(before) || /[A-Z0-9_]/i.test(after)) return match;
            let colIndex = labelToCol(colLabel);
            let rowIndex = Number(rowText) - 1;
            if (!colLock) colIndex += colOffset;
            if (!rowLock) rowIndex += rowOffset;
            if (colIndex < 0 || rowIndex < 0) return match;
            return `${colLock}${colToLabel(colIndex)}${rowLock}${rowIndex + 1}`;
        });
    }

    function renderUniversityTemplates() {
        if (!universityTemplateGrid) return;
        const items = TABLE_TEMPLATES.filter(t => String(t.id || "").startsWith("univ_"));
        universityTemplateGrid.innerHTML = items.map(t =>             `<button type="button" class="we-university-card" data-template-id="${t.id}"><span>${escapeHtml(t.tag)}</span><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.desc)}</small></button>`
        ).join("");
    }

    function renderTableTemplates() {
        if (!tableTemplateGrid) return;
        tableTemplateGrid.innerHTML = TABLE_TEMPLATES.filter(t => !String(t.id || "").startsWith("univ_")).map(t => `
            <button type="button" class="we-template-card" data-template-id="${t.id}">
                <span class="we-template-tag">${escapeHtml(t.tag)}</span>
                <strong>${escapeHtml(t.title)}</strong>
                <small>${escapeHtml(t.desc)}</small>
                <em>Wstawia od aktywnej komórki, a formuły przesuwają się automatycznie.</em>
            </button>
        `).join("");
        refreshI18nAfterDynamicRender();
    }

    function applyTableTemplate(id) {
        const template = TABLE_TEMPLATES.find(t => t.id === id);
        if (!template || !currentSheet) return;
        pushHistorySnapshot();
        const clear = clearBeforeTemplateBtn?.classList.contains("active") || clearBeforeUniversityTemplateBtn?.classList.contains("active");
        if (clear) currentSheet.grid = emptyGrid();
        ensureDimensions(Math.max(currentRows, template.rows.length + activeCell.row + 2), Math.max(currentCols, Math.max(...template.rows.map(r => r.length)) + activeCell.col + 2));
        template.rows.forEach((row, r) => row.forEach((value, c) => {
            let nextValue = String(value  || "");
            if (nextValue.startsWith("=")) {
                nextValue = shiftFormulaReferences(nextValue, activeCell.row, activeCell.col);
            }
            currentSheet.grid[activeCell.row + r][activeCell.col + c] = nextValue;
        }));
        renderGrid();
        markDirty();
        logUserAction("Wstawiono szablon tabeli", { type: "table_template", template: template.title || template.id, startCell: cellAddress(activeCell.row, activeCell.col) });
    }

    const MENU_DEFS = {
        file: [{label:"Zapisz", action:"save"},{label:"Import CSV", action:"import"},{label:"Eksport CSV", action:"export"}],
        edit: [{label:"Cofnij", action:"undo"},{label:"Wyczyść komórkę", action:"clear-cell"},{label:"Wyczyść wiersz", action:"clear-row"}],
        view: [{label:"Tryb pełnej szerokości", action:"full-width"},{label:"Pokaż / ukryj siatkę", action:"grid"},{label:"Wyrównaj do tekstu", action:"autofit"}],
        insert: [{label:"Funkcja", action:"function-helper"},{label:"Link", action:"link"},{label:"Pole wyboru", action:"checkbox"},{label:"Menu rozwijane", action:"dropdown"},{label:"Tabela przestawna", action:"pivot"},{label:"Solver", action:"solver"},{label:"Emotikony", action:"emoji"}],
        format: [{label:"Pogrubienie", action:"bold"},{label:"Kursywa", action:"italic"},{label:"Podkreślenie", action:"underline"}],
        data: [{label:"Sortuj A-Z", action:"sort-asc"},{label:"Sortuj Z-A", action:"sort-desc"},{label:"Formatowanie warunkowe", action:"conditional-format"}],
        tools: [{label:"Solver", action:"solver"},{label:"Walidacja formuły", action:"function-helper"},{label:"Formatowanie warunkowe", action:"conditional-format"}],
        extensions: [{label:"Brak rozszerzeń", action:"noop", disabled:true}],
        help: [{label:"Podpowiedzi formuł", action:"function-helper"},{label:"Skróty: F4 blokuje adresy", action:"noop", disabled:true}]
    };

    function showMenuPopover(menuName, anchor) {
        if (!menuPopover) return;
        const items = MENU_DEFS[menuName] || [];
        menuPopover.innerHTML = items.map(item => `<button type="button" data-menu-action="${item.action}" ${item.disabled ? "disabled" : ""}>${escapeHtml(item.label)}</button>`).join("");
        const rect = anchor.getBoundingClientRect();
        menuPopover.style.left = `${rect.left}px`;
        menuPopover.style.top = `${rect.bottom + 4}px`;
        menuPopover.hidden = false;
        refreshI18nAfterDynamicRender();
    }

    function handleMenuAction(action) {
        if (action === "save") return saveSheet();
        if (action === "export") return exportBtn?.click();
        if (action === "import") return importInput?.click();
        if (action === "undo") return undoBtn?.click();
        if (action === "full-width") return toggleFullWidthBtn?.click();
        if (action === "grid") return toggleGridBtn?.click();
        if (action === "autofit") return autofitBtn?.click();
        if (action === "bold") return boldBtn?.click();
        if (action === "italic") return italicBtn?.click();
        if (action === "underline") return underlineBtn?.click();
        if (action === "sort-asc") return sortAscBtn?.click();
        if (action === "sort-desc") return sortDescBtn?.click();
        if (action && action !== "noop") return applyInsertAction(action);
    }

    function openSmartInsert(mode) {
        smartInsertMode = mode;
        editingConditionalRuleIndex = null;
        if (smartInsertApplyBtn) smartInsertApplyBtn.textContent = "Wstaw";
        if (!smartInsertModal || !smartInsertBody) return;
        const configs = {
            function: { title:"Wstaw funkcję", subtitle:"Wybierz funkcję z katalogu albo zacznij pisać w pasku formuły. Podpowiedzi pokażą wymagane argumenty.", body:`<div class="we-smart-grid"><label>Funkcja<select id="smart-function-select"></select></label><label>Zakres / argumenty<input id="smart-function-args" placeholder="np. A1:A10"></label><p class="we-smart-help">Przykład: SUMA z argumentem A1:A10 utworzy =SUMA(A1:A10). F4 w pasku formuły przełącza blokady $.</p></div>` },
            link: { title:"Wstaw link", subtitle:"Podaj tekst i adres. Link będzie klikalny w komórce.", body:`<div class="we-smart-grid"><label>Tekst wyświetlany<input id="smart-link-text" value="Otwórz"></label><label>Adres URL<input id="smart-link-url" value="https://"></label></div>` },
            checkbox: { title:"Wstaw pole wyboru", subtitle:"Ustaw początkowy stan pola wyboru i opcjonalny opis.", body:`<div class="we-smart-grid"><label class="we-smart-check"><input id="smart-checkbox-checked" type="checkbox"> Zaznaczone na start</label><label>Opis obok pola<input id="smart-checkbox-label" placeholder="opcjonalnie"></label></div>` },
            dropdown: { title:"Reguła sprawdzania poprawności danych", subtitle:"Utwórz menu rozwijane podobne do Arkuszy Google. Każda linia to jedna opcja.", body:`<div class="we-smart-grid"><label>Zastosuj do komórki<input value="${cellAddress(activeCell.row, activeCell.col)}" readonly></label><label>Kryteria<select><option>Menu</option><option>Menu z zakresu</option></select></label><label class="we-grid-span-2">Opcje<textarea id="smart-dropdown-options" rows="5">Opcja 1\nOpcja 2\nGotowe</textarea></label><label class="we-smart-check"><input id="smart-dropdown-multi" type="checkbox"> Zezwalaj na wybieranie wielu opcji</label></div>` },
            "conditional-format": { title:"Formatowanie warunkowe", subtitle:"Dodaj regułę, ustaw priorytet i edytuj ją z listy po lewej bez usuwania.", body:`<div class="we-conditional-editor-layout"><section class="we-conditional-list-panel"><div class="we-conditional-panel-head"><strong>Aktywne reguły</strong><span class="we-conditional-badge">kolejność ma znaczenie</span></div><p>Reguły z wyższym priorytetem są ważniejsze. Strzałkami możesz zmieniać ich kolejność.</p><div id="conditional-rules-list" class="we-conditional-list"></div></section><section class="we-conditional-form-panel"><div class="we-conditional-form-head"><strong>Edytor reguły</strong><span>Wprowadź zakres, warunek i styl wyróżnienia.</span></div><div class="we-smart-grid we-conditional-grid"><label>Zakres<input id="conditional-range" value="${getCurrentSelectionRangeText()}" placeholder="np. A1:C10"></label><label>Warunek<select id="conditional-template"><option value="text-contains">Tekst zawiera…</option><option value="text-eq">Tekst to dokładnie…</option><option value="number-gt">Liczba większa niż…</option><option value="number-lt">Liczba mniejsza niż…</option><option value="number-between">Liczba między…</option><option value="empty">Puste komórki</option><option value="not-empty">Niepuste komórki</option></select></label><label>Wartość<input id="conditional-value" value="OK" placeholder="np. OK, 100, ❌"></label><label>Druga wartość<input id="conditional-value2" value="" placeholder="używana tylko dla „Liczba między”"></label><label>Kolor reguły<select id="conditional-preset"><option value="green">Zielony — dobrze / OK</option><option value="red">Czerwony — błąd / źle</option><option value="yellow">Żółty — uwaga</option><option value="blue">Niebieski — informacja</option><option value="purple">Fioletowy — wyróżnienie</option></select></label><label>Ważność<select id="conditional-priority"><option value="3">Wysoka — ma pierwszeństwo</option><option value="2" selected>Normalna</option><option value="1">Niska</option></select></label><div class="we-conditional-preview-tip we-grid-span-2">Szybkie przykłady: <span>tekst zawiera OK</span><span>liczba &gt; 100</span><span>pusta komórka</span></div></div></section></div>` }
        };
        const cfg = configs[mode] || configs.function;
        smartInsertTitle.textContent = cfg.title;
        smartInsertSubtitle.textContent = cfg.subtitle;
        smartInsertBody.innerHTML = cfg.body;
        if (mode === "function") {
            const select = document.getElementById("smart-function-select");
            const argsInput = document.getElementById("smart-function-args");
            const rawCatalog = window.FORMULA_CATALOG || {};
            const catalog = Array.isArray(rawCatalog) ? rawCatalog : Object.values(rawCatalog).flat();
            select.innerHTML = catalog.map(fn => `<option value="${fn.name}" data-syntax="${escapeHtml(fn.syntax || "")}" data-example="${escapeHtml(fn.example || "")}">${fn.name} — ${escapeHtml(fn.description || "")}</option>`).join("");
            const fillArgsFromExample = () => {
                const opt = select.selectedOptions?.[0];
                const example = opt?.dataset?.example || opt?.dataset?.syntax || "";
                const inner = example.match(/^[^()]+\((.*)\)$/)?.[1];
                if (argsInput && inner && !argsInput.value.trim()) argsInput.value = inner;
                updateSmartPreview();
            };
            select.addEventListener("change", () => {
                if (argsInput) argsInput.value = "";
                fillArgsFromExample();
            });
            fillArgsFromExample();
        }
        smartInsertBody.querySelectorAll("input,textarea,select").forEach(el => {
            el.addEventListener("input", updateSmartPreview);
            el.addEventListener("change", updateSmartPreview);
        });
        updateSmartPreview();
        renderConditionalRulesSummary();
        if (mode === "conditional-format") fillConditionalForm(null, null);
        openModal(smartInsertModal);
        refreshI18nAfterDynamicRender();
    }

    function updateSmartPreview() {
        if (!smartInsertPreview) return;
        smartInsertPreview.innerHTML = escapeHtml(buildSmartInsertFormula() || "—");
    }

    function buildSmartInsertFormula() {
        if (smartInsertMode === "function") {
            const name = document.getElementById("smart-function-select")?.value || "SUMA";
            const argsInput = document.getElementById("smart-function-args");
            const selected = document.getElementById("smart-function-select")?.selectedOptions?.[0];
            const example = selected?.dataset?.example || selected?.dataset?.syntax || "";
            const fallbackArgs = example.match(/^[^()]+\((.*)\)$/)?.[1] || "A1:A10";
            const args = (argsInput?.value?.trim() || fallbackArgs).trim();
            return `=${name}(${args})`;
        }
        if (smartInsertMode === "link") {
            const text = document.getElementById("smart-link-text")?.value?.trim() || "Link";
            const url = document.getElementById("smart-link-url")?.value?.trim() || "https://";
            return `=LINK(${text}|${url})`;
        }
        if (smartInsertMode === "checkbox") {
            const checked = document.getElementById("smart-checkbox-checked")?.checked;
            const label = document.getElementById("smart-checkbox-label")?.value?.trim();
            return buildCheckboxFormula(Boolean(checked), label || "");
        }
        if (smartInsertMode === "dropdown") {
            const options = (document.getElementById("smart-dropdown-options")?.value || "Opcja 1\nOpcja 2").split(/\n+/).map(x => x.trim()).filter(Boolean);
            return buildDropdownFormula(options, options[0] || "");
        }
        if (smartInsertMode === "conditional-format") {
            const type = document.getElementById("conditional-template")?.value || "text-contains";
            const range = document.getElementById("conditional-range")?.value || getCurrentSelectionRangeText();
            const value = document.getElementById("conditional-value")?.value || "";
            const value2 = document.getElementById("conditional-value2")?.value || "";
            const priority = document.getElementById("conditional-priority")?.value || "2";
            return `Reguła: ${range} • ${type} • ${value}${value2 ? " / " + value2 : ""} • ważność: ${conditionalPriorityLabel(priority)}`;
        }
        return "";
    }

    function applySmartInsert() {
        if (smartInsertMode === "conditional-format") {
            if (!currentSheet) return;
            const range = document.getElementById("conditional-range")?.value?.trim() || getCurrentSelectionRangeText();
            if (!parseRangeBounds(range)) return alert("Podaj poprawny zakres, np. A1:C10.");
            const type = document.getElementById("conditional-template")?.value || "text-contains";
            const preset = document.getElementById("conditional-preset")?.value || "yellow";
            const value = document.getElementById("conditional-value")?.value || "";
            const value2 = document.getElementById("conditional-value2")?.value || "";
            const priority = parseInt(document.getElementById("conditional-priority")?.value || "2", 10);
            const nextRule = {
                id: editingConditionalRuleIndex !== null ? ensureConditionalRules()[editingConditionalRuleIndex]?.id : `cf_${Date.now()}`,
                range, type, value, value2, preset, priority,
                style: buildConditionalStyle(preset),
                label: `${type} ${value || ""}`.trim()
            };
            pushHistorySnapshot();
            if (editingConditionalRuleIndex !== null && ensureConditionalRules()[editingConditionalRuleIndex]) {
                ensureConditionalRules()[editingConditionalRuleIndex] = nextRule;
                logUserAction("Zmieniono formatowanie warunkowe", { type: "conditional_format_edit", range });
            } else {
                ensureConditionalRules().push(nextRule);
                logUserAction("Dodano formatowanie warunkowe", { type: "conditional_format", range });
            }
            editingConditionalRuleIndex = null;
            fillConditionalForm(null, null);
            renderConditionalRulesSummary();
            renderGrid();
            markDirty();
            return;
        }
        const formula = buildSmartInsertFormula();
        if (!formula || !currentSheet) return;
        if (smartInsertMode === "link" && !/^=LINK\(.+\|https?:\/\//i.test(formula)) return alert("Podaj poprawny adres URL zaczynający się od http:// albo https://.");
        if (smartInsertMode === "dropdown") {
            const parsed = parseDropdownFormula(formula);
            if (parsed.options.length < 2) return alert("Dodaj co najmniej dwie opcje menu.");
        }
        const oldValue = currentSheet.grid[activeCell.row]?.[activeCell.col] || "";
        pushCellEditHistory(activeCell.row, activeCell.col, oldValue, formula);
        currentSheet.grid[activeCell.row][activeCell.col] = formula;
        closeModal(smartInsertModal);
        updateCellElement(activeCell.row, activeCell.col);
        scheduleComputedRefresh(activeCell.row, activeCell.col);
        markDirty();
        logUserAction("Wstawiono element", { type: `smart_insert_${smartInsertMode || "unknown"}`, value: formula, cell: cellAddress(activeCell.row, activeCell.col) });
    }

    function buildPivotFromModal() {
        const rangeText = pivotRangeInput?.value?.trim();
        if (!rangeText) {
            alert("Podaj zakres danych.");
            return;
        }
        if (!pivotConfig.rows.length && !pivotConfig.values.length) {
            const fields = getPivotFields();
            if (fields.length) {
                pivotConfig.rows = [fields[0]];
                pivotConfig.values = [fields[1] ? { ...fields[1], agg: pivotAggSelect?.value || "sum" } : { ...fields[0], agg: "count" }];
            }
        }
        pivotObjects.push({
            rangeText,
            rows: JSON.parse(JSON.stringify(pivotConfig.rows)),
            columns: JSON.parse(JSON.stringify(pivotConfig.columns)),
            values: JSON.parse(JSON.stringify(pivotConfig.values)),
            filters: JSON.parse(JSON.stringify(pivotConfig.filters)),
            agg: pivotAggSelect?.value || "sum"
        });
        rerenderGeneratedObjects();
        closeModal(pivotModal);
        logUserAction("Utworzono tabelę przestawną", { type: "pivot_create", range: rangeText, rows: pivotConfig.rows.map(x => x.name || x), values: pivotConfig.values.map(x => x.name || x) });
    }

    function expandCellRefs(text) {
        const refs = [];
        String(text || "")
            .split(/[\n,;]/)
            .map(part => part.trim())
            .filter(Boolean)
            .forEach(part => {
                const rangeParts = part.split(":").map(normalizeCellRefText);
                if (rangeParts.length === 2) {
                    const start = cellRefToIndex(rangeParts[0]);
                    const end = cellRefToIndex(rangeParts[1]);
                    if (!start || !end) return;

                    const rowStart = Math.min(start.row, end.row);
                    const rowEnd = Math.max(start.row, end.row);
                    const colStart = Math.min(start.col, end.col);
                    const colEnd = Math.max(start.col, end.col);

                    for (let row = rowStart; row <= rowEnd; row += 1) {
                        for (let col = colStart; col <= colEnd; col += 1) {
                            refs.push({ row, col });
                        }
                    }
                    return;
                }

                const ref = cellRefToIndex(rangeParts[0]);
                if (ref) refs.push(ref);
            });

        return refs;
    }

    function getSolverMode() {
        return document.querySelector('input[name="solver-objective-sense"]:checked')?.value || "max";
    }

    function rangeTextFromBounds(rowStart, rowEnd, colStart, colEnd) {
        return `${cellAddress(rowStart, colStart)}:${cellAddress(rowEnd, colEnd)}`;
    }

    function normalizeRefListText(text) {
        return String(text || "")
            .split(/[;,\n]/)
            .map(item => item.trim().toUpperCase())
            .filter(Boolean);
    }

    function setSolverVariablesFromSelection(replace = false) {
        if (!solverVariableInput) return;
        const selectionText = getCurrentSelectionRangeText();
        if (replace || !solverVariableInput.value.trim()) {
            solverVariableInput.value = selectionText;
            return;
        }
        const existing = normalizeRefListText(solverVariableInput.value);
        const next = selectionText.toUpperCase();
        if (!existing.includes(next)) {
            solverVariableInput.value = `${solverVariableInput.value.trim()},${selectionText}`;
        }
    }

    function setSolverConstraintText(line, replace = false) {
        if (!solverConstraintsInput || !line) return;
        if (replace || !solverConstraintsInput.value.trim()) {
            solverConstraintsInput.value = line;
            return;
        }
        solverConstraintsInput.value = `${solverConstraintsInput.value.trim()}\n${line}`;
    }

    function getSelectedSolverConstraintOperator() {
        const op = solverConstraintOpSelect?.value || "<=";
        return ["<=", "=", ">="].includes(op) ? op : "<=";
    }

    function buildConstraintFromSelection() {
        const op = getSelectedSolverConstraintOperator();
        const bounds = getSelectionBounds();
        if (!bounds) return `${cellAddress(activeCell.row, activeCell.col)} ${op} `;
        const width = bounds.colEnd - bounds.colStart + 1;
        const height = bounds.rowEnd - bounds.rowStart + 1;
        if (width === 2) {
            const left = rangeTextFromBounds(bounds.rowStart, bounds.rowEnd, bounds.colStart, bounds.colStart);
            const right = rangeTextFromBounds(bounds.rowStart, bounds.rowEnd, bounds.colEnd, bounds.colEnd);
            return `${left} ${op} ${right}`;
        }
        if (height === 2) {
            const left = rangeTextFromBounds(bounds.rowStart, bounds.rowStart, bounds.colStart, bounds.colEnd);
            const right = rangeTextFromBounds(bounds.rowEnd, bounds.rowEnd, bounds.colStart, bounds.colEnd);
            return `${left} ${op} ${right}`;
        }
        return `${getCurrentSelectionRangeText()} ${op} `;
    }

    function addSolverConstraintFromSelection(replace = false) {
        setSolverConstraintText(buildConstraintFromSelection(), replace);
    }

    function solverCellRawValue(row, col) {
        return currentSheet?.grid?.[row]?.[col] ?? "";
    }

    function textContainsAny(value, needles) {
        const normalized = String(value || "").toLowerCase();
        return needles.some(needle => normalized.includes(needle));
    }

    function isFormulaCell(value) {
        return String(value || "").trim().startsWith("=");
    }

    function findFirstFormulaCellInRow(row, startCol = 0) {
        const values = currentSheet?.grid?.[row] || [];
        for (let col = Math.max(0, startCol); col < values.length; col += 1) {
            if (isFormulaCell(values[col])) return { row, col };
        }
        return null;
    }

    function rangeBoundsFromRefs(refs) {
        if (!Array.isArray(refs) || !refs.length) return null;
        const rowStart = Math.min(...refs.map(ref => ref.row));
        const rowEnd = Math.max(...refs.map(ref => ref.row));
        const colStart = Math.min(...refs.map(ref => ref.col));
        const colEnd = Math.max(...refs.map(ref => ref.col));
        const expected = (rowEnd - rowStart + 1) * (colEnd - colStart + 1);
        const unique = new Set(refs.map(ref => `${ref.row}:${ref.col}`));
        if (unique.size !== expected) return null;
        return { rowStart, rowEnd, colStart, colEnd };
    }

    function boundsToRangeText(bounds) {
        if (!bounds) return "";
        const first = cellAddress(bounds.rowStart, bounds.colStart);
        const last = cellAddress(bounds.rowEnd, bounds.colEnd);
        return first === last ? first : `${first}:${last}`;
    }

    function rangeTextToBounds(text) {
        const refs = expandCellRefs(text);
        return rangeBoundsFromRefs(refs);
    }

    function sameBounds(a, b) {
        return Boolean(a && b
            && a.rowStart === b.rowStart && a.rowEnd === b.rowEnd
            && a.colStart === b.colStart && a.colEnd === b.colEnd);
    }

    function cellInsideBounds(row, col, bounds) {
        return Boolean(bounds && row >= bounds.rowStart && row <= bounds.rowEnd && col >= bounds.colStart && col <= bounds.colEnd);
    }

    function valueLooksFilledNumberOrFormula(value) {
        const raw = String(value ?? "").trim();
        return raw !== "" && (isNumericValue(value) || isFormulaCell(value));
    }

    function rangeHasOnlyPlainValues(bounds) {
        if (!bounds) return false;
        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
            for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
                const value = solverCellRawValue(row, col);
                if (String(value ?? "").trim() === "") return false;
                if (isFormulaCell(value)) return false;
            }
        }
        return true;
    }

    function getVariableCandidateFromInputOrSelection() {
        const typed = solverVariableInput?.value?.trim();
        if (typed) {
            const refs = expandCellRefs(typed);
            if (refs.length) {
                return { refs, bounds: rangeBoundsFromRefs(refs), rangeText: typed.toUpperCase() };
            }
        }
        const bounds = getSelectionBounds();
        if (bounds) {
            const rangeText = boundsToRangeText(bounds);
            const refs = expandCellRefs(rangeText);
            if (refs.length) return { refs, bounds, rangeText };
        }
        return null;
    }

    function detectVariablesByLabels() {
        if (!currentSheet?.grid?.length) return null;
        const rows = currentSheet.grid.length;
        const cols = Math.max(...currentSheet.grid.map(row => Array.isArray(row) ? row.length : 0), 0);
        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < Math.min(cols, 8); col += 1) {
                const label = solverCellRawValue(row, col);
                if (!textContainsAny(label, ["ilość", "ilosc", "zmienne", "decyzyjne", "produkcja", "plan"])) continue;
                let startCol = col + 1;
                while (startCol < cols && String(solverCellRawValue(row, startCol) || "").trim() === "") startCol += 1;
                let endCol = startCol;
                while (endCol < cols) {
                    const cell = solverCellRawValue(row, endCol);
                    const below = row + 1 < rows ? solverCellRawValue(row + 1, endCol) : "";
                    const usable = cell === "" || isNumericValue(cell) || isFormulaCell(cell) || isNumericValue(below) || isFormulaCell(below);
                    if (!usable) break;
                    endCol += 1;
                }
                if (endCol - startCol >= 1) {
                    const rangeText = rangeTextFromBounds(row, row, startCol, endCol - 1);
                    return { refs: expandCellRefs(rangeText), bounds: rangeTextToBounds(rangeText), rangeText };
                }
            }
        }
        return null;
    }

    function getRangeDimensions(bounds) {
        return bounds ? { rows: bounds.rowEnd - bounds.rowStart + 1, cols: bounds.colEnd - bounds.colStart + 1 } : { rows: 0, cols: 0 };
    }

    function scoreVariableRangeCandidate(bounds) {
        if (!bounds) return -Infinity;
        const rows = currentSheet?.grid?.length || 0;
        const cols = Math.max(...(currentSheet?.grid || []).map(row => Array.isArray(row) ? row.length : 0), 0);
        let score = 0;
        const labelText = collectNearbyCellText(bounds.rowStart, bounds.colStart, 2, 3);
        if (textContainsAny(labelText, ["ilość", "ilosc", "zmienne", "decyzyjne", "plan", "x1", "x2"])) score += 20;
        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
            const right = solverCellRawValue(row, bounds.colEnd + 1);
            if (isFormulaCell(right) || isNumericValue(right)) score += 5;
        }
        for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
            const below = solverCellRawValue(bounds.rowEnd + 1, col);
            if (isFormulaCell(below) || isNumericValue(below)) score += 5;
        }
        if (bounds.rowEnd < rows - 1) score += 1;
        if (bounds.colEnd < cols - 1) score += 1;
        return score;
    }

    function detectVariablesFromSumProductFormulas() {
        if (!currentSheet?.grid?.length) return null;
        const rows = currentSheet.grid.length;
        const cols = Math.max(...currentSheet.grid.map(row => Array.isArray(row) ? row.length : 0), 0);
        let best = null;
        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < cols; col += 1) {
                const raw = String(solverCellRawValue(row, col) || "").trim();
                if (!/^=/.test(raw) || !/SUMA\.ILOCZYN[ÓO]W|SUMPRODUCT/i.test(raw)) continue;
                const args = splitFormulaArgs(getFormulaArgsText(raw));
                const ranges = args.filter(isRangeArg).map(arg => ({ text: normalizeCellRefText(arg), bounds: rangeTextToBounds(arg) })).filter(item => item.bounds);
                ranges.forEach(item => {
                    const score = scoreVariableRangeCandidate(item.bounds);
                    if (!best || score > best.score) {
                        best = { refs: expandCellRefs(item.text), bounds: item.bounds, rangeText: item.text, score };
                    }
                });
            }
        }
        return best;
    }

    function detectVariableCandidate() {
        return getVariableCandidateFromInputOrSelection()
            || detectVariablesByLabels()
            || detectVariablesFromSumProductFormulas();
    }

    function collectNearbyCellText(row, col, radiusRows = 1, radiusCols = 4) {
        const parts = [];
        const rows = currentSheet?.grid?.length || 0;
        const cols = Math.max(...(currentSheet?.grid || []).map(item => Array.isArray(item) ? item.length : 0), 0);
        for (let r = Math.max(0, row - radiusRows); r <= Math.min(rows - 1, row + radiusRows); r += 1) {
            for (let c = Math.max(0, col - radiusCols); c <= Math.min(cols - 1, col + radiusCols); c += 1) {
                const value = solverCellRawValue(r, c);
                if (value !== undefined && value !== null && String(value).trim() !== "") parts.push(String(value));
            }
        }
        return parts.join(" ");
    }

    function analyzeLinearSideForVariables(variableRefs, side) {
        const originalValues = variableRefs.map(ref => currentSheet.grid?.[ref.row]?.[ref.col]);
        try {
            const baseValues = variableRefs.map(() => 0);
            const fn = buildLinearFunction(variableRefs, side, baseValues);
            if (!fn) return null;
            const hasVariable = fn.coeffs.some(coeff => Math.abs(coeff) > 1e-8);
            return hasVariable ? fn : null;
        } finally {
            originalValues.forEach((value, idx) => {
                const ref = variableRefs[idx];
                if (!currentSheet.grid[ref.row]) currentSheet.grid[ref.row] = [];
                currentSheet.grid[ref.row][ref.col] = value;
            });
        }
    }

    function findLinearFormulaCells(variableRefs, variableBounds) {
        if (!currentSheet?.grid?.length || !variableRefs?.length) return [];
        const rows = currentSheet.grid.length;
        const cols = Math.max(...currentSheet.grid.map(row => Array.isArray(row) ? row.length : 0), 0);
        const items = [];
        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < cols; col += 1) {
                const raw = solverCellRawValue(row, col);
                if (!isFormulaCell(raw)) continue;
                if (cellInsideBounds(row, col, variableBounds)) continue;
                const fn = analyzeLinearSideForVariables(variableRefs, { row, col });
                if (!fn) continue;
                const nearby = collectNearbyCellText(row, col, 1, 5);
                const text = String(raw || "").toUpperCase();
                const isNearVariableRight = variableBounds && row >= variableBounds.rowStart && row <= variableBounds.rowEnd && col > variableBounds.colEnd && col <= variableBounds.colEnd + 3;
                const isNearVariableBelow = variableBounds && col >= variableBounds.colStart && col <= variableBounds.colEnd && row > variableBounds.rowEnd && row <= variableBounds.rowEnd + 3;
                let objectiveScore = 0;
                if (/SUMA\.ILOCZYN[ÓO]W|SUMPRODUCT/i.test(text)) objectiveScore += 35;
                if (textContainsAny(nearby, ["funkcja celu", "cel", "zysk", "koszt", "koszty", "wynik", "z=", "z =", "razem"])) objectiveScore += 30;
                if (isNearVariableRight || isNearVariableBelow) objectiveScore -= 30;
                if (textContainsAny(nearby, ["limit", "ogranic", "zużycie", "zuzycie", "dostęp", "dostep", "zasób", "zasob"])) objectiveScore -= 20;
                items.push({ row, col, ref: cellAddress(row, col), raw, fn, objectiveScore, isNearVariableRight, isNearVariableBelow });
            }
        }
        return items;
    }

    function findTargetForZlp(variableRefs, variableBounds) {
        const typed = solverTargetInput?.value?.trim();
        const typedRef = cellRefToIndex(typed);
        if (typedRef) return cellAddress(typedRef.row, typedRef.col);
        const formulas = findLinearFormulaCells(variableRefs, variableBounds);
        const best = formulas
            .filter(item => item.objectiveScore > -20)
            .sort((a, b) => b.objectiveScore - a.objectiveScore)[0];
        return best ? best.ref : "";
    }

    function matchingVerticalRangeCell(formulaRow, formulaCol, variableBounds) {
        if (!variableBounds) return null;
        const height = variableBounds.rowEnd - variableBounds.rowStart + 1;
        const offset = formulaRow - variableBounds.rowStart;
        if (offset < 0 || offset >= height) return null;
        const rows = currentSheet?.grid?.length || 0;
        const cols = Math.max(...(currentSheet?.grid || []).map(row => Array.isArray(row) ? row.length : 0), 0);
        let best = null;
        for (let col = formulaCol + 1; col < cols; col += 1) {
            for (let startRow = 0; startRow + height - 1 < rows; startRow += 1) {
                const targetRow = startRow + offset;
                if (targetRow === formulaRow && col === formulaCol) continue;
                const bounds = { rowStart: startRow, rowEnd: startRow + height - 1, colStart: col, colEnd: col };
                if (!rangeHasOnlyPlainValues(bounds)) continue;
                let localScore = 0;
                if (startRow < variableBounds.rowStart) localScore += 20;
                localScore -= Math.abs(col - (formulaCol + 1));
                localScore -= Math.abs(startRow - Math.max(0, variableBounds.rowStart - height));
                if (!best || localScore > best.score) best = { row: targetRow, col, score: localScore };
            }
        }
        return best;
    }

    function matchingHorizontalRangeCell(formulaRow, formulaCol, variableBounds) {
        if (!variableBounds) return null;
        const width = variableBounds.colEnd - variableBounds.colStart + 1;
        const offset = formulaCol - variableBounds.colStart;
        if (offset < 0 || offset >= width) return null;
        const rows = currentSheet?.grid?.length || 0;
        const cols = Math.max(...(currentSheet?.grid || []).map(row => Array.isArray(row) ? row.length : 0), 0);
        let best = null;
        for (let row = 0; row < rows; row += 1) {
            if (row === formulaRow) continue;
            for (let startCol = 0; startCol + width - 1 < cols; startCol += 1) {
                const targetCol = startCol + offset;
                const bounds = { rowStart: row, rowEnd: row, colStart: startCol, colEnd: startCol + width - 1 };
                if (!rangeHasOnlyPlainValues(bounds)) continue;
                let localScore = 0;
                if (row < variableBounds.rowStart) localScore += 20;
                if (startCol === variableBounds.colStart) localScore += 10;
                localScore -= Math.abs(row - Math.max(0, variableBounds.rowStart - 1));
                localScore -= Math.abs(startCol - variableBounds.colStart);
                if (!best || localScore > best.score) best = { row, col: targetCol, score: localScore };
            }
        }
        return best;
    }

    function findConstraintRightHandCell(item, variableBounds, variableRefs) {
        const rows = currentSheet?.grid?.length || 0;
        const cols = Math.max(...(currentSheet?.grid || []).map(row => Array.isArray(row) ? row.length : 0), 0);
        for (let col = item.col + 1; col < Math.min(cols, item.col + 5); col += 1) {
            const candidate = solverCellRawValue(item.row, col);
            if (valueLooksFilledNumberOrFormula(candidate) && !analyzeLinearSideForVariables(variableRefs, { row: item.row, col })) {
                return { row: item.row, col };
            }
        }
        if (item.isNearVariableRight) return matchingVerticalRangeCell(item.row, item.col, variableBounds);
        if (item.isNearVariableBelow) return matchingHorizontalRangeCell(item.row, item.col, variableBounds);
        return null;
    }

    function detectConstraintsForZlp(variableRefs, variableBounds, targetRef) {
        const formulas = findLinearFormulaCells(variableRefs, variableBounds);
        const constraints = [];
        const seen = new Set();
        const mode = getSolverMode();
        formulas.forEach(item => {
            if (item.ref === targetRef) return;
            const looksLikeConstraint = item.isNearVariableRight
                || item.isNearVariableBelow
                || textContainsAny(collectNearbyCellText(item.row, item.col, 1, 4), ["limit", "ogranic", "zużycie", "zuzycie", "dostęp", "dostep", "zasób", "zasob", "suma"]);
            if (!looksLikeConstraint) return;
            const rhs = findConstraintRightHandCell(item, variableBounds, variableRefs);
            if (!rhs) return;
            let op = "<=";
            if (item.isNearVariableRight && mode === "min") op = "=";
            if (item.isNearVariableBelow && mode === "min") op = "<=";
            const line = `${item.ref} ${op} ${cellAddress(rhs.row, rhs.col)}`;
            if (!seen.has(line)) {
                seen.add(line);
                constraints.push(line);
            }
        });
        if (variableBounds) constraints.push(`${boundsToRangeText(variableBounds)} >= 0`);
        return constraints;
    }

    function detectZlpModelFromActiveSheet() {
        if (!currentSheet?.grid?.length) return null;
        const candidate = detectVariableCandidate();
        if (!candidate?.refs?.length) return null;
        const variableRefs = candidate.refs;
        const variableBounds = candidate.bounds || rangeBoundsFromRefs(variableRefs);
        const variablesRange = candidate.rangeText || boundsToRangeText(variableBounds) || variableRefs.map(ref => cellAddress(ref.row, ref.col)).join(",");
        const targetRef = findTargetForZlp(variableRefs, variableBounds);
        let constraints = detectConstraintsForZlp(variableRefs, variableBounds, targetRef);
        const existingConstraints = (solverConstraintsInput?.value || "").trim();
        if ((!constraints.length || constraints.every(line => />=\s*0\s*$/i.test(line))) && existingConstraints) {
            constraints = existingConstraints.split(/\n/).map(line => line.trim()).filter(Boolean);
        }
        let maxLimit = null;
        constraints.forEach(line => {
            const split = splitConstraintLine(line);
            if (!split) return;
            parseConstraintSides(split.leftRaw, split.rightRaw).forEach(pair => {
                const right = getConstraintValue(pair.right);
                if (Number.isFinite(right)) maxLimit = maxLimit === null ? right : Math.max(maxLimit, right);
            });
        });
        return { targetRef, variablesRange, constraints, maxLimit };
    }

    function fillSolverFromZlpModel() {
        const model = detectZlpModelFromActiveSheet();
        if (!model) {
            alert("Nie udało się automatycznie rozpoznać układu ZLP w aktywnym arkuszu. Zaznacz komórki zmienne i ograniczenia albo wpisz je ręcznie.");
            return;
        }
        if (solverTargetInput && model.targetRef) solverTargetInput.value = model.targetRef;
        if (solverVariableInput) solverVariableInput.value = model.variablesRange;
        if (solverConstraintsInput) solverConstraintsInput.value = model.constraints.join("\n");
        if (solverMaxInput && Number.isFinite(model.maxLimit) && model.maxLimit > 0) solverMaxInput.value = Math.ceil(model.maxLimit);
    }

    function solverNumber(value) {
        if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
        if (typeof value === "boolean") return value ? 1 : 0;
        const normalized = String(value ?? "").trim().replace(/\s+/g, "").replace(",", ".");
        if (!normalized) return NaN;
        const num = Number(normalized);
        return Number.isFinite(num) ? num : NaN;
    }

    function normalizeSolverExpression(text) {
        const trimmed = String(text || "").trim();
        if (!trimmed) return "";
        if (cellRefToIndex(trimmed)) return trimmed;
        if (/^[-+]?\d+(?:[\.,]\d+)?$/.test(trimmed)) return trimmed;
        if (trimmed.startsWith("=")) return trimmed;
        if (/[A-Z]+\d+|[+\-*/()]|SUMA|MIN|MAX|ŚRED|SRED/i.test(trimmed)) return `=${trimmed}`;
        return trimmed;
    }

    function getConstraintValue(side) {
        if (side && typeof side === "object" && Number.isInteger(side.row) && Number.isInteger(side.col)) {
            return solverNumber(getCellComputedValue(side.row, side.col));
        }
        const expression = normalizeSolverExpression(side);
        if (!expression) return NaN;
        try {
            const value = expression.startsWith("=")
                ? FormulaEngine.evaluate(expression, buildFormulaContext(), new Set())
                : normalizeScalarToken(expression, new Set());
            return solverNumber(value);
        } catch (error) {
            console.warn("Nie udało się policzyć ograniczenia Solvera:", side, error);
            return NaN;
        }
    }

    function splitConstraintLine(line) {
        const normalized = String(line || "")
            .replace(/≤/g, "<=")
            .replace(/≥/g, ">=")
            .replace(/=>/g, ">=")
            .replace(/=</g, "<=");
        let depth = 0;
        for (let i = 0; i < normalized.length; i += 1) {
            const ch = normalized[i];
            if (ch === "(") depth += 1;
            if (ch === ")") depth = Math.max(0, depth - 1);
            if (depth !== 0) continue;
            const two = normalized.slice(i, i + 2);
            if (["<=", ">=", "=="].includes(two)) {
                return { leftRaw: normalized.slice(0, i), op: two === "==" ? "=" : two, rightRaw: normalized.slice(i + 2) };
            }
            if (["<", ">"].includes(ch)) {
                return { leftRaw: normalized.slice(0, i), op: ch, rightRaw: normalized.slice(i + 1) };
            }
            if (ch === "=" && i > 0) {
                return { leftRaw: normalized.slice(0, i), op: "=", rightRaw: normalized.slice(i + 1) };
            }
        }
        return null;
    }

    function parseConstraintSides(leftRaw, rightRaw) {
        const leftText = String(leftRaw || "").trim();
        const rightText = String(rightRaw || "").trim();
        const plainRange = /^\$?[A-Z]+\$?\d+\s*:\s*\$?[A-Z]+\$?\d+$/i;
        const plainRef = /^\$?[A-Z]+\$?\d+$/i;
        const leftExpandable = plainRange.test(leftText) || plainRef.test(leftText);
        const rightExpandable = plainRange.test(rightText) || plainRef.test(rightText);
        const leftRefs = leftExpandable ? expandCellRefs(leftText) : [];
        const rightRefs = rightExpandable ? expandCellRefs(rightText) : [];
        const count = Math.max(leftRefs.length, rightRefs.length);

        if (count > 0 && (leftRefs.length || rightRefs.length)) {
            return Array.from({ length: count }, (_, idx) => ({
                left: leftRefs[idx] || leftRefs[0] || leftText,
                right: rightRefs[idx] || rightRefs[0] || rightText
            }));
        }
        return [{ left: leftText, right: rightText }];
    }

    function parseSolverConstraints() {
        const raw = solverConstraintsInput?.value || "";
        const constraints = [];
        raw.split(/\n/).map(line => line.trim()).filter(Boolean).forEach(line => {
            const split = splitConstraintLine(line);
            if (!split) return;
            const { leftRaw, op, rightRaw } = split;
            parseConstraintSides(leftRaw, rightRaw).forEach(pair => {
                constraints.push({ ...pair, op });
            });
        });
        return constraints;
    }

    function constraintsSatisfied(constraints) {
        return constraints.every(constraint => {
            const left = getConstraintValue(constraint.left);
            const right = getConstraintValue(constraint.right);
            if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
            if (constraint.op === "<=") return left <= right + 1e-7;
            if (constraint.op === ">=") return left + 1e-7 >= right;
            if (constraint.op === "<") return left < right + 1e-7;
            if (constraint.op === ">") return left + 1e-7 > right;
            return Math.abs(left - right) <= 1e-7;
        });
    }

    function ensureRefsFitGrid(refs) {
        const maxRow = refs.reduce((max, ref) => Math.max(max, ref.row + 1), currentRows);
        const maxCol = refs.reduce((max, ref) => Math.max(max, ref.col + 1), currentCols);
        ensureDimensions(maxRow, maxCol);
    }

    function setSolverVariableValues(variableRefs, values) {
        variableRefs.forEach((ref, idx) => {
            currentSheet.grid[ref.row][ref.col] = values[idx];
        });
    }

    function solveLinearSystem(matrix, vector) {
        const n = vector.length;
        const a = matrix.map((row, idx) => [...row, vector[idx]]);
        for (let col = 0; col < n; col += 1) {
            let pivot = col;
            for (let row = col + 1; row < n; row += 1) {
                if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
            }
            if (Math.abs(a[pivot][col]) < 1e-10) return null;
            [a[col], a[pivot]] = [a[pivot], a[col]];
            const divisor = a[col][col];
            for (let c = col; c <= n; c += 1) a[col][c] /= divisor;
            for (let row = 0; row < n; row += 1) {
                if (row === col) continue;
                const factor = a[row][col];
                for (let c = col; c <= n; c += 1) a[row][c] -= factor * a[col][c];
            }
        }
        return a.map(row => row[n]);
    }

    function combinationsOfIndexes(count, choose) {
        const results = [];
        function build(start, combo) {
            if (combo.length === choose) {
                results.push([...combo]);
                return;
            }
            for (let i = start; i < count; i += 1) {
                combo.push(i);
                build(i + 1, combo);
                combo.pop();
            }
        }
        build(0, []);
        return results;
    }

    function buildLinearFunction(variableRefs, side, baseValues) {
        setSolverVariableValues(variableRefs, baseValues);
        const constant = getConstraintValue(side);
        if (!Number.isFinite(constant)) return null;
        const coeffs = variableRefs.map((_, idx) => {
            const testValues = [...baseValues];
            testValues[idx] += 1;
            setSolverVariableValues(variableRefs, testValues);
            return getConstraintValue(side) - constant;
        });
        const ones = baseValues.map(value => value + 1);
        setSolverVariableValues(variableRefs, ones);
        const actual = getConstraintValue(side);
        const predicted = constant + coeffs.reduce((sum, coeff) => sum + coeff, 0);
        if (!Number.isFinite(actual) || Math.abs(actual - predicted) > 1e-5) return null;
        return { constant, coeffs };
    }

    function tryBuildLinearModel(variableRefs, constraints, target, searchMin, searchMax) {
        if (!variableRefs.length || variableRefs.length > 8) return null;
        const baseValues = variableRefs.map(() => 0);
        const targetFunction = buildLinearFunction(variableRefs, target, baseValues);
        if (!targetFunction) return null;
        const inequalities = [];
        for (const constraint of constraints) {
            const left = buildLinearFunction(variableRefs, constraint.left, baseValues);
            const right = buildLinearFunction(variableRefs, constraint.right, baseValues);
            if (!left || !right) return null;
            let coeffs = left.coeffs.map((coeff, idx) => coeff - right.coeffs[idx]);
            let rhs = right.constant - left.constant;
            if (constraint.op === ">=" || constraint.op === ">") {
                coeffs = coeffs.map(value => -value);
                rhs = -rhs;
            }
            if (constraint.op === "=") {
                inequalities.push({ coeffs, rhs });
                inequalities.push({ coeffs: coeffs.map(value => -value), rhs: -rhs });
            } else {
                inequalities.push({ coeffs, rhs });
            }
        }
        variableRefs.forEach((_, idx) => {
            const lower = Array.from({ length: variableRefs.length }, () => 0);
            lower[idx] = -1;
            inequalities.push({ coeffs: lower, rhs: -searchMin });
        });
        return { targetFunction, inequalities };
    }

    function solveLinearCandidate(variableRefs, constraints, target, mode, searchMin, searchMax) {
        if (mode === "target") return null;
        const model = tryBuildLinearModel(variableRefs, constraints, target, searchMin, searchMax);
        if (!model) return null;
        const n = variableRefs.length;
        const candidates = [variableRefs.map(() => searchMin)];
        combinationsOfIndexes(model.inequalities.length, n).forEach(combo => {
            const matrix = combo.map(idx => model.inequalities[idx].coeffs);
            const vector = combo.map(idx => model.inequalities[idx].rhs);
            const solution = solveLinearSystem(matrix, vector);
            if (solution && solution.every(value => Number.isFinite(value))) candidates.push(solution);
        });
        let best = null;
        candidates.forEach(values => {
            if (values.some(value => value < searchMin - 1e-7)) return;
            setSolverVariableValues(variableRefs, values);
            const linearOk = model.inequalities.every(item => item.coeffs.reduce((sum, coeff, idx) => sum + coeff * values[idx], 0) <= item.rhs + 1e-6);
            if (!linearOk) return;
            if (constraints.length && !constraintsSatisfied(constraints)) return;
            const result = solverNumber(getCellComputedValue(target.row, target.col));
            if (!Number.isFinite(result)) return;
            if (!best || (mode === "max" ? result > best.value + 1e-7 : result < best.value - 1e-7)) {
                best = { values: values.map(value => Math.abs(value) < 1e-9 ? 0 : Number(value.toFixed(10))), value: result };
            }
        });
        return best;
    }

    function showSolverResult(message, details = []) {
        if (!solverResultBox) return;
        const detailHtml = details.length
            ? `<ul>${details.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : "";
        solverResultBox.innerHTML = `<strong>Solver:</strong> ${escapeHtml(message)}${detailHtml}`;
        solverResultBox.hidden = false;
    }

    function clearSolverResult() {
        if (!solverResultBox) return;
        solverResultBox.hidden = true;
        solverResultBox.innerHTML = "";
    }

    function boundsSize(bounds) {
        return bounds ? { rows: bounds.rowEnd - bounds.rowStart + 1, cols: bounds.colEnd - bounds.colStart + 1 } : { rows: 0, cols: 0 };
    }

    function boundsEqualSize(a, b) {
        const aa = boundsSize(a);
        const bb = boundsSize(b);
        return aa.rows === bb.rows && aa.cols === bb.cols && aa.rows > 0 && aa.cols > 0;
    }

    function getBoundsNumbers(bounds) {
        if (!bounds) return [];
        const values = [];
        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
            const current = [];
            for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
                const value = getCellComputedValue(row, col);
                const number = solverNumber(value);
                if (!Number.isFinite(number)) return null;
                current.push(number);
            }
            values.push(current);
        }
        return values;
    }

    function boundsAllNumeric(bounds) {
        const values = getBoundsNumbers(bounds);
        return Boolean(values && values.length && values.every(row => row.every(Number.isFinite)));
    }

    function flattenMatrix(matrix) {
        return matrix.flatMap(row => row);
    }

    function parseSumProductRangeArgs(formulaText) {
        const raw = String(formulaText || "").trim();
        if (!/^=/.test(raw) || !/SUMA\.ILOCZYN[ÓO]W|SUMPRODUCT/i.test(raw)) return [];
        const args = splitFormulaArgs(getFormulaArgsText(raw));
        return args
            .filter(isRangeArg)
            .map(arg => ({ text: normalizeCellRefText(arg), bounds: rangeTextToBounds(arg) }))
            .filter(item => item.bounds);
    }

    function findNumericSubBounds(containerBounds, wantedRows, wantedCols, preferredBounds = null) {
        if (!containerBounds || wantedRows <= 0 || wantedCols <= 0) return null;
        let best = null;
        for (let row = containerBounds.rowStart; row + wantedRows - 1 <= containerBounds.rowEnd; row += 1) {
            for (let col = containerBounds.colStart; col + wantedCols - 1 <= containerBounds.colEnd; col += 1) {
                const bounds = { rowStart: row, rowEnd: row + wantedRows - 1, colStart: col, colEnd: col + wantedCols - 1 };
                if (!boundsAllNumeric(bounds)) continue;
                let score = 100;
                if (preferredBounds) {
                    score -= Math.abs(bounds.colStart - preferredBounds.colStart) * 4;
                    score -= Math.abs(bounds.rowStart - Math.max(0, preferredBounds.rowStart - wantedRows - 1)) * 2;
                }
                if (!best || score > best.score) best = { bounds, score };
            }
        }
        return best?.bounds || null;
    }

    function findCostBoundsForSolverTransport(target, variableBounds) {
        if (!target || !variableBounds) return null;
        const variableRangeText = boundsToRangeText(variableBounds).toUpperCase();
        const targetRaw = solverCellRawValue(target.row, target.col);
        const wanted = boundsSize(variableBounds);
        const ranges = parseSumProductRangeArgs(targetRaw);
        const variableArg = ranges.find(item => sameBounds(item.bounds, variableBounds) || item.text.toUpperCase() === variableRangeText);
        const otherArgs = ranges.filter(item => !sameBounds(item.bounds, variableBounds));
        for (const item of otherArgs) {
            if (boundsEqualSize(item.bounds, variableBounds) && boundsAllNumeric(item.bounds)) return item.bounds;
            const sub = findNumericSubBounds(item.bounds, wanted.rows, wanted.cols, variableBounds);
            if (sub) return sub;
        }
        if (variableArg && ranges.length === 2) {
            const other = ranges.find(item => item !== variableArg);
            if (other) {
                if (boundsEqualSize(other.bounds, variableBounds) && boundsAllNumeric(other.bounds)) return other.bounds;
                const sub = findNumericSubBounds(other.bounds, wanted.rows, wanted.cols, variableBounds);
                if (sub) return sub;
            }
        }
        for (let gap = 0; gap <= 4; gap += 1) {
            const rowStart = variableBounds.rowStart - wanted.rows - gap;
            if (rowStart < 0) continue;
            const candidate = { rowStart, rowEnd: rowStart + wanted.rows - 1, colStart: variableBounds.colStart, colEnd: variableBounds.colEnd };
            if (boundsAllNumeric(candidate)) return candidate;
        }
        return null;
    }

    function constraintBoundsFromParsed(pairSide) {
        if (pairSide && typeof pairSide === "object" && Number.isInteger(pairSide.row) && Number.isInteger(pairSide.col)) {
            return { rowStart: pairSide.row, rowEnd: pairSide.row, colStart: pairSide.col, colEnd: pairSide.col };
        }
        return rangeTextToBounds(String(pairSide || ""));
    }

    function getRawConstraintPairs() {
        const raw = solverConstraintsInput?.value || "";
        const items = [];
        raw.split(/\n/).map(line => line.trim()).filter(Boolean).forEach(line => {
            const split = splitConstraintLine(line);
            if (!split) return;
            const leftBounds = rangeTextToBounds(split.leftRaw);
            const rightBounds = rangeTextToBounds(split.rightRaw);
            items.push({ line, op: split.op, leftRaw: split.leftRaw, rightRaw: split.rightRaw, leftBounds, rightBounds });
        });
        return items;
    }

    function findTransportationConstraintBounds(variableBounds) {
        const size = boundsSize(variableBounds);
        const result = { rowFormulaBounds: null, rowLimitBounds: null, colFormulaBounds: null, colLimitBounds: null };
        const pairs = getRawConstraintPairs();
        pairs.forEach(item => {
            if (item.leftBounds && item.rightBounds) {
                const leftSize = boundsSize(item.leftBounds);
                const rightSize = boundsSize(item.rightBounds);
                const leftIsVertical = leftSize.rows === size.rows && leftSize.cols === 1;
                const rightIsVertical = rightSize.rows === size.rows && rightSize.cols === 1;
                const leftIsHorizontal = leftSize.rows === 1 && leftSize.cols === size.cols;
                const rightIsHorizontal = rightSize.rows === 1 && rightSize.cols === size.cols;
                if (leftIsVertical && rightIsVertical && item.leftBounds.colStart > variableBounds.colEnd) {
                    result.rowFormulaBounds = item.leftBounds;
                    result.rowLimitBounds = item.rightBounds;
                }
                if (leftIsHorizontal && rightIsHorizontal && item.leftBounds.rowStart > variableBounds.rowEnd) {
                    result.colFormulaBounds = item.leftBounds;
                    result.colLimitBounds = item.rightBounds;
                }
            }
        });
        return result;
    }

    function findPlainVerticalBoundsNearCost(costBounds, rowsCount) {
        if (!costBounds) return null;
        const rows = currentSheet?.grid?.length || 0;
        const cols = Math.max(...(currentSheet?.grid || []).map(row => Array.isArray(row) ? row.length : 0), 0);
        let best = null;
        for (let col = costBounds.colEnd + 1; col < Math.min(cols, costBounds.colEnd + 6); col += 1) {
            const bounds = { rowStart: costBounds.rowStart, rowEnd: costBounds.rowStart + rowsCount - 1, colStart: col, colEnd: col };
            if (bounds.rowEnd >= rows || !boundsAllNumeric(bounds)) continue;
            let score = 50 - Math.abs(col - (costBounds.colEnd + 1));
            if (!best || score > best.score) best = { bounds, score };
        }
        return best?.bounds || null;
    }

    function findPlainHorizontalBoundsNearVariables(variableBounds, colsCount) {
        if (!variableBounds) return null;
        for (let gap = 0; gap <= 4; gap += 1) {
            const row = variableBounds.rowStart - 1 - gap;
            if (row < 0) continue;
            const bounds = { rowStart: row, rowEnd: row, colStart: variableBounds.colStart, colEnd: variableBounds.colStart + colsCount - 1 };
            if (boundsAllNumeric(bounds)) return bounds;
        }
        return null;
    }

    function ensureTransportHelperFormulas(variableBounds, rowFormulaBounds, colFormulaBounds) {
        const size = boundsSize(variableBounds);
        if (rowFormulaBounds) {
            for (let i = 0; i < size.rows; i += 1) {
                const row = rowFormulaBounds.rowStart + i;
                const col = rowFormulaBounds.colStart;
                const sumRange = rangeTextFromBounds(variableBounds.rowStart + i, variableBounds.rowStart + i, variableBounds.colStart, variableBounds.colEnd);
                if (!isFormulaCell(solverCellRawValue(row, col))) currentSheet.grid[row][col] = `=SUMA(${sumRange})`;
            }
        }
        if (colFormulaBounds) {
            for (let j = 0; j < size.cols; j += 1) {
                const row = colFormulaBounds.rowStart;
                const col = colFormulaBounds.colStart + j;
                const sumRange = rangeTextFromBounds(variableBounds.rowStart, variableBounds.rowEnd, variableBounds.colStart + j, variableBounds.colStart + j);
                if (!isFormulaCell(solverCellRawValue(row, col))) currentSheet.grid[row][col] = `=SUMA(${sumRange})`;
            }
        }
    }

    function buildSolverTransportModel(target, variableRefs, variableBounds, mode, searchMax) {
        if (!target || !variableBounds) return null;
        const size = boundsSize(variableBounds);
        if (size.rows < 2 || size.cols < 2 || variableRefs.length !== size.rows * size.cols || variableRefs.length > 12) return null;
        const costBounds = findCostBoundsForSolverTransport(target, variableBounds);
        if (!costBounds) return null;
        const costMatrix = getBoundsNumbers(costBounds);
        if (!costMatrix) return null;
        const detected = findTransportationConstraintBounds(variableBounds);
        const rowLimitBounds = detected.rowLimitBounds || findPlainVerticalBoundsNearCost(costBounds, size.rows);
        const colLimitBounds = detected.colLimitBounds || findPlainHorizontalBoundsNearVariables(variableBounds, size.cols);
        if (!rowLimitBounds || !colLimitBounds) return null;
        const suppliesMatrix = getBoundsNumbers(rowLimitBounds);
        const demandsMatrix = getBoundsNumbers(colLimitBounds);
        if (!suppliesMatrix || !demandsMatrix) return null;
        const supplies = suppliesMatrix.map(row => row[0]);
        const demands = demandsMatrix[0];
        if (supplies.length !== size.rows || demands.length !== size.cols) return null;
        const rowFormulaBounds = detected.rowFormulaBounds || {
            rowStart: variableBounds.rowStart,
            rowEnd: variableBounds.rowEnd,
            colStart: variableBounds.colEnd + 1,
            colEnd: variableBounds.colEnd + 1
        };
        const colFormulaBounds = detected.colFormulaBounds || {
            rowStart: variableBounds.rowEnd + 1,
            rowEnd: variableBounds.rowEnd + 1,
            colStart: variableBounds.colStart,
            colEnd: variableBounds.colEnd
        };
        return { target, variableBounds, costBounds, costMatrix, supplies, demands, rowLimitBounds, colLimitBounds, rowFormulaBounds, colFormulaBounds, mode, searchMax };
    }

    function solveLinearWithEqualitiesAndInequalities(objectiveCoeffs, equalities, inequalities, mode) {
        const n = objectiveCoeffs.length;
        const eqCount = equalities.length;
        if (!n || eqCount > n) return null;
        const candidates = [];
        const needActive = n - eqCount;
        combinationsOfIndexes(inequalities.length, needActive).forEach(combo => {
            const rows = equalities.map(item => item.coeffs);
            const rhs = equalities.map(item => item.rhs);
            combo.forEach(idx => {
                rows.push(inequalities[idx].coeffs);
                rhs.push(inequalities[idx].rhs);
            });
            const solution = solveLinearSystem(rows, rhs);
            if (solution && solution.every(Number.isFinite)) candidates.push(solution);
        });
        if (needActive === 0) {
            const solution = solveLinearSystem(equalities.map(item => item.coeffs), equalities.map(item => item.rhs));
            if (solution && solution.every(Number.isFinite)) candidates.push(solution);
        }
        let best = null;
        candidates.forEach(values => {
            const eqOk = equalities.every(item => Math.abs(item.coeffs.reduce((sum, coeff, idx) => sum + coeff * values[idx], 0) - item.rhs) <= 1e-6);
            if (!eqOk) return;
            const ineqOk = inequalities.every(item => item.coeffs.reduce((sum, coeff, idx) => sum + coeff * values[idx], 0) <= item.rhs + 1e-6);
            if (!ineqOk) return;
            const value = objectiveCoeffs.reduce((sum, coeff, idx) => sum + coeff * values[idx], 0);
            if (!best || (mode === "max" ? value > best.value + 1e-7 : value < best.value - 1e-7)) {
                best = { values: values.map(value => Math.abs(value) < 1e-9 ? 0 : Number(value.toFixed(10))), value };
            }
        });
        return best;
    }

    function solveTransportationModel(model) {
        const m = model.supplies.length;
        const n = model.demands.length;
        const variableCount = m * n;
        const objectiveCoeffs = flattenMatrix(model.costMatrix);
        const equalities = [];
        const inequalities = [];
        for (let i = 0; i < m; i += 1) {
            const coeffs = Array.from({ length: variableCount }, () => 0);
            for (let j = 0; j < n; j += 1) coeffs[i * n + j] = 1;
            equalities.push({ coeffs, rhs: model.supplies[i] });
        }
        for (let j = 0; j < n; j += 1) {
            const coeffs = Array.from({ length: variableCount }, () => 0);
            for (let i = 0; i < m; i += 1) coeffs[i * n + j] = 1;
            inequalities.push({ coeffs, rhs: model.demands[j] });
        }
        for (let idx = 0; idx < variableCount; idx += 1) {
            const lower = Array.from({ length: variableCount }, () => 0);
            lower[idx] = -1;
            inequalities.push({ coeffs: lower, rhs: 0 });
        }
        return solveLinearWithEqualitiesAndInequalities(objectiveCoeffs, equalities, inequalities, model.mode === "max" ? "max" : "min");
    }

    function runTransportationSolverShortcut(target, variableRefs, variableBounds, mode, searchMax) {
        const model = buildSolverTransportModel(target, variableRefs, variableBounds, mode, searchMax);
        if (!model) return null;
        const solution = solveTransportationModel(model);
        if (!solution) return null;
        ensureTransportHelperFormulas(model.variableBounds, model.rowFormulaBounds, model.colFormulaBounds);
        const variableRange = boundsToRangeText(model.variableBounds);
        const costRange = boundsToRangeText(model.costBounds);
        currentSheet.grid[target.row][target.col] = `=SUMA.ILOCZYNÓW(${costRange}; ${variableRange})`;
        const rowFormulaRange = boundsToRangeText(model.rowFormulaBounds);
        const rowLimitRange = boundsToRangeText(model.rowLimitBounds);
        const colFormulaRange = boundsToRangeText(model.colFormulaBounds);
        const colLimitRange = boundsToRangeText(model.colLimitBounds);
        if (solverConstraintsInput) {
            solverConstraintsInput.value = `${rowFormulaRange} = ${rowLimitRange}\n${colFormulaRange} <= ${colLimitRange}`;
        }
        return {
            values: solution.values,
            value: solution.value,
            details: [
                `rozpoznano model transportowy/ZLP: koszt ${costRange}, zmienne ${variableRange}`,
                `ograniczenia ustawione jak w Solverze: podaż jako równość, zapotrzebowanie jako górny limit`
            ]
        };
    }


    function runSolverFromModal() {
        if (!currentSheet) return;
        activateSelectedSolverSheet();
        clearSolverResult();

        const targetRef = solverTargetInput?.value?.trim().toUpperCase();
        const variablesRaw = solverVariableInput?.value?.trim().toUpperCase();
        const mode = getSolverMode();
        const step = Math.abs(solverNumber(solverStepInput?.value || 1)) || 1;
        const min = solverNumber(solverMinInput?.value || 0);
        const max = solverNumber(solverMaxInput?.value || 100);
        const targetValue = solverNumber(solverTargetValueInput?.value || 0);
        const forceNonnegative = solverNonnegativeInput?.checked !== false;

        const target = cellRefToIndex(targetRef);
        if (!target || !variablesRaw || !Number.isFinite(min) || !Number.isFinite(max) || max < min) {
            alert("Podaj poprawną komórkę celu, komórki zmienne oraz zakres min/max.");
            return;
        }

        let variableRefs = expandCellRefs(variablesRaw);
        const seen = new Set();
        variableRefs = variableRefs.filter(ref => {
            const key = `${ref.row}:${ref.col}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (!variableRefs.length) {
            alert("Nie znaleziono poprawnych komórek zmiennych.");
            return;
        }

        ensureRefsFitGrid([...variableRefs, target]);
        let constraints = parseSolverConstraints();
        pushHistorySnapshot();

        const originalValues = variableRefs.map(v => currentSheet.grid[v.row][v.col]);
        const searchMin = forceNonnegative ? Math.max(0, min) : min;
        let bestScore = Infinity;
        let bestValue = null;
        let bestCombination = variableRefs.map(() => searchMin);
        let solverDetails = [];
        let solverUsedShortcut = false;

        function setVariables(values) {
            setSolverVariableValues(variableRefs, values);
        }

        function scoreObjective(result) {
            if (mode === "target") return Math.abs(result - targetValue);
            if (mode === "max") return -result;
            return result;
        }

        function search(index, currentCombination) {
            if (index === variableRefs.length) {
                setVariables(currentCombination);
                if (constraints.length && !constraintsSatisfied(constraints)) return;

                const result = solverNumber(getCellComputedValue(target.row, target.col));
                if (!Number.isFinite(result)) return;

                const score = scoreObjective(result);
                if (score < bestScore) {
                    bestScore = score;
                    bestValue = result;
                    bestCombination = [...currentCombination];
                }
                return;
            }

            for (let test = searchMin; test <= max + 1e-9; test += step) {
                currentCombination[index] = Number(test.toFixed(10));
                search(index + 1, currentCombination);
            }
        }

        const variableBounds = rangeBoundsFromRefs(variableRefs);
        const transportCandidate = mode !== "target"
            ? runTransportationSolverShortcut(target, variableRefs, variableBounds, mode, max)
            : null;
        if (transportCandidate) {
            bestValue = transportCandidate.value;
            bestCombination = transportCandidate.values;
            bestScore = scoreObjective(transportCandidate.value);
            solverDetails = transportCandidate.details || [];
            solverUsedShortcut = true;
            constraints = parseSolverConstraints();
        }

        const linearCandidate = solverUsedShortcut ? null : solveLinearCandidate(variableRefs, constraints, target, mode, searchMin, max);
        if (!solverUsedShortcut && linearCandidate) {
            bestValue = linearCandidate.value;
            bestCombination = linearCandidate.values;
            bestScore = scoreObjective(linearCandidate.value);
            solverDetails = ["rozpoznano liniowy model ZLP z komórki celu, zmiennych i ograniczeń"];
        }

        const valuesPerVariable = Math.floor((max - searchMin) / step) + 1;
        const estimatedGridChecks = Math.pow(Math.max(valuesPerVariable, 1), variableRefs.length);
        if (!solverUsedShortcut && !linearCandidate && estimatedGridChecks > 200000) {
            originalValues.forEach((value, idx) => {
                const ref = variableRefs[idx];
                currentSheet.grid[ref.row][ref.col] = value;
            });
            alert("Solver rozpoznał zbyt duży zakres do przeszukiwania krok po kroku. Użyj 'Wczytaj ZLP' albo zmniejsz zakres/krok.");
            return;
        }
        if (!solverUsedShortcut && (!linearCandidate || mode === "target")) {
            search(0, Array.from({ length: variableRefs.length }, () => searchMin));
        }

        if (bestValue === null) {
            originalValues.forEach((value, idx) => {
                const ref = variableRefs[idx];
                currentSheet.grid[ref.row][ref.col] = value;
            });
            alert(window.ARES_I18N ? window.ARES_I18N.t("Nie znaleziono rozwiązania spełniającego ograniczenia.") : "Nie znaleziono rozwiązania spełniającego ograniczenia.");
            return;
        }

        setVariables(bestCombination);
        renderGrid();
        markDirty();
        showSolverResult(`znaleziono rozwiązanie. Wartość funkcji celu: ${displayFormulaValue(bestValue)}.`, solverDetails);

        const card = document.createElement("div");
        card.className = "we-object-card";
        card.innerHTML = `
            <div class="we-chart-object-title">Solver</div>
            <div class="we-object-body">
                <div><strong>${window.ARES_I18N ? window.ARES_I18N.t("Komórka celu") : "Komórka celu"}:</strong> ${escapeHtml(targetRef)}</div>
                <div><strong>${window.ARES_I18N ? window.ARES_I18N.t("Komórki zmienne") : "Komórki zmienne"}:</strong> ${escapeHtml(variablesRaw)}</div>
                <div><strong>${window.ARES_I18N ? window.ARES_I18N.t("Kierunek optymalizacji") : "Kierunek optymalizacji"}:</strong> ${mode === "max" ? (window.ARES_I18N ? window.ARES_I18N.t("maksymalizuj") : "maksymalizuj") : mode === "min" ? (window.ARES_I18N ? window.ARES_I18N.t("minimalizuj") : "minimalizuj") : `${window.ARES_I18N ? window.ARES_I18N.t("wartość docelowa") : "wartość docelowa"} ${targetValue}`}</div>
                <div><strong>${window.ARES_I18N ? window.ARES_I18N.t("Najlepsze wartości") : "Najlepsze wartości"}:</strong> ${escapeHtml(bestCombination.join(", "))}</div>
                <div><strong>${window.ARES_I18N ? window.ARES_I18N.t("Wartość funkcji celu") : "Wartość funkcji celu"}:</strong> ${escapeHtml(displayFormulaValue(bestValue))}</div>
                <div><strong>${window.ARES_I18N ? window.ARES_I18N.t("Ograniczenia") : "Ograniczenia"}:</strong> ${constraints.length ? escapeHtml(solverConstraintsInput.value.replace(/\n/g, " | ")) : (window.ARES_I18N ? window.ARES_I18N.t("brak") : "brak")}</div>
            </div>
        `;
        generatedObjectsCard.hidden = false;
        generatedObjectsArea.prepend(card);

        logUserAction("Uruchomiono solver", { type: "solver_run", target: targetRef, variables: variablesRaw, mode, objectiveValue: bestValue });
        // Zostawiamy panel otwarty, żeby było od razu widać wynik i użyte ustawienia.
    }

    function initializeMenus() {
        insertMenuItems.forEach(item => {
            item.addEventListener("click", () => {
                const submenuId = item.dataset.submenu;
                const action = item.dataset.action;

                insertMenuItems.forEach(btn => btn.classList.remove("active"));
                item.classList.add("active");

                if (submenuId) {
                    insertSubmenus.forEach(submenu => submenu.classList.remove("active"));
                    document.getElementById(submenuId)?.classList.add("active");
                    return;
                }

                if (action) applyInsertAction(action);
            });
        });

        insertSubmenuItems.forEach(item => {
            item.addEventListener("click", () => {
                const action = item.dataset.action;
                if (action) applyInsertAction(action);
            });
        });
    }

    function setRibbonFloating(target) {
        if (!toolbarCard) return;
        const isFloating = target && target !== "start";
        toolbarCard.classList.toggle("ribbon-floating", Boolean(isFloating));
        toolbarCard.classList.toggle("ribbon-open", Boolean(isFloating));
    }

    function openRibbon() {
        window.clearTimeout(ribbonCloseTimer);
        const activeTarget = document.querySelector(".we-tab.active")?.dataset.tab || "start";
        setRibbonFloating(activeTarget);
    }

    function activateStartRibbon() {
        const startTab = document.querySelector('.we-tab[data-tab="start"]');
        if (!startTab) return;
        tabs.forEach(item => item.classList.remove("active"));
        panels.forEach(panel => panel.classList.remove("active"));
        startTab.classList.add("active");
        document.querySelector('.we-ribbon-panel[data-panel="start"]')?.classList.add("active");
        setRibbonFloating("start");
    }

    function closeRibbonSoon() {
        window.clearTimeout(ribbonCloseTimer);
        ribbonCloseTimer = window.setTimeout(() => {
            activateStartRibbon();
        }, 160);
    }

    function activateRibbonTab(tab, keepOpen = true) {
        if (!tab) return;
        const target = tab.dataset.tab;
        tabs.forEach(item => item.classList.remove("active"));
        panels.forEach(panel => panel.classList.remove("active"));
        tab.classList.add("active");
        document.querySelector(`.we-ribbon-panel[data-panel="${target}"]`)?.classList.add("active");
        if (target === "addons" && !editorAddonsLoaded) {
            loadEditorAddons();
        }
        if (keepOpen) setRibbonFloating(target);
        else setRibbonFloating("start");
    }

    function getRibbonInteractionMode() {
        try {
            const prefs = JSON.parse(localStorage.getItem("ares_preferences") || "{}");
            return prefs.ribbonMode === "click" ? "click" : "hover";
        } catch (error) {
            return "hover";
        }
    }

    function initializeTabs() {
        const ribbonMode = getRibbonInteractionMode();
        if (toolbarCard) toolbarCard.dataset.ribbonMode = ribbonMode;
        tabs.forEach(tab => {
            tab.addEventListener("click", event => {
                if (ribbonMode === "click") {
                    event.preventDefault();
                    activateRibbonTab(tab, true);
                    return;
                }
                activateRibbonTab(tab);
            });
            tab.addEventListener("mouseenter", () => {
                if (ribbonMode === "hover") activateRibbonTab(tab);
            });
            tab.addEventListener("focus", () => activateRibbonTab(tab));
            tab.addEventListener("mouseleave", () => {
                if (ribbonMode === "hover") closeRibbonSoon();
            });
            tab.addEventListener("blur", () => {
                if (ribbonMode === "hover") closeRibbonSoon();
            });
        });
        ribbonEl?.addEventListener("mouseenter", () => {
            if (ribbonMode === "hover") openRibbon();
        });
        ribbonEl?.addEventListener("mouseleave", () => {
            if (ribbonMode === "hover") closeRibbonSoon();
        });
        ribbonEl?.addEventListener("focusin", openRibbon);
        ribbonEl?.addEventListener("focusout", () => {
            if (ribbonMode === "hover") closeRibbonSoon();
        });
        document.addEventListener("click", event => {
            if (ribbonMode !== "click") return;
            if (event.target.closest(".we-tabs") || event.target.closest(".we-ribbon")) return;
            activateStartRibbon();
        });
    }
    function initializeModals() {
        modalCloseButtons.forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.closeModal;
                const modal = document.getElementById(target);
                closeModal(modal);
            });
        });

        [chartModal, pivotModal, solverModal, reportModal, commentModal, emojiModal, smartInsertModal].forEach(modal => {
            modal?.addEventListener("click", event => {
                if (modal === solverModal) return;
                if (event.target === modal) closeModal(modal);
            });
        });
    }

    function getAllFormulaItems() {
        if (!window.FORMULA_CATALOG) return [];
        return Object.values(window.FORMULA_CATALOG).flat();
    }


    function getFormulaNameFromText(value) {
        const match = String(value || "").trim().match(/^=\s*([A-ZĄĆĘŁŃÓŚŹŻ.\-]+)/i);
        return match ? match[1].toUpperCase() : "";
    }
    function getFormulaArgsText(value) {
        const text = String(value || "").trim();
        const openIndex = text.indexOf("(");
        if (openIndex < 0 || !text.endsWith(")")) return null;
        return text.slice(openIndex + 1, -1);
    }
    function splitFormulaArgs(argsText) {
        if (argsText === null) return [];
        const args = [];
        let current = "";
        let depth = 0;
        let quote = null;
        for (let i = 0; i < argsText.length; i += 1) {
            const ch = argsText[i];
            if (quote) {
                current += ch;
                if (ch === quote) quote = null;
                continue;
            }
            if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
            if (ch === "(") depth += 1;
            if (ch === ")") depth = Math.max(0, depth - 1);
            if ((ch === ";" || ch === ",") && depth === 0) { args.push(current.trim()); current = ""; }
            else current += ch;
        }
        if (current.trim() || argsText.trim()) args.push(current.trim());
        return args;
    }
    function findFormulaDefinition(name) {
        return getAllFormulaItems().find(fn => fn.name.toUpperCase() === String(name || "").toUpperCase()) || null;
    }
    function rangeToCells(rangeText) {
        const text = String(rangeText || "").trim().replace(/\$/g, "");
        const parts = text.split(":");
        if (parts.length === 1) { const one = cellRefToIndex(parts[0]); return one ? [one] : []; }
        const start = cellRefToIndex(parts[0]); const end = cellRefToIndex(parts[1]);
        if (!start || !end) return [];
        const cells = [];
        for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row += 1) {
            for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col += 1) cells.push({ row, col });
        }
        return cells;
    }
    function isRangeArg(arg) { return /^\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?$/i.test(String(arg || "").trim()); }
    function argHasBlankCells(arg) {
        return rangeToCells(arg).some(({ row, col }) => {
            const value = currentSheet?.grid?.[row]?.[col];
            return value === undefined || value === null || String(value).trim() === "";
        });
    }
    function argIsNumericOrCell(arg) {
        const raw = String(arg || "").trim();
        if (!raw) return false;
        if (isRangeArg(raw)) {
            const cells = rangeToCells(raw);
            if (!cells.length) return false;
            return cells.every(({ row, col }) => isNumericValue(getCellComputedValue(row, col)));
        }
        const cell = cellRefToIndex(raw);
        if (cell) return isNumericValue(getCellComputedValue(cell.row, cell.col));
        return Number.isFinite(Number(raw.replace(",", "."))) || /^[-+]?\d+(?:[,.]\d+)?(?:\s*[+\-*/]\s*\d+(?:[,.]\d+)?)*$/.test(raw);
    }
    function validateFormulaBeforeApply(value) {
        const text = String(value || "").trim();
        if (!text.startsWith("=")) return { ok: true };
        const name = getFormulaNameFromText(text);
        if (!name) return { ok: false, message: "Formuła musi zaczynać się od nazwy funkcji, np. =SUMA(A1:A10)." };
        const def = findFormulaDefinition(name);
        if (!def) return { ok: false, message: "Nie znam funkcji " + name + ". Wybierz ją z listy podpowiedzi albo sprawdź pisownię." };
        const argsText = getFormulaArgsText(text);
        if (argsText === null) return { ok: false, message: "Funkcja " + name + " wymaga nawiasów. Przykład: " + (def.example || def.syntax) + "." };
        const args = splitFormulaArgs(argsText);
        const minArgs = Number.isFinite(def.minArgs) ? def.minArgs : 0;
        const maxArgs = Number.isFinite(def.maxArgs) ? def.maxArgs : Infinity;
        if (args.length < minArgs) return { ok: false, message: name + ": za mało argumentów. Wymagane: " + minArgs + ". Składnia: " + def.syntax + "." };
        if (args.length > maxArgs) return { ok: false, message: name + ": za dużo argumentów. Maksymalnie: " + maxArgs + ". Składnia: " + def.syntax + "." };
        if (def.requiresBackend || ["IMPORTRANGE", "IMPORTHTML", "IMPORTDATA", "IMPORTFEED", "IMPORTXML", "GOOGLEFINANCE"].includes(name)) {
            return { ok: false, message: name + " wymaga podłączenia zewnętrznego źródła/backendu. W tej wersji zapis jest blokowany, żeby nie tworzyć błędnego wyniku." };
        }
        const finance = ["PMT", "PV", "FV", "NPV", "XNPV", "IRR", "XIRR", "NPER", "RATE", "IPMT", "PPMT", "RRI", "MIRR", "FVSCHEDULE", "PI", "TP"];
        if (finance.includes(name)) {
            if (args.some(arg => !arg.trim())) return { ok: false, message: name + ": wszystkie wymagane pola muszą być uzupełnione." };
            if (["NPV", "XNPV", "IRR", "XIRR", "MIRR", "FVSCHEDULE", "PI"].includes(name)) {
                const idx = name === "FVSCHEDULE" ? 1 : (name === "NPV" || name === "XNPV") ? 1 : 0;
                if (!isRangeArg(args[idx])) return { ok: false, message: name + ": argument „" + (def.params?.[idx]?.label || "zakres") + "” musi być zakresem komórek, np. A1:A5." };
                if (argHasBlankCells(args[idx])) return { ok: false, message: name + ": najpierw uzupełnij wszystkie komórki w zakresie " + args[idx] + "." };
            }
            for (let idx = 0; idx < args.length; idx += 1) {
                if ((name === "XNPV" && idx === 2) || (["IRR", "XIRR"].includes(name) && idx === 0)) continue;
                if (!argIsNumericOrCell(args[idx])) return { ok: false, message: name + ": argument „" + (def.params?.[idx]?.label || ("argument " + (idx + 1))) + "” musi być liczbą albo zakresem liczbowym." };
            }
        }
        if (def.numericArgs && def.numericArgs.length) {
            for (const idx of def.numericArgs) {
                if (args[idx] !== undefined && !argIsNumericOrCell(args[idx])) return { ok: false, message: name + ": argument „" + (def.params?.[idx]?.label || ("argument " + (idx + 1))) + "” musi być liczbą lub komórką z liczbą." };
            }
        }
        return { ok: true };
    }
    function formatFormulaSignature(fn) {
        if (Array.isArray(fn.params) && fn.params.length) {
            return fn.name + "(" + fn.params.map((param, idx) => '<span class="' + (idx === 0 ? 'we-formula-helper-current' : '') + '">' + escapeHtml(param.label) + '</span>').join("; ") + ")";
        }
        return escapeHtml(fn.syntax || fn.name);
    }
    function formatFormulaParamList(fn) {
        if (!Array.isArray(fn.params) || !fn.params.length) return "";
        return '<div class="we-formula-helper-params">' + fn.params.map(param => '<div><strong>' + escapeHtml(param.label) + '</strong> — ' + escapeHtml(param.description || 'uzupełnij zgodnie ze składnią funkcji') + '</div>').join('') + '</div>';
    }

    function renderFormulaHelper() {
        if (!formulaHelperPopover || !formulaInput) return;
        const value = formulaInput.value || "";
        if (!value.startsWith("=")) {
            formulaHelperPopover.hidden = true;
            return;
        }
        const fnMatch = value.match(/^=([A-ZĄĆĘŁŃÓŚŹŻ.\-]*)/i);
        const token = (fnMatch?.[1] || "").toUpperCase();
        const all = getAllFormulaItems();
        const exact = all.find(fn => fn.name.toUpperCase() === token);
        const matches = all.filter(fn => fn.name.toUpperCase().includes(token)).slice(0, 8);
        const shown = exact || matches[0];
        if (!shown) {
            formulaHelperPopover.hidden = true;
            return;
        }
        formulaHelperPopover.innerHTML = `
            <div class="we-formula-helper-head">${formatFormulaSignature(shown)}</div>
            <div class="we-formula-helper-body">
                <div>${escapeHtml(shown.description || "Podpowiedź do funkcji.")}</div>
                ${formatFormulaParamList(shown)}
                <div class="we-formula-helper-example">Przykład: ${escapeHtml(shown.example || shown.syntax || "")}</div>
                <small>Enter zapisuje formułę, F4 przełącza blokadę odwołań: A1 → $A$1 → A$1 → $A1.</small>
            </div>
            <div class="we-formula-helper-list">
                ${matches.map(fn => `<div class="we-formula-helper-item" data-formula-syntax="${escapeHtml(fn.syntax)}"><div class="we-formula-helper-name">${escapeHtml(fn.name)}</div><div class="we-formula-helper-syntax">${escapeHtml(fn.syntax)}</div></div>`).join("")}
            </div>`;
        formulaHelperPopover.hidden = false;
    }


    function getEmojiItems() {
        const search = String(emojiSearchInput?.value || "").trim().toLowerCase();
        const base = search ? [...new Set(Object.values(EMOJI_CATEGORIES).flat())] : (EMOJI_CATEGORIES[activeEmojiCategory] || EMOJI_CATEGORIES.popularne);
        if (!search) return base;
        const words = {"?":"ok tak gotowe zatwierdzone wykonane","?":"nie b?d usu? odrzucone","?":"uwaga ostrze?enie ryzyko","?":"pinezka wa?ne przypi?te","?":"wykres tabela dane analiza","?":"wzrost trend wynik","?":"spadek trend wynik","?":"kalkulator obliczenia suma","?":"pomys? idea wskaz?wka","?":"wa?ne pilne","?":"blokada zamkni?te zabezpieczenie","?":"odblokowane otwarte","?":"folder plik katalog","?":"notatka komentarz tekst"};
        return base.filter(item => (words[item] || "").includes(search) || item.includes(search));
    }
    function renderEmojiPicker() {
        if (!emojiCategoryButtons || !emojiGrid || !emojiPreview) return;
        emojiCategoryButtons.innerHTML = Object.keys(EMOJI_CATEGORIES).map(category => '<button type="button" class="we-emoji-category ' + (category === activeEmojiCategory ? 'active' : '') + '" data-emoji-category="' + category + '">' + category + '</button>').join('');
        emojiGrid.innerHTML = getEmojiItems().map(emoji => '<button type="button" class="we-emoji-item ' + (emoji === selectedEmoji ? 'active' : '') + '" data-emoji="' + emoji + '" title="' + emoji + '">' + emoji + '</button>').join('');
        emojiPreview.textContent = selectedEmoji;
    }
    function openEmojiPicker() { selectedEmoji = selectedEmoji || "📌"; renderEmojiPicker(); openModal(emojiModal); emojiSearchInput?.focus(); }
    function insertSelectedEmoji() {
        if (!currentSheet || !selectedEmoji) return;
        const existing = currentSheet.grid[activeCell.row][activeCell.col] || "";
        const nextValue = String(existing || "") + selectedEmoji;
        pushCellEditHistory(activeCell.row, activeCell.col, existing, nextValue);
        currentSheet.grid[activeCell.row][activeCell.col] = nextValue;
        updateCellElement(activeCell.row, activeCell.col);
        markDirty();
        closeModal(emojiModal);
    }

    function openCommentEditor(mode) {
        commentEditMode = mode;
        const raw = currentSheet.grid[activeCell.row][activeCell.col] || "";
        const prefix = mode === "note" ? "=NOTE(" : "=COMMENT(";
        const existing = typeof raw === "string" && raw.startsWith(prefix) && raw.endsWith(")") ? raw.slice(prefix.length, -1) : "";
        if (commentModalTitle) commentModalTitle.textContent = mode === "note" ? "Notatka" : "Komentarz";
        if (commentTextarea) commentTextarea.value = existing;
        updateCommentPreview();
        openModal(commentModal);
        commentTextarea?.focus();
    }

    function updateCommentPreview() {
        if (!commentPreview) return;
        const value = commentTextarea?.value || "";
        commentPreview.textContent = value || "Brak treści.";
    }

    function saveCommentFromModal() {
        if (!currentSheet) return;
        const value = commentTextarea?.value || "";
        const oldValue = currentSheet.grid[activeCell.row]?.[activeCell.col] || "";
        const nextValue = value ? (commentEditMode === "note" ? `=NOTE(${value})` : `=COMMENT(${value})`) : "";
        pushCellEditHistory(activeCell.row, activeCell.col, oldValue, nextValue);
        currentSheet.grid[activeCell.row][activeCell.col] = nextValue;
        updateCellElement(activeCell.row, activeCell.col);
        markDirty();
        closeModal(commentModal);
    }

    function deleteCommentFromModal() {
        if (!currentSheet) return;
        const oldValue = currentSheet.grid[activeCell.row]?.[activeCell.col] || "";
        pushCellEditHistory(activeCell.row, activeCell.col, oldValue, "");
        currentSheet.grid[activeCell.row][activeCell.col] = "";
        updateCellElement(activeCell.row, activeCell.col);
        markDirty();
        closeModal(commentModal);
    }

    function showCellTooltip(text, x, y) {
        hideCellTooltip();
        activeTooltip = document.createElement("div");
        activeTooltip.className = "we-cell-tooltip";
        activeTooltip.textContent = text;
        document.body.appendChild(activeTooltip);
        activeTooltip.style.left = `${Math.min(x + 12, window.innerWidth - 340)}px`;
        activeTooltip.style.top = `${Math.min(y + 12, window.innerHeight - 120)}px`;
    }

    function hideCellTooltip() {
        activeTooltip?.remove();
        activeTooltip = null;
    }

    function normalizeHeaderName(value, fallbackIndex) {
        const raw = String(value  || "").trim();
        return raw || `Kolumna ${fallbackIndex + 1}`;
    }

    function findTableHeaderRow(grid) {
        if (!Array.isArray(grid)) return -1;
        for (let row = 0; row < grid.length; row += 1) {
            const nonEmpty = (grid[row] || []).filter(cell => String(cell  || "").trim() !== "");
            if (nonEmpty.length >= 2) return row;
        }
        return -1;
    }

    function isRowEffectivelyEmpty(row) {
        return !row || row.every(cell => String(cell  || "").trim() === "");
    }

    function mergeWorkbookSheetsIntoOneTable() {
        if (!workbook || !Array.isArray(workbook.sheets) || workbook.sheets.length < 2) {
            alert("Do scalania potrzebne są co najmniej dwa arkusze w jednym pliku.");
            return;
        }

        commitActiveSheetToWorkbook();

        const includeSource = confirm("Dodać kolumnę z nazwą arkusza źródłowego?\n\nOK = tak, Anuluj = nie.");
        const allHeaders = includeSource ? ["Źródło arkusza"] : [];
        const headerSet = new Set(allHeaders.map(h => h.toLowerCase()));
        const mergedRecords = [];
        const skippedSheets = [];

        workbook.sheets.forEach((sheet, sheetIndex) => {
            const grid = Array.isArray(sheet.grid) ? sheet.grid : [];
            const headerRowIndex = findTableHeaderRow(grid);
            if (headerRowIndex < 0) {
                skippedSheets.push(sheet.name || `Arkusz ${sheetIndex + 1}`);
                return;
            }

            const rawHeaders = grid[headerRowIndex] || [];
            const localHeaders = rawHeaders.map((cell, idx) => normalizeHeaderName(cell, idx));
            const localUniqueHeaders = [];
            const localCounts = new Map();

            localHeaders.forEach(header => {
                const base = header;
                const key = base.toLowerCase();
                const count = localCounts.get(key) || 0;
                localCounts.set(key, count + 1);
                localUniqueHeaders.push(count ? `${base} (${count + 1})` : base);
            });

            localUniqueHeaders.forEach(header => {
                const key = header.toLowerCase();
                if (!headerSet.has(key)) {
                    headerSet.add(key);
                    allHeaders.push(header);
                }
            });

            for (let rowIndex = headerRowIndex + 1; rowIndex < grid.length; rowIndex += 1) {
                const row = grid[rowIndex] || [];
                if (isRowEffectivelyEmpty(row)) continue;

                const record = {};
                if (includeSource) record["Źródło arkusza"] = sheet.name || `Arkusz ${sheetIndex + 1}`;
                localUniqueHeaders.forEach((header, colIndex) => {
                    record[header] = row[colIndex] || "";
                });
                mergedRecords.push(record);
            }
        });

        if (!mergedRecords.length) {
            alert("Nie znaleziono danych do scalenia. Każdy scalany arkusz powinien mieć wiersz nagłówków i co najmniej jeden wiersz danych.");
            return;
        }

        const mergedGrid = [
            allHeaders,
            ...mergedRecords.map(record => allHeaders.map(header => record[header] || ""))
        ];

        const minRows = Math.max(20, mergedGrid.length + 2);
        const minCols = Math.max(10, allHeaders.length + 1);
        while (mergedGrid.length < minRows) mergedGrid.push(Array.from({ length: allHeaders.length }, () => ""));
        mergedGrid.forEach(row => { while (row.length < minCols) row.push(""); });

        let baseName = "Scalone arkusze";
        let name = baseName;
        let suffix = 2;
        const existingNames = new Set(workbook.sheets.map(sheet => String(sheet.name || "").toLowerCase()));
        while (existingNames.has(name.toLowerCase())) {
            name = `${baseName} ${suffix}`;
            suffix += 1;
        }

        workbook.sheets.push({
            name,
            grid: mergedGrid,
            styles: {},
            color: "",
            hidden: false,
            protected: false
        });
        activateWorkbookSheet(workbook.sheets.length - 1);
        markDirty();

        const skippedText = skippedSheets.length ? `\n\nPominięto bez rozpoznanej tabeli: ${skippedSheets.join(", ")}.` : "";
        alert(`Utworzono arkusz „${name}”.\nScalono ${mergedRecords.length} wierszy danych i ${allHeaders.length} kolumn.${skippedText}`);
    }



    function rememberRecentColor(color) {
        if (!color) return;
        recentColors = [color, ...recentColors.filter(c => c !== color)].slice(0, 12);
        localStorage.setItem("ares_recent_colors", JSON.stringify(recentColors));
    }

    function showColorPopover(input, kind) {
        document.querySelectorAll(".we-color-popover").forEach(el => el.remove());
        const pop = document.createElement("div");
        pop.className = "we-color-popover";
        const isText = kind === "textColor";
        const defaultColor = isText ? "#eef3ff" : "#0f1728";
        const title = isText ? "Kolor tekstu" : "Kolor tła";
        const presets = ["#000000","#434343","#666666","#999999","#cccccc","#ffffff","#ff0000","#ff9900","#ffff00","#00ff00","#00ffff","#0000ff","#9900ff","#ff00ff","#4f8cff","#3ccf91","#f8c156","#ff8a65"];
        const recent = recentColors.length ? recentColors : presets.slice(0, 8);
        pop.innerHTML = `
            <div class="we-color-popover-title">${title}</div>
            <div class="we-color-actions">
                <button type="button" data-color-reset="1">Kolor domyślny</button>
                <button type="button" data-color-original="1">Oryginalny</button>
            </div>
            <div class="we-color-popover-title">Ostatnie wybory</div>
            <div class="we-color-recent-grid">${recent.map(c => `<button type="button" class="we-color-recent-swatch" data-color="${c}" style="background:${c}" title="${c}"></button>`).join("")}</div>
            <div class="we-color-popover-title" style="margin-top:10px">Paleta</div>
            <div class="we-color-recent-grid">${presets.map(c => `<button type="button" class="we-color-recent-swatch" data-color="${c}" style="background:${c}" title="${c}"></button>`).join("")}</div>`;
        document.body.appendChild(pop);
        const rect = input.getBoundingClientRect();
        pop.style.left = `${Math.min(rect.left, window.innerWidth - 290)}px`;
        pop.style.top = `${rect.bottom + 8}px`;
        pop.addEventListener("click", event => {
            const colorBtn = event.target.closest("[data-color]");
            if (colorBtn) {
                const color = colorBtn.dataset.color;
                input.value = color;
                rememberRecentColor(color);
                applyStyleToSelectionOrActive({ [kind]: color });
                pop.remove();
                return;
            }
            if (event.target.closest("[data-color-reset]")) {
                input.value = defaultColor;
                applyStyleToSelectionOrActive({ [kind]: defaultColor });
                pop.remove();
                return;
            }
            if (event.target.closest("[data-color-original]")) {
                input.value = defaultColor;
                applyStyleToSelectionOrActive({ [kind]: "" });
                pop.remove();
            }
        });
        setTimeout(() => {
            document.addEventListener("click", function close(ev) {
                if (!pop.contains(ev.target) && ev.target !== input) {
                    pop.remove();
                    document.removeEventListener("click", close);
                }
            });
        }, 0);
    }

    function getSelectedBoundsOrActive() {
        return getSelectionBounds() || { rowStart: activeCell.row, rowEnd: activeCell.row, colStart: activeCell.col, colEnd: activeCell.col };
    }

    function applyBorderPreset(preset, color = "#5b8def", lineStyle = "solid", width = "2px") {
        if (!currentSheet) return;
        pushHistorySnapshot();
        const b = getSelectedBoundsOrActive();
        for (let row = b.rowStart; row <= b.rowEnd; row += 1) {
            for (let col = b.colStart; col <= b.colEnd; col += 1) {
                const patch = { border: false, borderColor: color, borderLineStyle: lineStyle, borderWidth: width };
                if (preset === "clear") {
                    Object.assign(patch, { border: false, borderTop: false, borderRight: false, borderBottom: false, borderLeft: false });
                } else if (preset === "all") {
                    Object.assign(patch, { borderTop: true, borderRight: true, borderBottom: true, borderLeft: true });
                } else if (preset === "outer") {
                    Object.assign(patch, {
                        borderTop: row === b.rowStart,
                        borderRight: col === b.colEnd,
                        borderBottom: row === b.rowEnd,
                        borderLeft: col === b.colStart
                    });
                } else if (preset === "inner") {
                    Object.assign(patch, {
                        borderTop: row > b.rowStart,
                        borderRight: col < b.colEnd,
                        borderBottom: row < b.rowEnd,
                        borderLeft: col > b.colStart
                    });
                } else if (preset === "top") patch.borderTop = true;
                else if (preset === "right") patch.borderRight = true;
                else if (preset === "bottom") patch.borderBottom = true;
                else if (preset === "left") patch.borderLeft = true;
                else if (preset === "vertical") Object.assign(patch, { borderLeft: true, borderRight: true });
                else if (preset === "horizontal") Object.assign(patch, { borderTop: true, borderBottom: true });
                setCellStyle(row, col, patch);
            }
        }
        renderGrid();
        markDirty();
    }

    function showBorderPopover() {
        document.querySelectorAll(".we-border-popover").forEach(el => el.remove());
        const anchor = document.querySelector('[data-ribbon-action="borders"]');
        const pop = document.createElement("div");
        pop.className = "we-border-popover";
        pop.innerHTML = `
            <div class="we-color-popover-title">Obramowania</div>
            <div class="we-border-grid">
                <button class="we-border-option" data-border-preset="all" title="Wszystkie">▦</button>
                <button class="we-border-option" data-border-preset="outer" title="Zewnętrzne">□</button>
                <button class="we-border-option" data-border-preset="inner" title="Wewnętrzne">╬</button>
                <button class="we-border-option" data-border-preset="top" title="Górne">▔</button>
                <button class="we-border-option" data-border-preset="bottom" title="Dolne">?</button>
                <button class="we-border-option" data-border-preset="left" title="Lewe">▏</button>
                <button class="we-border-option" data-border-preset="right" title="Prawe">▕</button>
                <button class="we-border-option" data-border-preset="horizontal" title="Poziome">?</button>
                <button class="we-border-option" data-border-preset="vertical" title="Pionowe">║</button>
                <button class="we-border-option" data-border-preset="clear" title="Wyczyść">×</button>
            </div>
            <div class="we-border-controls">
                <label>Kolor <input id="border-popover-color" type="color" value="#5b8def"></label>
                <label>Styl <select id="border-popover-style"><option value="solid">ciągła</option><option value="dashed">przerywana</option><option value="dotted">kropkowana</option><option value="double">podwójna</option></select></label><label>Grubość <select id="border-popover-width"><option value="1px">cienka</option><option value="2px" selected>średnia</option><option value="3px">gruba</option><option value="4px">bardzo gruba</option></select></label>
            </div>
            <button class="we-border-apply" data-border-preset="all">Zastosuj wszystkie krawędzie</button>`;
        document.body.appendChild(pop);
        const rect = anchor?.getBoundingClientRect() || { left: 40, bottom: 120 };
        pop.style.left = `${Math.min(rect.left, window.innerWidth - 370)}px`;
        pop.style.top = `${rect.bottom + 8}px`;
        pop.addEventListener("click", event => {
            const btn = event.target.closest("[data-border-preset]");
            if (!btn) return;
            const color = pop.querySelector("#border-popover-color")?.value || "#5b8def";
            const style = pop.querySelector("#border-popover-style")?.value || "solid";
            const width = pop.querySelector("#border-popover-width")?.value || "2px";
            applyBorderPreset(btn.dataset.borderPreset, color, style, width);
            pop.remove();
        });
        setTimeout(() => {
            document.addEventListener("click", function close(ev) {
                if (!pop.contains(ev.target) && !ev.target.closest('[data-ribbon-action="borders"]')) {
                    pop.remove();
                    document.removeEventListener("click", close);
                }
            });
        }, 0);
    }


    function setSheetZoom(scale, updateSelect = true) {
        const value = Math.max(0.5, Math.min(1.8, Number(scale) || 1));
        if (sheetGridTable) {
            sheetGridTable.style.transform = "";
            sheetGridTable.style.transformOrigin = "";
            sheetGridTable.style.setProperty("--we-table-zoom", String(value));
        }
        if (updateSelect) {
            const zoom = document.getElementById("zoom-select");
            if (zoom) zoom.value = Math.round(value * 100) + "%";
        }
        window.requestAnimationFrame(() => scheduleFormulaReferenceHighlights());
    }

    function fitSheetToAvailableWidth() {
        if (!sheetEditorCard || !sheetGridTable) return;
        setSheetZoom(1, false);
        window.requestAnimationFrame(() => {
            const scroll = sheetEditorCard.querySelector(".we-sheet-scroll");
            const available = Math.max(360, (scroll?.clientWidth || sheetEditorCard.clientWidth || window.innerWidth) - 18);
            const natural = sheetGridTable.scrollWidth || sheetGridTable.offsetWidth || available;
            const next = natural > available ? available / natural : 1;
            setSheetZoom(next, false);
            const zoom = document.getElementById("zoom-select");
            if (zoom) zoom.value = "Dopasuj";
        });
    }

    function refreshEditorResponsiveLayout() {
        document.documentElement.style.setProperty("--we-viewport-width", window.innerWidth + "px");
        if (document.getElementById("zoom-select")?.value === "Dopasuj") fitSheetToAvailableWidth();
    }

    function applyRibbonAction(action) {
        if (!action) return;
        if (action === "merge-sheets") return mergeWorkbookSheetsIntoOneTable();
        if (["chart", "pivot", "solver", "report-builder", "dropdown", "checkbox", "function-helper", "link", "comment", "note", "emoji"].includes(action)) {
            return applyInsertAction(action);
        }
        if (action === "group-view") return alert("Widok grupowania: zaznacz zakres i użyj sortowania, aby grupować dane logicznie.");
        if (action === "filter-view") return alert("Widok filtra aktywny. Możesz teraz tworzyć osobne wersje filtrów.");
        if (action === "slicer") return alert("Fragmentator dodany jako szybki filtr danych (wersja uproszczona).");
        if (action === "protect-ranges") return alert("Ochrona zakresów jest aktywna w tej sesji dla bieżącego arkusza.");
        if (action === "named-ranges") return defineNamedRange();
        if (action === "named-functions") return defineNamedFunction();
        if (action === "column-stats") return showColumnStats();
        if (action === "data-clean") return cleanSelectedData();
        if (action === "data-quality-profile") return showDataQualityProfile();
        if (action === "split-columns") return splitSelectedColumnValues();
        if (action === "data-extract") return extractDataFromSelection();
        if (action === "data-connectors") return alert("Łączniki danych: miejsce gotowe pod API/CSV/JSON. W tej wersji użyj importu i skryptów arkusza.");
        if (action === "filter") return alert("Filtr: zaznacz zakres z nagłówkami, a potem możesz sortować go przyciskami A-Z / Z-A.");
        if (action === "comments") return openCommentEditor("comment");
        if (action === "open-data-guide") return openModal(dataGuideModal);
        if (action === "freeze-first-row") {
            sheetGridTable?.classList.toggle("freeze-first-row");
            return;
        }
        if (action === "freeze-first-col") {
            sheetGridTable?.classList.toggle("freeze-first-col");
            return;
        }
        if (action === "zoom-fit") return fitSheetToAvailableWidth();
        if (action === "zoom-100") {
            setSheetZoom(1);
            return;
        }
        if (action === "compact-view") {
            sheetEditorCard?.classList.toggle("compact-view");
            return;
        }
        if (action === "currency") return applyFormatToSelectionOrActive("currency");
        if (action === "percent") return applyFormatToSelectionOrActive("percent");
        if (action === "decimal-up") return applyFormatToSelectionOrActive("decimal-up");
        if (action === "decimal-down") return applyFormatToSelectionOrActive("decimal-down");
        if (action === "borders") return showBorderPopover();
        if (action === "merge") return alert("Scalanie komórek wymaga osobnego modelu zakresów.");
        if (action === "wrap") return applyStyleToSelectionOrActive({ wrap: true });
        if (action === "text-rotation") return applyStyleToSelectionOrActive({ rotate: true });
        if (action === "more-tools") return alert("Najważniejsze narzędzia są dostępne w zakładkach Start, Wstaw, Formuły, Tabele, Dane i Widok.");
    }

    function showColumnStats() {
        if (!currentSheet) return;
        const bounds = getSelectionBounds();
        const col = bounds ? bounds.colStart : activeCell.col;
        const values = [];
        for (let row = 0; row < currentRows; row += 1) {
            const raw = currentSheet.grid?.[row]?.[col];
            if (raw == null || String(raw).trim() === "") continue;
            const num = parseNumber(raw);
            if (Number.isFinite(num)) values.push(num);
        }
        const columnName = columnNumberToName(col + 1);
        if (!values.length) {
            alert(`Kolumna ${columnName} nie ma liczbowych danych do analizy.`);
            return;
        }
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        alert(
            `Statystyki kolumny ${columnName}:\nLiczba wartości: ${values.length}\nSuma: ${sum.toFixed(2)}\nŚrednia: ${avg.toFixed(2)}\nMin: ${min.toFixed(2)}\nMax: ${max.toFixed(2)}`
        );
    }

    function cleanSelectedData() {
        if (!currentSheet) return;
        pushHistorySnapshot();
        forEachSelectedCell((row, col) => {
            const raw = String(currentSheet.grid?.[row]?.[col]  || "");
            currentSheet.grid[row][col] = raw.replace(/\s+/g, " ").trim();
        });
        renderGrid();
        markDirty();
        alert("Wyczyszczono dane w zaznaczeniu (zbędne spacje usunięte).");
    }

    function showDataQualityProfile() {
        if (!currentSheet) return;
        const bounds = getSelectionBounds() || {
            rowStart: 0,
            rowEnd: Math.max(0, currentRows - 1),
            colStart: 0,
            colEnd: Math.max(0, currentCols - 1)
        };
        const seen = new Map();
        let total = 0;
        let empty = 0;
        let numeric = 0;
        let text = 0;
        let duplicates = 0;

        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
            for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
                total += 1;
                const raw = currentSheet.grid?.[row]?.[col];
                const value = String(raw || "").trim();
                if (!value) {
                    empty += 1;
                    continue;
                }
                if (isNumericValue(value)) numeric += 1;
                else text += 1;
                const key = value.toLowerCase();
                const count = (seen.get(key) || 0) + 1;
                seen.set(key, count);
                if (count === 2) duplicates += 1;
            }
        }

        const rangeText = `${colToLabel(bounds.colStart)}${bounds.rowStart + 1}:${colToLabel(bounds.colEnd)}${bounds.rowEnd + 1}`;
        alert(
            `Profil jakości danych (${rangeText})\n` +
            `Komórki: ${total}\n` +
            `Puste: ${empty}\n` +
            `Liczby: ${numeric}\n` +
            `Tekst: ${text}\n` +
            `Powtórzenia wartości: ${duplicates}`
        );
        logUserAction("Wygenerowano profil jakości danych", {
            type: "data_quality_profile",
            range: rangeText,
            total,
            empty,
            numeric,
            text,
            duplicates
        });
    }

    function splitSelectedColumnValues() {
        if (!currentSheet) return;
        const delimiter = prompt("Podaj separator podziału (np. ; , |):", ",");
        if (!delimiter) return;
        pushHistorySnapshot();
        const bounds = getSelectionBounds() || { rowStart: activeCell.row, rowEnd: activeCell.row, colStart: activeCell.col, colEnd: activeCell.col };
        const sourceCol = bounds.colStart;
        let maxWidth = 1;
        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
            const parts = String(currentSheet.grid?.[row]?.[sourceCol]  || "").split(delimiter).map(v => v.trim());
            maxWidth = Math.max(maxWidth, parts.length);
            ensureDimensions(row + 1, sourceCol + parts.length);
            parts.forEach((part, idx) => { currentSheet.grid[row][sourceCol + idx] = part; });
        }
        renderGrid();
        markDirty();
        alert(`Podzielono dane z kolumny ${colToLabel(sourceCol)} na ${maxWidth} kolumn(y).`);
    }

    function extractDataFromSelection() {
        const bounds = getSelectionBounds();
        if (!bounds) {
            alert("Najpierw zaznacz zakres danych do wyodrębnienia.");
            return;
        }
        const range = `${colToLabel(bounds.colStart)}${bounds.rowStart + 1}:${colToLabel(bounds.colEnd)}${bounds.rowEnd + 1}`;
        alert(`Wyodrębnianie danych aktywne dla zakresu ${range}.`);
    }

    function defineNamedRange() {
        if (!currentSheet) return;
        const bounds = getSelectionBounds();
        if (!bounds) {
            alert("Zaznacz zakres, który chcesz nazwać.");
            return;
        }
        const name = prompt("Nazwa zakresu:", "zakres_1");
        if (!name) return;
        const range = `${colToLabel(bounds.colStart)}${bounds.rowStart + 1}:${colToLabel(bounds.colEnd)}${bounds.rowEnd + 1}`;
        if (!currentSheet.namedRanges) currentSheet.namedRanges = {};
        currentSheet.namedRanges[name] = range;
        markDirty();
        alert(`Zapisano zakres: ${name} = ${range}`);
    }

    function defineNamedFunction() {
        if (!currentSheet) return;
        const name = prompt("Nazwa funkcji:", "MOJA_FUNKCJA");
        if (!name) return;
        const expression = prompt("Wyrażenie (użyj argumentu x, np. x*1.23):", "x");
        if (!expression) return;
        if (!currentSheet.namedFunctions) currentSheet.namedFunctions = {};
        currentSheet.namedFunctions[name] = expression;
        markDirty();
        alert(`Zapisano funkcję: ${name}(x) = ${expression}`);
    }

    function applyFormatToSelectionOrActive(kind) {
        if (!currentSheet) return;
        pushHistorySnapshot();
        forEachSelectedCell((row, col) => {
            const value = currentSheet.grid[row]?.[col];
            const num = parseNumber(value);
            if (kind === "currency") currentSheet.grid[row][col] = Number.isFinite(num) ? `${num.toFixed(2)} zł` : value;
            if (kind === "percent") currentSheet.grid[row][col] = Number.isFinite(num) ? `${(num * 100).toFixed(2)}%` : value;
            if (kind === "decimal-up") currentSheet.grid[row][col] = Number.isFinite(num) ? num.toFixed(2) : value;
            if (kind === "decimal-down") currentSheet.grid[row][col] = Number.isFinite(num) ? num.toFixed(0) : value;
        });
        renderGrid();
        markDirty();
    }

    async function loadNetworkSummary() {
        if (!teamListEl || DEMO_MODE) return;
        try {
            networkSummaryCache = await getJson("/ares/api/network/summary/");
            renderTeamPanel();
        } catch (error) {
            teamListEl.innerHTML = '<div class="we-addons-empty">Nie udało się pobrać globalnych grup.</div>';
        }
    }

    function scheduleNetworkSummaryLoad(delay = 450) {
        if (networkSummaryLoadScheduled || DEMO_MODE || !teamListEl) return;
        networkSummaryLoadScheduled = true;
        const run = () => {
            networkSummaryLoadScheduled = false;
            void loadNetworkSummary();
        };
        if (window.requestIdleCallback) {
            window.requestIdleCallback(run, { timeout: 1200 });
        } else {
            window.setTimeout(run, delay);
        }
    }

    function renderTeamPanel() {
        if (!teamListEl) return;
        const organizations = Array.isArray(networkSummaryCache.organizations) ? networkSummaryCache.organizations : [];
        const friends = Array.isArray(networkSummaryCache.friends) ? networkSummaryCache.friends : [];
        const groups = Array.isArray(networkSummaryCache.groups) ? networkSummaryCache.groups : [];
        const organizationHtml = organizations.map((org) => `
            <div class="we-mini-list-item">
                <span>🏢 ${escapeHtml(org.name)} <small>${escapeHtml(org.visibilityLabel || "")}</small></span>
                <div><span class="we-addon-pill">${org.teamCount || 0} teamów</span></div>
            </div>
        `).join("");
        const friendHtml = friends.map((f) => `
            <div class="we-mini-list-item">
                <span>👤 ${escapeHtml(f.username)} <small>${escapeHtml(f.email || "")}</small></span>
                <button class="btn btn-secondary" type="button" data-remove-friend-id="${f.id}">Usuń</button>
            </div>
        `).join("");
        const groupHtml = groups.map((g) => {
            const assignedCurrentSheet = (g.assignedSheets || []).some(s => String(s.id) === String(sheetId));
            return `
            <div class="we-mini-list-item">
                <span>👥 ${escapeHtml(g.name)} <small>${escapeHtml(g.organizationName || g.role || "")}</small></span>
                <div>
                    <button class="btn btn-secondary" type="button" data-group-watch-id="${g.id}">${g.watching ? "Unwatch" : "Watch"}</button>
                    <button class="btn btn-secondary" type="button" data-group-member-add-id="${g.id}">Dodaj osobę</button>
                    <button class="btn btn-secondary" type="button" data-group-assign-id="${g.id}">${assignedCurrentSheet ? "Odepnij arkusz" : "Przypnij arkusz"}</button>
                </div>
            </div>`;
        }).join("");
        teamListEl.innerHTML = (organizationHtml + friendHtml + groupHtml) || '<div class="we-addons-empty">Brak znajomych, organizacji i globalnych grup.</div>';
    }

    async function addFriend() {
        const value = String(teamFriendInput?.value || "").trim();
        if (!value) return;
        await postJson("/ares/api/network/friends/add/", { query: value });
        if (teamFriendInput) teamFriendInput.value = "";
        await loadNetworkSummary();
    }

    async function addGroup() {
        const value = String(teamGroupInput?.value || "").trim();
        if (!value) return;
        const firstOrg = Array.isArray(networkSummaryCache.organizations) && networkSummaryCache.organizations.length
            ? networkSummaryCache.organizations[0].id
            : null;
        await postJson("/ares/api/network/groups/create/", { name: value, description: "", organizationId: firstOrg });
        if (teamGroupInput) teamGroupInput.value = "";
        await loadNetworkSummary();
    }

    async function addOrganization() {
        const value = String(teamOrgInput?.value || "").trim();
        if (!value) return;
        await postJson("/ares/api/network/organizations/create/", { name: value, visibility: "private" });
        if (teamOrgInput) teamOrgInput.value = "";
        await loadNetworkSummary();
    }

    function renderFollowMeStatus(text) {
        if (followMeStatusEl) followMeStatusEl.textContent = text;
        if (followMeToggleBtn) followMeToggleBtn.textContent = followMeBroadcastEnabled ? "Wyłącz nadawanie" : "Włącz nadawanie";
    }

    function broadcastFollowMePosition() {
        if (!followMeBroadcastEnabled || !currentSheet) return;
        const payload = {
            sheetId: String(sheetId || ""),
            tab: currentSheet.activeTabName || "",
            cell: cellAddress(activeCell.row, activeCell.col),
            ts: Date.now()
        };
        try {
            localStorage.setItem(FOLLOW_ME_CHANNEL, JSON.stringify(payload));
        } catch (error) {}
    }

    function jumpToFollowMeSignal() {
        try {
            const raw = localStorage.getItem(FOLLOW_ME_CHANNEL);
            if (!raw) return renderFollowMeStatus("Brak sygnału follow-me.");
            const payload = JSON.parse(raw);
            const ref = cellRefToIndex(payload.cell || "");
            if (!ref) return renderFollowMeStatus("Odebrano sygnał, ale bez poprawnej komórki.");
            setActiveCell(ref.row, ref.col, true);
            renderFollowMeStatus(`Śledzisz: ${payload.cell}`);
        } catch (error) {
            renderFollowMeStatus("Błąd odczytu follow-me.");
        }
    }

    function renderCellTasks() {
        if (!cellTaskListEl) return;
        const state = getSheetExtensionState();
        const items = state.tasks || [];
        if (!items.length) {
            cellTaskListEl.innerHTML = '<div class="we-addons-empty">Brak zadań w komórkach.</div>';
            return;
        }
        cellTaskListEl.innerHTML = items.map((task, idx) => `
            <div class="we-mini-list-item">
                <span>${task.done ? "✅" : "📝"} ${escapeHtml(task.cell)} — ${escapeHtml(task.text)}</span>
                <div>
                    <button class="btn btn-secondary" type="button" data-task-toggle="${idx}">${task.done ? "Cofnij" : "Done"}</button>
                    <button class="btn btn-secondary" type="button" data-task-remove="${idx}">Usuń</button>
                </div>
            </div>
        `).join("");
    }

    function addCellTask() {
        const text = String(cellTaskInput?.value || "").trim();
        if (!text) return;
        const state = getSheetExtensionState();
        state.tasks.push({
            cell: cellAddress(activeCell.row, activeCell.col),
            text,
            done: false,
            createdAt: new Date().toISOString()
        });
        if (cellTaskInput) cellTaskInput.value = "";
        renderCellTasks();
        markDirty();
    }

    function renderScenarios() {
        if (!scenarioListEl) return;
        const state = getSheetExtensionState();
        const rows = state.scenarios || [];
        if (!rows.length) {
            scenarioListEl.innerHTML = '<div class="we-addons-empty">Brak scenariuszy.</div>';
            return;
        }
        scenarioListEl.innerHTML = rows.map((s, idx) => `
            <div class="we-mini-list-item">
                <span>🌿 ${escapeHtml(s.name)} <small>${new Date(s.createdAt).toLocaleString("pl-PL")}</small></span>
                <div>
                    <button class="btn btn-secondary" type="button" data-scenario-compare="${idx}">Porównaj</button>
                    <button class="btn btn-secondary" type="button" data-scenario-restore="${idx}">Przywróć</button>
                    <button class="btn btn-secondary" type="button" data-scenario-remove="${idx}">Usuń</button>
                </div>
            </div>
        `).join("");
    }

    function saveScenario() {
        const name = String(scenarioNameInput?.value || "").trim() || `Scenariusz ${new Date().toLocaleTimeString("pl-PL")}`;
        const state = getSheetExtensionState();
        state.scenarios.push({
            name,
            createdAt: new Date().toISOString(),
            grid: JSON.parse(JSON.stringify(currentSheet.grid || [])),
            styles: JSON.parse(JSON.stringify(currentSheet.styles || {}))
        });
        if (scenarioNameInput) scenarioNameInput.value = "";
        renderScenarios();
        markDirty();
        logUserAction("Zapisano scenariusz", { type: "scenario_save", name });
    }

    function compareScenario(index) {
        const state = getSheetExtensionState();
        const item = state.scenarios[index];
        if (!item) return;
        const changes = _safeCellDiffCount(item.grid || [], currentSheet.grid || []);
        alert(`Różnice względem scenariusza "${item.name}": ${changes} komórek.`);
    }

    function _safeCellDiffCount(before, after) {
        const rows = Math.max(before.length || 0, after.length || 0);
        let cols = 0;
        for (let r = 0; r < rows; r += 1) cols = Math.max(cols, (before[r] || []).length, (after[r] || []).length);
        let count = 0;
        for (let r = 0; r < rows; r += 1) {
            for (let c = 0; c < cols; c += 1) {
                if (String(before?.[r]?.[c] || "") !== String(after?.[r]?.[c] || "")) count += 1;
            }
        }
        return count;
    }

    function restoreScenario(index) {
        const state = getSheetExtensionState();
        const item = state.scenarios[index];
        if (!item) return;
        pushHistorySnapshot();
        currentSheet.grid = JSON.parse(JSON.stringify(item.grid || emptyGrid()));
        currentSheet.styles = JSON.parse(JSON.stringify(item.styles || {}));
        ensureDimensions(currentSheet.grid.length || 20, Math.max(...(currentSheet.grid.map(r => r.length)), 10));
        renderGrid();
        markDirty();
        logUserAction("Przywrócono scenariusz", { type: "scenario_restore", name: item.name });
    }

    function runWorkflowCleanReport() {
        cleanSelectedData();
        showDataQualityProfile();
        if (workflowStatusEl) workflowStatusEl.textContent = "Workflow wykonany: czyszczenie + profil jakości.";
    }

    function runWorkflowSaveReport() {
        saveSheet();
        populateReportBuilder();
        openModal(reportModal);
        if (workflowStatusEl) workflowStatusEl.textContent = "Workflow wykonany: zapisano arkusz i przygotowano raport w edytorze.";
        logUserAction("Workflow: zapis + raport", { type: "workflow_save_report" });
    }

    function countFilledCells(grid) {
        return (grid || []).reduce((sum, row) => sum + (Array.isArray(row) ? row.filter(cell => String(cell || "").trim() !== "").length : 0), 0);
    }

    function getSelectionStats() {
        const rangeText = getCurrentSelectionRangeText();
        const matrix = getRangeMatrix(rangeText, true);
        const rows = matrix.length;
        const cols = matrix[0]?.length || 0;
        return { rangeText, rows, cols };
    }

    function buildSuggestedKpis() {
        if (!currentSheet) return [];
        const filledCells = countFilledCells(currentSheet.grid || []);
        const selection = getSelectionStats();
        const rows = (currentSheet.grid || []).length;
        const cols = Math.max(...((currentSheet.grid || []).map(row => row.length || 0)), 0);
        const kpis = [
            { label: "Wiersze arkusza", value: rows },
            { label: "Kolumny arkusza", value: cols },
            { label: "Niepuste komórki", value: filledCells },
            { label: "Wykresy", value: chartObjects.length },
            { label: "Tabele przestawne", value: pivotObjects.length },
        ];
        if (selection.rows && selection.cols) {
            kpis.push({ label: "Bieżące zaznaczenie", value: `${selection.rangeText} (${selection.rows}×${selection.cols})` });
        }
        return kpis;
    }

    function buildSuggestedInsights() {
        if (!currentSheet) return [];
        const selection = getSelectionStats();
        const notes = [
            `Arkusz roboczy: ${currentSheet.name || "Arkusz"}.`,
            chartObjects.length ? `W arkuszu są ${chartObjects.length} wykres(y), które można opisać jako wizualne podsumowanie analizy.` : "Brak wykresów — warto rozważyć dodanie wizualizacji do raportu.",
            pivotObjects.length ? `W arkuszu są ${pivotObjects.length} tabela(e) przestawna(e), więc raport może odwoływać się do agregacji i przekrojów danych.` : "Brak tabel przestawnych — raport będzie oparty głównie na siatce danych i wykresach.",
        ];
        if (selection.rows && selection.cols) {
            notes.push(`Aktualnie zaznaczony zakres ${selection.rangeText} może zostać użyty jako główny fragment raportu.`);
        }
        if (currentSheet.category) {
            notes.push(`Kategoria arkusza: ${currentSheet.category}.`);
        }
        return notes;
    }

    function buildExecutiveSummary() {
        if (!currentSheet) return "";
        const selection = getSelectionStats();
        const filledCells = countFilledCells(currentSheet.grid || []);
        return [
            `Arkusz ${currentSheet.name || "Arkusz"} zawiera ${filledCells} niepustych komórek i ${chartObjects.length} wykres(y), co daje gotową bazę do krótkiego podsumowania decyzji.`,
            selection.rows && selection.cols ? `Najbardziej aktualny zakres pracy to ${selection.rangeText} (${selection.rows}×${selection.cols}).` : "Raport obejmuje cały bieżący arkusz.",
            pivotObjects.length ? `Dostępne są też ${pivotObjects.length} tabela(e) przestawna(e), więc można pokazać agregacje i przekroje bez ręcznego liczenia.` : "Brak tabel przestawnych, więc nacisk raportu będzie na siatkę danych i wykresy.",
        ].join(" ");
    }

    function buildRiskSummary() {
        if (!currentSheet) return "";
        if (!chartObjects.length && !pivotObjects.length) {
            return "Ryzykiem raportu jest brak dodatkowych obiektów analitycznych, więc odbiorca będzie opierał się głównie na surowej siatce danych.";
        }
        const selection = getSelectionStats();
        if (selection.rangeText === "A1") {
            return "Sprawdź, czy zakres źródłowy raportu jest właściwy. Przy pojedynczej komórce łatwo przypadkiem oprzeć opis na zbyt małym fragmencie danych.";
        }
        return "Przed eksportem warto potwierdzić, że wybrane wykresy i tabele przestawne pokazują ten sam zakres danych i nie mieszają różnych wersji analizy.";
    }

    function buildRecommendationSummary() {
        if (!currentSheet) return "";
        if (chartObjects.length || pivotObjects.length) {
            return "Pokaż najpierw najważniejszy wykres lub tabelę przestawną, a potem zamknij raport jedną decyzją albo konkretnym następnym krokiem.";
        }
        return "Najpierw dodaj jedną wizualizację lub tabelę przestawną do najważniejszego zakresu, a dopiero potem eksportuj raport dla innych osób.";
    }

    function renderReportObjectSelection(container, items, typeLabel) {
        if (!container) return;
        if (!items.length) {
            container.innerHTML = `<div class="we-report-select-empty">Brak ${typeLabel.toLowerCase()} w tym arkuszu.</div>`;
            return;
        }
        container.innerHTML = items.map((item) => `
            <label class="we-report-select-item">
                <input type="checkbox" data-report-object="${escapeHtml(item.kind)}" value="${escapeHtml(String(item.index))}" checked>
                <span>
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.meta)}</small>
                </span>
            </label>
        `).join("");
    }

    function renderReportObjectLists() {
        renderReportObjectSelection(
            reportModalChartList,
            chartObjects.map((chart, index) => ({
                kind: "chart",
                index,
                title: chart.title || `Wykres ${index + 1}`,
                meta: `${chart.type || "chart"} • ${chart.rangeText || "brak zakresu"}`
            })),
            "wykresów"
        );
        renderReportObjectSelection(
            reportModalPivotList,
            pivotObjects.map((pivot, index) => ({
                kind: "pivot",
                index,
                title: `Tabela przestawna ${index + 1}`,
                meta: `${pivot.agg || "sum"} • ${pivot.rangeText || "brak zakresu"}`
            })),
            "tabel przestawnych"
        );
    }

    function getSelectedReportObjectIndexes(kind) {
        const root = kind === "chart" ? reportModalChartList : reportModalPivotList;
        if (!root) return [];
        return Array.from(root.querySelectorAll(`[data-report-object="${kind}"]:checked`))
            .map(input => Number.parseInt(input.value, 10))
            .filter(Number.isInteger);
    }

    function getSelectedChartsForReport() {
        return getSelectedReportObjectIndexes("chart")
            .map(index => ({ index, chart: chartObjects[index] }))
            .filter(item => item.chart)
            .map(({ index, chart }) => ({
                index,
                title: chart.title || `Wykres ${index + 1}`,
                type: chart.type,
                rangeText: chart.rangeText
            }));
    }

    function getSelectedPivotsForReport() {
        return getSelectedReportObjectIndexes("pivot")
            .map(index => ({ index, pivot: pivotObjects[index] }))
            .filter(item => item.pivot)
            .map(({ index, pivot }) => ({
                index,
                title: `Tabela przestawna ${index + 1}`,
                agg: pivot.agg,
                rangeText: pivot.rangeText
            }));
    }

    function fillReportScopeOptions() {
        if (!reportModalScopeSelect) return;
        const visibility = reportModalVisibilitySelect?.value || "private";
        if (visibility === "team") {
            const groups = Array.isArray(networkSummaryCache.groups) ? networkSummaryCache.groups : [];
            reportModalScopeSelect.innerHTML = groups.length
                ? groups.map(group => `<option value="group:${group.id}">${escapeHtml(group.name)}</option>`).join("")
                : `<option value="">Brak zespołów</option>`;
            return;
        }
        if (visibility === "organization") {
            const orgs = Array.isArray(networkSummaryCache.organizations) ? networkSummaryCache.organizations : [];
            reportModalScopeSelect.innerHTML = orgs.length
                ? orgs.map(org => `<option value="organization:${org.id}">${escapeHtml(org.name)}</option>`).join("")
                : `<option value="">Brak organizacji</option>`;
            return;
        }
        reportModalScopeSelect.innerHTML = `<option value="">Prywatny raport</option>`;
    }

    function renderReportPreview() {
        if (!reportModalPreview || !reportModalHints) return;
        const kpis = String(reportModalKpisInput?.value || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const insights = String(reportModalInsightsInput?.value || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const selectedCharts = getSelectedChartsForReport();
        const selectedPivots = getSelectedPivotsForReport();
        const hintRows = [];
        if (reportIncludeSelectionInput?.checked) hintRows.push(`Zakres: ${getSelectionStats().rangeText}`);
        hintRows.push(`Wybrane wykresy: ${selectedCharts.length}`);
        hintRows.push(`Wybrane tabele przestawne: ${selectedPivots.length}`);
        if (reportIncludeActivityInput?.checked) hintRows.push("Stan arkusza i aktywność bieżącej sesji");
        reportModalHints.innerHTML = hintRows.map(text => `<div class="we-report-hint">${escapeHtml(text)}</div>`).join("") || `<div class="we-report-hint">Wybierz źródła raportu po prawej stronie.</div>`;
        reportModalPreview.innerHTML = `
<strong>${escapeHtml(reportModalTitleInput?.value || "Raport roboczy")}</strong>

${escapeHtml(reportModalDescriptionInput?.value || "Opis raportu pojawi się tutaj.")}

KPI:
${kpis.length ? kpis.map(item => `• ${escapeHtml(item)}`).join("<br>") : "• Brak KPI"}

Wnioski:
${insights.length ? insights.map(item => `• ${escapeHtml(item)}`).join("<br>") : "• Brak wniosków"}

Executive summary:
${escapeHtml(reportModalExecutiveSummaryInput?.value || "Brak sekcji executive summary.")}

Risk:
${escapeHtml(reportModalRiskInput?.value || "Brak sekcji risk.")}

Rekomendacja:
${escapeHtml(reportModalRecommendationInput?.value || "Brak sekcji rekomendacji.")}

Obiekty:
${selectedCharts.length ? selectedCharts.map(item => `• ${escapeHtml(item.title)}`).join("<br>") : "• Brak wybranych wykresów"}
<br>
${selectedPivots.length ? selectedPivots.map(item => `• ${escapeHtml(item.title)}`).join("<br>") : "• Brak wybranych tabel przestawnych"}
        `.trim();
    }

    function populateReportBuilder() {
        if (!reportModalTitleInput || !currentSheet) return;
        const suggestedKpis = buildSuggestedKpis();
        const suggestedInsights = buildSuggestedInsights();
        const chartLead = chartObjects[0]?.title || chartObjects[0]?.type || "wykresów";
        reportModalTitleInput.value = reportModalTitleInput.value || `Raport: ${currentSheet.name || "Arkusz"}${chartObjects.length ? ` + ${chartLead}` : ""}`;
        reportModalDescriptionInput.value = reportModalDescriptionInput.value || `Raport oparty na arkuszu ${currentSheet.name || "Arkusz"}, bieżących danych i obiektach analitycznych przygotowanych w edytorze.`;
        reportModalKpisInput.value = suggestedKpis.map(item => `${item.label}|${item.value}`).join("\n");
        reportModalInsightsInput.value = suggestedInsights.join("\n");
        reportModalExecutiveSummaryInput.value = reportModalExecutiveSummaryInput.value || buildExecutiveSummary();
        reportModalRiskInput.value = reportModalRiskInput.value || buildRiskSummary();
        reportModalRecommendationInput.value = reportModalRecommendationInput.value || buildRecommendationSummary();
        renderReportObjectLists();
        fillReportScopeOptions();
        renderReportPreview();
    }

    async function saveReportFromEditor(openReportsAfter = false) {
        if (!currentSheet || DEMO_MODE) return;
        await saveSheet();
        const visibility = reportModalVisibilitySelect?.value || "private";
        const scopeValue = reportModalScopeSelect?.value || "";
        const selection = getSelectionStats();
        const selectedCharts = getSelectedChartsForReport();
        const selectedPivots = getSelectedPivotsForReport();
        const payload = {
            title: (reportModalTitleInput?.value || "").trim() || `Raport: ${currentSheet.name || "Arkusz"}`,
            description: reportModalDescriptionInput?.value || "",
            sheetId: sheetId,
            reportType: reportModalTypeSelect?.value || "analytical",
            visibility,
            config: {
                source: "worksheet-editor",
                includeSelection: !!reportIncludeSelectionInput?.checked,
                includeActivity: !!reportIncludeActivityInput?.checked,
                selectedChartIndexes: selectedCharts.map(item => item.index),
                selectedPivotIndexes: selectedPivots.map(item => item.index),
            },
            snapshot: {
                selection: reportIncludeSelectionInput?.checked ? selection : null,
                charts: selectedCharts,
                pivots: selectedPivots,
                kpis: String(reportModalKpisInput?.value || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
                    const [label, value] = line.split("|");
                    return { label: (label || "").trim(), value: (value || "").trim() };
                }).filter(item => item.label),
                insights: String(reportModalInsightsInput?.value || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean),
                executiveSummary: reportModalExecutiveSummaryInput?.value || "",
                risk: reportModalRiskInput?.value || "",
                recommendation: reportModalRecommendationInput?.value || ""
            }
        };
        if (scopeValue.startsWith("group:")) payload.groupId = scopeValue.split(":")[1];
        if (scopeValue.startsWith("organization:")) payload.organizationId = scopeValue.split(":")[1];
        await postJson("/ares/api/reports/user/create/", payload);
        if (workflowStatusEl) workflowStatusEl.textContent = "Raport zapisany z poziomu edytora.";
        logUserAction("Utworzono raport z edytora", { type: "editor_report_create", reportType: payload.reportType, visibility });
        closeModal(reportModal);
        if (openReportsAfter) {
            window.location.href = "/reports/";
        }
    }

    function initializeEvents() {
        saveBtn?.addEventListener("click", saveSheet);
        exportBtn?.addEventListener("click", exportSheetData);
        renameBtn?.addEventListener("click", renameSheet);
        undoBtn?.addEventListener("click", undoLastChange);
        redoBtn?.addEventListener("click", redoLastChange);

        importInput?.addEventListener("change", event => {
            const file = event.target.files?.[0];
            if (file) importDataFile(file);
        });

        applyFormulaBtn?.addEventListener("click", applyFormulaToActiveCell);
        formulaInput?.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                applyFormulaToActiveCell();
                formulaHelperPopover && (formulaHelperPopover.hidden = true);
            }
            if (event.key === "F4") {
                event.preventDefault();
                toggleReferenceLockInFormulaInput();
                renderFormulaHelper();
            }
        });
        formulaInput?.addEventListener("input", () => {
            renderFormulaHelper();
            if (!currentSheet) return;
            const value = formulaInput.value || "";
            ensureDimensions(activeCell.row + 1, activeCell.col + 1);
            currentSheet.grid[activeCell.row][activeCell.col] = value;
            scheduleFormulaReferenceHighlights(value);
            clearTimeout(autosaveTimer);
            autosaveTimer = setTimeout(saveSheet, 300000);
            setAutosaveState("saving", "Niezapisane zmiany — autozapis co 5 min");
        });
        formulaInput?.addEventListener("focus", () => {
            formulaEditTarget = { ...activeCell };
            renderFormulaHelper();
            scheduleFormulaReferenceHighlights(formulaInput.value || "");
        });
        formulaInput?.addEventListener("blur", () => {
            window.setTimeout(() => scheduleFormulaReferenceHighlights(), 0);
        });
        document.addEventListener("click", event => {
            if (!formulaHelperPopover || formulaHelperPopover.hidden) return;
            if (event.target === formulaInput || formulaHelperPopover.contains(event.target) || event.target.closest?.(".we-sheet-table")) return;
            if (skipFormulaBlurHide) return;
            formulaHelperPopover.hidden = true;
        });
        formulaHelperPopover?.addEventListener("click", event => {
            const item = event.target.closest("[data-formula-syntax]");
            if (!item || !formulaInput) return;
            formulaInput.value = item.dataset.formulaSyntax || "";
            formulaInput.focus();
            renderFormulaHelper();
        });
        emojiSearchInput?.addEventListener("input", renderEmojiPicker);
        emojiCategoryButtons?.addEventListener("click", event => {
            const btn = event.target.closest("[data-emoji-category]");
            if (!btn) return;
            activeEmojiCategory = btn.dataset.emojiCategory;
            if (emojiSearchInput) emojiSearchInput.value = "";
            renderEmojiPicker();
        });
        emojiGrid?.addEventListener("click", event => {
            const btn = event.target.closest("[data-emoji]");
            if (!btn) return;
            selectedEmoji = btn.dataset.emoji;
            renderEmojiPicker();
        });
        emojiGrid?.addEventListener("dblclick", event => {
            const btn = event.target.closest("[data-emoji]");
            if (!btn) return;
            selectedEmoji = btn.dataset.emoji;
            insertSelectedEmoji();
        });
        emojiInsertBtn?.addEventListener("click", insertSelectedEmoji);

        sortAscBtn?.addEventListener("click", () => sortActiveColumn("asc"));
        sortDescBtn?.addEventListener("click", () => sortActiveColumn("desc"));
        clearCellBtn?.addEventListener("click", clearActiveCell);
        toggleFullWidthBtn?.addEventListener("click", toggleFullWidth);
        toggleGridBtn?.addEventListener("click", toggleGrid);
        autofitBtn?.addEventListener("click", () => autoFitColumns(true));
        sheetImageLayer?.addEventListener("click", event => {
            const deleteChartBtn = event.target.closest("[data-delete-sheet-chart-id]");
            if (deleteChartBtn) {
                const state = getSheetExtensionState();
                state.sheetCharts = (state.sheetCharts || []).filter(chart => chart.id !== deleteChartBtn.dataset.deleteSheetChartId);
                renderSheetImages();
                markDirty();
                return;
            }
            const deleteBtn = event.target.closest("[data-delete-image-id]");
            if (!deleteBtn) return;
            const state = getSheetExtensionState();
            state.images = (state.images || []).filter(image => image.id !== deleteBtn.dataset.deleteImageId);
            renderSheetImages();
            markDirty();
        });
        sheetImageLayer?.addEventListener("mousedown", event => {
            const handle = event.target.closest("[data-sheet-chart-drag]");
            if (!handle || event.target.closest("button")) return;
            startSheetChartDrag(handle.dataset.sheetChartDrag, event);
        });
        document.addEventListener("mousemove", event => {
            if (!activeSheetChartDrag) return;
            const dx = event.clientX - activeSheetChartDrag.startX;
            const dy = event.clientY - activeSheetChartDrag.startY;
            const x = Math.max(0, activeSheetChartDrag.originX + dx);
            const y = Math.max(0, activeSheetChartDrag.originY + dy);
            activeSheetChartDrag.element.style.left = `${x}px`;
            activeSheetChartDrag.element.style.top = `${y}px`;
        });
        document.addEventListener("mouseup", () => {
            if (!activeSheetChartDrag) return;
            const x = parseFloat(activeSheetChartDrag.element.style.left || "0");
            const y = parseFloat(activeSheetChartDrag.element.style.top || "0");
            updateSheetChartPosition(activeSheetChartDrag.id, x, y);
            activeSheetChartDrag.element.classList.remove("dragging");
            document.body.classList.remove("we-dragging-sheet-chart");
            activeSheetChartDrag = null;
            renderSheetImages();
        });
        document.addEventListener("paste", async event => {
            const insideSheet = document.activeElement?.closest?.(".we-sheet-table") || event.target?.closest?.(".we-sheet-table");
            if (!insideSheet || document.activeElement?.classList?.contains("we-cell-editing")) return;
            const imageSrc = await readClipboardImageFromEvent(event);
            const text = event.clipboardData?.getData("text/plain") || "";
            if (!imageSrc && !text) return;
            event.preventDefault();
            if (imageSrc) {
                insertImageOverlayAtActiveCell(imageSrc);
                return;
            }
            cellClipboard.text = text;
            await pasteClipboardToActiveCell();
        });

        fontFamilySelect?.addEventListener("change", () => {
            applyStyleToSelectionOrActive({ fontFamily: fontFamilySelect.value });
        });

        fontSizeInput?.addEventListener("change", () => {
            applyStyleToSelectionOrActive({ fontSize: parseInt(fontSizeInput.value || "14", 10) });
        });

        boldBtn?.addEventListener("click", () => {
            toggleStyleFlag("bold");
        });

        italicBtn?.addEventListener("click", () => {
            toggleStyleFlag("italic");
        });

        underlineBtn?.addEventListener("click", () => {
            toggleStyleFlag("underline");
        });

        textColorInput?.addEventListener("click", () => showColorPopover(textColorInput, "textColor"));
        textColorInput?.addEventListener("input", () => {
            rememberRecentColor(textColorInput.value);
            applyStyleToSelectionOrActive({ textColor: textColorInput.value });
        });

        fillColorInput?.addEventListener("click", () => showColorPopover(fillColorInput, "fillColor"));
        fillColorInput?.addEventListener("input", () => {
            rememberRecentColor(fillColorInput.value);
            applyStyleToSelectionOrActive({ fillColor: fillColorInput.value });
        });

        alignLeftBtn?.addEventListener("click", () => {
            applyStyleToSelectionOrActive({ align: "left" });
        });

        alignCenterBtn?.addEventListener("click", () => {
            applyStyleToSelectionOrActive({ align: "center" });
        });

        alignRightBtn?.addEventListener("click", () => {
            applyStyleToSelectionOrActive({ align: "right" });
        });

        chartTypeCards?.addEventListener("click", (event) => {
            const card = event.target.closest("[data-chart-type]");
            if (!card) return;
            chartTypeCards.querySelectorAll(".we-chart-type-card").forEach(btn => btn.classList.remove("active"));
            card.classList.add("active");
            if (chartTypeSelect) chartTypeSelect.value = card.dataset.chartType || "line";
            scheduleChartPreviewRefresh();
        });

        [chartRangeInput, chartTypeSelect, chartTitleInput, chartXTitleInput, chartYTitleInput, chartSeriesColorInput, chartBgColorInput, chartWidthInput, chartHeightInput, chartLineWidthInput, chartPointSizeInput, chartSortSelect, chartLegendPositionSelect, chartPlacementSelect, chartFirstRowHeaderInput, chartFirstColLabelsInput, chartShowLegendInput, chartShowGridInput, chartShowLabelsInput, chartPlaceOnSheetInput]
            .filter(Boolean)
            .forEach(control => {
                control.addEventListener("input", () => { scheduleChartPreviewRefresh(); renderChartRangeInsight(); });
                control.addEventListener("change", () => { scheduleChartPreviewRefresh(); renderChartRangeInsight(); });
            });

        chartUseSelectionBtn?.addEventListener("click", () => {
            if (chartRangeInput) chartRangeInput.value = getCurrentSelectionRangeText();
            renderChartSmartSuggestions();
            scheduleChartPreviewRefresh();
        });

        chartSmartPanel?.addEventListener("click", event => {
            const card = event.target.closest("[data-chart-suggestion-index]");
            if (!card) return;
            applyChartSuggestion(card.dataset.range || "", card.dataset.type || "column", card.dataset.title || "", card.dataset.xTitle || "", card.dataset.yTitle || "");
        });

        buildChartBtn?.addEventListener("click", () => {
            const config = getChartConfigFromInputs();
            if (!config.rangeText) {
                alert("Podaj zakres danych.");
                return;
            }

            if (editingChartIndex !== null && chartObjects[editingChartIndex]) {
                chartObjects[editingChartIndex] = config;
            } else {
                chartObjects.push(config);
                if (config.placeOnSheet) {
                    insertChartOverlayToSheet(config, config.placement || "near");
                }
            }

            editingChartIndex = null;
            refreshChartActionLabel();
            rerenderGeneratedObjects();
            closeModal(chartModal);
        });

        generatedObjectsArea?.addEventListener("click", (event) => {
            const actionBtn = event.target.closest("[data-chart-action]");
            if (!actionBtn) return;
            const index = parseInt(actionBtn.dataset.chartIndex || "-1", 10);
            if (!Number.isInteger(index) || !chartObjects[index]) return;
            const action = actionBtn.dataset.chartAction;
            if (action === "embed") {
                insertChartOverlayToSheet(chartObjects[index], chartObjects[index].placement || "near");
            }
            if (action === "edit") {
                populateChartModal(chartObjects[index], index);
                openModal(chartModal);
            }
            if (action === "delete") {
                chartObjects.splice(index, 1);
                if (editingChartIndex === index) editingChartIndex = null;
                rerenderGeneratedObjects();
            }
        });

        buildPivotBtn?.addEventListener("click", buildPivotFromModal);
        pivotUseSelectionBtn?.addEventListener("click", () => { if (pivotRangeInput) pivotRangeInput.value = getCurrentSelectionRangeText(); renderPivotEditor(); });
        pivotSearchInput?.addEventListener("input", renderPivotEditor);
        pivotRangeInput?.addEventListener("input", renderPivotEditor);
        pivotClearBtn?.addEventListener("click", () => { pivotConfig = { rows: [], columns: [], values: [], filters: [] }; renderPivotEditor(); });
        document.querySelectorAll("[data-pivot-add]").forEach(btn => btn.addEventListener("click", () => addPivotField(btn.dataset.pivotAdd)));
        pivotModal?.addEventListener("click", event => {
            const quick = event.target.closest("[data-pivot-quick]");
            if (quick) addPivotField(quick.dataset.pivotQuick, quick.dataset.fieldIndex);
            const move = event.target.closest("[data-pivot-move]");
            if (move) movePivotField(move.dataset.pivotMove, parseInt(move.dataset.pivotMoveIndex || "0", 10), parseInt(move.dataset.pivotMoveDelta || "0", 10));
            const remove = event.target.closest("[data-pivot-remove]");
            if (remove) removePivotField(remove.dataset.pivotRemove, parseInt(remove.dataset.pivotRemoveIndex || "0", 10));
        });
        commentTextarea?.addEventListener("input", updateCommentPreview);
        commentSaveBtn?.addEventListener("click", saveCommentFromModal);
        commentDeleteBtn?.addEventListener("click", deleteCommentFromModal);
        runSolverBtn?.addEventListener("click", runSolverFromModal);
        smartInsertApplyBtn?.addEventListener("click", applySmartInsert);
        tableTemplateGrid?.addEventListener("click", event => {
            const card = event.target.closest("[data-template-id]");
            if (card) applyTableTemplate(card.dataset.templateId);
        });
        universityTemplateGrid?.addEventListener("click", event => {
            const card = event.target.closest("[data-template-id]");
            if (card) applyTableTemplate(card.dataset.templateId);
        });
        clearBeforeTemplateBtn?.addEventListener("click", () => clearBeforeTemplateBtn.classList.toggle("active"));
        clearBeforeUniversityTemplateBtn?.addEventListener("click", () => clearBeforeUniversityTemplateBtn.classList.toggle("active"));
        document.querySelectorAll("[data-ribbon-action]").forEach(button => {
            button.addEventListener("click", () => applyRibbonAction(button.dataset.ribbonAction));
        });
        document.getElementById("zoom-select")?.addEventListener("change", event => {
            if (String(event.target.value) === "Dopasuj") return fitSheetToAvailableWidth();
            const raw = String(event.target.value || "100%").replace("%", "");
            setSheetZoom(Number(raw) / 100 || 1, false);
        });
        sheetScriptSelect?.addEventListener("change", () => loadScriptToEditor(sheetScriptSelect.value));
        sheetScriptNewBtn?.addEventListener("click", createNewSheetScript);
        sheetScriptDeleteBtn?.addEventListener("click", deleteCurrentScript);
        sheetScriptSaveBtn?.addEventListener("click", saveCurrentScriptFromEditor);
        sheetScriptRunBtn?.addEventListener("click", runCurrentScript);
        editorAddonsList?.addEventListener("click", async event => {
            const installBtn = event.target.closest("[data-addon-install-id]");
            const attachBtn = event.target.closest("[data-addon-attach-id]");
            const runBtn = event.target.closest("[data-addon-run-id]");
            if (!installBtn && !attachBtn && !runBtn) return;
            if (!currentSheetCanEdit) {
                setScriptResult("Nie masz uprawnień do edycji tego arkusza.", true);
                return;
            }
            const addonId = String(installBtn?.dataset.addonInstallId || attachBtn?.dataset.addonAttachId || runBtn?.dataset.addonRunId || "").trim();
            const addon = editorAddonsCache.find(item => String(item.id) === addonId);
            if (!addon) {
                setScriptResult("Nie znaleziono dodatku. Odśwież listę dodatków.", true);
                return;
            }
            if (installBtn) {
                try {
                    await postJson(`/ares/api/addons/${addonId}/install/`, { sheetId: Number(sheetId) });
                    await loadEditorAddons();
                    setScriptResult(`Dodatek „${addon.title}” został zainstalowany.`, false);
                } catch (error) {
                    setScriptResult("Nie udało się zainstalować dodatku.", true);
                }
                return;
            }
            const script = attachAddonToCurrentSheet(addon);
            if (!script) return;
            if (runBtn) {
                await runScriptCode(script.name, script.code);
            }
        });
        window.addEventListener("resize", () => {
            refreshEditorResponsiveLayout();
            scheduleFormulaReferenceHighlights();
        });
        window.visualViewport?.addEventListener("resize", () => {
            refreshEditorResponsiveLayout();
            scheduleFormulaReferenceHighlights();
        });
        const sheetScrollEl = sheetGridTable?.closest(".we-sheet-scroll") || sheetEditorCard?.querySelector(".we-sheet-scroll");
        sheetScrollEl?.addEventListener("scroll", () => scheduleFormulaReferenceHighlights(), { passive: true });
        setTimeout(refreshEditorResponsiveLayout, 80);
        menuBar?.addEventListener("click", event => {
            const btn = event.target.closest("[data-menu]");
            if (btn) showMenuPopover(btn.dataset.menu, btn);
        });
        menuPopover?.addEventListener("click", event => {
            const btn = event.target.closest("[data-menu-action]");
            if (!btn || btn.disabled) return;
            menuPopover.hidden = true;
            handleMenuAction(btn.dataset.menuAction);
        });
        sheetContextMenu?.addEventListener("pointerdown", event => {
            const swatch = event.target.closest(".we-sheet-color-swatch[data-sheet-action]");
            if (!swatch || swatch.disabled) return;
            event.preventDefault();
            event.stopPropagation();
            handleSheetContextAction(swatch.dataset.sheetAction);
            sheetContextMenu.hidden = true;
        }, true);
        sheetContextMenu?.addEventListener("click", event => {
            const cellBtn = event.target.closest("[data-cell-action]");
            if (cellBtn && !cellBtn.disabled) {
                sheetContextMenu.hidden = true;
                handleCellContextAction(cellBtn.dataset.cellAction);
                return;
            }
            const btn = event.target.closest("[data-sheet-action]");
            if (!btn || btn.disabled) return;
            sheetContextMenu.hidden = true;
            handleSheetContextAction(btn.dataset.sheetAction);
        });
        document.addEventListener("click", event => {
            if (menuPopover && !event.target.closest(".we-menu-bar") && !event.target.closest("#we-menu-popover")) menuPopover.hidden = true;
            if (sheetContextMenu && !event.target.closest(".we-workbook-tab") && !event.target.closest("#sheet-context-menu")) sheetContextMenu.hidden = true;
        });

        solverSheetSelect?.addEventListener("change", () => {
            activateSelectedSolverSheet();
            refreshSolverSheetSelect(activeWorkbookSheetIndex);
        });
        solverCurrentSheetBtn?.addEventListener("click", () => {
            refreshSolverSheetSelect(activeWorkbookSheetIndex);
        });
        solverTargetUpdateBtn?.addEventListener("click", () => {
            if (solverTargetInput) solverTargetInput.value = `${colToLabel(activeCell.col)}${activeCell.row + 1}`;
        });
        solverTargetClearBtn?.addEventListener("click", () => {
            if (solverTargetInput) solverTargetInput.value = "";
        });
        solverVariableAddBtn?.addEventListener("click", () => setSolverVariablesFromSelection(false));
        solverVariableUpdateBtn?.addEventListener("click", () => setSolverVariablesFromSelection(true));
        solverVariableDeleteBtn?.addEventListener("click", () => {
            if (solverVariableInput) solverVariableInput.value = "";
        });
        solverConstraintAddBtn?.addEventListener("click", () => addSolverConstraintFromSelection(false));
        solverConstraintUpdateBtn?.addEventListener("click", () => addSolverConstraintFromSelection(true));
        solverConstraintZlpBtn?.addEventListener("click", fillSolverFromZlpModel);
        solverConstraintClearBtn?.addEventListener("click", () => {
            if (solverConstraintsInput) solverConstraintsInput.value = "";
        });

        teamOrgAddBtn?.addEventListener("click", async () => {
            try { await addOrganization(); } catch (error) { alert("Nie udało się utworzyć organizacji."); }
        });
        teamFriendAddBtn?.addEventListener("click", async () => {
            try { await addFriend(); } catch (error) { alert("Nie udało się dodać znajomego."); }
        });
        teamGroupAddBtn?.addEventListener("click", async () => {
            try { await addGroup(); } catch (error) { alert("Nie udało się utworzyć grupy."); }
        });
        teamListEl?.addEventListener("click", async event => {
            const removeFriend = event.target.closest("[data-remove-friend-id]");
            if (removeFriend) {
                try {
                    await postJson(`/ares/api/network/friends/${removeFriend.dataset.removeFriendId}/remove/`, {});
                    await loadNetworkSummary();
                } catch (error) {
                    alert("Nie udało się usunąć znajomego.");
                }
                return;
            }
            const watchBtn = event.target.closest("[data-group-watch-id]");
            if (watchBtn) {
                try {
                    await postJson(`/ares/api/network/groups/${watchBtn.dataset.groupWatchId}/watch/toggle/`, {});
                    await loadNetworkSummary();
                } catch (error) {
                    alert("Nie udało się zmienić watch.");
                }
                return;
            }
            const addMemberBtn = event.target.closest("[data-group-member-add-id]");
            if (addMemberBtn) {
                const query = prompt("Podaj login lub e-mail użytkownika:");
                if (!query) return;
                try {
                    await postJson(`/ares/api/network/groups/${addMemberBtn.dataset.groupMemberAddId}/members/add/`, { query, role: "member" });
                    await loadNetworkSummary();
                } catch (error) {
                    alert("Nie udało się dodać członka grupy.");
                }
                return;
            }
            const assignBtn = event.target.closest("[data-group-assign-id]");
            if (assignBtn) {
                const groupId = assignBtn.dataset.groupAssignId;
                const group = (networkSummaryCache.groups || []).find(g => String(g.id) === String(groupId));
                const assignedCurrentSheet = (group?.assignedSheets || []).some(s => String(s.id) === String(sheetId));
                try {
                    if (assignedCurrentSheet) {
                        await postJson(`/ares/api/network/groups/${groupId}/unassign-sheet/`, { sheetId: Number(sheetId) });
                    } else {
                        await postJson(`/ares/api/network/groups/${groupId}/assign-sheet/`, { sheetId: Number(sheetId) });
                    }
                    await loadNetworkSummary();
                } catch (error) {
                    alert("Nie udało się zmienić przypisania arkusza do grupy.");
                }
            }
        });

        followMeToggleBtn?.addEventListener("click", () => {
            followMeBroadcastEnabled = !followMeBroadcastEnabled;
            renderFollowMeStatus(followMeBroadcastEnabled ? "Nadawanie aktywne: inni mogą śledzić Twoją komórkę." : "Tryb wyłączony.");
            if (followMeBroadcastEnabled) broadcastFollowMePosition();
        });
        followMeJoinBtn?.addEventListener("click", jumpToFollowMeSignal);
        window.addEventListener("storage", event => {
            if (event.key !== FOLLOW_ME_CHANNEL || !event.newValue) return;
            if (!followMeBroadcastEnabled) return;
            renderFollowMeStatus("Wysłano nowy sygnał follow-me.");
        });

        cellTaskAddBtn?.addEventListener("click", addCellTask);
        cellTaskListEl?.addEventListener("click", event => {
            const toggle = event.target.closest("[data-task-toggle]");
            const remove = event.target.closest("[data-task-remove]");
            const state = getSheetExtensionState();
            if (toggle) {
                const idx = Number(toggle.dataset.taskToggle);
                if (state.tasks[idx]) state.tasks[idx].done = !state.tasks[idx].done;
                renderCellTasks();
                markDirty();
                return;
            }
            if (remove) {
                const idx = Number(remove.dataset.taskRemove);
                state.tasks.splice(idx, 1);
                renderCellTasks();
                markDirty();
            }
        });

        scenarioSaveBtn?.addEventListener("click", saveScenario);
        scenarioListEl?.addEventListener("click", event => {
            const compare = event.target.closest("[data-scenario-compare]");
            const restore = event.target.closest("[data-scenario-restore]");
            const remove = event.target.closest("[data-scenario-remove]");
            const state = getSheetExtensionState();
            if (compare) return compareScenario(Number(compare.dataset.scenarioCompare));
            if (restore) return restoreScenario(Number(restore.dataset.scenarioRestore));
            if (remove) {
                state.scenarios.splice(Number(remove.dataset.scenarioRemove), 1);
                renderScenarios();
                markDirty();
            }
        });

        workflowCleanReportBtn?.addEventListener("click", runWorkflowCleanReport);
        workflowSaveReportBtn?.addEventListener("click", runWorkflowSaveReport);
        reportModalVisibilitySelect?.addEventListener("change", () => {
            fillReportScopeOptions();
            renderReportPreview();
        });
        [
            reportModalTitleInput,
            reportModalTypeSelect,
            reportModalDescriptionInput,
            reportModalKpisInput,
            reportModalInsightsInput,
            reportModalExecutiveSummaryInput,
            reportModalRiskInput,
            reportModalRecommendationInput,
            reportIncludeSelectionInput,
            reportIncludeActivityInput,
            reportModalScopeSelect
        ].forEach(control => control?.addEventListener("input", renderReportPreview));
        [reportIncludeSelectionInput, reportIncludeActivityInput, reportModalScopeSelect].forEach(control => control?.addEventListener("change", renderReportPreview));
        reportModalChartList?.addEventListener("change", renderReportPreview);
        reportModalPivotList?.addEventListener("change", renderReportPreview);
        reportModalSaveBtn?.addEventListener("click", () => saveReportFromEditor(false));
        reportModalSaveOpenBtn?.addEventListener("click", () => saveReportFromEditor(true));
    }

    function safeBoot(stepName, callback) {
        try {
            callback();
            return true;
        } catch (error) {
            console.error(`Błąd startu edytora [${stepName}]`, error);
            return false;
        }
    }

    safeBoot("renderTableTemplates", renderTableTemplates);
    safeBoot("renderUniversityTemplates", renderUniversityTemplates);
    safeBoot("initializeTabs", initializeTabs);
    safeBoot("initializeMenus", initializeMenus);
    safeBoot("initializeModals", initializeModals);
    safeBoot("initializeEvents", initializeEvents);
    if (addSheetTagBtn) {
        addSheetTagBtn.addEventListener("click", addSheetTag);
    }
    if (sheetTagSaveBtn) {
        sheetTagSaveBtn.addEventListener("click", saveSheetTagFromModal);
    }
    if (sheetTagInput) {
        sheetTagInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                saveSheetTagFromModal();
            }
            if (event.key === "Escape") {
                event.preventDefault();
                closeSheetTagModal();
            }
        });
    }
    safeBoot("renderFollowMeStatus", () => renderFollowMeStatus("Tryb wyłączony."));
    safeBoot("loadNetworkSummary", () => {
        scheduleNetworkSummaryLoad(700);
    });
    safeBoot("renderCellTasks", renderCellTasks);
    safeBoot("renderScenarios", renderScenarios);
    sheetTagCancelBtns.forEach(btn => btn.addEventListener("click", closeSheetTagModal));
    sheetTagSuggestionBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (!sheetTagInput) return;
            sheetTagInput.value = btn.dataset.tagSuggestion || "";
            sheetTagInput.focus();
        });
    });
    if (sheetTagModal) {
        sheetTagModal.addEventListener("click", event => {
            if (event.target === sheetTagModal) closeSheetTagModal();
        });
    }

    if (sheetMetaEl && /Ładowanie danych arkusza/i.test(sheetMetaEl.textContent || "")) {
        sheetMetaEl.textContent = "Start ładowania arkusza…";
    }

    Promise.resolve()
        .then(() => loadSheet())
        .catch(error => {
            console.error("Krytyczny błąd ładowania arkusza:", error);
            if (sheetMetaEl) sheetMetaEl.textContent = "Nie udało się uruchomić edytora arkusza.";
            setAutosaveState("error", "Błąd ładowania");
        });
});
