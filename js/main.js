import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const userArea = document.getElementById("user-area");
const cartCount = document.getElementById("cart-count");

function renderUser(user) {
    if (!userArea) return;

    if (user) {
        const name = user.displayName || user.email.split("@")[0];
        userArea.innerHTML = `
            <span class="welcome-user">Hi, ${escapeHtml(name)}</span>
            <button id="logout-btn" class="nav-button" type="button">Logout</button>
        `;
        document.getElementById("logout-btn").addEventListener("click", async () => {
            await signOut(auth);
            window.location.href = "./index.html";
        });
    } else {
        userArea.innerHTML = `<a href="./login.html">Login</a>`;
    }
}

function listenToCartCount(user) {
    if (!cartCount) return;

    if (!user) {
        cartCount.textContent = "0";
        return;
    }

    const cartRef = collection(db, "users", user.uid, "cart");
    onSnapshot(cartRef, (snapshot) => {
        const total = snapshot.docs.reduce((sum, doc) => sum + Number(doc.data().quantity || 0), 0);
        cartCount.textContent = String(total);
    }, (error) => {
        console.error("Cart count error:", error);
        cartCount.textContent = "0";
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

onAuthStateChanged(auth, (user) => {
    renderUser(user);
    listenToCartCount(user);
});

console.log("Q's Urban Threads: Firebase connected.");
