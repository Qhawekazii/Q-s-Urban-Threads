import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { listenToCart, setCartQuantity, removeFromCart } from "./cartService.js";
import { showToast } from "./main.js";

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
        showToast("Log in to access your cart.", "error");
        return;
    }

    cartMessage.textContent = `Signed in as ${user.email}`;

    unsubscribe = listenToCart(user.uid, (items) => {
        renderCart(user.uid, items);
    }, (error) => {
        console.error("Cart load error:", error);
        cartMessage.textContent = "We couldn't load your cart. Please check your connection and Firestore rules.";
        cartContent.innerHTML = `
            <div class="empty-state">
                <h2>Cart unavailable</h2>
                <p>Your cart could not be loaded right now.</p>
            </div>
        `;
        showToast("Cart could not be loaded.", "error");
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

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
    );
    const total = subtotal;
    const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

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
            <div class="summary-row"><span>Items</span><span>${itemCount}</span></div>
            <div class="summary-row"><span>Subtotal</span><span>R${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Delivery</span><span>Calculated at checkout</span></div>
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

            button.disabled = true;
            try {
                await setCartQuantity(uid, item, newQuantity);
                showToast(newQuantity <= 0 ? `${item.name} removed from cart.` : "Cart quantity updated.", "success");
            } catch (error) {
                console.error("Quantity update error:", error);
                showToast("Could not update cart quantity.", "error");
                button.disabled = false;
            }
        });
    });

    cartContent.querySelectorAll(".remove-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const item = items.find((entry) => entry.productId === button.dataset.id);
            button.disabled = true;
            try {
                await removeFromCart(uid, button.dataset.id);
                showToast(`${item?.name || "Item"} removed from cart.`, "success");
            } catch (error) {
                console.error("Remove cart item error:", error);
                showToast("Could not remove that item.", "error");
                button.disabled = false;
            }
        });
    });

    document.getElementById("checkout-btn")?.addEventListener("click", () => {
        showToast("Checkout is protected and ready for payment integration.", "info");
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
