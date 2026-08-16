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

    // 2. טעינת המוצרים מקובץ ה-JSON - מבנה מותאם אישית
    fetch("data/products/index.json")
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then((data) => {
            const grid = document.getElementById("menu-grid");
            if (!grid) return;

            grid.innerHTML = "";

            data.bakery_items.forEach((item) => {
                const card = document.createElement("div");
                // שימוש במחלקה menu-card כדי שה-CSS יזהה אותה
                card.className = `menu-card ${!item.inStock ? "out-of-stock" : ""}`;

                // בניית ה-HTML הפנימי לפי המבנה שציירת
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
        })
        .catch((error) => console.error("Error loading products:", error));

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
