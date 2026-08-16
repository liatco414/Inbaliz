document.addEventListener("DOMContentLoaded", () => {
    const recipesGrid = document.getElementById("recipesGrid");
    const searchInput = document.getElementById("recipeSearch");
    let allRecipes = [];

    // טעינת המתכונים מתוך ה-JSON
    fetch("data/recipes.json")
        .then((response) => response.json())
        .then((data) => {
            allRecipes = data;
            displayRecipes(allRecipes);
        })
        .catch((error) => console.error("שגיאה בטעינת המתכונים:", error));

    // פונקציה שמציגה את המתכונים במסך
    function displayRecipes(recipesToDisplay) {
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
                    <img src="${recipe.image}" alt="${recipe.title}">
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
            const filtered = allRecipes.filter((recipe) => recipe.title.toLowerCase().includes(searchTerm));
            displayRecipes(filtered);
        });
    }
});
