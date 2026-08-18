document.addEventListener("DOMContentLoaded", () => {
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzEgmH6sMzqS_7coZhC_1kmiNc1FuxrWjpIeo87PYjukjr6p4uXHLBq41k_-R8Qlc9B/exec";

    const recipesGrid = document.getElementById("recipesGrid");
    const searchInput = document.getElementById("recipeSearch");

    let currentPage = 1;
    const itemsPerPage = 10;
    const RECIPE_CACHE_PREFIX = "inbaliz_recipe_page_";

    async function loadRecipesPage(page) {
        if (!recipesGrid) return;

        // בדיקה האם העמוד כבר שמור בזיכרון המקומי של הדפדפן
        const cacheKey = RECIPE_CACHE_PREFIX + page;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                return JSON.parse(cachedData); // טעינה מיידית ללא המתנה לשרת!
            } catch (e) {
                localStorage.removeItem(cacheKey); // ניקוי אם המידע פגום
            }
        }

        // אם אין בזיכרון, מציגים ספינר וניגשים לשרת
        recipesGrid.innerHTML = `
            <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
                <p>טוען מתכונים מהמטבח...</p>
            </div>
        `;

        try {
            const response = await fetch(`${GOOGLE_WEB_APP_URL}?type=recipe&page=${page}&limit=${itemsPerPage}&t=${Date.now()}`);
            if (!response.ok) throw new Error("Could not fetch recipes");
            const result = await response.json(); // מחזיר אובייקט עם { data, totalPages, currentPage }

            // שמירת העמוד החדש ב-LocalStorage רק אם התקבלו נתונים תקינים
            if (result && result.data) {
                localStorage.setItem(cacheKey, JSON.stringify(result));
            }

            return result;
        } catch (error) {
            console.error("שגיאה בטעינת המתכונים:", error);
            return { data: [], totalPages: 0 };
        }
    }

    async function fetchAndRender() {
        const result = await loadRecipesPage(currentPage);
        displayRecipes(result.data, result.totalPages);
    }

    fetchAndRender();

    function displayRecipes(recipesToDisplay, totalPages) {
        if (!recipesGrid) return;

        recipesGrid.innerHTML = "";

        if (!recipesToDisplay || recipesToDisplay.length === 0) {
            recipesGrid.innerHTML = `<p class="no-results">לא נמצאו מתכונים...</p>`;
            return;
        }

        recipesToDisplay.forEach((recipe) => {
            const card = document.createElement("a");
            card.href = `recipe-detail.html?id=${recipe.id}`;
            card.className = "recipe-card-preview";
            card.innerHTML = `
                <div class="recipe-card-img">
                    <img src="${recipe.image}" alt="${recipe.title}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="recipe-card-info">
                    <h3>${recipe.title}</h3>
                    <p>לחצו לצפייה במצרכים ובאופן ההכנה מלא <i class="fa-solid fa-arrow-left"></i></p>
                </div>
            `;
            recipesGrid.appendChild(card);
        });

        // יצירת סרגל עמודים מבוסס נתוני שרת
        if (totalPages > 1) {
            const paginationBar = document.createElement("div");
            paginationBar.className = "pagination-bar";
            paginationBar.style.cssText = "display: flex; gap: 10px; justify-content: center; margin-top: 30px; width: 100%; grid-column: 1 / -1;";

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.innerText = i;
                btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
                btn.style.cssText = `padding: 8px 15px; border-radius: 8px; border: 1px solid #d4a373; background: ${i === currentPage ? "#d4a373" : "#fff"}; color: ${i === currentPage ? "#fff" : "#333"}; cursor: pointer; font-weight: bold;`;

                btn.addEventListener("click", () => {
                    currentPage = i;
                    fetchAndRender();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                });

                paginationBar.appendChild(btn);
            }
            recipesGrid.appendChild(paginationBar);
        }
    }

    // חיפוש חי על גבי כרטיסיות המתכונים הנטענות בעמוד הנוכחי
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const cards = recipesGrid.querySelectorAll(".recipe-card-preview");
            cards.forEach((card) => {
                const title = card.querySelector("h3").innerText.toLowerCase();
                card.style.display = title.includes(searchTerm) ? "block" : "none";
            });
        });
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
