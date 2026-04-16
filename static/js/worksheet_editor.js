document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const sheetId = params.get("sheet");

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

    const sortAscBtn = document.getElementById("sort-asc-btn");
    const sortDescBtn = document.getElementById("sort-desc-btn");
    const clearCellBtn = document.getElementById("clear-cell-btn");
    const toggleFullWidthBtn = document.getElementById("toggle-full-width-btn");
    const toggleGridBtn = document.getElementById("toggle-grid-btn");
    const autofitBtn = document.getElementById("autofit-cols-btn");
    const sheetEditorCard = document.getElementById("sheet-editor-card");
    const sheetGridTable = document.getElementById("sheet-grid-table");

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
    const buildChartBtn = document.getElementById("build-chart-btn");

    const pivotModal = document.getElementById("pivot-modal");
    const pivotRangeInput = document.getElementById("pivot-range-input");
    const pivotAggSelect = document.getElementById("pivot-agg-select");
    const buildPivotBtn = document.getElementById("build-pivot-btn");

    const solverModal = document.getElementById("solver-modal");
    const solverTargetInput = document.getElementById("solver-target-input");
    const solverVariableInput = document.getElementById("solver-variable-input");
    const solverModeSelect = document.getElementById("solver-mode-select");
    const solverStepInput = document.getElementById("solver-step-input");
    const solverMinInput = document.getElementById("solver-min-input");
    const solverMaxInput = document.getElementById("solver-max-input");
    const runSolverBtn = document.getElementById("run-solver-btn");

    const modalCloseButtons = document.querySelectorAll("[data-close-modal]");

    const formulaCategoriesEl = document.getElementById("formula-categories");
    const formulaListEl = document.getElementById("formula-list");
    const formulaDetailsEl = document.getElementById("formula-details");
    const formulaCategoryTitleEl = document.getElementById("formula-category-title");

    const undoBtn = document.getElementById("undo-btn");

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
    let activeCell = { row: 0, col: 0 };
    let autosaveTimer = null;
    let fullWidthMode = false;
    let gridHidden = false;

    let activeFormulaCategory = null;
    let activeFormulaName = null;

    let chartObjects = [];
    let pivotObjects = [];

    let historyStack = [];
    let isRestoringHistory = false;

    let selectionStart = null;
    let selectionEnd = null;
    let isMouseSelecting = false;

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
        console.log("GET", url, "status:", response.status, "body:", text);

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

    function labelToCol(label) {
        let result = 0;
        for (const ch of String(label).toUpperCase()) {
            result = result * 26 + (ch.charCodeAt(0) - 64);
        }
        return result - 1;
    }

    function cellRefToIndex(ref) {
        const match = String(ref || "").trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
        if (!match) return null;

        return {
            col: labelToCol(match[1]),
            row: parseInt(match[2], 10) - 1
        };
    }

    function emptyGrid(rows = 20, cols = 10) {
        return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
    }

    function inferDimensionsFromGrid(grid) {
        const rows = Math.max(Array.isArray(grid) ? grid.length : 0, 20);
        let cols = 10;

        (grid || []).forEach(row => {
            cols = Math.max(cols, Array.isArray(row) ? row.length : 0);
        });

        return { rows, cols };
    }

    function normalizeLoadedSheet(data) {
        const initialGrid = Array.isArray(data.grid) ? data.grid : emptyGrid();
        const dims = inferDimensionsFromGrid(initialGrid);

        currentRows = dims.rows;
        currentCols = dims.cols;

        const normalized = emptyGrid(currentRows, currentCols);
        initialGrid.forEach((row, r) => {
            row.forEach((value, c) => {
                normalized[r][c] = value ?? "";
            });
        });

        return {
            ...data,
            category: data.category || "Bez kategorii",
            styles: data.styles || {},
            grid: normalized
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
        }, 1200);
    }

    function markDirty() {
        if (!currentSheet || isRestoringHistory) return;
        setAutosaveState("saving", "Niezapisane zmiany");
        scheduleAutosave();
        rerenderGeneratedObjects();
    }

    function cloneSheetState() {
        return {
            grid: JSON.parse(JSON.stringify(currentSheet.grid || [])),
            styles: JSON.parse(JSON.stringify(currentSheet.styles || {})),
            name: currentSheet.name,
            category: currentSheet.category
        };
    }

    function pushHistorySnapshot() {
        if (!currentSheet || isRestoringHistory) return;
        historyStack.push(cloneSheetState());
        if (historyStack.length > 100) {
            historyStack.shift();
        }
    }

    function undoLastChange() {
        if (!currentSheet || !historyStack.length) return;

        isRestoringHistory = true;
        const snapshot = historyStack.pop();

        currentSheet.grid = snapshot.grid;
        currentSheet.styles = snapshot.styles || {};
        currentSheet.name = snapshot.name;
        currentSheet.category = snapshot.category;

        const dims = inferDimensionsFromGrid(currentSheet.grid);
        currentRows = dims.rows;
        currentCols = dims.cols;

        if (sheetNameEl) sheetNameEl.textContent = currentSheet.name || "Arkusz";
        if (sheetMetaEl) sheetMetaEl.textContent = `Wiersze: ${currentRows} • Kolumny: ${currentCols}`;

        renderGrid();
        isRestoringHistory = false;
        setAutosaveState("saving", "Cofnięto zmianę");
        scheduleAutosave();
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

    function updateSelectionHighlight() {
        document.querySelectorAll(".we-sheet-table td").forEach(td => {
            td.classList.remove("active-cell", "selected-range");

            const row = parseInt(td.dataset.row, 10);
            const col = parseInt(td.dataset.col, 10);

            if (isCellInSelection(row, col)) {
                td.classList.add("selected-range");
            }

            if (row === activeCell.row && col === activeCell.col) {
                td.classList.add("active-cell");
            }
        });
    }

    function applyStyleToSelectionOrActive(patch) {
        if (!currentSheet) return;
        pushHistorySnapshot();

        forEachSelectedCell((row, col) => {
            setCellStyle(row, col, patch);
        });

        renderGrid();
        markDirty();
    }

    function toggleStyleFlag(flagName) {
        const current = getCellStyle(activeCell.row, activeCell.col);
        applyStyleToSelectionOrActive({
            [flagName]: !current[flagName]
        });
    }

    function applyCellStyleToElement(td, row, col) {
        const style = getCellStyle(row, col);

        td.style.fontFamily = style.fontFamily || "";
        td.style.fontSize = style.fontSize ? `${style.fontSize}px` : "";
        td.style.fontWeight = style.bold ? "700" : "";
        td.style.fontStyle = style.italic ? "italic" : "";
        td.style.textDecoration = style.underline ? "underline" : "";
        td.style.color = style.textColor || "";
        td.style.backgroundColor = style.fillColor || "";
        td.style.textAlign = style.align || "";
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
                                currentSheet.grid[r + rr][c + cc] = `${SPILL_PREFIX}${spillValue ?? ""}`;
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
            return `<a class="we-cell-link" href="${escapeHtml(url || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(text || url || "Link")}</a>`;
        }

        if (value.startsWith("=CHECKBOX(") && value.endsWith(")")) {
            const checked = value.slice(10, -1).trim().toLowerCase() === "true" ? "checked" : "";
            return `<div class="we-checkbox-wrap"><input class="we-cell-checkbox" type="checkbox" ${checked}></div>`;
        }

        if (value.startsWith("=DROPDOWN(") && value.endsWith(")")) {
            const options = value.slice(10, -1).split("|").map(v => v.trim()).filter(Boolean);
            return `<select class="we-cell-dropdown">${options.map(o => `<option>${escapeHtml(o)}</option>`).join("")}</select>`;
        }

        if (value.startsWith("=IMAGE(") && value.endsWith(")")) {
            return `<img class="we-cell-image" src="${escapeHtml(value.slice(7, -1).trim())}" alt="Obraz">`;
        }

        if (value.startsWith("=COMMENT(") && value.endsWith(")")) {
            return `<div class="we-cell-indicator" title="${escapeHtml(value.slice(9, -1))}">💬</div>`;
        }

        if (value.startsWith("=NOTE(") && value.endsWith(")")) {
            return `<div class="we-cell-indicator" title="${escapeHtml(value.slice(6, -1))}">📝</div>`;
        }

        return null;
    }

    function cellDisplayValue(row, col) {
        const raw = currentSheet.grid[row][col] ?? "";
        const special = typeof raw === "string" ? renderSpecialCellContent(raw.trim()) : null;

        if (special !== null) {
            return { html: special, special: true };
        }

        if (typeof raw === "string" && raw.startsWith(SPILL_PREFIX)) {
            return {
                html: `<span class="we-formula-result">${escapeHtml(raw.slice(SPILL_PREFIX.length))}</span>`,
                special: true
            };
        }

        if (typeof raw === "string" && raw.trim().startsWith("=")) {
            const result = getCellComputedValue(row, col);
            if (Array.isArray(result)) {
                return { html: `<span class="we-formula-result">[tablica]</span>`, special: true };
            }
            return {
                html: `<span class="we-formula-result">${escapeHtml(result)}</span>`,
                special: true
            };
        }

        return { html: escapeHtml(raw), special: false };
    }

    function updateFormulaBar() {
        if (!currentSheet) return;
        const value = currentSheet.grid[activeCell.row][activeCell.col] ?? "";
        if (formulaInput) formulaInput.value = value;
        if (activeCellLabel) activeCellLabel.textContent = `${colToLabel(activeCell.col)}${activeCell.row + 1}`;
    }

    function setActiveCell(row, col, focus = false) {
        activeCell = { row, col };
        updateFormulaBar();
        updateSelectionHighlight();
        refreshStartControlsFromCell();

        if (focus) {
            const cell = body.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.focus();
        }
    }

    function renderGrid() {
        if (!currentSheet) return;

        applySpills();

        head.innerHTML = "";
        body.innerHTML = "";

        const headerRow = document.createElement("tr");
        const corner = document.createElement("th");
        corner.textContent = "#";
        headerRow.appendChild(corner);

        for (let col = 0; col < currentCols; col += 1) {
            const th = document.createElement("th");
            th.textContent = colToLabel(col);
            headerRow.appendChild(th);
        }
        head.appendChild(headerRow);

        for (let row = 0; row < currentRows; row += 1) {
            const tr = document.createElement("tr");

            const rowHeader = document.createElement("th");
            rowHeader.className = "row-header";
            rowHeader.textContent = row + 1;
            tr.appendChild(rowHeader);

            for (let col = 0; col < currentCols; col += 1) {
                const td = document.createElement("td");
                td.dataset.row = String(row);
                td.dataset.col = String(col);
                td.tabIndex = 0;

                const rawValue = currentSheet.grid[row][col] ?? "";
                const display = cellDisplayValue(row, col);

                td.innerHTML = display.html;

                const editableBlocked =
                    display.special ||
                    (typeof rawValue === "string" && rawValue.startsWith(SPILL_PREFIX));

                if (editableBlocked) {
                    td.classList.add("we-special-cell");
                    td.contentEditable = "false";
                } else {
                    td.contentEditable = "true";
                    td.spellcheck = false;
                }

                applyCellStyleToElement(td, row, col);

                td.addEventListener("mousedown", event => {
                    if (event.button !== 0) return;

                    isMouseSelecting = true;
                    selectionStart = { row, col };
                    selectionEnd = { row, col };
                    setActiveCell(row, col, false);
                    updateSelectionHighlight();

                    if (!editableBlocked) {
                        td.focus();
                    }
                });

                td.addEventListener("mouseover", () => {
                    if (!isMouseSelecting) return;
                    selectionEnd = { row, col };
                    updateSelectionHighlight();
                });

                td.addEventListener("click", () => {
                    setActiveCell(row, col, false);
                    if (!editableBlocked) td.focus();
                });

                td.addEventListener("focus", () => {
                    setActiveCell(row, col, false);
                    const currentRaw = currentSheet.grid[row][col] ?? "";
                    if (formulaInput) formulaInput.value = currentRaw;
                    if (!editableBlocked) td.textContent = currentRaw;
                });

                td.addEventListener("blur", () => {
                    if (!editableBlocked) {
                        const newValue = td.textContent ?? "";
                        if (newValue !== (currentSheet.grid[row][col] ?? "")) {
                            pushHistorySnapshot();
                            currentSheet.grid[row][col] = newValue;
                            td.innerHTML = cellDisplayValue(row, col).html;
                            applyCellStyleToElement(td, row, col);
                            markDirty();
                        } else {
                            td.innerHTML = cellDisplayValue(row, col).html;
                            applyCellStyleToElement(td, row, col);
                        }
                    }
                });

                td.addEventListener("input", () => {
                    if (!editableBlocked && formulaInput) {
                        formulaInput.value = td.textContent ?? "";
                    }
                });

                td.addEventListener("keydown", event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        td.blur();
                        clearSelection();
                        setActiveCell(Math.min(currentRows - 1, row + 1), col, true);
                    }
                });

                tr.appendChild(td);
            }

            body.appendChild(tr);
        }

        updateSelectionHighlight();
        autoFitColumns();
        rerenderGeneratedObjects();
    }

    document.addEventListener("mouseup", () => {
        if (isMouseSelecting) {
            isMouseSelecting = false;
            updateSelectionHighlight();
        }
    });

    function autoFitColumns() {
        const colWidths = Array.from({ length: currentCols }, () => 120);

        for (let col = 0; col < currentCols; col += 1) {
            colWidths[col] = Math.max(colWidths[col], (colToLabel(col).length * 12) + 42);

            for (let row = 0; row < currentRows; row += 1) {
                const raw = currentSheet.grid[row][col] ?? "";
                const text = String(
                    typeof raw === "string" && raw.trim().startsWith("=")
                        ? getCellComputedValue(row, col)
                        : raw
                );
                colWidths[col] = Math.min(420, Math.max(colWidths[col], (text.length * 8) + 34));
            }
        }

        const headerCells = head.querySelectorAll("th");
        headerCells.forEach((cell, index) => {
            if (index > 0) cell.style.minWidth = `${colWidths[index - 1]}px`;
        });

        body.querySelectorAll("tr").forEach(tr => {
            tr.querySelectorAll("td").forEach((td, index) => {
                td.style.minWidth = `${colWidths[index]}px`;
            });
        });
    }

    function applyFormulaToActiveCell() {
        if (!currentSheet) return;
        const value = formulaInput?.value ?? "";

        pushHistorySnapshot();

        if (hasMultiSelection()) {
            forEachSelectedCell((row, col) => {
                ensureDimensions(row + 1, col + 1);
                currentSheet.grid[row][col] = value;
            });
        } else {
            ensureDimensions(activeCell.row + 1, activeCell.col + 1);
            currentSheet.grid[activeCell.row][activeCell.col] = value;
        }

        renderGrid();
        markDirty();
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

            btn.addEventListener("click", () => {
                activeFormulaCategory = category;
                activeFormulaName = null;
                renderFormulaCategories();
                renderFormulaList();
                renderFormulaDetails();
            });

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

            item.innerHTML = `
                <div class="we-formula-item-name">${escapeHtml(fn.name)}</div>
                <div class="we-formula-item-syntax">${escapeHtml(fn.syntax)}</div>
            `;

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
        modalEl?.classList.add("open");
    }

    function closeModal(modalEl) {
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
            type,
            useHeader,
            title,
            xTitle,
            yTitle,
            showLegend,
            showGrid,
            showLabels,
            color
        } = chart;

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

        const chartColor = color || DEFAULT_CHART_COLOR;
        const titleHtml = title ? `<div class="we-chart-main-title">${escapeHtml(title)}</div>` : "";
        const legendHtml = showLegend
            ? `<div class="we-chart-legend-box"><span class="we-chart-legend-item"><span class="we-chart-legend-swatch" style="background:${chartColor}"></span><span>${escapeHtml(yTitle || "Seria")}</span></span></div>`
            : "";

        if (type === "bar") {
            const series = rows.map((row, index) => ({
                label: String(row[0] ?? labels[index] ?? `P${index + 1}`),
                value: parseNumber(row[row.length - 1])
            }));

            const maxValue = Math.max(...series.map(item => item.value), 1);

            const rowsHtml = series.map(item => {
                const ratio = (item.value / maxValue) * 100;
                const label = showLabels ? `<div class="we-chart-value">${item.value}</div>` : `<div class="we-chart-value"></div>`;
                return `
                    <div class="we-chart-row">
                        <div class="we-chart-label">${escapeHtml(item.label)}</div>
                        <div class="we-chart-track">
                            <div class="we-chart-fill" style="width:${ratio}%; background:${chartColor}"></div>
                        </div>
                        ${label}
                    </div>
                `;
            }).join("");

            return `${titleHtml}${rowsHtml}${legendHtml}`;
        }

        if (type === "column") {
            const series = rows.map((row, index) => ({
                label: String(row[0] ?? labels[index] ?? `P${index + 1}`),
                value: parseNumber(row[row.length - 1])
            }));

            const width = 760;
            const height = 320;
            const padding = 48;
            const innerWidth = width - padding * 2;
            const innerHeight = height - padding * 2;
            const maxValue = Math.max(...series.map(item => item.value), 1);
            const colWidth = innerWidth / Math.max(series.length, 1);

            const gridLines = buildGridLines(width, height, padding, showGrid);

            const bars = series.map((item, index) => {
                const barHeight = (item.value / maxValue) * innerHeight;
                const x = padding + index * colWidth + 8;
                const y = height - padding - barHeight;
                const w = Math.max(colWidth - 16, 10);

                return `
                    <rect x="${x}" y="${y}" width="${w}" height="${barHeight}" rx="4" fill="${chartColor}"></rect>
                    ${showLabels ? `<text class="we-chart-label-text" x="${x + w / 2}" y="${y - 8}" text-anchor="middle">${item.value}</text>` : ""}
                `;
            }).join("");

            const xLabels = series.map((item, index) => {
                const x = padding + index * colWidth + colWidth / 2;
                return `<text x="${x}" y="${height - 16}" text-anchor="middle" font-size="11" fill="#c9d6ef">${escapeHtml(item.label)}</text>`;
            }).join("");

            const yLabels = Array.from({ length: 5 }, (_, i) => {
                const value = Math.round(maxValue - (maxValue * i / 4));
                const y = padding + (innerHeight * i / 4) + 4;
                return `<text x="${padding - 10}" y="${y}" text-anchor="end" font-size="11" fill="#c9d6ef">${value}</text>`;
            }).join("");

            return `
                ${titleHtml}
                <div class="we-chart-svg-wrap">
                    <svg class="we-line-svg" viewBox="0 0 ${width} ${height}">
                        ${gridLines}
                        <line class="we-axis-line" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line>
                        <line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"></line>
                        ${bars}
                        ${xLabels}
                        ${yLabels}
                        ${xTitle ? `<text class="we-chart-axis-title" x="${width / 2}" y="${height - 2}" text-anchor="middle">${escapeHtml(xTitle)}</text>` : ""}
                        ${yTitle ? `<text class="we-chart-axis-title" transform="translate(16 ${height / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yTitle)}</text>` : ""}
                    </svg>
                </div>
                ${legendHtml}
            `;
        }

        if (type === "line" || type === "area") {
            const series = rows.map((row, index) => ({
                label: String(row[0] ?? labels[index] ?? `P${index + 1}`),
                value: parseNumber(row[row.length - 1])
            }));

            const max = Math.max(...series.map(point => point.value), 1);
            const width = 760;
            const height = 280;
            const padding = 42;

            const gridLines = buildGridLines(width, height, padding, showGrid);

            const path = series.map((point, index) => {
                const x = padding + ((width - padding * 2) * (series.length === 1 ? 0.5 : index / (series.length - 1)));
                const y = height - padding - ((height - padding * 2) * (point.value / max));
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
            }).join(" ");

            const areaPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

            const circles = series.map((point, index) => {
                const x = padding + ((width - padding * 2) * (series.length === 1 ? 0.5 : index / (series.length - 1)));
                const y = height - padding - ((height - padding * 2) * (point.value / max));
                const labelText = showLabels ? `<text class="we-chart-label-text" x="${x}" y="${y - 10}" text-anchor="middle">${point.value}</text>` : "";
                return `${labelText}<circle cx="${x}" cy="${y}" r="4.5" fill="${chartColor}"></circle>`;
            }).join("");

            const ticks = series.map((point, index) => {
                const x = padding + ((width - padding * 2) * (series.length === 1 ? 0.5 : index / (series.length - 1)));
                return `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#c9d6ef">${escapeHtml(point.label)}</text>`;
            }).join("");

            return `
                ${titleHtml}
                <div class="we-chart-svg-wrap">
                    <svg class="we-line-svg" viewBox="0 0 ${width} ${height}">
                        ${gridLines}
                        <line class="we-axis-line" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line>
                        <line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"></line>
                        ${type === "area" ? `<path d="${areaPath}" fill="${chartColor}" opacity="0.18"></path>` : ""}
                        <path d="${path}" fill="none" stroke="${chartColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
                        ${circles}
                        ${ticks}
                        ${xTitle ? `<text class="we-chart-axis-title" x="${width / 2}" y="${height - 2}" text-anchor="middle">${escapeHtml(xTitle)}</text>` : ""}
                        ${yTitle ? `<text class="we-chart-axis-title" transform="translate(14 ${height / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yTitle)}</text>` : ""}
                    </svg>
                </div>
                ${legendHtml}
            `;
        }

        if (type === "pie") {
            const items = rows.map((row, index) => ({
                label: String(row[0] ?? labels[index] ?? `Element ${index + 1}`),
                value: Math.max(0, parseNumber(row[row.length - 1]))
            }));

            const total = items.reduce((acc, item) => acc + item.value, 0) || 1;
            let startAngle = 0;

            const slices = items.map((item, index) => {
                const angle = (item.value / total) * Math.PI * 2;
                const endAngle = startAngle + angle;

                const x1 = 120 + 90 * Math.cos(startAngle - Math.PI / 2);
                const y1 = 120 + 90 * Math.sin(startAngle - Math.PI / 2);
                const x2 = 120 + 90 * Math.cos(endAngle - Math.PI / 2);
                const y2 = 120 + 90 * Math.sin(endAngle - Math.PI / 2);

                const largeArc = angle > Math.PI ? 1 : 0;
                const sliceColor = STATIC_PALETTE[index % STATIC_PALETTE.length];

                const path = `<path d="M120,120 L${x1},${y1} A90,90 0 ${largeArc},1 ${x2},${y2} z" fill="${sliceColor}"></path>`;
                startAngle = endAngle;
                return path;
            }).join("");

            const labelsHtml = showLabels
                ? items.map(item => `
                    <div class="we-chart-row">
                        <div class="we-chart-label">${escapeHtml(item.label)}</div>
                        <div class="we-chart-track">
                            <div class="we-chart-fill" style="width:${(item.value / total) * 100}%"></div>
                        </div>
                        <div class="we-chart-value">${item.value}</div>
                    </div>
                `).join("")
                : "";

            return `
                ${titleHtml}
                <div class="we-chart-svg-wrap">
                    <svg class="we-line-svg" viewBox="0 0 320 260">
                        ${slices}
                    </svg>
                </div>
                ${labelsHtml}
                ${showLegend ? `
                    <div class="we-chart-legend-box">
                        ${items.map((item, index) => `
                            <span class="we-chart-legend-item">
                                <span class="we-chart-legend-swatch" style="background:${STATIC_PALETTE[index % STATIC_PALETTE.length]}"></span>
                                <span>${escapeHtml(item.label)}</span>
                            </span>
                        `).join("")}
                    </div>
                ` : ""}
            `;
        }

        if (type === "scatter") {
            const points = rows.map((row, index) => ({
                x: parseNumber(row[0]),
                y: parseNumber(row[1]),
                label: `P${index + 1}`
            }));

            const maxX = Math.max(...points.map(point => point.x), 1);
            const maxY = Math.max(...points.map(point => point.y), 1);
            const width = 760;
            const height = 280;
            const padding = 42;

            const gridLines = buildGridLines(width, height, padding, showGrid);

            const circles = points.map(point => {
                const x = padding + ((width - padding * 2) * (point.x / maxX));
                const y = height - padding - ((height - padding * 2) * (point.y / maxY));
                return `
                    <circle cx="${x}" cy="${y}" r="5" fill="${chartColor}"></circle>
                    ${showLabels ? `<text class="we-chart-label-text" x="${x + 8}" y="${y - 8}">${escapeHtml(point.label)}</text>` : ""}
                `;
            }).join("");

            return `
                ${titleHtml}
                <div class="we-chart-svg-wrap">
                    <svg class="we-line-svg" viewBox="0 0 ${width} ${height}">
                        ${gridLines}
                        <line class="we-axis-line" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line>
                        <line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"></line>
                        ${circles}
                        ${xTitle ? `<text class="we-chart-axis-title" x="${width / 2}" y="${height - 2}" text-anchor="middle">${escapeHtml(xTitle)}</text>` : ""}
                        ${yTitle ? `<text class="we-chart-axis-title" transform="translate(14 ${height / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yTitle)}</text>` : ""}
                    </svg>
                </div>
                ${legendHtml}
            `;
        }

        if (type === "histogram") {
            const numericValues = rows.flat().map(parseNumber).filter(value => Number.isFinite(value));

            if (!numericValues.length) {
                return "<div>Brak danych liczbowych do histogramu.</div>";
            }

            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const bucketCount = Math.min(8, Math.max(4, Math.round(Math.sqrt(numericValues.length))));
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

            const width = 760;
            const height = 320;
            const padding = 48;
            const innerWidth = width - padding * 2;
            const innerHeight = height - padding * 2;
            const maxCount = Math.max(...counts, 1);
            const barWidth = innerWidth / bucketCount;

            const yGrid = buildGridLines(width, height, padding, showGrid);

            const bars = counts.map((count, index) => {
                const barHeight = (count / maxCount) * innerHeight;
                const x = padding + index * barWidth + 4;
                const y = height - padding - barHeight;
                const w = Math.max(barWidth - 8, 6);

                return `
                    <rect x="${x}" y="${y}" width="${w}" height="${barHeight}" rx="4" fill="${chartColor}"></rect>
                    ${showLabels ? `<text class="we-chart-label-text" x="${x + w / 2}" y="${y - 8}" text-anchor="middle">${count}</text>` : ""}
                `;
            }).join("");

            const xLabels = bucketLabels.map((label, index) => {
                const x = padding + index * barWidth + barWidth / 2;
                return `<text x="${x}" y="${height - 16}" text-anchor="middle" font-size="10" fill="#c9d6ef">${escapeHtml(label)}</text>`;
            }).join("");

            const yLabels = Array.from({ length: 5 }, (_, i) => {
                const value = Math.round(maxCount - (maxCount * i / 4));
                const y = padding + (innerHeight * i / 4) + 4;
                return `<text x="${padding - 10}" y="${y}" text-anchor="end" font-size="11" fill="#c9d6ef">${value}</text>`;
            }).join("");

            return `
                ${titleHtml}
                <div class="we-chart-svg-wrap">
                    <svg class="we-line-svg" viewBox="0 0 ${width} ${height}">
                        ${yGrid}
                        <line class="we-axis-line" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line>
                        <line class="we-axis-line" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"></line>
                        ${bars}
                        ${xLabels}
                        ${yLabels}
                        ${xTitle ? `<text class="we-chart-axis-title" x="${width / 2}" y="${height - 2}" text-anchor="middle">${escapeHtml(xTitle || "Przedziały")}</text>` : ""}
                        ${yTitle ? `<text class="we-chart-axis-title" transform="translate(16 ${height / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yTitle || "Liczność")}</text>` : ""}
                    </svg>
                </div>
                ${legendHtml}
            `;
        }

        return "<div>Nieobsługiwany typ wykresu.</div>";
    }

    function buildPivotHtml(config) {
        const matrix = getRangeMatrix(config.rangeText, true);
        if (matrix.length < 1 || matrix[0].length < 2) {
            return "<div>Za mało danych do tabeli przestawnej.</div>";
        }

        const rowField = config.rowField ?? 0;
        const valueField = config.valueField ?? 1;
        const agg = config.agg || "sum";

        const grouped = new Map();

        matrix.forEach(row => {
            const key = String(row[rowField] ?? "");
            const value = parseNumber(row[valueField]);

            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(value);
        });

        const renderedRows = Array.from(grouped.entries()).map(([key, values]) => {
            let result = 0;

            if (agg === "sum") result = values.reduce((a, b) => a + b, 0);
            if (agg === "count") result = values.length;
            if (agg === "avg") result = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            if (agg === "min") result = values.length ? Math.min(...values) : 0;
            if (agg === "max") result = values.length ? Math.max(...values) : 0;
            if (agg === "median") {
                const sorted = [...values].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                result = sorted.length
                    ? (sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid])
                    : 0;
            }

            return `<tr><td>${escapeHtml(key)}</td><td>${Number(result.toFixed(4))}</td></tr>`;
        }).join("");

        return `
            <table class="we-pivot-table">
                <thead>
                    <tr><th>Klucz</th><th>Wartość</th></tr>
                </thead>
                <tbody>${renderedRows}</tbody>
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
                <div class="we-chart-object-title">Wykres ${index + 1}</div>
                <div class="we-chart-object-subtitle">${escapeHtml(chart.rangeText)} • ${escapeHtml(chart.type)}</div>
                <div class="we-object-body">${html}</div>
            `;
            generatedObjectsArea.appendChild(card);
        });

        pivotObjects.forEach((pivot, index) => {
            const html = buildPivotHtml(pivot);
            const card = document.createElement("div");
            card.className = "we-object-card";
            card.innerHTML = `
                <div class="we-chart-object-title">Tabela przestawna ${index + 1}</div>
                <div class="we-chart-object-subtitle">${escapeHtml(pivot.rangeText)} • ${escapeHtml(pivot.agg)}</div>
                <div class="we-object-body">${html}</div>
            `;
            generatedObjectsArea.appendChild(card);
        });

        generatedObjectsCard.hidden = chartObjects.length === 0 && pivotObjects.length === 0;
    }

    async function saveSheet() {
        if (!currentSheet) return;

        setAutosaveState("saving", "Zapisywanie...");
        try {
            await postJson(`/ares/api/sheets/${sheetId}/save/`, {
                name: currentSheet.name,
                category: currentSheet.category || "Bez kategorii",
                grid: currentSheet.grid,
                styles: currentSheet.styles || {},
                action: "Zapisano arkusz"
            });

            setAutosaveState("saved", "Wszystkie zmiany zapisane");
        } catch (error) {
            console.error(error);
            setAutosaveState("error", "Błąd zapisu");
        }
    }

    async function loadSheet() {
        try {
            console.log("Ładowanie arkusza, sheetId =", sheetId);

            const data = await getJson(`/ares/api/sheets/${sheetId}/`);
            console.log("Dane arkusza z API:", data);

            currentSheet = normalizeLoadedSheet({
                ...data,
                category: data.category || "Bez kategorii"
            });

            historyStack = [];

            if (sheetNameEl) sheetNameEl.textContent = currentSheet.name || "Arkusz";
            if (sheetMetaEl) sheetMetaEl.textContent = `Wiersze: ${currentRows} • Kolumny: ${currentCols}`;

            initializeFormulaBrowser();
            renderGrid();
            setAutosaveState("", "Brak zmian");
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
    }

    function importCsv(file) {
        const reader = new FileReader();
        reader.onload = event => {
            const text = String(event.target?.result ?? "");
            const rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split(";"));

            pushHistorySnapshot();

            currentRows = Math.max(rows.length, 20);
            currentCols = Math.max(10, ...rows.map(row => row.length));
            currentSheet.grid = emptyGrid(currentRows, currentCols);

            rows.forEach((row, r) => {
                row.forEach((cell, c) => {
                    currentSheet.grid[r][c] = cell;
                });
            });

            renderGrid();
            markDirty();
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

        if (action === "function-helper") {
            formulaInput?.focus();
            return;
        }

        if (action === "link") {
            const text = prompt("Tekst linku:", "Otwórz");
            const url = prompt("Adres URL:", "https://");
            if (url) {
                pushHistorySnapshot();
                currentSheet.grid[activeCell.row][activeCell.col] = `=LINK(${text || url}|${url})`;
                renderGrid();
                markDirty();
            }
            return;
        }

        if (action === "checkbox") {
            pushHistorySnapshot();
            currentSheet.grid[activeCell.row][activeCell.col] = "=CHECKBOX(false)";
            renderGrid();
            return markDirty();
        }

        if (action === "dropdown") {
            const options = prompt("Opcje rozdziel pionową kreską |", "Nowe|W toku|Gotowe");
            if (options) {
                pushHistorySnapshot();
                currentSheet.grid[activeCell.row][activeCell.col] = `=DROPDOWN(${options})`;
                renderGrid();
                markDirty();
            }
            return;
        }

        if (action === "emoji") {
            const emoji = prompt("Podaj emoji:", "📌");
            if (emoji !== null) {
                pushHistorySnapshot();
                currentSheet.grid[activeCell.row][activeCell.col] = emoji;
                renderGrid();
                markDirty();
            }
            return;
        }

        if (action === "comment") {
            const comment = prompt("Treść komentarza:");
            if (comment !== null) {
                pushHistorySnapshot();
                currentSheet.grid[activeCell.row][activeCell.col] = `=COMMENT(${comment})`;
                renderGrid();
                markDirty();
            }
            return;
        }

        if (action === "note") {
            const note = prompt("Treść notatki:");
            if (note !== null) {
                pushHistorySnapshot();
                currentSheet.grid[activeCell.row][activeCell.col] = `=NOTE(${note})`;
                renderGrid();
                markDirty();
            }
        }
    }

    function buildPivotFromModal() {
        const rangeText = pivotRangeInput?.value?.trim();
        const agg = pivotAggSelect?.value || "sum";

        if (!rangeText) {
            alert("Podaj zakres danych.");
            return;
        }

        const rowField = parseInt(prompt("Numer kolumny dla klucza (od 1):", "1") || "1", 10) - 1;
        const valueField = parseInt(prompt("Numer kolumny dla wartości (od 1):", "2") || "2", 10) - 1;

        pivotObjects.push({ rangeText, agg, rowField, valueField });
        rerenderGeneratedObjects();
        closeModal(pivotModal);
    }

    function runSolverFromModal() {
        if (!currentSheet) return;

        const targetRef = solverTargetInput?.value?.trim().toUpperCase();
        const variablesRaw = solverVariableInput?.value?.trim().toUpperCase();
        const mode = solverModeSelect?.value || "max";
        const step = parseNumber(solverStepInput?.value ?? 1);
        const min = parseNumber(solverMinInput?.value ?? 0);
        const max = parseNumber(solverMaxInput?.value ?? 100);

        const target = cellRefToIndex(targetRef);
        if (!target || !variablesRaw) {
            alert("Podaj poprawną komórkę celu i co najmniej jedną komórkę zmiennej.");
            return;
        }

        const variableRefs = variablesRaw
            .split(",")
            .map(v => v.trim())
            .filter(Boolean)
            .map(cellRefToIndex)
            .filter(Boolean);

        if (!variableRefs.length) {
            alert("Nie znaleziono poprawnych komórek zmiennych.");
            return;
        }

        pushHistorySnapshot();

        const originalValues = variableRefs.map(v => currentSheet.grid[v.row][v.col]);

        let bestValue = mode === "max" ? -Infinity : Infinity;
        let bestCombination = variableRefs.map(() => min);

        function setVariables(values) {
            variableRefs.forEach((ref, idx) => {
                currentSheet.grid[ref.row][ref.col] = values[idx];
            });
        }

        function search(index, currentCombination) {
            if (index === variableRefs.length) {
                setVariables(currentCombination);
                const result = parseNumber(getCellComputedValue(target.row, target.col));

                if ((mode === "max" && result > bestValue) || (mode === "min" && result < bestValue)) {
                    bestValue = result;
                    bestCombination = [...currentCombination];
                }
                return;
            }

            for (let test = min; test <= max; test += (step || 1)) {
                currentCombination[index] = test;
                search(index + 1, currentCombination);
            }
        }

        search(0, Array.from({ length: variableRefs.length }, () => min));
        setVariables(bestCombination);

        renderGrid();
        markDirty();

        const card = document.createElement("div");
        card.className = "we-object-card";
        card.innerHTML = `
            <div class="we-chart-object-title">Solver</div>
            <div class="we-object-body">
                <div><strong>Komórka celu:</strong> ${escapeHtml(targetRef)}</div>
                <div><strong>Komórki zmienne:</strong> ${escapeHtml(variablesRaw)}</div>
                <div><strong>Tryb:</strong> ${mode === "max" ? "maksymalizacja" : "minimalizacja"}</div>
                <div><strong>Najlepsze wartości:</strong> ${escapeHtml(bestCombination.join(", "))}</div>
                <div><strong>Wynik funkcji celu:</strong> ${bestValue}</div>
            </div>
        `;
        generatedObjectsCard.hidden = false;
        generatedObjectsArea.prepend(card);

        closeModal(solverModal);

        variableRefs.forEach((ref, idx) => {
            currentSheet.grid[ref.row][ref.col] = bestCombination[idx] ?? originalValues[idx];
        });
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

    function initializeTabs() {
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const target = tab.dataset.tab;
                tabs.forEach(item => item.classList.remove("active"));
                panels.forEach(panel => panel.classList.remove("active"));
                tab.classList.add("active");
                document.querySelector(`.we-ribbon-panel[data-panel="${target}"]`)?.classList.add("active");
            });
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

        [chartModal, pivotModal, solverModal].forEach(modal => {
            modal?.addEventListener("click", event => {
                if (event.target === modal) closeModal(modal);
            });
        });
    }

    function initializeEvents() {
        saveBtn?.addEventListener("click", saveSheet);
        exportBtn?.addEventListener("click", downloadCsv);
        renameBtn?.addEventListener("click", renameSheet);
        undoBtn?.addEventListener("click", undoLastChange);

        importInput?.addEventListener("change", event => {
            const file = event.target.files?.[0];
            if (file) importCsv(file);
        });

        applyFormulaBtn?.addEventListener("click", applyFormulaToActiveCell);
        formulaInput?.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                applyFormulaToActiveCell();
            }
        });

        sortAscBtn?.addEventListener("click", () => sortActiveColumn("asc"));
        sortDescBtn?.addEventListener("click", () => sortActiveColumn("desc"));
        clearCellBtn?.addEventListener("click", clearActiveCell);
        toggleFullWidthBtn?.addEventListener("click", toggleFullWidth);
        toggleGridBtn?.addEventListener("click", toggleGrid);
        autofitBtn?.addEventListener("click", autoFitColumns);

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

        textColorInput?.addEventListener("input", () => {
            applyStyleToSelectionOrActive({ textColor: textColorInput.value });
        });

        fillColorInput?.addEventListener("input", () => {
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

        buildChartBtn?.addEventListener("click", () => {
            const rangeText = chartRangeInput?.value?.trim();
            if (!rangeText) {
                alert("Podaj zakres danych.");
                return;
            }

            chartObjects.push({
                rangeText,
                type: chartTypeSelect?.value || "line",
                useHeader: chartFirstRowHeaderInput?.checked ?? true,
                title: chartTitleInput?.value?.trim() || "",
                xTitle: chartXTitleInput?.value?.trim() || "",
                yTitle: chartYTitleInput?.value?.trim() || "",
                showLegend: chartShowLegendInput?.checked ?? true,
                showGrid: chartShowGridInput?.checked ?? true,
                showLabels: chartShowLabelsInput?.checked ?? false,
                color: chartSeriesColorInput?.value || DEFAULT_CHART_COLOR
            });

            rerenderGeneratedObjects();
            closeModal(chartModal);
        });

        buildPivotBtn?.addEventListener("click", buildPivotFromModal);
        runSolverBtn?.addEventListener("click", runSolverFromModal);
    }

    initializeTabs();
    initializeMenus();
    initializeModals();
    initializeEvents();
    loadSheet();
});
