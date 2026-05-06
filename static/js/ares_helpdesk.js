(function () {
    const TOPICS = [
        {
            title: "Jak działa arkusz?",
            keywords: ["arkusz", "komórka", "komorka", "zaznacz", "edit", "edycja", "delete", "skrót", "skrot"],
            answer: "Arkusz ARES działa podobnie do prostego arkusza Google: kliknięcie wybiera komórkę, podwójne kliknięcie uruchamia edycję, Delete lub Backspace czyści komórkę albo zaznaczony zakres, Ctrl+C/Ctrl+X/Ctrl+V obsługują kopiowanie, wycinanie i wklejanie, Ctrl+S zapisuje, Ctrl+Z cofa, a Ctrl+Y ponawia zmianę."
        },
        {
            title: "Jak importować dane?",
            keywords: ["import", "csv", "xlsx", "xls", "txt", "tsv", "plik"],
            answer: "Dane możesz wczytać z sekcji Import danych albo z poziomu arkusza. ARES obsługuje CSV, TXT, TSV, XLSX oraz XLS. Po imporcie dane trafiają do siatki, którą możesz dalej sortować, formatować, analizować i eksportować."
        },
        {
            title: "Jak działają formuły?",
            keywords: ["formuła", "formula", "funkcja", "suma", "średnia", "srednia", "="],
            answer: "Formuły wpisujesz od znaku równości, na przykład =A1+B1 albo =SUMA(A1:A10). Pasek formuły pokazuje zawartość aktywnej komórki, a katalog funkcji pomaga wybrać gotową funkcję i zobaczyć przykład użycia."
        },
        {
            title: "Jak działa Solver?",
            keywords: ["solver", "optymalizacja", "cel", "ograniczenia", "zmienne"],
            answer: "Solver służy do szukania najlepszego wyniku przy wybranych ograniczeniach. Wskazujesz komórkę celu, komórki zmienne, kierunek optymalizacji oraz ograniczenia, a ARES przelicza warianty i pokazuje najlepsze rozwiązanie."
        },
        {
            title: "Jak tworzyć wykresy?",
            keywords: ["wykres", "chart", "diagram", "słupkowy", "slupkowy", "liniowy"],
            answer: "Zaznacz zakres danych, wejdź w Wstaw lub Dane i wybierz Wykres. Możesz ustawić typ wykresu, tytuł, etykiety osi, legendę, rozmiar i wygląd. Podgląd pomaga sprawdzić efekt przed zapisaniem obiektu."
        },
        {
            title: "Jak udostępnić arkusz?",
            keywords: ["udostępn", "udostepn", "współpraca", "wspolpraca", "share", "dostęp", "dostep"],
            answer: "Właściciel arkusza może udostępnić go innemu użytkownikowi po e-mailu lub loginie. Można nadać dostęp tylko do podglądu albo do edycji. Przy udostępnionym arkuszu działa też czat arkusza."
        },
        {
            title: "Jak działa czat arkusza?",
            keywords: ["chat", "czat", "wiadomość", "wiadomosc", "komunikacja", "rozmowa"],
            answer: "Czat arkusza jest przypięty do konkretnego arkusza. Po otwarciu panelu w rogu możesz wysłać wiadomość, a inni użytkownicy z dostępem do tego arkusza zobaczą ją w tym samym miejscu. Przy wiadomościach pokazuje się nazwa użytkownika i godzina."
        },
        {
            title: "Jak zgłosić problem?",
            keywords: ["problem", "błąd", "blad", "zgłoszenie", "zgloszenie", "bug", "feedback"],
            answer: "Wejdź w Zgłoś problem, opisz co nie działa, gdzie występuje błąd i jakie kroki prowadzą do problemu. Administrator może potem przejrzeć zgłoszenia w panelu zgłoszeń."
        },
        {
            title: "Jak zmienić wygląd i język?",
            keywords: ["profil", "motyw", "język", "jezyk", "kolor", "avatar", "wygląd", "wyglad"],
            answer: "W profilu użytkownika możesz zmienić motyw, język aplikacji, avatar, skróty szybkiego dostępu i preferencje interfejsu. Ustawienia są zapisywane, aby aplikacja wyglądała tak samo przy kolejnym wejściu."
        }
    ];

    function normalize(text) {
        return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function findAnswer(question) {
        const q = normalize(question);
        if (!q.trim()) return "Wpisz pytanie o działanie aplikacji ARES. Możesz zapytać o arkusze, import, formuły, wykresy, Solver, udostępnianie, czat, profil albo zgłaszanie problemów.";
        let best = null;
        let score = 0;
        TOPICS.forEach(topic => {
            let localScore = 0;
            topic.keywords.forEach(keyword => {
                if (q.includes(normalize(keyword))) localScore += 2;
            });
            normalize(topic.title).split(/\s+/).forEach(word => {
                if (word.length > 3 && q.includes(word)) localScore += 1;
            });
            if (localScore > score) {
                score = localScore;
                best = topic;
            }
        });
        if (best) return best.answer;
        return "Nie mam idealnego dopasowania, ale w ARES najważniejsze obszary to: arkusze, import danych, formuły, wykresy, tabele przestawne, Solver, udostępnianie, czat arkusza, profil oraz zgłaszanie problemów. Doprecyzuj pytanie jednym z tych słów, a podam konkretną instrukcję.";
    }

    function speak(text) {
        if (!("speechSynthesis" in window)) {
            alert("Ta przeglądarka nie obsługuje odczytywania głosowego.");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pl-PL";
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }

    function getTopicKey(topic) {
        return normalize(topic?.title || "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    function setActiveTopicButton(list, key) {
        if (!list) return;
        list.querySelectorAll(".helpdesk-topic-btn").forEach(btn => {
            btn.classList.toggle("is-active", btn.dataset.topicKey === key);
            btn.setAttribute("aria-pressed", btn.dataset.topicKey === key ? "true" : "false");
        });
    }

    function initPageHelpdesk() {
        const input = document.getElementById("helpdesk-question");
        const answer = document.getElementById("helpdesk-answer");
        const answerBtn = document.getElementById("helpdesk-answer-btn");
        const speakBtn = document.getElementById("helpdesk-speak-btn");
        const list = document.getElementById("helpdesk-topic-list");
        if (!input || !answer) return;

        const showAnswer = (alsoSpeak = false) => {
            const text = findAnswer(input.value);
            answer.textContent = text;
            if (alsoSpeak) speak(text);
        };

        answerBtn?.addEventListener("click", () => showAnswer(false));
        speakBtn?.addEventListener("click", () => showAnswer(true));
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") showAnswer(false);
        });

        if (list) {
            list.innerHTML = TOPICS.map(topic => `<button type="button" class="helpdesk-topic-btn" data-topic-key="${getTopicKey(topic)}">${topic.title}</button>`).join("");
            list.querySelectorAll("button").forEach((btn, index) => {
                btn.addEventListener("click", () => {
                    const topic = TOPICS[index];
                    const key = getTopicKey(topic);
                    input.value = topic.title;
                    answer.textContent = topic.answer;
                    setActiveTopicButton(list, key);
                    try {
                        window.localStorage.setItem("ares_helpdesk_topic", key);
                    } catch (e) {}
                    try {
                        const url = new URL(window.location.href);
                        url.searchParams.set("topic", key);
                        window.history.replaceState({}, "", url);
                    } catch (e) {}
                });
            });

            let preferredTopic = "";
            try {
                preferredTopic = new URL(window.location.href).searchParams.get("topic") || window.localStorage.getItem("ares_helpdesk_topic") || "";
            } catch (e) {}
            const preferredIndex = TOPICS.findIndex(topic => getTopicKey(topic) === preferredTopic);
            if (preferredIndex >= 0) {
                const topic = TOPICS[preferredIndex];
                input.value = topic.title;
                answer.textContent = topic.answer;
                setActiveTopicButton(list, preferredTopic);
            }
        }
    }

    window.ARES_HELPDESK = { TOPICS, findAnswer, speak };
    document.addEventListener("DOMContentLoaded", initPageHelpdesk);
})();
