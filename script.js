document.addEventListener("DOMContentLoaded", () => {
    // דאגי להדביק כאן את הכתובת שקיבלת מ-Google Apps Script (Web App URL)
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxs41gKQuTUlxTr0x7y1HT19QmK7Kiw_F0gYUbXQjZJJytOf_IhJSlBm44-OD5As3xE/exec";

    // 1. הפעלת סליידר התמונות ברקע (Fade Effect)
    const slides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
        }, 4000);
    }

    // 2. טעינת המוצרים מ-Google Sheets עם Loader
    async function loadProducts() {
        const grid = document.getElementById("menu-grid");
        if (!grid) return;

        // הצגת אנימציית טעינה (Loader)
        grid.innerHTML = `
            <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
                <p>טוען מוצרים...</p>
            </div>
        `;

        try {
            const response = await fetch(`${GOOGLE_WEB_APP_URL}?type=product`);
            if (!response.ok) throw new Error("Could not fetch products from Google Sheets");
            return await response.json();
        } catch (error) {
            console.error("Error loading products:", error);
            return [];
        }
    }

    // קריאה לפונקציה ורינדור התוצאות
    loadProducts().then((products) => {
        const grid = document.getElementById("menu-grid");
        if (!grid) return;

        grid.innerHTML = ""; // ניקוי ה-Loader

        if (!products || products.length === 0) {
            grid.innerHTML = `<p class="no-results">לא נמצאו מוצרים כרגע...</p>`;
            return;
        }

        products.forEach((item) => {
            const card = document.createElement("div");
            card.className = `menu-card ${!item.inStock ? "out-of-stock" : ""}`;

            card.innerHTML = `
                <div class="menu-card-img-wrapper">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="menu-card-body">
                    <h3 class="menu-card-title">${item.name}</h3>
                    <p class="menu-card-desc">${item.description}</p>
                </div>
                <div class="menu-card-footer">
                    <span class="menu-card-price">${item.price}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    });

    // 3. פתרון אבסולוטי לגלילה חלקה
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();

                    const navbarHeight = document.querySelector(".navbar").offsetHeight || 70;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth",
                    });
                }
            }
        });
    });
});

// 4. ניהול תפריט המבורגר למובייל
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
    });

    // סגירת התפריט אוטומטית בלחיצה על קישור
    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        });
    });
}
