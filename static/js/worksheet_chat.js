(function () {
    function getCookie(name) {
        const cookies = document.cookie ? document.cookie.split(";") : [];
        for (const raw of cookies) {
            const cookie = raw.trim();
            if (cookie.startsWith(name + "=")) return decodeURIComponent(cookie.slice(name.length + 1));
        }
        return "";
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatTime(value) {
        try {
            return new Date(value).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
        } catch (e) {
            return "teraz";
        }
    }

    async function getJson(url) {
        const response = await fetch(url, { credentials: "same-origin", headers: { "X-Requested-With": "XMLHttpRequest" } });
        if (!response.ok) throw new Error(await response.text() || "Nie można pobrać wiadomości czatu.");
        return response.json();
    }

    async function postJson(url, payload) {
        const response = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await response.text() || "Nie można wysłać wiadomości.");
        return response.json();
    }

    document.addEventListener("DOMContentLoaded", function () {
        const params = new URLSearchParams(window.location.search);
        const sheetId = params.get("sheet");
        const launcher = document.getElementById("we-chat-launcher");
        const panel = document.getElementById("we-sheet-chat");
        const closeBtn = document.getElementById("we-chat-close");
        const messagesEl = document.getElementById("we-chat-messages");
        const form = document.getElementById("we-chat-form");
        const input = document.getElementById("we-chat-input");
        const badge = document.getElementById("we-chat-new-count");
        const subtitle = document.getElementById("we-chat-subtitle");
        if (!launcher || !panel || !messagesEl || !form || !input) return;

        if (!sheetId) {
            launcher.hidden = true;
            panel.hidden = true;
            return;
        }

        let lastId = 0;
        let unread = 0;
        let loading = false;
        let pollTimer = null;

        function setUnread(value) {
            unread = value;
            if (badge) badge.textContent = String(value);
            launcher.classList.toggle("has-new", value > 0);
        }

        function renderMessages(messages, append = false) {
            if (!append) messagesEl.innerHTML = "";
            if (!messages.length && !append) {
                messagesEl.innerHTML = '<div class="we-chat-empty">Brak wiadomości. Napisz pierwszą wiadomość do osób mających dostęp do arkusza.</div>';
                return;
            }
            if (!append) messagesEl.innerHTML = "";
            const html = messages.map(msg => {
                lastId = Math.max(lastId, Number(msg.id) || 0);
                const mine = msg.isMine ? " mine" : "";
                return `<div class="we-chat-msg${mine}">
                    <div class="we-chat-author">${escapeHtml(msg.author || msg.username || "Użytkownik")}</div>
                    <div class="we-chat-bubble">${escapeHtml(msg.body)}</div>
                    <div class="we-chat-time">${formatTime(msg.createdAt)}</div>
                </div>`;
            }).join("");
            messagesEl.insertAdjacentHTML("beforeend", html);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        async function loadMessages(append = false) {
            if (loading) return;
            loading = true;
            try {
                const url = append && lastId ? `/ares/api/sheets/${sheetId}/chat/messages/?after=${lastId}` : `/ares/api/sheets/${sheetId}/chat/messages/`;
                const data = await getJson(url);
                const messages = data.messages || [];
                if (messages.length) {
                    renderMessages(messages, append);
                    if (panel.hidden) setUnread(unread + messages.filter(m => !m.isMine).length);
                } else if (!append) {
                    renderMessages([], false);
                }
                if (subtitle) subtitle.textContent = "Czat udostępnionego arkusza — wiadomości są zapisywane przy arkuszu.";
            } catch (err) {
                if (subtitle) subtitle.textContent = "Czat niedostępny: " + err.message.slice(0, 120);
            } finally {
                loading = false;
            }
        }

        launcher.addEventListener("click", () => {
            panel.hidden = !panel.hidden;
            if (!panel.hidden) {
                setUnread(0);
                input.focus({ preventScroll: true });
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
        });
        closeBtn?.addEventListener("click", () => { panel.hidden = true; });

        form.addEventListener("submit", async event => {
            event.preventDefault();
            const body = input.value.trim();
            if (!body) return;
            input.value = "";
            input.style.height = "";
            try {
                const data = await postJson(`/ares/api/sheets/${sheetId}/chat/messages/add/`, { body });
                if (data.message) renderMessages([data.message], true);
            } catch (err) {
                alert(err.message || "Nie można wysłać wiadomości.");
                input.value = body;
            }
        });

        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height = `${Math.min(110, input.scrollHeight)}px`;
        });
        input.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                form.requestSubmit();
            }
        });

        loadMessages(false);
        pollTimer = window.setInterval(() => loadMessages(true), 7000);
        window.addEventListener("beforeunload", () => { if (pollTimer) clearInterval(pollTimer); });
    });
})();
