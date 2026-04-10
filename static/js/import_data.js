document.addEventListener("DOMContentLoaded", function () {
    const sheetSelect = document.getElementById("import-target-sheet");
    const fileInput = document.getElementById("import-file");
    const runBtn = document.getElementById("run-import-btn");

    if (!sheetSelect || !fileInput || !runBtn) return;

    async function loadSheetsToSelect() {
        let sheets = [];
        try {
            sheets = await apiGet("/ares/api/sheets/");
        } catch (e) {
            return;
        }

        sheetSelect.innerHTML = "";

        if (!sheets.length) {
            const option = document.createElement("option");
            option.textContent = "Brak arkuszy";
            option.value = "";
            sheetSelect.appendChild(option);
            return;
        }

        sheets.forEach(sheet => {
            const option = document.createElement("option");
            option.value = sheet.id;
            option.textContent = `${sheet.order}. ${sheet.name} (${sheet.category})`;
            sheetSelect.appendChild(option);
        });
    }

    runBtn.addEventListener("click", async function () {
        const sheetId = sheetSelect.value;
        const file = fileInput.files[0];

        if (!sheetId) {
            alert("Najpierw utwórz arkusz.");
            return;
        }

        if (!file) {
            alert("Wybierz plik CSV.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (event) {
            const csvText = event.target.result;

            const rows = csvText
                .split(/\r?\n/)
                .filter(line => line.trim() !== "")
                .map(line => parseCsvLine(line));

            const maxCols = Math.max(...rows.map(r => r.length), 1);
            const normalized = rows.map(row => {
                const out = [...row];
                while (out.length < maxCols) out.push("");
                return out;
            });

            try {
                const sheet = await apiGet(`/ares/api/sheets/${sheetId}/`);
                await apiPost(`/ares/api/sheets/${sheetId}/save/`, {
                    name: sheet.name,
                    category: sheet.category,
                    grid: normalized,
                    action: "Zaimportowano CSV do arkusza",
                });

                await apiPost("/ares/api/history/add/", {
                    sheetId: Number(sheetId),
                    action: "Zaimportowano CSV do arkusza",
                    details: {
                        sheetName: sheet.name,
                        rows: normalized.length,
                        cols: maxCols,
                        type: "import_csv",
                    }
                });

                alert("Import CSV zakończony sukcesem.");
                window.location.href = `/worksheets/editor/?sheet=${sheetId}`;
            } catch (e) {
                alert("Import nie powiódł się.");
            }
        };

        reader.readAsText(file, "utf-8");
    });

    loadSheetsToSelect();
});
