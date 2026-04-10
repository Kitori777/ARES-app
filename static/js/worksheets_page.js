document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("create-sheet-form");
    const sheetList = document.getElementById("sheet-list");

    async function renderSheets() {
        sheetList.innerHTML = "";
        let sheets = [];

        try {
            sheets = await apiGet("/ares/api/sheets/");
        } catch (e) {
            sheetList.innerHTML = `<div class="panel-card"><p>Błąd pobierania arkuszy.</p></div>`;
            return;
        }

        if (!sheets.length) {
            sheetList.innerHTML = `
                <div class="panel-card">
                    <h3>Brak arkuszy</h3>
                    <p>Utwórz pierwszy arkusz, aby rozpocząć pracę.</p>
                </div>
            `;
            return;
        }

        sheets.forEach((sheet) => {
            const sizeMb = estimateSizeMbFromGrid(sheet);

            const card = document.createElement("article");
            card.className = "sheet-item-card";
            card.innerHTML = `
                <div class="sheet-item-top">
                    <div>
                        <div class="sheet-order-number">Arkusz ${sheet.order}</div>
                        <h3>${sheet.name}</h3>
                        <p class="sheet-meta">Kategoria: ${sheet.category}</p>
                    </div>
                    <span class="sheet-badge">${sizeMb} MB</span>
                </div>

                <div class="sheet-item-info">
                    <p>Utworzono: ${formatDate(sheet.createdAt)}</p>
                    <p>Aktualizacja: ${formatDate(sheet.updatedAt)}</p>
                </div>

                <div class="sheet-item-actions">
                    <a class="btn btn-primary" href="/worksheets/editor/?sheet=${sheet.id}">Otwórz</a>
                    <button class="btn btn-secondary delete-sheet-btn" data-sheet-id="${sheet.id}">Usuń</button>
                </div>
            `;
            sheetList.appendChild(card);
        });

        document.querySelectorAll(".delete-sheet-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const sheetId = this.dataset.sheetId;
                if (!confirm("Czy na pewno chcesz usunąć ten arkusz?")) return;

                try {
                    await apiPost(`/ares/api/sheets/${sheetId}/delete/`);
                    await renderSheets();
                } catch (e) {
                    alert("Nie udało się usunąć arkusza.");
                }
            });
        });
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("sheet-name").value.trim();
        const category = document.getElementById("sheet-category").value.trim();

        if (!name) {
            alert("Podaj nazwę arkusza.");
            return;
        }

        try {
            const sheet = await apiPost("/ares/api/sheets/create/", { name, category });
            window.location.href = `/worksheets/editor/?sheet=${sheet.id}`;
        } catch (e) {
            alert("Nie udało się utworzyć arkusza.");
        }
    });

    renderSheets();
});
