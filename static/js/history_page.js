document.addEventListener("DOMContentLoaded", async function () {
    const historyList = document.getElementById("history-list");
    const summaryGrid = document.getElementById("history-summary-grid");

    if (!historyList || !summaryGrid) return;

    let history = [];
    try {
        history = await apiGet("/ares/api/history/");
    } catch (e) {
        summaryGrid.innerHTML = `<div class="panel-card"><p>Błąd pobierania historii.</p></div>`;
        return;
    }

    if (!history.length) {
        summaryGrid.innerHTML = `
            <div class="panel-card">
                <h3>Brak historii</h3>
                <p>Nie wykonano jeszcze żadnych operacji.</p>
            </div>
        `;
        historyList.innerHTML = `
            <div class="timeline-item">
                <strong>Brak historii</strong>
                <span>Nie wykonano jeszcze żadnych operacji.</span>
            </div>
        `;
        return;
    }

    const grouped = {};

    history.forEach(entry => {
        const day = entry.createdAt.slice(0, 10);

        if (!grouped[day]) {
            grouped[day] = {
                entries: [],
                actionsCount: 0,
                visitCount: 0,
                importCount: 0,
                exportCount: 0,
                saveCount: 0,
            };
        }

        grouped[day].entries.push(entry);
        grouped[day].actionsCount += 1;

        const details = entry.details || {};
        if (details.type === "visit") grouped[day].visitCount += 1;
        if (details.type === "import_csv") grouped[day].importCount += 1;
        if (details.type === "export_csv") grouped[day].exportCount += 1;
        if (String(entry.action).toLowerCase().includes("zapis")) grouped[day].saveCount += 1;
    });

    const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    summaryGrid.innerHTML = "";
    sortedDays.forEach(day => {
        const item = grouped[day];

        const card = document.createElement("article");
        card.className = "history-day-card";
        card.innerHTML = `
            <div class="history-day-title">${formatDay(day)}</div>
            <div class="history-day-stats">
                <div><strong>Wejścia:</strong> ${item.visitCount}</div>
                <div><strong>Akcje:</strong> ${item.actionsCount}</div>
                <div><strong>Importy:</strong> ${item.importCount}</div>
                <div><strong>Eksporty:</strong> ${item.exportCount}</div>
                <div><strong>Zapisy:</strong> ${item.saveCount}</div>
            </div>
        `;
        summaryGrid.appendChild(card);
    });

    historyList.innerHTML = "";
    history.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `
            <strong>${entry.order}.</strong>
            <span>${formatDate(entry.createdAt)} — ${entry.action}${entry.sheetName ? ` — ${entry.sheetName}` : ""}</span>
        `;
        historyList.appendChild(item);
    });
});
