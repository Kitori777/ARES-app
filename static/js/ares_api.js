async function apiGet(url) {
    const response = await fetch(url, {
        credentials: "same-origin",
    });
    if (!response.ok) throw new Error("Błąd pobierania danych.");
    return await response.json();
}

async function apiPost(url, data = {}) {
    const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Błąd zapisu danych.");
    }

    return await response.json();
}

function getCsrfToken() {
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="));
    return cookie ? cookie.split("=")[1] : "";
}

function estimateSizeMbFromGrid(sheet) {
    const json = JSON.stringify(sheet);
    const bytes = new Blob([json]).size;
    return (bytes / (1024 * 1024)).toFixed(2);
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
