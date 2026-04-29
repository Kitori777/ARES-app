document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("create-sheet-form");
    const sheetList = document.getElementById("sheet-list");
    const FAVORITES_KEY = "ares_favorite_sheets";

    function loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveFavorites(favorites) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }

    function isFavorite(sheetId) {
        return !!loadFavorites()[String(sheetId)];
    }

    function toggleFavorite(sheetId) {
        const favorites = loadFavorites();
        const key = String(sheetId);
        if (favorites[key]) {
            delete favorites[key];
        } else {
            favorites[key] = true;
        }
        saveFavorites(favorites);
    }

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

        const favorites = loadFavorites();
        sheets = [...sheets].sort((a, b) => {
            const favA = favorites[String(a.id)] ? 1 : 0;
            const favB = favorites[String(b.id)] ? 1 : 0;
            if (favA !== favB) return favB - favA;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        const favCount = sheets.filter(sheet => favorites[String(sheet.id)]).length;
        const summary = document.createElement("div");
        summary.className = "sheet-list-summary";
        summary.innerHTML = `
            <div>
                <strong>${sheets.length}</strong> arkuszy łącznie
                ${favCount ? `<span>• ${favCount} ulubione wyświetlane na górze</span>` : `<span>• kliknij gwiazdkę, aby przypiąć arkusz wyżej</span>`}
            </div>
        `;
        sheetList.appendChild(summary);

        sheets.forEach((sheet, index) => {
            const sizeMb = estimateSizeMbFromGrid(sheet);
            const favorite = !!favorites[String(sheet.id)];

            const card = document.createElement("article");
            card.className = `sheet-item-card ${favorite ? "is-favorite" : ""}`;
            card.innerHTML = `
                <div class="sheet-item-top">
                    <div>
                        <div class="sheet-order-number">${favorite ? "Ulubiony" : `Arkusz ${index + 1}`}</div>
                        <h3>${sheet.name}</h3>
                        <p class="sheet-meta">Kategoria: ${sheet.category || "Bez kategorii"}</p>
                    </div>
                    <div class="sheet-card-tools">
                        <button class="favorite-sheet-btn ${favorite ? "active" : ""}" type="button" data-sheet-id="${sheet.id}" title="${favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}" aria-label="${favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}">
                            ${favorite ? "★" : "☆"}
                        </button>
                        <span class="sheet-badge">${sizeMb} MB</span>
                    </div>
                </div>

                <div class="sheet-item-info">
                    <p>Utworzono: ${formatDate(sheet.createdAt)}</p>
                    <p>Aktualizacja: ${formatDate(sheet.updatedAt)}</p>
                </div>

                <div class="sheet-item-actions">
                    <a class="btn btn-primary" href="/worksheets/editor/?sheet=${sheet.id}">Otwórz</a>
                    <button class="btn btn-secondary rename-sheet-list-btn" data-sheet-id="${sheet.id}" data-sheet-name="${String(sheet.name || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" data-sheet-category="${String(sheet.category || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">Zmień nazwę</button>
                    <button class="btn btn-secondary delete-sheet-btn" data-sheet-id="${sheet.id}">Usuń</button>
                </div>
            `;
            sheetList.appendChild(card);
        });

        document.querySelectorAll(".favorite-sheet-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const sheetId = this.dataset.sheetId;
                toggleFavorite(sheetId);
                await renderSheets();
            });
        });


        document.querySelectorAll(".rename-sheet-list-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const sheetId = this.dataset.sheetId;
                const currentName = this.dataset.sheetName || "Arkusz";
                const currentCategory = this.dataset.sheetCategory || "Bez kategorii";
                const name = prompt("Podaj nową nazwę arkusza:", currentName);
                if (!name || !name.trim()) return;
                const category = prompt("Kategoria arkusza:", currentCategory) || currentCategory;
                try {
                    await apiPost(`/ares/api/sheets/${sheetId}/save/`, { name: name.trim(), category: category.trim(), action: "Zmieniono nazwę arkusza" });
                    await renderSheets();
                } catch (e) { alert("Nie udało się zmienić nazwy arkusza."); }
            });
        });

        document.querySelectorAll(".delete-sheet-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const sheetId = this.dataset.sheetId;
                if (!confirm("Czy na pewno chcesz usunąć ten arkusz?")) return;

                try {
                    await apiPost(`/ares/api/sheets/${sheetId}/delete/`);
                    const favorites = loadFavorites();
                    delete favorites[String(sheetId)];
                    saveFavorites(favorites);
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
