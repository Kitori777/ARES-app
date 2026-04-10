document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById("ares-sheet");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    const addRowBtn = document.getElementById("add-row-btn");
    const clearSheetBtn = document.getElementById("clear-sheet-btn");
    const exportCsvBtn = document.getElementById("export-csv-btn");

    const storageKey = "ares_sheet_data";

    function saveTable() {
        const rows = [];
        tbody.querySelectorAll("tr").forEach((tr) => {
            const cells = [];
            tr.querySelectorAll("td").forEach((td) => {
                cells.push(td.innerText.trim());
            });
            rows.push(cells);
        });
        localStorage.setItem(storageKey, JSON.stringify(rows));
    }

    function loadTable() {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return;

        const rows = JSON.parse(saved);
        tbody.innerHTML = "";

        rows.forEach((row) => {
            const tr = document.createElement("tr");
            row.forEach((cell) => {
                const td = document.createElement("td");
                td.contentEditable = "true";
                td.innerText = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        attachCellListeners();
    }

    function attachCellListeners() {
        tbody.querySelectorAll("td").forEach((td) => {
            td.addEventListener("input", saveTable);
        });
    }

    function addRow() {
        const rowCount = tbody.querySelectorAll("tr").length + 1;

        const tr = document.createElement("tr");
        const newRow = [
            rowCount.toString(),
            "Nowy arkusz",
            "Nowa kategoria",
            "Nowy",
            "0"
        ];

        newRow.forEach((text) => {
            const td = document.createElement("td");
            td.contentEditable = "true";
            td.innerText = text;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
        attachCellListeners();
        saveTable();
    }

    function clearSheet() {
        if (!confirm("Czy na pewno chcesz wyczyścić arkusz?")) return;
        localStorage.removeItem(storageKey);
        location.reload();
    }

    function exportTableToCSV() {
        let csv = [];
        const rows = table.querySelectorAll("tr");

        rows.forEach((row) => {
            const cols = row.querySelectorAll("th, td");
            let rowData = [];
            cols.forEach((col) => {
                rowData.push('"' + col.innerText.replace(/"/g, '""') + '"');
            });
            csv.push(rowData.join(","));
        });

        const csvString = csv.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", "ares_arkusz.csv");
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    addRowBtn?.addEventListener("click", addRow);
    clearSheetBtn?.addEventListener("click", clearSheet);
    exportCsvBtn?.addEventListener("click", exportTableToCSV);

    loadTable();
    attachCellListeners();
});
