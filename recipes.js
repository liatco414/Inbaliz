document.addEventListener("DOMContentLoaded", () => {
    const recipesGrid = document.getElementById("recipesGrid");
    const searchInput = document.getElementById("recipeSearch");
    let allRecipes = [];

    // טעינת כל קבצי ה-JSON מתיקיית המתכונים בגיטהאב
    async function loadRecipesFolder() {
        try {
            // החליפי את שם המשתמש ושם הריפו שלך בגיטהאב כאן למטה!
            const GITHUB_USER = "YOUR_GITHUB_USERNAME";
            const REPO_NAME = "YOUR_REPO_NAME";

            const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/data/recipes`);
            if (!response.ok) throw new Error("Could not fetch recipes folder");

            const files = await response.json();
            const jsonFiles = files.filter(file => file.name.endsWith('.json'));
            
            const recipesPromises = jsonFiles.map(file => fetch(file.download_url).then(res => res.json()));
            return await Promise.all(recipesPromises);
        } catch (error) {
            console.error("שגיאה בטעינת המתכונים:", error);
            return [];
        }
    }

    loadRecipesFolder().then((recipes) => {
        allRecipes = recipes;
        displayRecipes(allRecipes);
    });

    // פונקציה שמציגה את המתכונים במסך
    function displayRecipes(recipesToDisplay) {
        if (!recipesGrid) return;
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
            const filtered = allRecipes.filter((recipe) => recipe.title && recipe.title.toLowerCase().includes(searchTerm));
            displayRecipes(filtered);
        });
    }
});
