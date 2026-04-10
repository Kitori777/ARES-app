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
    const addRowBtn = document.getElementById("add-row-btn");
    const addColBtn = document.getElementById("add-col-btn");
    const renameBtn = document.getElementById("rename-sheet-btn");
    const importInput = document.getElementById("csv-import-input");
    const formulaInput = document.getElementById("formula-input");
    const applyFormulaBtn = document.getElementById("apply-formula-btn");
    const activeCellLabel = document.getElementById("active-cell-label");

    const formulaChips = document.querySelectorAll(".we-chip[data-fn]");
    const tabs = document.querySelectorAll(".we-tab");
    const panels = document.querySelectorAll(".we-ribbon-panel");

    const sortAscBtn = document.getElementById("sort-asc-btn");
    const sortDescBtn = document.getElementById("sort-desc-btn");
    const clearCellBtn = document.getElementById("clear-cell-btn");
    const toggleFullWidthBtn = document.getElementById("toggle-full-width-btn");
    const toggleGridBtn = document.getElementById("toggle-grid-btn");
    const sheetEditorCard = document.getElementById("sheet-editor-card");
    const sheetGridTable = document.getElementById("sheet-grid-table");

    const insertMenuItems = document.querySelectorAll(".we-insert-item");
    const insertSubmenuItems = document.querySelectorAll(".we-submenu-item");
    const insertSubmenus = document.querySelectorAll(".we-submenu");
    const imageInsertInput = document.getElementById("image-insert-input");

    const chartModal = document.getElementById("chart-modal");
    const pivotModal = document.getElementById("pivot-modal");
    const chartRangeInput = document.getElementById("chart-range-input");
    const chartTypeSelect = document.getElementById("chart-type-select");
    const buildChartBtn = document.getElementById("build-chart-btn");
    const pivotRangeInput = document.getElementById("pivot-range-input");
    const buildPivotBtn = document.getElementById("build-pivot-btn");
    const modalCloseButtons = document.querySelectorAll(".we-modal-close");

    const generatedObjectsCard = document.getElementById("generated-objects-card");
    const generatedObjectsArea = document.getElementById("generated-objects-area");

    let currentSheet = null;
    let activeCell = { row: 0, col: 0 };

    let hasUnsavedChanges = false;
    let autosaveTimer = null;
    let isSaving = false;

    const FUNCTION_ALIASES = {
        "ŚREDNIA": "SREDNIA",
        "SREDNIA": "SREDNIA",
        "SUMA": "SUMA",
        "MEDIANA": "MEDIANA",
        "MINIMUM": "MINIMUM",
        "MIN": "MINIMUM",
        "MAXIMUM": "MAXIMUM",
        "MAX": "MAXIMUM",
        "ZLICZ": "ZLICZ",
        "ODCHYLENIE": "ODCHYLENIE",
        "ODCH.": "ODCHYLENIE",
        "WARIANCJA": "WARIANCJA",
        "ABS": "ABS",
        "ROUND": "ROUND",
        "PIERWIASTEK": "PIERWIASTEK",
        "PIERW.": "PIERWIASTEK",
        "MOC": "MOC",
        "LEN": "LEN",
        "CONCAT": "CONCAT",
        "LEWO": "LEWO",
        "PRAWO": "PRAWO",
        "DZISIAJ": "DZISIAJ",
        "TERAZ": "TERAZ"
    };

    function normalizeFunctionName(name) {
        return FUNCTION_ALIASES[(name || "").trim().toUpperCase()] || (name || "").trim().toUpperCase();
    }

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

        if (!response.ok) {
            throw new Error(`GET ${url} -> ${response.status}`);
        }

        return await response.json();
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

    function setAutosaveStatus(state, text) {
        if (!autosaveBadge) return;
        autosaveBadge.className = `we-autosave-badge ${state || ""}`.trim();
        autosaveBadge.textContent = text;
    }

    function markDirty() {
        hasUnsavedChanges = true;
        setAutosaveStatus("saving", "Niezapisane zmiany");
        scheduleAutosave();
    }

    function scheduleAutosave() {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => {
            silentSave();
        }, 1200);
    }

    async function silentSave() {
        if (!currentSheet || !hasUnsavedChanges || isSaving) return;

        isSaving = true;
        setAutosaveStatus("saving", "Trwa autozapis...");

        try {
            await postJson(`/ares/api/sheets/${currentSheet.id}/save/`, {
                name: currentSheet.name,
                category: currentSheet.category,
                grid: currentSheet.grid,
                action: "Autozapis arkusza"
            });

            hasUnsavedChanges = false;
            setAutosaveStatus("saved", "Zapisano automatycznie");
        } catch (e) {
            console.error("silentSave error:", e);
            setAutosaveStatus("error", "Błąd autozapisu");
        } finally {
            isSaving = false;
        }
    }

    function saveOnExit() {
        if (!currentSheet || !hasUnsavedChanges) return;

        const csrftoken = getCookie("csrftoken");
        const payload = JSON.stringify({
            name: currentSheet.name,
            category: currentSheet.category,
            grid: currentSheet.grid,
            action: "Autozapis przy wyjściu"
        });

        const url = `/ares/api/sheets/${currentSheet.id}/save/`;

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken || "",
                "X-Requested-With": "XMLHttpRequest"
            },
            credentials: "same-origin",
            keepalive: true,
            body: payload
        }).catch(() => {});
    }

    function columnIndexToLabel(index) {
        let label = "";
        let n = index;
        while (n >= 0) {
            label = String.fromCharCode((n % 26) + 65) + label;
            n = Math.floor(n / 26) - 1;
        }
        return label;
    }

    function getCellName(row, col) {
        return `${columnIndexToLabel(col)}${row + 1}`;
    }

    function setActiveCellLabel() {
        if (activeCellLabel) {
            activeCellLabel.textContent = getCellName(activeCell.row, activeCell.col);
        }
    }

    function parseCellRef(cellRef) {
        const match = /^([A-Z]+)(\d+)$/i.exec((cellRef || "").trim());
        if (!match) return null;

        const letters = match[1].toUpperCase();
        const row = parseInt(match[2], 10) - 1;

        let col = 0;
        for (let i = 0; i < letters.length; i++) {
            col = col * 26 + (letters.charCodeAt(i) - 64);
        }

        return { row, col: col - 1 };
    }

    function parseRange(rangeText) {
        const clean = (rangeText || "").trim();
        if (!clean.includes(":")) return null;

        const [startText, endText] = clean.split(":");
        const start = parseCellRef(startText);
        const end = parseCellRef(endText);
        if (!start || !end) return null;

        return {
            rowStart: Math.min(start.row, end.row),
            rowEnd: Math.max(start.row, end.row),
            colStart: Math.min(start.col, end.col),
            colEnd: Math.max(start.col, end.col)
        };
    }

    function toNumber(value) {
        const normalized = String(value ?? "").trim().replace(",", ".");
        if (!normalized) return NaN;
        const num = Number(normalized);
        return Number.isFinite(num) ? num : NaN;
    }

    function ensureRectangularGrid(grid) {
        if (!Array.isArray(grid) || !grid.length) {
            return Array.from({ length: 20 }, () => Array(8).fill(""));
        }

        const maxCols = Math.max(...grid.map(r => Array.isArray(r) ? r.length : 0), 1);

        return grid.map(row => {
            const safe = Array.isArray(row) ? [...row] : [];
            while (safe.length < maxCols) safe.push("");
            return safe;
        });
    }

    function formatDate(value) {
        if (!value) return "-";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleString("pl-PL");
    }

    function updateHeaderInfo() {
        if (!currentSheet) return;

        const rows = currentSheet.grid.length;
        const cols = currentSheet.grid[0] ? currentSheet.grid[0].length : 0;

        if (sheetNameEl) {
            sheetNameEl.textContent = currentSheet.name || "Arkusz";
        }

        if (sheetMetaEl) {
            sheetMetaEl.textContent =
                `Kategoria: ${currentSheet.category || "Bez kategorii"} | ` +
                `Rozmiar: ${rows} × ${cols} | ` +
                `Utworzono: ${formatDate(currentSheet.createdAt)} | ` +
                `Aktualizacja: ${formatDate(currentSheet.updatedAt)}`;
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSpecialCell(raw) {
        const value = String(raw ?? "");

        if (value.startsWith("=LINK(") && value.endsWith(")")) {
            const inner = value.slice(6, -1);
            const [text, url] = inner.split("|");
            return `<a class="we-cell-link" href="${escapeHtml(url || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(text || url || "Link")}</a>`;
        }

        if (value.startsWith("=CHECKBOX(") && value.endsWith(")")) {
            const inner = value.slice(10, -1).trim();
            const checked = inner === "true";
            return `<label class="we-checkbox-wrap"><input type="checkbox" class="we-cell-checkbox" ${checked ? "checked" : ""}></label>`;
        }

        if (value.startsWith("=DROPDOWN(") && value.endsWith(")")) {
            const inner = value.slice(10, -1);
            const [selected, optionsRaw] = inner.split("|");
            const options = String(optionsRaw || "").split(",").map(x => x.trim()).filter(Boolean);

            return `
                <select class="we-cell-dropdown">
                    ${options.map(opt => `<option value="${escapeHtml(opt)}" ${opt === selected ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("")}
                </select>
            `;
        }

        if (value.startsWith("=IMAGE(") && value.endsWith(")")) {
            const inner = value.slice(7, -1);
            return `<img src="${inner}" class="we-cell-image" alt="obraz">`;
        }

        if (value.startsWith("=DRAW(") && value.endsWith(")")) {
            const inner = value.slice(6, -1);
            return `<div class="we-cell-draw">${escapeHtml(inner)}</div>`;
        }

        if (value.startsWith("=COMMENT(") && value.endsWith(")")) {
            const inner = value.slice(9, -1);
            return `<div class="we-cell-indicator comment" title="${escapeHtml(inner)}">💬</div>`;
        }

        if (value.startsWith("=NOTE(") && value.endsWith(")")) {
            const inner = value.slice(6, -1);
            return `<div class="we-cell-indicator note" title="${escapeHtml(inner)}">📝</div>`;
        }

        if (value === "=SMART_DATE") {
            return `<span class="we-smart-chip">${new Date().toLocaleDateString("pl-PL")}</span>`;
        }

        if (value.startsWith("=SMART_STATUS(") && value.endsWith(")")) {
            const inner = value.slice(14, -1);
            return `<span class="we-smart-chip">${escapeHtml(inner)}</span>`;
        }

        if (value.startsWith("=SMART_PROGRESS(") && value.endsWith(")")) {
            const inner = Number(value.slice(16, -1));
            const pct = Number.isFinite(inner) ? Math.max(0, Math.min(100, inner)) : 0;
            return `
                <div class="we-smart-progress">
                    <div class="we-smart-progress-bar" style="width:${pct}%"></div>
                    <span>${pct}%</span>
                </div>
            `;
        }

        return null;
    }

    function renderGrid() {
        if (!currentSheet || !head || !body) return;

        currentSheet.grid = ensureRectangularGrid(currentSheet.grid);
        const grid = currentSheet.grid;
        const cols = grid[0].length;

        head.innerHTML = "";
        body.innerHTML = "";

        const trHead = document.createElement("tr");
        const corner = document.createElement("th");
        corner.className = "row-header";
        corner.textContent = "#";
        trHead.appendChild(corner);

        for (let c = 0; c < cols; c++) {
            const th = document.createElement("th");
            th.textContent = columnIndexToLabel(c);
            trHead.appendChild(th);
        }

        head.appendChild(trHead);

        grid.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");

            const rowHeader = document.createElement("th");
            rowHeader.className = "row-header";
            rowHeader.textContent = rowIndex + 1;
            tr.appendChild(rowHeader);

            row.forEach((value, colIndex) => {
                const td = document.createElement("td");
                td.dataset.row = rowIndex;
                td.dataset.col = colIndex;

                const specialHtml = renderSpecialCell(value);

                if (specialHtml) {
                    td.innerHTML = specialHtml;
                    td.contentEditable = "false";
                    td.classList.add("we-special-cell");
                } else {
                    td.innerText = value ?? "";
                    td.contentEditable = "true";
                }

                td.addEventListener("click", (e) => {
                    activeCell = { row: rowIndex, col: colIndex };
                    setActiveCellLabel();

                    if (formulaInput) {
                        formulaInput.value = currentSheet.grid[rowIndex][colIndex] ?? "";
                    }

                    const checkbox = e.target.closest(".we-cell-checkbox");
                    const dropdown = e.target.closest(".we-cell-dropdown");

                    if (checkbox) {
                        currentSheet.grid[rowIndex][colIndex] = `=CHECKBOX(${checkbox.checked ? "true" : "false"})`;
                        markDirty();
                    }

                    if (dropdown) {
                        const raw = String(currentSheet.grid[rowIndex][colIndex] || "");
                        if (raw.startsWith("=DROPDOWN(") && raw.endsWith(")")) {
                            const inner = raw.slice(10, -1);
                            const [, optionsRaw] = inner.split("|");
                            currentSheet.grid[rowIndex][colIndex] = `=DROPDOWN(${dropdown.value}|${optionsRaw || ""})`;
                            markDirty();
                        }
                    }
                });

                td.addEventListener("focus", () => {
                    activeCell = { row: rowIndex, col: colIndex };
                    setActiveCellLabel();

                    if (formulaInput) {
                        formulaInput.value = currentSheet.grid[rowIndex][colIndex] ?? "";
                    }
                });

                td.addEventListener("input", () => {
                    if (!td.classList.contains("we-special-cell")) {
                        currentSheet.grid[rowIndex][colIndex] = td.innerText;
                        if (activeCell.row === rowIndex && activeCell.col === colIndex && formulaInput) {
                            formulaInput.value = td.innerText;
                        }
                        markDirty();
                    }
                });

                td.addEventListener("change", (e) => {
                    const checkbox = e.target.closest(".we-cell-checkbox");
                    const dropdown = e.target.closest(".we-cell-dropdown");

                    if (checkbox) {
                        currentSheet.grid[rowIndex][colIndex] = `=CHECKBOX(${checkbox.checked ? "true" : "false"})`;
                        markDirty();
                    }

                    if (dropdown) {
                        const raw = String(currentSheet.grid[rowIndex][colIndex] || "");
                        if (raw.startsWith("=DROPDOWN(") && raw.endsWith(")")) {
                            const inner = raw.slice(10, -1);
                            const [, optionsRaw] = inner.split("|");
                            currentSheet.grid[rowIndex][colIndex] = `=DROPDOWN(${dropdown.value}|${optionsRaw || ""})`;
                            markDirty();
                        }
                    }
                });

                tr.appendChild(td);
            });

            body.appendChild(tr);
        });

        updateHeaderInfo();
        setActiveCellLabel();
    }

    function getRangeValues(arg) {
        if (!currentSheet) return [];

        if (!arg.includes(":")) {
            const ref = parseCellRef(arg);
            if (!ref) return [];
            return [currentSheet.grid?.[ref.row]?.[ref.col] ?? ""];
        }

        const [startRef, endRef] = arg.split(":");
        const start = parseCellRef(startRef);
        const end = parseCellRef(endRef);
        if (!start || !end) return [];

        const values = [];
        const rowStart = Math.min(start.row, end.row);
        const rowEnd = Math.max(start.row, end.row);
        const colStart = Math.min(start.col, end.col);
        const colEnd = Math.max(start.col, end.col);

        for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
                values.push(currentSheet.grid?.[r]?.[c] ?? "");
            }
        }

        return values;
    }

    function median(values) {
        const arr = [...values].sort((a, b) => a - b);
        const mid = Math.floor(arr.length / 2);
        return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    }

    function variance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    }

    function stddev(values) {
        return Math.sqrt(variance(values));
    }

    function evaluateFormula(text) {
        const raw = (text || "").trim();

        if (!raw.startsWith("=")) {
            return raw;
        }

        const match = /^=([A-ZĄĆĘŁŃÓŚŹŻ.]+)\((.*)\)$/i.exec(raw);
        if (!match) return raw;

        const fn = normalizeFunctionName(match[1]);
        const arg = match[2].trim();

        const numericFns = ["SUMA", "SREDNIA", "MEDIANA", "MINIMUM", "MAXIMUM", "ZLICZ", "ODCHYLENIE", "WARIANCJA"];
        if (numericFns.includes(fn)) {
            const values = getRangeValues(arg).map(toNumber).filter(v => !Number.isNaN(v));
            if (!values.length) return "";
            if (fn === "SUMA") return values.reduce((a, b) => a + b, 0);
            if (fn === "SREDNIA") return values.reduce((a, b) => a + b, 0) / values.length;
            if (fn === "MEDIANA") return median(values);
            if (fn === "MINIMUM") return Math.min(...values);
            if (fn === "MAXIMUM") return Math.max(...values);
            if (fn === "ZLICZ") return values.length;
            if (fn === "ODCHYLENIE") return stddev(values);
            if (fn === "WARIANCJA") return variance(values);
        }

        if (fn === "ABS") {
            const v = toNumber(arg);
            return Number.isNaN(v) ? "" : Math.abs(v);
        }

        if (fn === "ROUND") {
            const parts = arg.split(",");
            const v = toNumber(parts[0]);
            const decimals = Number(parts[1] ?? 0);
            return Number.isNaN(v) ? "" : Number(v.toFixed(decimals));
        }

        if (fn === "PIERWIASTEK") {
            const v = toNumber(arg);
            return Number.isNaN(v) ? "" : Math.sqrt(v);
        }

        if (fn === "MOC") {
            const parts = arg.split(",");
            const base = toNumber(parts[0]);
            const power = toNumber(parts[1]);
            return Number.isNaN(base) || Number.isNaN(power) ? "" : Math.pow(base, power);
        }

        if (fn === "LEN") {
            return String(arg).length;
        }

        if (fn === "CONCAT") {
            return arg.split(",").map(x => x.trim()).join("");
        }

        if (fn === "LEWO") {
            const parts = arg.split(",");
            const txt = String(parts[0] ?? "").trim();
            const n = Number(parts[1] ?? 1);
            return txt.substring(0, n);
        }

        if (fn === "PRAWO") {
            const parts = arg.split(",");
            const txt = String(parts[0] ?? "").trim();
            const n = Number(parts[1] ?? 1);
            return txt.slice(-n);
        }

        if (fn === "DZISIAJ") {
            return new Date().toLocaleDateString("pl-PL");
        }

        if (fn === "TERAZ") {
            return new Date().toLocaleString("pl-PL");
        }

        return raw;
    }

    async function loadSheet() {
        if (!sheetId) {
            if (sheetNameEl) sheetNameEl.textContent = "Brak identyfikatora arkusza";
            if (sheetMetaEl) sheetMetaEl.textContent = "Nie podano parametru ?sheet=";
            return;
        }

        try {
            const data = await getJson(`/ares/api/sheets/${sheetId}/`);

            currentSheet = {
                id: data.id,
                name: data.name || "Arkusz",
                category: data.category || "Bez kategorii",
                grid: ensureRectangularGrid(data.grid || []),
                createdAt: data.createdAt || null,
                updatedAt: data.updatedAt || null
            };

            renderGrid();
            hasUnsavedChanges = false;
            setAutosaveStatus("", "Brak zmian");
        } catch (e) {
            console.error("loadSheet error:", e);
            if (sheetNameEl) sheetNameEl.textContent = "Nie znaleziono arkusza";
            if (sheetMetaEl) sheetMetaEl.textContent = "Nie udało się pobrać danych.";
            setAutosaveStatus("error", "Błąd ładowania");
        }
    }

    async function saveSheet() {
        if (!currentSheet) return;

        try {
            await postJson(`/ares/api/sheets/${currentSheet.id}/save/`, {
                name: currentSheet.name,
                category: currentSheet.category,
                grid: currentSheet.grid,
                action: "Zapisano arkusz"
            });

            const refreshed = await getJson(`/ares/api/sheets/${currentSheet.id}/`);
            currentSheet = {
                id: refreshed.id,
                name: refreshed.name || currentSheet.name,
                category: refreshed.category || currentSheet.category,
                grid: ensureRectangularGrid(refreshed.grid || currentSheet.grid),
                createdAt: refreshed.createdAt || currentSheet.createdAt,
                updatedAt: refreshed.updatedAt || currentSheet.updatedAt
            };

            updateHeaderInfo();
            hasUnsavedChanges = false;
            setAutosaveStatus("saved", "Zapisano ręcznie");
        } catch (e) {
            console.error("saveSheet error:", e);
            setAutosaveStatus("error", "Błąd zapisu");
            alert("Nie udało się zapisać arkusza.");
        }
    }

    function parseCsv(text) {
        const rows = text
            .split(/\r?\n/)
            .filter(line => line.trim() !== "")
            .map(line => line.split(";"));

        return ensureRectangularGrid(rows);
    }

    function gridToCsv(grid) {
        return grid.map(row =>
            row.map(cell => {
                const value = String(cell ?? "");
                if (value.includes(";") || value.includes('"') || value.includes("\n")) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(";")
        ).join("\n");
    }

    function applyFormulaToActiveCell() {
        if (!currentSheet || !formulaInput || !activeCell) return;
        const result = evaluateFormula(formulaInput.value);
        currentSheet.grid[activeCell.row][activeCell.col] = String(result);
        renderGrid();
        markDirty();
    }

    function insertRowAbove() {
        const cols = currentSheet.grid[0]?.length || 8;
        currentSheet.grid.splice(activeCell.row, 0, Array(cols).fill(""));
        renderGrid();
        markDirty();
    }

    function insertRowBelow() {
        const cols = currentSheet.grid[0]?.length || 8;
        currentSheet.grid.splice(activeCell.row + 1, 0, Array(cols).fill(""));
        renderGrid();
        markDirty();
    }

    function insertColLeft() {
        currentSheet.grid.forEach(row => row.splice(activeCell.col, 0, ""));
        renderGrid();
        markDirty();
    }

    function insertColRight() {
        currentSheet.grid.forEach(row => row.splice(activeCell.col + 1, 0, ""));
        renderGrid();
        markDirty();
    }

    function clearRow() {
        const cols = currentSheet.grid[0]?.length || 8;
        currentSheet.grid[activeCell.row] = Array(cols).fill("");
        renderGrid();
        markDirty();
    }

    function clearCol() {
        currentSheet.grid.forEach(row => {
            row[activeCell.col] = "";
        });
        renderGrid();
        markDirty();
    }

    function applyTemplate(type) {
        let grid = [];

        if (type === "tpl-budget") {
            grid = [
                ["Kategoria", "Plan", "Wykonanie", "Różnica"],
                ["Czynsz", "", "", ""],
                ["Jedzenie", "", "", ""],
                ["Transport", "", "", ""],
                ["Rozrywka", "", "", ""],
                ["SUMA", "", "", ""]
            ];
        }

        if (type === "tpl-tasks") {
            grid = [
                ["Zadanie", "Status", "Priorytet", "Termin"],
                ["", "Nowe", "Średni", ""],
                ["", "W toku", "Wysoki", ""],
                ["", "Zrobione", "Niski", ""]
            ];
        }

        if (type === "tpl-schedule") {
            grid = [
                ["Godzina", "Pon", "Wt", "Śr", "Czw", "Pt"],
                ["08:00", "", "", "", "", ""],
                ["10:00", "", "", "", "", ""],
                ["12:00", "", "", "", "", ""],
                ["14:00", "", "", "", "", ""]
            ];
        }

        if (type === "tpl-report") {
            grid = [
                ["Miesiąc", "Sprzedaż", "Koszty", "Wynik"],
                ["Styczeń", "", "", ""],
                ["Luty", "", "", ""],
                ["Marzec", "", "", ""]
            ];
        }

        if (grid.length) {
            currentSheet.grid = ensureRectangularGrid(grid);
            activeCell = { row: 0, col: 0 };
            renderGrid();
            markDirty();
        }
    }

    function openModal(modal) {
        if (modal) modal.classList.add("open");
    }

    function closeModal(modal) {
        if (modal) modal.classList.remove("open");
    }

    function showGeneratedObject(title, html) {
        generatedObjectsCard.hidden = false;
        const wrapper = document.createElement("div");
        wrapper.className = "we-object-card";
        wrapper.innerHTML = `
            <div class="we-object-top"><strong>${escapeHtml(title)}</strong></div>
            <div class="we-object-body">${html}</div>
        `;
        generatedObjectsArea.prepend(wrapper);
    }

    function getRangeData(rangeText) {
        const parsed = parseRange(rangeText);
        if (!parsed) return [];

        const rows = [];
        for (let r = parsed.rowStart; r <= parsed.rowEnd; r++) {
            const row = [];
            for (let c = parsed.colStart; c <= parsed.colEnd; c++) {
                row.push(currentSheet.grid?.[r]?.[c] ?? "");
            }
            rows.push(row);
        }
        return rows;
    }

    function buildChartHtml(rangeText, type) {
        const data = getRangeData(rangeText);
        if (!data.length) return "<div>Nieprawidłowy zakres.</div>";

        let labels = [];
        let values = [];

        if (data[0].length >= 2) {
            labels = data.map(r => String(r[0] ?? ""));
            values = data.map(r => toNumber(r[1])).filter(v => !Number.isNaN(v));
        } else {
            labels = data.map((_, i) => `Pozycja ${i + 1}`);
            values = data.map(r => toNumber(r[0])).filter(v => !Number.isNaN(v));
        }

        if (!values.length) return "<div>Zakres nie zawiera danych liczbowych do wykresu.</div>";

        const max = Math.max(...values, 1);

        if (type === "bar") {
            return `
                <div class="we-chart-list">
                    ${values.map((v, i) => `
                        <div class="we-chart-row">
                            <div class="we-chart-label">${escapeHtml(labels[i] || `P${i + 1}`)}</div>
                            <div class="we-chart-track">
                                <div class="we-chart-fill" style="width:${(v / max) * 100}%"></div>
                            </div>
                            <div class="we-chart-value">${v}</div>
                        </div>
                    `).join("")}
                </div>
            `;
        }

        if (type === "line") {
            const width = 520;
            const height = 220;
            const step = values.length > 1 ? width / (values.length - 1) : width;
            const points = values.map((v, i) => {
                const x = i * step;
                const y = height - ((v / max) * (height - 20)) - 10;
                return `${x},${y}`;
            }).join(" ");

            return `
                <svg viewBox="0 0 ${width} ${height}" class="we-line-svg">
                    <polyline fill="none" stroke="#7ba8ff" stroke-width="3" points="${points}" />
                    ${values.map((v, i) => {
                        const x = i * step;
                        const y = height - ((v / max) * (height - 20)) - 10;
                        return `<circle cx="${x}" cy="${y}" r="5" fill="#4f8cff"></circle>`;
                    }).join("")}
                </svg>
                <div class="we-line-legend">
                    ${labels.map((l, i) => `<span>${escapeHtml(l || `P${i + 1}`)}: ${values[i]}</span>`).join("")}
                </div>
            `;
        }

        if (type === "pie") {
            const total = values.reduce((a, b) => a + b, 0) || 1;
            return `
                <div class="we-chart-list">
                    ${values.map((v, i) => `
                        <div class="we-chart-row">
                            <div class="we-chart-label">${escapeHtml(labels[i] || `P${i + 1}`)}</div>
                            <div class="we-chart-track">
                                <div class="we-chart-fill" style="width:${(v / total) * 100}%"></div>
                            </div>
                            <div class="we-chart-value">${((v / total) * 100).toFixed(1)}%</div>
                        </div>
                    `).join("")}
                </div>
            `;
        }

        return "<div>Nieobsługiwany typ wykresu.</div>";
    }

    function buildPivotHtml(rangeText) {
        const data = getRangeData(rangeText);
        if (!data.length || data[0].length < 2) {
            return "<div>Do tabeli przestawnej light wybierz zakres z co najmniej 2 kolumnami.</div>";
        }

        const map = new Map();

        data.forEach(row => {
            const key = String(row[0] ?? "").trim();
            const val = toNumber(row[1]);
            if (!key) return;
            map.set(key, (map.get(key) || 0) + (Number.isNaN(val) ? 1 : val));
        });

        const rows = [...map.entries()];
        if (!rows.length) return "<div>Brak danych do zestawienia.</div>";

        return `
            <table class="we-pivot-table">
                <thead>
                    <tr><th>Klucz</th><th>Wartość</th></tr>
                </thead>
                <tbody>
                    ${rows.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${v}</td></tr>`).join("")}
                </tbody>
            </table>
        `;
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const panel = document.querySelector(`.we-ribbon-panel[data-panel="${target}"]`);
            if (panel) panel.classList.add("active");
        });
    });

    insertMenuItems.forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            insertMenuItems.forEach(item => item.classList.remove("active"));
            btn.classList.add("active");

            const submenuId = btn.dataset.submenu;
            if (!submenuId) return;

            insertSubmenus.forEach(sm => sm.classList.remove("active"));
            const target = document.getElementById(submenuId);
            if (target) target.classList.add("active");
        });

        btn.addEventListener("click", async () => {
            const action = btn.dataset.action;
            if (!action || !currentSheet) return;

            if (action === "new-sheet") {
                const name = prompt("Nazwa nowego arkusza:", "Nowy arkusz");
                if (!name) return;
                const category = prompt("Kategoria:", "Bez kategorii") || "Bez kategorii";

                try {
                    const created = await postJson("/ares/api/sheets/create/", { name, category });
                    window.location.href = `/worksheets/editor/?sheet=${created.id}`;
                } catch (e) {
                    console.error(e);
                    alert("Nie udało się utworzyć nowego arkusza.");
                }
            }

            if (action === "chart") {
                openModal(chartModal);
            }

            if (action === "pivot") {
                openModal(pivotModal);
            }

            if (action === "image") {
                imageInsertInput.click();
            }

            if (action === "drawing") {
                const draw = prompt("Podaj znak / emoji / krótki rysunek tekstowy:", "★");
                if (draw !== null) {
                    currentSheet.grid[activeCell.row][activeCell.col] = `=DRAW(${draw})`;
                    renderGrid();
                    markDirty();
                }
            }

            if (action === "function-helper") {
                const fn = prompt("Podaj nazwę funkcji, np. SUMA", "SUMA");
                const range = prompt("Podaj zakres, np. A1:A10", "A1:A10");
                if (fn && range) {
                    formulaInput.value = `=${normalizeFunctionName(fn)}(${range})`;
                    formulaInput.focus();
                }
            }

            if (action === "link") {
                const text = prompt("Tekst linku:", "OpenAI");
                if (text === null) return;
                const url = prompt("Adres URL:", "https://example.com");
                if (url === null) return;
                currentSheet.grid[activeCell.row][activeCell.col] = `=LINK(${text}|${url})`;
                renderGrid();
                markDirty();
            }

            if (action === "checkbox") {
                currentSheet.grid[activeCell.row][activeCell.col] = "=CHECKBOX(false)";
                renderGrid();
                markDirty();
            }

            if (action === "dropdown") {
                const options = prompt("Podaj opcje oddzielone przecinkami:", "Nowe,W toku,Zrobione");
                if (!options) return;
                const first = options.split(",")[0]?.trim() || "";
                currentSheet.grid[activeCell.row][activeCell.col] = `=DROPDOWN(${first}|${options})`;
                renderGrid();
                markDirty();
            }

            if (action === "emoji") {
                const emoji = prompt("Wpisz emotikon / emoji:", "😀");
                if (emoji !== null) {
                    currentSheet.grid[activeCell.row][activeCell.col] = emoji;
                    renderGrid();
                    markDirty();
                }
            }

            if (action === "comment") {
                const text = prompt("Treść komentarza:");
                if (text !== null && text.trim() !== "") {
                    currentSheet.grid[activeCell.row][activeCell.col] = `=COMMENT(${text})`;
                    renderGrid();
                    markDirty();
                }
            }

            if (action === "note") {
                const text = prompt("Treść notatki:");
                if (text !== null && text.trim() !== "") {
                    currentSheet.grid[activeCell.row][activeCell.col] = `=NOTE(${text})`;
                    renderGrid();
                    markDirty();
                }
            }
        });
    });

    insertSubmenuItems.forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            if (!action || !currentSheet) return;

            if (action === "clear-cell") {
                currentSheet.grid[activeCell.row][activeCell.col] = "";
                renderGrid();
                markDirty();
                return;
            }

            if (action === "clear-row") {
                clearRow();
                return;
            }

            if (action === "clear-col") {
                clearCol();
                return;
            }

            if (action === "row-above") {
                insertRowAbove();
                return;
            }

            if (action === "row-below") {
                insertRowBelow();
                return;
            }

            if (action === "col-left") {
                insertColLeft();
                return;
            }

            if (action === "col-right") {
                insertColRight();
                return;
            }

            if (action.startsWith("tpl-")) {
                applyTemplate(action);
                return;
            }

            if (action === "smart-date") {
                currentSheet.grid[activeCell.row][activeCell.col] = "=SMART_DATE";
                renderGrid();
                markDirty();
                return;
            }

            if (action === "smart-status") {
                const status = prompt("Podaj status:", "Nowe");
                if (status !== null) {
                    currentSheet.grid[activeCell.row][activeCell.col] = `=SMART_STATUS(${status})`;
                    renderGrid();
                    markDirty();
                }
                return;
            }

            if (action === "smart-progress") {
                const pct = prompt("Podaj postęp 0-100:", "50");
                if (pct !== null) {
                    currentSheet.grid[activeCell.row][activeCell.col] = `=SMART_PROGRESS(${pct})`;
                    renderGrid();
                    markDirty();
                }
            }
        });
    });

    modalCloseButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = document.getElementById(btn.dataset.closeModal);
            closeModal(modal);
        });
    });

    if (buildChartBtn) {
        buildChartBtn.addEventListener("click", () => {
            const range = chartRangeInput.value.trim();
            const type = chartTypeSelect.value;
            const html = buildChartHtml(range, type);
            showGeneratedObject(`Wykres: ${range} (${type})`, html);
            closeModal(chartModal);
        });
    }

    if (buildPivotBtn) {
        buildPivotBtn.addEventListener("click", () => {
            const range = pivotRangeInput.value.trim();
            const html = buildPivotHtml(range);
            showGeneratedObject(`Tabela przestawna light: ${range}`, html);
            closeModal(pivotModal);
        });
    }

    if (imageInsertInput) {
        imageInsertInput.addEventListener("change", () => {
            const file = imageInsertInput.files?.[0];
            if (!file || !currentSheet) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                currentSheet.grid[activeCell.row][activeCell.col] = `=IMAGE(${e.target.result})`;
                renderGrid();
                markDirty();
            };
            reader.readAsDataURL(file);
            imageInsertInput.value = "";
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            await saveSheet();
        });
    }

    if (renameBtn) {
        renameBtn.addEventListener("click", () => {
            if (!currentSheet) return;
            const name = prompt("Nowa nazwa arkusza:", currentSheet.name || "");
            if (!name) return;
            currentSheet.name = name.trim();
            updateHeaderInfo();
            markDirty();
        });
    }

    if (addRowBtn) {
        addRowBtn.addEventListener("click", () => {
            if (!currentSheet) return;
            const cols = currentSheet.grid[0]?.length || 8;
            currentSheet.grid.push(Array(cols).fill(""));
            renderGrid();
            markDirty();
        });
    }

    if (addColBtn) {
        addColBtn.addEventListener("click", () => {
            if (!currentSheet) return;
            currentSheet.grid.forEach(row => row.push(""));
            renderGrid();
            markDirty();
        });
    }

    if (clearCellBtn) {
        clearCellBtn.addEventListener("click", () => {
            if (!currentSheet) return;
            currentSheet.grid[activeCell.row][activeCell.col] = "";
            renderGrid();
            markDirty();
        });
    }

    if (sortAscBtn) {
        sortAscBtn.addEventListener("click", () => {
            if (!currentSheet) return;
            const col = activeCell.col;
            currentSheet.grid.sort((a, b) => String(a[col] ?? "").localeCompare(String(b[col] ?? ""), "pl"));
            renderGrid();
            markDirty();
        });
    }

    if (sortDescBtn) {
        sortDescBtn.addEventListener("click", () => {
            if (!currentSheet) return;
            const col = activeCell.col;
            currentSheet.grid.sort((a, b) => String(b[col] ?? "").localeCompare(String(a[col] ?? ""), "pl"));
            renderGrid();
            markDirty();
        });
    }

    if (toggleFullWidthBtn) {
        toggleFullWidthBtn.addEventListener("click", () => {
            if (sheetEditorCard) sheetEditorCard.classList.toggle("full-width-mode");
        });
    }

    if (toggleGridBtn) {
        toggleGridBtn.addEventListener("click", () => {
            if (sheetGridTable) sheetGridTable.classList.toggle("hide-grid");
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            if (!currentSheet) return;

            const csv = gridToCsv(currentSheet.grid);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${(currentSheet.name || "arkusz").replace(/[^\w\-]+/g, "_")}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    if (importInput) {
        importInput.addEventListener("change", async (e) => {
            const file = e.target.files?.[0];
            if (!file || !currentSheet) return;

            try {
                const text = await file.text();
                currentSheet.grid = parseCsv(text);
                renderGrid();
                markDirty();
            } catch (err) {
                console.error("import csv error:", err);
                alert("Nie udało się zaimportować CSV.");
            } finally {
                importInput.value = "";
            }
        });
    }

    if (applyFormulaBtn) {
        applyFormulaBtn.addEventListener("click", applyFormulaToActiveCell);
    }

    if (formulaInput) {
        formulaInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                applyFormulaToActiveCell();
            }
        });
    }

    formulaChips.forEach(btn => {
        btn.addEventListener("click", () => {
            const fn = normalizeFunctionName(btn.dataset.fn);
            if (!formulaInput) return;
            formulaInput.value = `=${fn}()`;
            formulaInput.focus();
        });
    });

    window.addEventListener("pagehide", saveOnExit);

    window.addEventListener("beforeunload", () => {
        if (hasUnsavedChanges) saveOnExit();
    });

    loadSheet();
});
