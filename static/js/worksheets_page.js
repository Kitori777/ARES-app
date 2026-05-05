document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("create-sheet-form");
    const sheetList = document.getElementById("sheet-list");
    const FAVORITES_KEY = "ares_favorite_sheets";
    const shareModal = document.getElementById("share-sheet-modal");
    const shareForm = document.getElementById("share-sheet-form");
    const shareEmailInput = document.getElementById("share-email-input");
    const sharePermissionSelect = document.getElementById("share-permission-select");
    const shareList = document.getElementById("share-list");
    const shareModalTitle = document.getElementById("share-modal-title");
    const shareModalSubtitle = document.getElementById("share-modal-subtitle");
    let activeShareSheetId = null;
    let activeShareSheetName = "";

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

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
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
            const canManageSharing = sheet.canShare !== false && !sheet.isShared;
            const ownerLabel = sheet.isShared
                ? `Udostępnione przez: ${escapeHtml(sheet.owner?.username || sheet.owner?.email || "właściciel")} • ${sheet.canEdit ? "możesz edytować" : "tylko podgląd"}`
                : "Właściciel: Ty";

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
                    ${`<p class="sheet-share-note">${ownerLabel}</p>`}
                </div>

                <div class="sheet-item-actions">
                    <a class="btn btn-primary" href="/worksheets/editor/?sheet=${sheet.id}">Otwórz</a>
                    ${canManageSharing ? `<button class="btn btn-secondary share-sheet-btn" data-sheet-id="${sheet.id}" data-sheet-name="${String(sheet.name || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">Udostępnij</button>` : ""}
                    ${canManageSharing ? `<button class="btn btn-secondary rename-sheet-list-btn" data-sheet-id="${sheet.id}" data-sheet-name="${String(sheet.name || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" data-sheet-category="${String(sheet.category || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">Zmień nazwę</button>` : ""}
                    ${canManageSharing ? `<button class="btn btn-secondary delete-sheet-btn" data-sheet-id="${sheet.id}">Usuń</button>` : ""}
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

        document.querySelectorAll(".share-sheet-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                await openShareModal(this.dataset.sheetId, this.dataset.sheetName || "Arkusz");
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



    function openShareOverlay() {
        if (!shareModal) return;
        shareModal.hidden = false;
        document.body.classList.add("modal-open");
        setTimeout(() => shareEmailInput?.focus(), 80);
    }

    function closeShareOverlay() {
        if (!shareModal) return;
        shareModal.hidden = true;
        document.body.classList.remove("modal-open");
        activeShareSheetId = null;
        activeShareSheetName = "";
        if (shareForm) shareForm.reset();
    }

    async function openShareModal(sheetId, sheetName) {
        activeShareSheetId = sheetId;
        activeShareSheetName = sheetName || "Arkusz";
        if (shareModalTitle) shareModalTitle.textContent = `Udostępnij „${activeShareSheetName}”`;
        if (shareModalSubtitle) shareModalSubtitle.textContent = "Dodaj osobę przez e-mail lub login. Konto musi już istnieć w aplikacji.";
        openShareOverlay();
        await renderShareList();
    }

    async function renderShareList() {
        if (!activeShareSheetId || !shareList) return;
        shareList.innerHTML = `<div class="share-empty">Ładowanie listy dostępu...</div>`;
        try {
            const data = await apiGet(`/ares/api/sheets/${activeShareSheetId}/shares/`);
            const shares = data.shares || [];
            if (!shares.length) {
                shareList.innerHTML = `<div class="share-empty">Brak dodanych osób. Tylko właściciel ma dostęp.</div>`;
                return;
            }

            shareList.innerHTML = shares.map(share => `
                <div class="share-person-row" data-share-id="${share.id}">
                    <div class="share-person-main">
                        <div class="share-avatar">${escapeHtml((share.username || share.email || "?").slice(0, 1).toUpperCase())}</div>
                        <div>
                            <strong>${escapeHtml(share.username || share.email)}</strong>
                            <small>${escapeHtml(share.email || "")}</small>
                        </div>
                    </div>
                    <div class="share-person-actions">
                        <select class="settings-input share-permission-change" data-share-id="${share.id}">
                            <option value="view" ${share.permission === "view" ? "selected" : ""}>Tylko podgląd</option>
                            <option value="edit" ${share.permission === "edit" ? "selected" : ""}>Może edytować</option>
                        </select>
                        <button class="btn btn-secondary remove-share-btn" type="button" data-share-id="${share.id}">Usuń</button>
                    </div>
                </div>
            `).join("");

            shareList.querySelectorAll(".share-permission-change").forEach(select => {
                select.addEventListener("change", async function () {
                    try {
                        await apiPost(`/ares/api/sheets/${activeShareSheetId}/shares/${this.dataset.shareId}/update/`, { permission: this.value });
                        await renderShareList();
                    } catch (e) {
                        alert("Nie udało się zmienić dostępu.");
                    }
                });
            });

            shareList.querySelectorAll(".remove-share-btn").forEach(btn => {
                btn.addEventListener("click", async function () {
                    if (!confirm("Usunąć dostęp tej osoby do arkusza?")) return;
                    try {
                        await apiPost(`/ares/api/sheets/${activeShareSheetId}/shares/${this.dataset.shareId}/delete/`, {});
                        await renderShareList();
                    } catch (e) {
                        alert("Nie udało się usunąć dostępu.");
                    }
                });
            });
        } catch (e) {
            shareList.innerHTML = `<div class="share-empty">Nie udało się pobrać listy dostępu.</div>`;
        }
    }

    document.querySelectorAll("[data-close-share-modal]").forEach(btn => {
        btn.addEventListener("click", closeShareOverlay);
    });

    if (shareForm) {
        shareForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            if (!activeShareSheetId) return;
            const email = shareEmailInput.value.trim();
            const permission = sharePermissionSelect.value;
            if (!email) {
                alert("Podaj e-mail lub login użytkownika.");
                return;
            }
            try {
                await apiPost(`/ares/api/sheets/${activeShareSheetId}/shares/add/`, { email, permission });
                shareEmailInput.value = "";
                sharePermissionSelect.value = "view";
                await renderShareList();
                await renderSheets();
            } catch (e) {
                alert(e.message || "Nie udało się udostępnić arkusza.");
            }
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
