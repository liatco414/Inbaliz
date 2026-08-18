document.addEventListener("DOMContentLoaded", () => {
    // הכתובת שקיבלת מ-Google Apps Script (Web App URL)
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxs41gKQuTUlxTr0x7y1HT19QmK7Kiw_F0gYUbXQjZJJytOf_IhJSlBm44-OD5As3xE/exec";

    const recipesGrid = document.getElementById("recipesGrid");
    const searchInput = document.getElementById("recipeSearch");
    let allRecipes = [];

    // טעינת המתכונים מ-Google Sheets (עם פרמטר type=recipe וחותמת זמן למניעת Cache)
    async function loadRecipes() {
        if (!recipesGrid) return;

        // --- כאן אנחנו מוסיפים את ה-Loader ---
        recipesGrid.innerHTML = `
            <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
                <p>טוען מתכונים מהמטבח...</p>
            </div>
        `;

        try {
            // הוספנו כאן את &t=${Date.now()} כדי שהדפדפן תמיד יביא את הנתונים החדשים מהשרת ולא מהזיכרון
            const response = await fetch(`${GOOGLE_WEB_APP_URL}?type=recipe&t=${Date.now()}`);
            if (!response.ok) throw new Error("Could not fetch recipes from Google Sheets");
            return await response.json();
        } catch (error) {
            console.error("שגיאה בטעינת המתכונים:", error);
            return [];
        }
    }

    loadRecipes().then((recipes) => {
        allRecipes = recipes || [];
        displayRecipes(allRecipes);
    });

    // פונקציה שמציגה את המתכונים במסך
    function displayRecipes(recipesToDisplay) {
        if (!recipesGrid) return;

        // כאן ה-displayRecipes כבר מנקה את ה-Loader אוטומטית ברגע שהיא רצה
        recipesGrid.innerHTML = "";

        if (recipesToDisplay.length === 0) {
            recipesGrid.innerHTML = `<p class="no-results">לא נמצאו מתכונים העונים לחיפוש...</p>`;
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
    }

    // חיפוש חי לפי שם המתכון
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filtered = allRecipes.filter((recipe) => recipe.title && recipe.title.toLowerCase().includes(searchTerm));
            displayRecipes(filtered);
        });
    }
});
