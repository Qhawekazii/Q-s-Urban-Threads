import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import { db, auth } from "./firebaseConfig.js";
import { addToCart } from "./cartService.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const grid = document.getElementById("product-grid");
const message = document.getElementById("shop-message");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

let products = [];
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

async function loadProducts() {
    try {
        const snapshot = await getDocs(collection(db, "products"));

        products = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data()
        }));

        if (!products.length) {
            message.textContent = "No products have been added to Firestore yet.";
            grid.innerHTML = "";
            return;
        }

        message.textContent = `${products.length} product${products.length === 1 ? "" : "s"} available.`;
        renderProducts();
    } catch (error) {
        console.error("Firestore products error:", error);
        message.textContent = "We couldn't load the products. Check your Firestore setup and rules.";
        grid.innerHTML = "";
    }
}

function renderProducts() {
    const search = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filtered = products.filter((product) => {
        const matchesSearch =
            !search ||
            String(product.name || "").toLowerCase().includes(search) ||
            String(product.description || "").toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || product.category === category;

        return matchesSearch && matchesCategory;
    });

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
                window.location.href = "./login.html";
                return;
            }

            const product = products.find((item) => item.id === button.dataset.id);
            if (!product) return;

            button.disabled = true;
            try {
                await addToCart(currentUser.uid, product);
                button.textContent = "Added ✓";
                setTimeout(() => {
                    button.textContent = "Add to Cart";
                    button.disabled = false;
                }, 900);
            } catch (error) {
                console.error("Add to cart error:", error);
                button.textContent = "Try again";
                button.disabled = false;
            }
        });
    });
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

const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get("category");
if (requestedCategory && [...categoryFilter.options].some((option) => option.value === requestedCategory)) {
    categoryFilter.value = requestedCategory;
}

loadProducts();
