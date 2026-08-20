import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import { db, auth } from "./firebaseConfig.js";
import { addToCart } from "./cartService.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { showToast } from "./main.js";

const grid = document.getElementById("product-grid");
const message = document.getElementById("shop-message");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");

let products = [];
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// Sample products data with different categories
const sampleProducts = [
    // T-Shirts
    {
        name: "Classic Urban Tee",
        description: "Comfortable cotton blend t-shirt perfect for everyday wear",
        price: 199.99,
        category: "T-Shirts",
        imageURL: "https://placehold.co/600x700?text=Urban+Tee"
    },
    {
        name: "Street Style Graphic Tee",
        description: "Bold graphic design with modern aesthetic",
        price: 249.99,
        category: "T-Shirts",
        imageURL: "https://placehold.co/600x700?text=Graphic+Tee"
    },
    {
        name: "Minimal Premium Shirt",
        description: "Sleek minimalist design in premium fabric",
        price: 279.99,
        category: "T-Shirts",
        imageURL: "https://placehold.co/600x700?text=Minimal+Shirt"
    },
    // Hoodies
    {
        name: "Oversized Streetwear Hoodie",
        description: "Relaxed fit hoodie perfect for layering",
        price: 449.99,
        category: "Hoodies",
        imageURL: "https://placehold.co/600x700?text=Oversized+Hoodie"
    },
    {
        name: "Tech Fleece Hoodie",
        description: "Advanced fleece technology for comfort and style",
        price: 529.99,
        category: "Hoodies",
        imageURL: "https://placehold.co/600x700?text=Tech+Hoodie"
    },
    {
        name: "Vintage Wash Hoodie",
        description: "Retro styled hoodie with vintage wash effect",
        price: 399.99,
        category: "Hoodies",
        imageURL: "https://placehold.co/600x700?text=Vintage+Hoodie"
    },
    // Jackets
    {
        name: "Urban Denim Jacket",
        description: "Classic denim with modern urban cuts",
        price: 699.99,
        category: "Jackets",
        imageURL: "https://placehold.co/600x700?text=Denim+Jacket"
    },
    {
        name: "Bomber Jacket Pro",
        description: "High-quality bomber jacket with premium materials",
        price: 799.99,
        category: "Jackets",
        imageURL: "https://placehold.co/600x700?text=Bomber+Jacket"
    },
    {
        name: "Windbreaker Essential",
        description: "Lightweight and water-resistant windbreaker",
        price: 549.99,
        category: "Jackets",
        imageURL: "https://placehold.co/600x700?text=Windbreaker"
    },
    // Pants
    {
        name: "Street Cargo Pants",
        description: "Functional cargo pants with urban style",
        price: 349.99,
        category: "Pants",
        imageURL: "https://placehold.co/600x700?text=Cargo+Pants"
    },
    {
        name: "Slim Fit Jeans",
        description: "Modern slim fit with authentic denim feel",
        price: 299.99,
        category: "Pants",
        imageURL: "https://placehold.co/600x700?text=Slim+Jeans"
    },
    {
        name: "Tapered Track Pants",
        description: "Comfortable track pants with tapered leg",
        price: 279.99,
        category: "Pants",
        imageURL: "https://placehold.co/600x700?text=Track+Pants"
    },
    // Accessories
    {
        name: "Street Snapback Cap",
        description: "Classic snapback with embroidered logo",
        price: 129.99,
        category: "Accessories",
        imageURL: "https://placehold.co/600x700?text=Snapback+Cap"
    },
    {
        name: "Premium Canvas Belt",
        description: "Durable canvas belt with metal buckle",
        price: 159.99,
        category: "Accessories",
        imageURL: "https://placehold.co/600x700?text=Canvas+Belt"
    },
    {
        name: "Crossbody Street Bag",
        description: "Stylish crossbody bag for urban commuters",
        price: 389.99,
        category: "Accessories",
        imageURL: "https://placehold.co/600x700?text=Crossbody+Bag"
    },
    {
        name: "Urban Beanie",
        description: "Comfortable wool blend beanie",
        price: 99.99,
        category: "Accessories",
        imageURL: "https://placehold.co/600x700?text=Beanie"
    }
];

async function loadProducts() {
    message.textContent = "Loading products...";
    grid.innerHTML = `
        <div class="loading-state" aria-hidden="true">
            <span></span><span></span><span></span>
        </div>
    `;

    try {
        const snapshot = await getDocs(collection(db, "products"));

        products = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data()
        })).filter(isValidProduct);

        if (!products.length) {
            message.textContent = "No products have been added to Firestore yet.";
            grid.innerHTML = "";
            return;
        }

        populateCategories();
        renderProducts();
    } catch (error) {
        console.error("Firestore products error:", error);
        message.textContent = "We couldn't load the products. Check your Firestore setup and rules.";
        grid.innerHTML = `
            <div class="empty-state">
                <h2>Products unavailable</h2>
                <p>Firestore could not be reached or the rules blocked the request.</p>
            </div>
        `;
        showToast("Products could not be loaded.", "error");
    }
}

function renderProducts() {
    const search = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const sort = sortSelect.value;

    const filtered = products.filter((product) => {
        const matchesSearch =
            !search ||
            String(product.name || "").toLowerCase().includes(search) ||
            String(product.description || "").toLowerCase().includes(search) ||
            String(product.category || "").toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || normalizeCategory(product.category) === normalizeCategory(category);

        return matchesSearch && matchesCategory;
    }).sort((a, b) => sortProducts(a, b, sort));

    message.textContent = `${filtered.length} of ${products.length} product${products.length === 1 ? "" : "s"} shown.`;

    if (!filtered.length) {
        grid.innerHTML = `<div class="empty-state"><h2>No products found</h2><p>Try another search or category.</p></div>`;
        return;
    }

    grid.innerHTML = filtered.map((product) => {
        const price = Number(product.price || 0).toFixed(2);
        const image = product.imageURL || "https://placehold.co/600x700?text=Urban+Threads";

        return `
            <article class="product-card">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy">
                <div class="product-info">
                    <p class="product-category">${escapeHtml(product.category || "Streetwear")}</p>
                    <h2>${escapeHtml(product.name || "Product")}</h2>
                    <p>${escapeHtml(product.description || "")}</p>
                    <div class="product-bottom">
                        <strong>R${price}</strong>
                        <button class="btn btn-dark add-to-cart" data-id="${escapeHtml(product.id)}">Add to Cart</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    grid.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", async () => {
            if (!currentUser) {
                showToast("Please log in to add items to your cart.", "error");
                window.location.href = "./login.html";
                return;
            }

            const product = products.find((item) => item.id === button.dataset.id);
            if (!product) return;

            button.disabled = true;
            try {
                await addToCart(currentUser.uid, product);
                button.textContent = "Added";
                showToast(`${product.name} added to your cart.`, "success");
                setTimeout(() => {
                    button.textContent = "Add to Cart";
                    button.disabled = false;
                }, 900);
            } catch (error) {
                console.error("Add to cart error:", error);
                button.textContent = "Try again";
                button.disabled = false;
                showToast("Could not add that item. Please try again.", "error");
            }
        });
    });
}

function isValidProduct(product) {
    return Boolean(
        product.id &&
        product.name &&
        typeof product.price !== "undefined" &&
        product.category &&
        product.description &&
        product.imageURL
    );
}

function populateCategories() {
    const categories = [...new Set(products.map((product) => String(product.category).trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));

    const current = categoryFilter.value;
    categoryFilter.innerHTML = [
        `<option value="All">All categories</option>`,
        ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    ].join("");

    if (categories.some((category) => normalizeCategory(category) === normalizeCategory(current))) {
        categoryFilter.value = categories.find((category) => normalizeCategory(category) === normalizeCategory(current));
    }
}

function sortProducts(a, b, sort) {
    if (sort === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
    if (sort === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
    if (sort === "name-asc") return String(a.name || "").localeCompare(String(b.name || ""));
    return 0;
}

function normalizeCategory(value) {
    return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

searchInput?.addEventListener("input", renderProducts);
categoryFilter?.addEventListener("change", renderProducts);
sortSelect?.addEventListener("change", renderProducts);

const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get("category");
if (requestedCategory) {
    categoryFilter.value = requestedCategory.trim();
}

loadProducts();
