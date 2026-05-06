document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    let sheetId = params.get("sheet");
    let currentSheetCanEdit = true;
    let currentSheetCanShare = false;
    const initialOpenPanel = params.get("open");

    const head = document.getElementById("sheet-head");
    const body = document.getElementById("sheet-body");

    const sheetNameEl = document.getElementById("editor-sheet-name");
    const sheetMetaEl = document.getElementById("editor-sheet-meta");
    const autosaveBadge = document.getElementById("autosave-badge");

    const saveBtn = document.getElementById("save-sheet-btn");
    const exportBtn = document.getElementById("export-csv-btn");
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
    const solverVariableAddBtn = document.getElementById("solver-variable-add-btn");
    const solverVariableDeleteBtn = document.getElementById("solver-variable-delete-btn");
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
    let activeColumnResize = null;
    let draggedColumnIndex = null;
    let draggedRowIndex = null;
    let highlightedCells = [];
    let highlightedHeaders = [];
    let highlightedFillCells = [];
    let activeCellElement = null;
    let computedCellKeys = new Set();
    let gridDelegationBound = false;
    let pendingColumnWidths = null;
    let columnWidthFrameId = null;
    let cellElements = [];
    let rowHeaderElements = [];
    let colHeaderElements = [];
    let workbook = null;
    let activeWorkbookSheetIndex = 0;
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
        popularne: ["😀","😃","😄","😁","😊","😉","😍","🤩","😎","🙂","🤔","👍","👎","👏","🙏","💪","✅","❌","⚠️","📌","⭐","🔥","💡","📊","📈","📉","🧮","📝","📁","🔒","🔓","🚀"],
        ludzie: ["😀","😂","🤣","😊","😇","😉","😋","😜","🤓","😎","🥳","😏","😐","🙄","😬","😴","😷","🤒","🤕","🤠","🥺","😢","😭","😤","😡","🤯","🤝","👏","🙌","👋","👌","✌️","🤞","🙏","💪","👀"],
        praca: ["📌","📎","✂️","📐","📏","🖊️","🖋️","✏️","📝","📒","📔","📕","📗","📘","📙","📚","📁","📂","🗂️","🗃️","🧾","📊","📈","📉","🧮","💼","🗓️","⏱️","⏰","🔍","🔎","🔔","📣","📧","📤","📥"],
        symbole: ["✅","☑️","✔️","❌","✖️","➕","➖","➗","✳️","⚠️","🚫","⛔","🔴","🟠","🟡","🟢","🔵","🟣","⚪","⚫","⬆️","⬇️","⬅️","➡️","↗️","↘️","🔁","🔄","💯","❓","❗","ℹ️","🔒","🔓","🔑","🔧"],
        obiekty: ["🏠","🏢","🏭","🚗","🚆","✈️","⚽","🎯","🏆","🥇","☕","🍕","🍎","🌞","🌙","⭐","🌧️","❄️","🔥","💧","🌱","🌳","🌍","⚡","🔋","🧲","🧪","🧬","💻","🖥️","⌨️","🖱️","📱","📷","🎧","🎮"]
    };
    let activeTooltip = null;
    let recentColors = JSON.parse(localStorage.getItem("ares_recent_colors") || "[]");

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
    let skipFormulaBlurHide = false;
    let formulaEditTarget = null;

    const SPILL_PREFIX = "__SPILL__:";
    const DEFAULT_CHART_COLOR = "#4f8cff";
    const STATIC_PALETTE = ["#4f8cff", "#7ba8ff", "#54c6eb", "#8a6dff", "#3ccf91", "#f8c156", "#ff8a65"];

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

    async function getJson(url) {
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

        return JSON.parse(text);
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

    async function logUserAction(action, details = {}) {
        try {
            await postJson("/ares/api/history/add/", {
                sheetId: sheetId,
                action,
                details: {
                    sheetName: currentSheet?.name || "Arkusz",
                    tabName: currentSheetLabel(),
                    activeCell: cellAddress(activeCell.row, activeCell.col),
                    ...details,
                }
            });
        } catch (error) {
            console.warn("Nie udało się zapisać historii akcji:", action, error);
        }
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
        const cursor = formulaInput.selectionStart ?? value.length;
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

    function inferDimensionsFromGrid(grid) {
        const rows = Math.max(Array.isArray(grid) ? grid.length : 0, MIN_ROWS || 20);
        let cols = MIN_COLS || 10;

        (grid || []).forEach(row => {
            cols = Math.max(cols, Array.isArray(row) ? row.length : 0);
        });

        return {
            rows: Number.isFinite(rows) && rows > 0 ? rows : (MIN_ROWS || 20),
            cols: Number.isFinite(cols) && cols > 0 ? cols : (MIN_COLS || 10)
        };
    }

    function safeSheetName(value, fallback = "Arkusz 1") {
        const text = String(value ?? "").trim();
        if (!text || text === "undefined" || text === "null") return fallback;
        // Stare/zepsute zapisy potrafiły traktować liczbę wierszy jako nazwę zakładki.
        if (/^\d+$/.test(text)) return fallback;
        return text;
    }

    function syncSheetDimensionsFromGrid() {
        const dims = inferDimensionsFromGrid(currentSheet?.grid || workbook?.sheets?.[activeWorkbookSheetIndex]?.grid || []);
        currentRows = Number.isFinite(dims.rows) ? dims.rows : (MIN_ROWS || 20);
        currentCols = Number.isFinite(dims.cols) ? dims.cols : (MIN_COLS || 10);
        return { rows: currentRows, cols: currentCols };
    }

    function updateSheetMeta(extra = "") {
        if (!sheetMetaEl) return;
        const dims = syncSheetDimensionsFromGrid();
        const tabName = safeSheetName(
            currentSheet?.activeTabName || workbook?.sheets?.[activeWorkbookSheetIndex]?.name,
            `Arkusz ${activeWorkbookSheetIndex + 1 || 1}`
        );
        sheetMetaEl.textContent = `Zakładka: ${tabName} • Wiersze: ${dims.rows} • Kolumny: ${dims.cols}${extra || ""}`;
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

    function normalizeSheetMeta(sheet, index) {
        return {
            name: safeSheetName(sheet?.name, `Arkusz ${index + 1}`),
            grid: Array.isArray(sheet?.grid) ? sheet.grid : emptyGrid(),
            styles: sheet?.styles || {},
            conditionalRules: Array.isArray(sheet?.conditionalRules) ? sheet.conditionalRules : [],
            color: sheet?.color || "",
            hidden: Boolean(sheet?.hidden),
            protected: Boolean(sheet?.protected),
            columnWidths: sheet?.columnWidths || {},
            rowHeights: sheet?.rowHeights || {}
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
        return String(formatted ?? "");
    }

    function normalizeWorkbookData(data) {
        const rawGrid = data.grid;
        const normalizedWorkbook = rawGrid && !Array.isArray(rawGrid) && Array.isArray(rawGrid.sheets)
            ? {
                activeSheetIndex: Math.min(rawGrid.activeSheetIndex || 0, rawGrid.sheets.length - 1),
                sheets: rawGrid.sheets.map((sheet, index) => normalizeSheetMeta(sheet, index))
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
                }]
            };

        workbook = normalizedWorkbook;
        ensureUniqueWorkbookSheetNames();
        return workbook;
    }

    function commitActiveSheetToWorkbook() {
        if (!workbook || !currentSheet) return;
        const previous = workbook.sheets[activeWorkbookSheetIndex] || {};
        workbook.sheets[activeWorkbookSheetIndex] = {
            ...previous,
            name: previous.name || currentSheet.activeTabName || currentSheet.name || `Arkusz ${activeWorkbookSheetIndex + 1}`,
            grid: currentSheet.grid,
            styles: currentSheet.styles || {},
            conditionalRules: currentSheet.conditionalRules || [],
            columnWidths: currentSheet.columnWidths || {},
            rowHeights: currentSheet.rowHeights || {}
        };
    }

    function activateWorkbookSheet(index, shouldRender = true) {
        if (!workbook || !workbook.sheets[index]) return;
        commitActiveSheetToWorkbook();
        activeWorkbookSheetIndex = index;
        workbook.activeSheetIndex = index;
        const selected = workbook.sheets[index];
        currentSheet.grid = selected.grid;
        currentSheet.styles = selected.styles || {};
        currentSheet.conditionalRules = Array.isArray(selected.conditionalRules) ? selected.conditionalRules : [];
        currentSheet.columnWidths = selected.columnWidths || {};
        currentSheet.rowHeights = selected.rowHeights || {};
        currentSheet.activeTabName = selected.name;
        const dims = inferDimensionsFromGrid(currentSheet.grid);
        currentRows = dims.rows;
        currentCols = dims.cols;
        ensureDimensions(currentRows, currentCols);
        activeCell = { row: 0, col: 0 };
        clearSelection();
        updateSheetMeta();
        renderWorkbookTabs();
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
        workbook.sheets.push({ name, grid: emptyGrid(), styles: {}, color: "", hidden: false, protected: false });
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
        if (index === activeWorkbookSheetIndex && currentSheet) currentSheet.activeTabName = uniqueName;
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
            sheets: workbook.sheets
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
                normalized[r][c] = value ?? "";
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
            grid: normalized,
            activeTabName: safeSheetName(active.name, "Arkusz 1")
        };
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

        const normalized = String(value ?? "").trim().replace(/\s+/g, "").replace(",", ".");
        if (!normalized) return 0;

        const num = Number(normalized);
        return Number.isFinite(num) ? num : 0;
    }

    function isNumericValue(value) {
        if (typeof value === "number") return Number.isFinite(value);
        if (typeof value === "boolean") return true;

        const normalized = String(value ?? "").trim().replace(/\s+/g, "").replace(",", ".");
        return normalized !== "" && !Number.isNaN(Number(normalized));
    }

    function escapeHtml(value) {
        return String(value ?? "")
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
        setAutosaveState("saving", "Niezapisane zmiany — autozapis co 5 min");
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
        redoStack.push(cloneSheetState());
        const snapshot = historyStack.pop();
        restoreSheetSnapshot(snapshot);

        renderGrid();
        isRestoringHistory = false;
        setAutosaveState("saving", "Cofnięto zmianę");
        scheduleAutosave();
        logUserAction("Cofnięto zmianę", { type: "undo" });
    }

    function redoLastChange() {
        if (!currentSheet || !redoStack.length) return;

        isRestoringHistory = true;
        historyStack.push(cloneSheetState());
        const snapshot = redoStack.pop();
        restoreSheetSnapshot(snapshot);

        renderGrid();
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
        const rawValue = currentSheet?.grid?.[row]?.[col] ?? "";
        const display = cellDisplayValue(row, col);
        return Boolean(display.special || (typeof rawValue === "string" && rawValue.startsWith(SPILL_PREFIX)));
    }

    function syncComputedCellRegistry(row, col) {
        const key = `${row}:${col}`;
        const rawValue = currentSheet?.grid?.[row]?.[col] ?? "";
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
            for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
                const th = colHeaderElements[col];
                if (th && !highlightedHeaders.includes(th)) {
                    th.classList.add("selected-header");
                    highlightedHeaders.push(th);
                }
            }
            for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
                const th = rowHeaderElements[row];
                if (th && !highlightedHeaders.includes(th)) {
                    th.classList.add("selected-header");
                    highlightedHeaders.push(th);
                }
            }
        }
    }

    function updateCellElement(row, col) {
        const td = cellElements[row]?.[col];
        syncComputedCellRegistry(row, col);
        if (!td) return;
        td.innerHTML = cellDisplayValue(row, col).html;
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
            const sourceValue = currentSheet.grid[bounds.rowStart]?.[col] ?? "";
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
        colHeaderElements[activeCell.col]?.classList?.remove("active-header");
        rowHeaderElements[activeCell.row]?.classList?.remove("active-header");
        activeCellElement?.querySelector(".we-fill-handle")?.remove();
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
        colHeaderElements[col]?.classList.add("active-header");
        rowHeaderElements[row]?.classList.add("active-header");
        attachFillHandle(activeCellElement, row, col);

        updateFormulaBar();
        scheduleRefreshStartControls();

        if (focus && activeCellElement) {
            activeCellElement.focus({ preventScroll: true });
        }
    }

    function isFormulaRangePickerReady() {
        if (!formulaInput || document.activeElement !== formulaInput) return false;
        const value = String(formulaInput.value || "");
        if (!value.trim().startsWith("=")) return false;
        const pos = formulaInput.selectionStart ?? value.length;
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
        ensureConditionalRules().forEach(rule => {
            rule._bounds = parseRangeBounds(rule.range);
            rule.priority = Number.isFinite(Number(rule.priority)) ? Number(rule.priority) : 2;
        });
    }

    function conditionalRuleMatches(rule, row, col) {
        const bounds = rule?._bounds || parseRangeBounds(rule?.range);
        if (!rule || !bounds || row < bounds.rowStart || row > bounds.rowEnd || col < bounds.colStart || col > bounds.colEnd) return false;
        const value = getCellComputedValue(row, col);
        const text = String(value ?? "");
        const needle = String(rule.value ?? "");
        const number = isNumericValue(value) ? parseNumber(value) : NaN;
        const a = String(rule.value ?? "").trim();
        const b = String(rule.value2 ?? "").trim();
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
        return ensureConditionalRules()
            .slice()
            .sort((a, b) => (Number(a.priority || 2) - Number(b.priority || 2)))
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
        if (valueInput) valueInput.value = rule?.value ?? "OK";
        if (value2Input) value2Input.value = rule?.value2 ?? "";
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

        forEachSelectedCell((row, col) => {
            setCellStyle(row, col, patch);
        });

        renderGrid();
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

    let refreshControlsTimer = null;
    function scheduleRefreshStartControls() {
        clearTimeout(refreshControlsTimer);
        refreshControlsTimer = setTimeout(refreshStartControlsFromCell, 180);
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
        const trimmed = String(token ?? "").trim();
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
        if (parts.length !== 2) return [];

        const start = cellRefToIndex(parts[0]);
        const end = cellRefToIndex(parts[1]);
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

        const raw = currentSheet?.grid?.[row]?.[col] ?? "";

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
        const raw = currentSheet.grid[row][col] ?? "";
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

        return { html: escapeHtml(raw), text: String(raw ?? ""), special: false };
    }

    function updateFormulaBar() {
        if (!currentSheet) return;
        const value = currentSheet.grid[activeCell.row][activeCell.col] ?? "";
        if (formulaInput) formulaInput.value = value;
        if (activeCellLabel) activeCellLabel.textContent = `${colToLabel(activeCell.col)}${activeCell.row + 1}`;
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
                line.push(raw ? (currentSheet.grid[row]?.[col] ?? "") : cellDisplayValue(row, col).text);
            }
            matrix.push(line);
        }
        return { bounds, matrix };
    }

    function matrixToClipboardText(matrix) {
        return matrix.map(row => row.map(value => String(value ?? "")).join("\t")).join("\n");
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
        const text = await readClipboardText();
        const matrix = text ? clipboardTextToMatrix(text) : cellClipboard.matrix;
        if (!matrix || !matrix.length) return;

        pushHistorySnapshot();
        ensureDimensions(activeCell.row + matrix.length, activeCell.col + Math.max(...matrix.map(row => row.length)));
        matrix.forEach((line, rowOffset) => {
            line.forEach((value, colOffset) => {
                currentSheet.grid[activeCell.row + rowOffset][activeCell.col + colOffset] = value;
            });
        });

        if (cellClipboard.cut && cellClipboard.sourceRange) {
            const targetRange = {
                rowStart: activeCell.row,
                rowEnd: activeCell.row + matrix.length - 1,
                colStart: activeCell.col,
                colEnd: activeCell.col + Math.max(...matrix.map(row => row.length)) - 1
            };
            for (let row = cellClipboard.sourceRange.rowStart; row <= cellClipboard.sourceRange.rowEnd; row += 1) {
                for (let col = cellClipboard.sourceRange.colStart; col <= cellClipboard.sourceRange.colEnd; col += 1) {
                    const insideTarget = row >= targetRange.rowStart && row <= targetRange.rowEnd && col >= targetRange.colStart && col <= targetRange.colEnd;
                    if (!insideTarget && currentSheet.grid[row]) currentSheet.grid[row][col] = "";
                }
            }
            cellClipboard.cut = false;
        }

        selectionStart = { row: activeCell.row, col: activeCell.col };
        selectionEnd = { row: activeCell.row + matrix.length - 1, col: activeCell.col + Math.max(...matrix.map(row => row.length)) - 1 };
        renderGrid();
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
        const raw = currentSheet.grid[row]?.[col] ?? "";
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
            const ref = cellAddress(activeCell.row, activeCell.col);
            if (solverVariableInput && !solverVariableInput.value.split(/[;,\n]/).map(x => x.trim().toUpperCase()).includes(ref)) {
                solverVariableInput.value = solverVariableInput.value.trim() ? `${solverVariableInput.value.trim()},${ref}` : ref;
            }
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
                    const raw = currentSheet?.grid?.[row]?.[col] ?? "";
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
        colHeaderElements.forEach((cell, col) => {
            if (!cell) return;
            const width = colWidths[col] || 120;
            cell.style.width = `${width}px`;
            cell.style.minWidth = `${width}px`;
            cell.style.maxWidth = `${width}px`;
        });

        cellElements.forEach(rowCells => {
            rowCells?.forEach((td, col) => {
                if (!td) return;
                const width = colWidths[col] || 120;
                td.style.width = `${width}px`;
                td.style.minWidth = `${width}px`;
                td.style.maxWidth = `${width}px`;
            });
        });
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
            clone.splice(targetIndex, 0, moved ?? "");
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
            useHeader: chartFirstRowHeaderInput?.checked ?? true,
            title: chartTitleInput?.value?.trim() || "",
            xTitle: chartXTitleInput?.value?.trim() || "",
            yTitle: chartYTitleInput?.value?.trim() || "",
            showLegend: chartShowLegendInput?.checked ?? true,
            showGrid: chartShowGridInput?.checked ?? true,
            showLabels: chartShowLabelsInput?.checked ?? false,
            color: chartSeriesColorInput?.value || DEFAULT_CHART_COLOR,
            backgroundColor: chartBgColorInput?.value || "#111827",
            width: parseInt(chartWidthInput?.value || "900", 10),
            height: parseInt(chartHeightInput?.value || "360", 10),
            lineWidth: parseInt(chartLineWidthInput?.value || "3", 10),
            pointSize: parseInt(chartPointSizeInput?.value || "5", 10),
            sortOrder: chartSortSelect?.value || "none",
            legendPosition: chartLegendPositionSelect?.value || "bottom"
        };
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
        if (chartFirstRowHeaderInput) chartFirstRowHeaderInput.checked = config.useHeader ?? true;
        if (chartShowLegendInput) chartShowLegendInput.checked = config.showLegend ?? true;
        if (chartShowGridInput) chartShowGridInput.checked = config.showGrid ?? true;
        if (chartShowLabelsInput) chartShowLabelsInput.checked = config.showLabels ?? false;
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
        td.textContent = initialValue !== null ? initialValue : (currentSheet.grid[row][col] ?? "");
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
        const cursor = formulaInput.selectionStart ?? value.length;
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
            const currentRaw = currentSheet?.grid?.[coords.row]?.[coords.col] ?? "";
            if (formulaInput) formulaInput.value = currentRaw;
        });

        body.addEventListener("focusout", event => {
            const td = getCellFromTarget(event.target);
            if (!td) return;
            const coords = getCellCoordsFromElement(td);
            if (!coords) return;
            const { row, col } = coords;
            if (!isCellEditingBlocked(row, col) && td.classList.contains("we-cell-editing")) {
                const newValue = td.textContent ?? "";
                td.classList.remove("we-cell-editing");
                td.contentEditable = "false";
                if (newValue !== (currentSheet.grid[row][col] ?? "")) {
                    pushHistorySnapshot();
                    currentSheet.grid[row][col] = newValue;
                    syncComputedCellRegistry(row, col);
                    markDirty();
                    logUserAction("Edycja komórki", { type: "cell_edit", cell: cellAddress(row, col), newValue });
                }
                td.innerHTML = cellDisplayValue(row, col).html;
                applyCellStyleToElement(td, row, col);
                if (row === activeCell.row && col === activeCell.col) {
                    attachFillHandle(td, row, col);
                }
                refreshComputedCells(row, col);
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
            if (event.key === "Escape") {
                event.preventDefault();
                td.classList.remove("we-cell-editing");
                td.contentEditable = "false";
                td.innerHTML = cellDisplayValue(row, col).html;
                applyCellStyleToElement(td, row, col);
                td.focus({ preventScroll: true });
            }
        });
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
            th.innerHTML = `<span class="we-header-label">${escapeHtml(colToLabel(col))}</span><span class="we-col-resize-handle" title="Przeciągnij, aby zmienić szerokość kolumny"></span>`;
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
                const source = draggedColumnIndex ?? parseInt(event.dataTransfer.getData("text/plain") || "-1", 10);
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
                const source = draggedRowIndex ?? parseInt(event.dataTransfer.getData("text/plain") || "-1", 10);
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

                const rawValue = currentSheet.grid[row][col] ?? "";
                const display = cellDisplayValue(row, col);
                syncComputedCellRegistry(row, col);

                td.innerHTML = display.html;
                const checkboxInput = td.querySelector(".we-cell-checkbox");
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
                const dropdownInput = td.querySelector(".we-cell-dropdown");
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
                const tooltipMarker = td.querySelector("[data-tooltip]");
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
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => rerenderGeneratedObjects(), { timeout: 600 });
        } else {
            window.setTimeout(() => rerenderGeneratedObjects(), 0);
        }
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
            const raw = currentSheet.grid?.[row]?.[col] ?? "";
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

    function commitActiveCellLive(row, col, td) {
        if (!currentSheet || !td) return;
        const newValue = td.textContent ?? "";
        ensureDimensions(row + 1, col + 1);
        currentSheet.grid[row][col] = newValue;
        if (formulaInput) formulaInput.value = newValue;
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(saveSheet, 300000);
        setAutosaveState("saving", "Niezapisane zmiany — autozapis co 5 min");
    }


    function applyFillDrag() {
        if (!currentSheet || !fillDragStart || !fillDragEnd) return;

        const sourceValue = currentSheet.grid[fillDragStart.row][fillDragStart.col] ?? "";
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
                    td.innerHTML = cellDisplayValue(row, col).html;
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
        event.preventDefault();
        if (key === "c") copySelectionToClipboard(false);
        if (key === "x") copySelectionToClipboard(true);
        if (key === "v") pasteClipboardToActiveCell();
        if (key === "s") saveSheet();
        if (key === "z") undoLastChange();
        if (key === "y") redoLastChange();
    });

    document.addEventListener("mousemove", event => {
        if (!activeColumnResize) return;
        const nextWidth = activeColumnResize.startWidth + (event.clientX - activeColumnResize.startX);
        setStoredColumnWidth(activeColumnResize.col, nextWidth);
        scheduleApplyColumnWidths(getAutoColumnWidths());
    });

    document.addEventListener("mouseup", () => {
        if (activeColumnResize) {
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
        const value = formulaInput?.value ?? "";
        const validation = validateFormulaBeforeApply(value);
        if (!validation.ok) {
            alert(validation.message);
            formulaInput?.focus();
            renderFormulaHelper();
            return;
        }

        pushHistorySnapshot();

        ensureDimensions(targetCell.row + 1, targetCell.col + 1);
        currentSheet.grid[targetCell.row][targetCell.col] = value;

        const activeTd = cellElements[targetCell.row]?.[targetCell.col];
        if (activeTd) {
            activeTd.innerHTML = cellDisplayValue(targetCell.row, targetCell.col).html;
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
            refreshChartActionLabel();
            scheduleChartPreviewRefresh();
        }
        if (modalEl === pivotModal) {
            if (pivotRangeInput && !pivotRangeInput.value.trim()) pivotRangeInput.value = getCurrentSelectionRangeText();
            renderPivotEditor();
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
        const showLegend = chart.legendPosition === "none" ? false : (chart.showLegend ?? true);
        const chartBgStyle = chart.backgroundColor ? ` style="--chart-bg:${chart.backgroundColor}"` : "";

        const matrix = getRangeMatrix(rangeText, true);
        if (!matrix.length || !matrix[0].length) {
            return "<div>Nie udało się odczytać zakresu.</div>";
        }

        let labels = [];
        let rows = matrix;

        if (useHeader && matrix.length > 1) {
            labels = matrix[0].map(item => String(item ?? ""));
            rows = matrix.slice(1);
        }

        if (!labels.length) {
            labels = rows.map((_, index) => `Wiersz ${index + 1}`);
        }

        function getSingleSeries() {
            let series = rows.map((row, index) => ({
                label: String(row[0] ?? labels[index] ?? `P${index + 1}`),
                value: parseNumber(row[row.length - 1])
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
            const points = rows.map((row, index) => ({ x: parseNumber(row[0]), y: parseNumber(row[1]), size: Math.max(3, parseNumber(row[2]) || pointSize), label: String(row[0] ?? `P${index + 1}`) })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
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
                    <button type="button" data-pivot-remove="${zone}" data-pivot-remove-index="${idx}">×</button>
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
        const rowFields = config.rows?.length ? config.rows : [{ index: config.rowField ?? 0, name: headers[config.rowField ?? 0] || "Wiersze" }];
        const columnFields = config.columns || [];
        const valueFields = config.values?.length ? config.values : [{ index: config.valueField ?? 1, name: headers[config.valueField ?? 1] || "Wartości", agg: config.agg || "sum" }];

        function keyFor(dataRow, fields, fallback = "Razem") {
            if (!fields.length) return fallback;
            return fields.map(field => String(dataRow[field.index] ?? "")).join(" / ") || "(puste)";
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
                        <div class="we-chart-object-subtitle">${escapeHtml(chart.rangeText)} • ${escapeHtml(chart.type)}</div>
                    </div>
                    <div class="we-object-actions">
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

        setAutosaveState("saving", "Zapisywanie...");
        try {
            await postJson(`/ares/api/sheets/${sheetId}/save/`, {
                name: currentSheet.name,
                category: currentSheet.category || "Bez kategorii",
                grid: workbookPayloadForSave(),
                styles: currentSheet.styles || {},
                conditionalRules: currentSheet.conditionalRules || [],
                action: "Zapisano arkusz"
            });

            setAutosaveState("saved", "Wszystkie zmiany zapisane");
        } catch (error) {
            console.error(error);
            setAutosaveState("error", "Błąd zapisu");
        }
    }

    async function ensureSheetIdForEditor() {
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
        };
        window.setTimeout(() => {
            map[initialOpenPanel]?.();
        }, 180);
    }

    async function loadSheet() {
        try {
            await ensureSheetIdForEditor();
            const data = await getJson(`/ares/api/sheets/${sheetId}/`);

            currentSheet = normalizeLoadedSheet({
                ...data,
                category: data.category || "Bez kategorii"
            });
            currentSheetCanEdit = data.canEdit !== false;
            currentSheetCanShare = !!data.canShare;

            historyStack = [];
            redoStack = [];

            if (sheetNameEl) sheetNameEl.textContent = currentSheet.name || "Arkusz";
            updateSheetMeta(`${data.isShared ? " • Udostępniony" : ""}${!currentSheetCanEdit ? " • Tylko odczyt" : ""}`);
            if (saveBtn) saveBtn.disabled = !currentSheetCanEdit;
            if (applyFormulaBtn) applyFormulaBtn.disabled = !currentSheetCanEdit;
            if (renameBtn) renameBtn.disabled = !currentSheetCanShare;
            renderWorkbookTabs();

            renderGrid();
            activateStartRibbon();
            setAutosaveState("", currentSheetCanEdit ? "Brak zmian" : "Tylko do odczytu");

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

    function downloadCsv() {
        if (!currentSheet) return;

        const csv = currentSheet.grid.map(row => row.map(cell => {
            const value = String(cell ?? "");
            if (value.includes(";") || value.includes('"') || value.includes("\n")) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(";")).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentSheet.name || "arkusz"}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        logUserAction("Eksport CSV", { type: "csv_export", rows: currentSheet.grid.length, cols: currentSheet.grid[0]?.length || 0 });
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

        safeRows.forEach((row, r) => {
            row.forEach((cell, c) => {
                currentSheet.grid[r][c] = cell == null ? "" : String(cell);
            });
        });

        renderGrid();
        markDirty();
        logUserAction("Import pliku w edytorze", { type: "file_import", fileName: sourceInfo.fileName || "plik", rows: safeRows.length, cols: Math.max(...safeRows.map(row => row.length), 0) });
    }

    function importCsv(file) {
        const name = String(file?.name || "").toLowerCase();
        if ((name.endsWith(".xlsx") || name.endsWith(".xls")) && window.XLSX) {
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const workbookXlsx = window.XLSX.read(event.target?.result, { type: "array" });
                    const firstSheetName = workbookXlsx.SheetNames[0];
                    const sheet = workbookXlsx.Sheets[firstSheetName];
                    const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" })
                        .map(row => row.map(cell => String(cell ?? "")))
                        .filter(row => row.some(value => String(value).trim() !== ""));
                    importRowsIntoSheet(rows, { fileName: file.name });
                } catch (error) {
                    console.error(error);
                    alert("Nie udało się odczytać pliku XLSX/XLS. Sprawdź, czy plik nie jest uszkodzony.");
                }
            };
            reader.readAsArrayBuffer(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            const text = String(event.target?.result ?? "");
            importRowsIntoSheet(parseCsvText(text), { fileName: file.name });
        };
        reader.readAsText(file, "utf-8");
    }

    function renameSheet() {
        if (!currentSheet) return;
        const nextName = prompt("Podaj nową nazwę arkusza:", currentSheet.name || "Arkusz");
        if (!nextName) return;

        pushHistorySnapshot();
        currentSheet.name = nextName.trim();
        if (sheetNameEl) sheetNameEl.textContent = currentSheet.name;
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
                ? String(first ?? "").localeCompare(String(second ?? ""), "pl")
                : String(second ?? "").localeCompare(String(first ?? ""), "pl");
        });

        currentSheet.grid = dataRows;
        renderGrid();
        markDirty();
    }

    function clearActiveCell() {
        if (!currentSheet) return;
        pushHistorySnapshot();

        forEachSelectedCell((row, col) => {
            currentSheet.grid[row][col] = "";
        });

        renderGrid();
        markDirty();
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
            let nextValue = String(value ?? "");
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
            const fallbackArgs = example.match(/^[^()]+\((.*)\)$/)?.[1] ?? "A1:A10";
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
        pushHistorySnapshot();
        currentSheet.grid[activeCell.row][activeCell.col] = formula;
        closeModal(smartInsertModal);
        renderGrid();
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

    function parseConstraintSides(leftRaw, rightRaw) {
        const leftRefs = expandCellRefs(leftRaw);
        const rightRefs = expandCellRefs(rightRaw);
        const count = Math.max(leftRefs.length, rightRefs.length);

        if (count > 0 && (leftRefs.length || rightRefs.length)) {
            return Array.from({ length: count }, (_, idx) => ({
                left: leftRefs[idx] || leftRefs[0] || leftRaw.trim(),
                right: rightRefs[idx] || rightRefs[0] || rightRaw.trim()
            }));
        }

        return [{ left: leftRaw.trim(), right: rightRaw.trim() }];
    }

    function getConstraintValue(side) {
        if (side && typeof side === "object" && Number.isInteger(side.row) && Number.isInteger(side.col)) {
            return parseNumber(getCellComputedValue(side.row, side.col));
        }
        return parseNumber(normalizeScalarToken(side));
    }

    function parseSolverConstraints() {
        const raw = solverConstraintsInput?.value || "";
        const constraints = [];
        raw.split(/\n/).map(line => line.trim()).filter(Boolean).forEach(line => {
            const match = line.match(/^(.*?)(<=|>=|=|==)(.*)$/);
            if (!match) return;

            const [, leftRaw, op, rightRaw] = match;
            parseConstraintSides(leftRaw, rightRaw).forEach(pair => {
                constraints.push({ ...pair, op: op === "==" ? "=" : op });
            });
        });
        return constraints;
    }

    function constraintsSatisfied(constraints) {
        return constraints.every(constraint => {
            const left = getConstraintValue(constraint.left);
            const right = getConstraintValue(constraint.right);
            if (!Number.isFinite(left) || !Number.isFinite(right)) return false;

            if (constraint.op === "<=") return left <= right + 1e-9;
            if (constraint.op === ">=") return left + 1e-9 >= right;
            return Math.abs(left - right) <= 1e-9;
        });
    }

    function runSolverFromModal() {
        if (!currentSheet) return;

        const targetRef = solverTargetInput?.value?.trim().toUpperCase();
        const variablesRaw = solverVariableInput?.value?.trim().toUpperCase();
        const mode = getSolverMode();
        const step = Math.abs(parseNumber(solverStepInput?.value ?? 1)) || 1;
        const min = parseNumber(solverMinInput?.value ?? 0);
        const max = parseNumber(solverMaxInput?.value ?? 100);
        const targetValue = parseNumber(solverTargetValueInput?.value ?? 0);
        const forceNonnegative = solverNonnegativeInput?.checked ?? true;

        const target = cellRefToIndex(targetRef);
        if (!target || !variablesRaw) {
            alert("Podaj poprawną komórkę celu i co najmniej jedną komórkę zmienną.");
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

        const constraints = parseSolverConstraints();
        pushHistorySnapshot();

        const originalValues = variableRefs.map(v => currentSheet.grid[v.row][v.col]);
        const searchMin = forceNonnegative ? Math.max(0, min) : min;
        let bestScore = Infinity;
        let bestValue = null;
        let bestCombination = variableRefs.map(() => searchMin);

        function setVariables(values) {
            variableRefs.forEach((ref, idx) => {
                currentSheet.grid[ref.row][ref.col] = values[idx];
            });
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

                const result = parseNumber(getCellComputedValue(target.row, target.col));
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

        search(0, Array.from({ length: variableRefs.length }, () => searchMin));

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
        closeModal(solverModal);
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
        if (keepOpen) setRibbonFloating(target);
        else setRibbonFloating("start");
    }

    function initializeTabs() {
        tabs.forEach(tab => {
            tab.addEventListener("click", () => activateRibbonTab(tab));
            tab.addEventListener("mouseenter", () => activateRibbonTab(tab));
            tab.addEventListener("focus", () => activateRibbonTab(tab));
            tab.addEventListener("mouseleave", closeRibbonSoon);
            tab.addEventListener("blur", closeRibbonSoon);
        });
        ribbonEl?.addEventListener("mouseenter", openRibbon);
        ribbonEl?.addEventListener("mouseleave", closeRibbonSoon);
        ribbonEl?.addEventListener("focusin", openRibbon);
        ribbonEl?.addEventListener("focusout", closeRibbonSoon);
    }
    function initializeModals() {
        modalCloseButtons.forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.closeModal;
                const modal = document.getElementById(target);
                closeModal(modal);
            });
        });

        [chartModal, pivotModal, solverModal, commentModal, emojiModal, smartInsertModal].forEach(modal => {
            modal?.addEventListener("click", event => {
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
        const words = {"✅":"ok tak gotowe zatwierdzone wykonane","❌":"nie błąd usuń odrzucone","⚠️":"uwaga ostrzeżenie ryzyko","📌":"pinezka ważne przypięte","📊":"wykres tabela dane analiza","📈":"wzrost trend wynik","📉":"spadek trend wynik","🧮":"kalkulator obliczenia suma","💡":"pomysł idea wskazówka","🔥":"ważne pilne ogień","🔒":"blokada zamknięte zabezpieczenie","🔓":"odblokowane otwarte","📁":"folder plik katalog","📝":"notatka komentarz tekst"};
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
        pushHistorySnapshot();
        const existing = currentSheet.grid[activeCell.row][activeCell.col] || "";
        currentSheet.grid[activeCell.row][activeCell.col] = String(existing || "") + selectedEmoji;
        renderGrid(); markDirty(); closeModal(emojiModal);
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
        pushHistorySnapshot();
        currentSheet.grid[activeCell.row][activeCell.col] = value ? (commentEditMode === "note" ? `=NOTE(${value})` : `=COMMENT(${value})`) : "";
        renderGrid();
        markDirty();
        closeModal(commentModal);
    }

    function deleteCommentFromModal() {
        if (!currentSheet) return;
        pushHistorySnapshot();
        currentSheet.grid[activeCell.row][activeCell.col] = "";
        renderGrid();
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
        const raw = String(value ?? "").trim();
        return raw || `Kolumna ${fallbackIndex + 1}`;
    }

    function findTableHeaderRow(grid) {
        if (!Array.isArray(grid)) return -1;
        for (let row = 0; row < grid.length; row += 1) {
            const nonEmpty = (grid[row] || []).filter(cell => String(cell ?? "").trim() !== "");
            if (nonEmpty.length >= 2) return row;
        }
        return -1;
    }

    function isRowEffectivelyEmpty(row) {
        return !row || row.every(cell => String(cell ?? "").trim() === "");
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
                    record[header] = row[colIndex] ?? "";
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
            ...mergedRecords.map(record => allHeaders.map(header => record[header] ?? ""))
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
                <button class="we-border-option" data-border-preset="bottom" title="Dolne">▁</button>
                <button class="we-border-option" data-border-preset="left" title="Lewe">▏</button>
                <button class="we-border-option" data-border-preset="right" title="Prawe">▕</button>
                <button class="we-border-option" data-border-preset="horizontal" title="Poziome">═</button>
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
        if (["chart", "pivot", "solver", "dropdown", "checkbox", "function-helper", "link", "comment", "note", "emoji"].includes(action)) {
            return applyInsertAction(action);
        }
        if (action === "filter") return alert("Filtr: zaznacz zakres z nagłówkami, a potem możesz sortować go przyciskami A-Z / Z-A. Pełne filtrowanie wartości jest przygotowane jako kolejne rozszerzenie.");
        if (action === "comments") return openCommentEditor("comment");
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
        if (action === "merge") return alert("Scalanie komórek: funkcja wizualna jest w pasku, pełna obsługa scalonych zakresów wymaga osobnego modelu zakresów.");
        if (action === "wrap") return applyStyleToSelectionOrActive({ wrap: true });
        if (action === "text-rotation") return applyStyleToSelectionOrActive({ rotate: true });
        if (action === "more-tools") return alert("Najważniejsze narzędzia są dostępne w zakładkach Start, Wstaw, Formuły, Tabele, Dane i Widok.");
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

    function initializeEvents() {
        saveBtn?.addEventListener("click", saveSheet);
        exportBtn?.addEventListener("click", downloadCsv);
        renameBtn?.addEventListener("click", renameSheet);
        undoBtn?.addEventListener("click", undoLastChange);
        redoBtn?.addEventListener("click", redoLastChange);

        importInput?.addEventListener("change", event => {
            const file = event.target.files?.[0];
            if (file) importCsv(file);
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
            const value = formulaInput.value ?? "";
            ensureDimensions(activeCell.row + 1, activeCell.col + 1);
            currentSheet.grid[activeCell.row][activeCell.col] = value;
            clearTimeout(autosaveTimer);
            autosaveTimer = setTimeout(saveSheet, 300000);
            setAutosaveState("saving", "Niezapisane zmiany — autozapis co 5 min");
        });
        formulaInput?.addEventListener("focus", () => {
            formulaEditTarget = { ...activeCell };
            renderFormulaHelper();
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

        [chartRangeInput, chartTypeSelect, chartTitleInput, chartXTitleInput, chartYTitleInput, chartSeriesColorInput, chartBgColorInput, chartWidthInput, chartHeightInput, chartLineWidthInput, chartPointSizeInput, chartSortSelect, chartLegendPositionSelect, chartFirstRowHeaderInput, chartShowLegendInput, chartShowGridInput, chartShowLabelsInput]
            .filter(Boolean)
            .forEach(control => {
                control.addEventListener("input", scheduleChartPreviewRefresh);
                control.addEventListener("change", scheduleChartPreviewRefresh);
            });

        chartUseSelectionBtn?.addEventListener("click", () => {
            if (chartRangeInput) chartRangeInput.value = getCurrentSelectionRangeText();
            scheduleChartPreviewRefresh();
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
        window.addEventListener("resize", refreshEditorResponsiveLayout);
        window.visualViewport?.addEventListener("resize", refreshEditorResponsiveLayout);
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

        solverTargetUpdateBtn?.addEventListener("click", () => {
            if (solverTargetInput) solverTargetInput.value = `${colToLabel(activeCell.col)}${activeCell.row + 1}`;
        });
        solverTargetClearBtn?.addEventListener("click", () => {
            if (solverTargetInput) solverTargetInput.value = "";
        });
        solverVariableAddBtn?.addEventListener("click", () => {
            if (!solverVariableInput) return;
            const ref = `${colToLabel(activeCell.col)}${activeCell.row + 1}`;
            solverVariableInput.value = solverVariableInput.value.trim()
                ? `${solverVariableInput.value.trim()},${ref}`
                : ref;
        });
        solverVariableDeleteBtn?.addEventListener("click", () => {
            if (solverVariableInput) solverVariableInput.value = "";
        });
    }

    renderTableTemplates();
    renderUniversityTemplates();
    initializeTabs();
    initializeMenus();
    initializeModals();
    initializeEvents();
    loadSheet();
});
