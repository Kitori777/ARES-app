const ARES_SHEETS_KEY = "ares_sheets";
const ARES_HISTORY_KEY = "ares_history";
const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 8;

function getSheets() {
    return JSON.parse(localStorage.getItem(ARES_SHEETS_KEY) || "[]");
}

function saveSheets(sheets) {
    localStorage.setItem(ARES_SHEETS_KEY, JSON.stringify(sheets));
}

function getHistory() {
    return JSON.parse(localStorage.getItem(ARES_HISTORY_KEY) || "[]");
}

function saveHistory(history) {
    localStorage.setItem(ARES_HISTORY_KEY, JSON.stringify(history));
}

function logHistory(action, sheetId = null, extra = {}) {
    const history = getHistory();
    history.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action,
        sheetId,
        ...extra,
    });
    saveHistory(history.slice(0, 1000));
}

function logPageVisit(pageName) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const dedupeKey = `ares_visit_${pageName}_${todayKey}_${new Date().getHours()}`;
    if (sessionStorage.getItem(dedupeKey)) return;

    sessionStorage.setItem(dedupeKey, "1");
    logHistory(`Wejście do modułu: ${pageName}`, null, {
        module: pageName,
        type: "visit",
    });
}

function createEmptyGrid(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}

function estimateSizeMb(sheet) {
    const json = JSON.stringify(sheet);
    const bytes = new Blob([json]).size;
    return (bytes / (1024 * 1024)).toFixed(2);
}

function findSheetById(sheetId) {
    return getSheets().find(sheet => sheet.id === sheetId);
}

function updateSheet(updatedSheet) {
    const sheets = getSheets().map(sheet => sheet.id === updatedSheet.id ? updatedSheet : sheet);
    saveSheets(sheets);
}

function createSheet(name, category) {
    const sheet = {
        id: crypto.randomUUID(),
        name: name.trim(),
        category: category.trim() || "Bez kategorii",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        grid: createEmptyGrid(),
    };

    const sheets = getSheets();
    sheets.unshift(sheet);
    saveSheets(sheets);

    logHistory("Utworzono arkusz", sheet.id, {
        sheetName: sheet.name,
        category: sheet.category,
        type: "sheet_create",
    });

    return sheet;
}

function deleteSheet(sheetId) {
    const sheets = getSheets();
    const target = sheets.find(s => s.id === sheetId);
    const filtered = sheets.filter(sheet => sheet.id !== sheetId);
    saveSheets(filtered);

    if (target) {
        logHistory("Usunięto arkusz", sheetId, {
            sheetName: target.name,
            type: "sheet_delete",
        });
    }
}

function importCsvToSheet(sheetId, csvText) {
    const sheet = findSheetById(sheetId);
    if (!sheet) return false;

    const rows = csvText
        .split(/\r?\n/)
        .filter(line => line.trim() !== "")
        .map(line => parseCsvLine(line));

    if (!rows.length) return false;

    const maxCols = Math.max(...rows.map(r => r.length), 1);
    const normalized = rows.map(row => {
        const out = [...row];
        while (out.length < maxCols) out.push("");
        return out;
    });

    sheet.grid = normalized;
    sheet.updatedAt = new Date().toISOString();
    updateSheet(sheet);

    logHistory("Zaimportowano CSV do arkusza", sheetId, {
        sheetName: sheet.name,
        rows: normalized.length,
        cols: maxCols,
        type: "import_csv",
    });

    return true;
}

function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const next = line[i + 1];

        if (ch === '"' && inQuotes && next === '"') {
            current += '"';
            i++;
        } else if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }

    result.push(current);
    return result;
}

function exportSheetToCsv(sheet) {
    const csv = sheet.grid
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sheet.name || "arkusz"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logHistory("Wyeksportowano arkusz do CSV", sheet.id, {
        sheetName: sheet.name,
        type: "export_csv",
    });
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString("pl-PL");
}

function formatDay(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString("pl-PL");
}

function columnIndexToLabel(index) {
    let label = "";
    let i = index;
    while (i >= 0) {
        label = String.fromCharCode((i % 26) + 65) + label;
        i = Math.floor(i / 26) - 1;
    }
    return label;
}

function columnLabelToIndex(label) {
    let index = 0;
    for (let i = 0; i < label.length; i++) {
        index = index * 26 + (label.charCodeAt(i) - 64);
    }
    return index - 1;
}

function parseCellRef(ref) {
    const match = /^([A-Z]+)(\d+)$/.exec(ref.toUpperCase());
    if (!match) return null;
    return {
        col: columnLabelToIndex(match[1]),
        row: parseInt(match[2], 10) - 1,
    };
}

function getCellName(row, col) {
    return `${columnIndexToLabel(col)}${row + 1}`;
}

function toNumber(value) {
    if (value === null || value === undefined || value === "") return NaN;
    const n = Number(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
}

function getRangeCells(grid, rangeText) {
    const [startRef, endRef] = rangeText.split(":");
    const start = parseCellRef(startRef);
    const end = parseCellRef(endRef || startRef);
    if (!start || !end) return [];

    const rowStart = Math.min(start.row, end.row);
    const rowEnd = Math.max(start.row, end.row);
    const colStart = Math.min(start.col, end.col);
    const colEnd = Math.max(start.col, end.col);

    const values = [];
    for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
            values.push(grid[r]?.[c] ?? "");
        }
    }
    return values;
}
