import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { listenToCart, setCartQuantity, removeFromCart } from "./cartService.js";

const cartContent = document.getElementById("cart-content");
const cartMessage = document.getElementById("cart-message");

let unsubscribe = null;

onAuthStateChanged(auth, (user) => {
    if (unsubscribe) unsubscribe();

    if (!user) {
        cartMessage.textContent = "You need to be logged in to view your cart.";
        cartContent.innerHTML = `
            <div class="empty-state">
                <h2>Your cart is private.</h2>
                <p>Log in to view and manage your items.</p>
                <a class="btn btn-dark" href="./login.html">Log In</a>
            </div>
        `;
        return;
    }

    cartMessage.textContent = `Signed in as ${user.email}`;

    unsubscribe = listenToCart(user.uid, (items) => {
        renderCart(user.uid, items);
    });
});

function renderCart(uid, items) {
    if (!items.length) {
        cartContent.innerHTML = `
            <div class="empty-state">
                <h2>Your cart is empty.</h2>
                <p>Find something you love in the collection.</p>
                <a class="btn btn-dark" href="./shop.html">Shop Now</a>
            </div>
        `;
        return;
    }

    const total = items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
    );

    cartContent.innerHTML = `
        <div class="cart-items">
            ${items.map((item) => `
                <article class="cart-item">
                    <img src="${escapeHtml(item.imageURL || "https://placehold.co/160x180?text=Urban+Threads")}" alt="${escapeHtml(item.name)}">
                    <div class="cart-item-info">
                        <p class="product-category">URBAN THREADS</p>
                        <h2>${escapeHtml(item.name)}</h2>
                        <p>R${Number(item.price || 0).toFixed(2)} each</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-action="decrease" data-id="${escapeHtml(item.productId)}">−</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-action="increase" data-id="${escapeHtml(item.productId)}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <strong>R${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</strong>
                        <button class="remove-btn" data-id="${escapeHtml(item.productId)}">Remove</button>
                    </div>
                </article>
            `).join("")}
        </div>

        <aside class="cart-summary">
            <h2>Order Summary</h2>
            <div class="summary-row"><span>Items</span><span>${items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</span></div>
            <div class="summary-row total-row"><span>Total</span><strong>R${total.toFixed(2)}</strong></div>
            <button class="btn btn-dark checkout-btn" type="button" id="checkout-btn">Checkout</button>
            <p class="checkout-note">Demo checkout for this assignment.</p>
        </aside>
    `;

    cartContent.querySelectorAll(".quantity-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const item = items.find((entry) => entry.productId === button.dataset.id);
            if (!item) return;

            const newQuantity = button.dataset.action === "increase"
                ? Number(item.quantity) + 1
                : Number(item.quantity) - 1;

            await setCartQuantity(uid, item, newQuantity);
        });
    });

    cartContent.querySelectorAll(".remove-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            await removeFromCart(uid, button.dataset.id);
        });
    });

    document.getElementById("checkout-btn")?.addEventListener("click", () => {
        alert("Checkout is ready for integration with a payment provider.");
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
