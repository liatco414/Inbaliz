document.addEventListener("DOMContentLoaded", () => {
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzEgmH6sMzqS_7coZhC_1kmiNc1FuxrWjpIeo87PYjukjr6p4uXHLBq41k_-R8Qlc9B/exec";

    // 1. סליידר (נשאר כפי שהיה)
    const slides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
        }, 4000);
    }

    // 2. טעינת מוצרים עם תיקון ה-LocalStorage
    let currentProductPage = 1;
    const productsPerPage = 4;
    const PROD_CACHE_PREFIX = "inbaliz_product_page_";

    async function loadProductsPage(page) {
        const grid = document.getElementById("menu-grid");
        if (!grid) return;

        const cacheKey = PROD_CACHE_PREFIX + page;
        const cachedData = localStorage.getItem(cacheKey);

        // הוספנו בדיקה: אם יש מידע ב-Cache, נחזיר אותו.
        // אבל אם נתקעת, ניתן למחוק ידנית ע"י לחיצה על כפתור ריענון או פשוט להוסיף תוקף.
        if (cachedData) {
            try {
                return JSON.parse(cachedData);
            } catch (e) {
                localStorage.removeItem(cacheKey); // ניקוי אם המידע פגום
            }
        }

        grid.innerHTML = `<div class="loading-spinner-container"><div class="loading-spinner"></div><p>טוען מוצרים...</p></div>`;

        try {
            // הוספת זמן כדי למנוע Cache של הדפדפן עצמו ברמת ה-Network
            const response = await fetch(`${GOOGLE_WEB_APP_URL}?type=product&page=${page}&limit=${productsPerPage}&t=${Date.now()}`);
            if (!response.ok) throw new Error("Could not fetch products");

            const result = await response.json();

            // שומרים רק אם באמת קיבלנו דאטה
            if (result && result.data) {
                localStorage.setItem(cacheKey, JSON.stringify(result));
            }
            return result;
        } catch (error) {
            console.error("Error loading products:", error);
            return { data: [], totalPages: 0 };
        }
    }

    async function fetchAndRenderProducts() {
        const result = await loadProductsPage(currentProductPage);
        renderProducts(result.data, result.totalPages);
    }

    fetchAndRenderProducts();

    function renderProducts(productsToDisplay, totalPages) {
        const grid = document.getElementById("menu-grid");
        if (!grid) return;

        grid.innerHTML = "";

        if (!productsToDisplay || productsToDisplay.length === 0) {
            grid.innerHTML = `<p class="no-results">לא נמצאו מוצרים כרגע...</p>`;
            return;
        }

        productsToDisplay.forEach((item) => {
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
                    <span class="menu-card-price">${item.price}₪</span>
                </div>
            `;
            grid.appendChild(card);
        });

        // יצירת סרגל עמודים
        if (totalPages > 1) {
            const paginationBar = document.createElement("div");
            paginationBar.className = "pagination-bar";
            paginationBar.style.cssText = "display: flex; gap: 10px; justify-content: center; margin-top: 30px; width: 100%; grid-column: 1 / -1;";

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.innerText = i;
                btn.className = `page-btn ${i === currentProductPage ? "active" : ""}`;
                btn.style.cssText = `padding: 8px 15px; border-radius: 8px; border: 1px solid #d4a373; background: ${i === currentProductPage ? "#d4a373" : "#fff"}; color: ${i === currentProductPage ? "#fff" : "#333"}; cursor: pointer; font-weight: bold;`;

                btn.addEventListener("click", () => {
                    currentProductPage = i;
                    fetchAndRenderProducts();
                    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
                });

                paginationBar.appendChild(btn);
            }
            grid.appendChild(paginationBar);
        }
    }
});
// --- לוגיקת המבורגר ---
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            hamburger.classList.toggle("open"); // אופציונלי: לאנימציית ה-X
        });
    }

    // סגירת התפריט בלחיצה על קישור
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            hamburger.classList.remove("open");
            hamburger.classList.toggle("is-active");
        });
    });
});
