
// Знаходимо елементи сторінки
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

// Автоматично встановлюємо поточний рік
document.getElementById("year").textContent =
    new Date().getFullYear();

// Відкриття та закриття мобільного меню
menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Закрити меню" : "Відкрити меню"
    );
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Закриваємо меню після натискання на посилання
nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Відкрити меню");
        menuToggle.textContent = "☰";
    });
});

// Перемикання теми
themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");

    themeToggle.textContent = isLight ? "🌙" : "☀️";
    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Увімкнути темну тему" : "Увімкнути світлу тему"
    );
});

// Обробка контактної форми
contactForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
        formStatus.textContent = "Заповни всі поля!";
        return;
    }

    // Підготовка тексту повідомлення
    const subject = encodeURIComponent("Повідомлення із сайту NEXUS");
    const body = encodeURIComponent(
        `Ім'я: ${name}\nEmail: ${email}\n\nПовідомлення:\n${message}`
    );

    formStatus.textContent =
        "Дані підготовлено. Для відправлення потрібна поштова програма або сервер.";

    // Відкриває поштову програму, якщо вона налаштована.
    // Заміни адресу нижче на свою електронну пошту.
    const recipient = "";

    if (recipient) {
        window.location.href =
            `mailto:${recipient}?subject=${subject}&body=${body}`;
    } else {
        const preparedMessage =
            `Тема: Повідомлення із сайту NEXUS\n\n` +
            `Ім'я: ${name}\nEmail: ${email}\n\n${message}`;

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.className = "btn secondary";
        copyButton.textContent = "Скопіювати повідомлення";

        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(preparedMessage);
                formStatus.textContent = "Повідомлення скопійовано!";
            } catch {
                formStatus.textContent =
                    "Не вдалося скопіювати. Спробуй виділити текст вручну.";
            }
        });

        const oldButton = document.getElementById("copyMessage");
        if (oldButton) oldButton.remove();

        copyButton.id = "copyMessage";
        formStatus.insertAdjacentElement("afterend", copyButton);
    }
});

