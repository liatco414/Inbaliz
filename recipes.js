document.addEventListener("DOMContentLoaded", () => {
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwS9QYu0O14wphSAXOX-wDLpEmhflUYDS8j1yuEgDsuXf_wiiUBrXGjR0K9kYzhxfcu/exec";

    const recipesGrid = document.getElementById("recipesGrid");
    const searchInput = document.getElementById("recipeSearch");
    const categoryFilterContainer = document.getElementById("categoryFilterContainer");

    let currentPage = 1;
    const itemsPerPage = 10;
    const RECIPE_CACHE_PREFIX = "inbaliz_recipe_page_";

    let allLoadedRecipes = []; // ישמור את רשימת המתכונים הנוכחית לצורך סינון מקומי מהיר
    let currentCategory = "הכל"; // ברירת מחדל - מציג את כולם

    async function loadRecipesPage(page) {
        if (!recipesGrid) return;

        const cacheKey = RECIPE_CACHE_PREFIX + page;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                // נטען ברקע את הנתונים המעודכנים מהשרת כדי לרענן את הסטייט
                backgroundRefreshProducts(page);
                return JSON.parse(cachedData);
            } catch (e) {
                localStorage.removeItem(cacheKey);
            }
        }

        recipesGrid.innerHTML = `
            <div class="loading-spinner-container" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <p>טוען מתכונים...</p>
            </div>
        `;

        try {
            const response = await fetch(`${GOOGLE_WEB_APP_URL}?type=recipe&page=${page}&limit=${itemsPerPage}&t=${Date.now()}`);
            if (!response.ok) throw new Error("Could not fetch recipes");
            const result = await response.json();

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
        if (result && result.data) {
            allLoadedRecipes = result.data;
            renderCategories(allLoadedRecipes);
            filterAndDisplayRecipes();
            renderPagination(result.totalPages);
        }
    }

    fetchAndRender();

    // יצירת כפתורי קטגוריות דינמית על סמך המתכונים הקיימים בעמוד
    function renderCategories(recipes) {
        if (!categoryFilterContainer) return;

        // איסוף קטגוריות ייחודיות
        const categories = ["הכל", ...new Set(recipes.map((r) => r.category).filter(Boolean))];

        categoryFilterContainer.innerHTML = "";

        categories.forEach((cat) => {
            const btn = document.createElement("button");
            btn.innerText = cat;
            const isActive = currentCategory === cat;
            btn.className = `category-filter-btn ${isActive ? "active" : ""}`;
            btn.style.cssText = `
                padding: 8px 16px;
                border-radius: 20px;
                border: 1px solid #d4a373;
                background: ${isActive ? "#d4a373" : "#fff"};
                color: ${isActive ? "#fff" : "#333"};
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
            `;

            btn.addEventListener("click", () => {
                currentCategory = cat;
                // עדכון עיצוב הכפתורים
                Array.from(categoryFilterContainer.children).forEach((b) => {
                    const selected = b.innerText === cat;
                    b.style.background = selected ? "#d4a373" : "#fff";
                    b.style.color = selected ? "#fff" : "#333";
                });
                filterAndDisplayRecipes();
            });

            categoryFilterContainer.appendChild(btn);
        });
    }

    // סינון והצגה של המתכונים לפי חיפוש טקסטואלי וקטגוריה נבחרה
    function filterAndDisplayRecipes() {
        if (!recipesGrid) return;

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

        const filtered = allLoadedRecipes.filter((recipe) => {
            const matchesCategory = currentCategory === "הכל" || recipe.category === currentCategory;
            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        recipesGrid.innerHTML = "";

        if (filtered.length === 0) {
            recipesGrid.innerHTML = `<p class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 30px;">לא נמצאו מתכונים תחת סינון זה...</p>`;
            return;
        }

        filtered.forEach((recipe) => {
            const card = document.createElement("a");
            card.href = `recipe-detail.html?id=${recipe.id}`;
            card.className = "recipe-card-preview";
            card.innerHTML = `
                <div class="recipe-card-img" style="position: relative;">
                    <img src="${recipe.image}" alt="${recipe.title}" onerror="this.src='images/placeholder.jpg'">
                    ${recipe.category ? `<span class="recipe-tag" style="position: absolute; top: 10px; right: 10px; background: rgba(212, 163, 115, 0.9); color: #fff; padding: 4px 10px; font-size: 12px; border-radius: 12px; font-weight: bold;">${recipe.category}</span>` : ""}
                </div>
                <div class="recipe-card-info">
                    <h3>${recipe.title}</h3>
                    <p>לחצו לצפייה במצרכים ובאופן ההכנה מלא <i class="fa-solid fa-arrow-left"></i></p>
                </div>
            `;
            recipesGrid.appendChild(card);
        });
    }

    // יצירת פג'ינציה (סרגל עמודים)
    function renderPagination(totalPages) {
        if (totalPages <= 1) return;

        // מחיקת פג'ינציה ישנה אם קיימת למניעת כפילויות
        const existingPagination = recipesGrid.querySelector(".pagination-bar");
        if (existingPagination) existingPagination.remove();

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

    // האזנה לחיפוש חי בזמן הקלדה
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filterAndDisplayRecipes();
        });
    }

    // לוגיקת תפריט המבורגר
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            hamburger.classList.toggle("open");
        });
    }

    if (navLinks) {
        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                if (hamburger) {
                    hamburger.classList.remove("open");
                }
            });
        });
    }
});
