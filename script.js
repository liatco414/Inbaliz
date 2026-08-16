document.addEventListener("DOMContentLoaded", () => {
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

    // 2. טעינת כל קבצי ה-JSON מתיקיית המוצרים בגיטהאב
    async function loadProductsFolder() {
        try {
            // החליפי את שם המשתמש ושם הריפו שלך בגיטהאב כאן למטה!
            const GITHUB_USER = "YOUR_GITHUB_USERNAME";
            const REPO_NAME = "YOUR_REPO_NAME";

            const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/data/products`);
            if (!response.ok) throw new Error("Could not fetch products folder");

            const files = await response.json();
            const jsonFiles = files.filter(file => file.name.endsWith('.json'));
            
            const productsPromises = jsonFiles.map(file => fetch(file.download_url).then(res => res.json()));
            return await Promise.all(productsPromises);
        } catch (error) {
            console.error("Error loading products:", error);
            return [];
        }
    }

    loadProductsFolder().then((products) => {
        const grid = document.getElementById("menu-grid");
        if (!grid) return;

        grid.innerHTML = "";

        if (products.length === 0) {
            grid.innerHTML = `<p class="no-results">לא נמצאו מוצרים...</p>`;
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
