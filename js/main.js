import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const userArea = document.getElementById("user-area");
const cartCount = document.getElementById("cart-count");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.getElementById("nav-links");
const themeToggle = document.getElementById("theme-toggle");

let unsubscribeCartCount = null;

function initTheme() {
    const savedTheme = localStorage.getItem("urbanThreadsTheme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (prefersDark ? "dark" : "light");

    document.documentElement.dataset.theme = theme;
    updateThemeButton(theme);
}

function updateThemeButton(theme) {
    if (!themeToggle) return;
    const nextTheme = theme === "dark" ? "light" : "dark";
    const label = `Switch to ${nextTheme} mode`;
    themeToggle.textContent = theme === "dark" ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("title", label);
}

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("urbanThreadsTheme", nextTheme);
    updateThemeButton(nextTheme);
    showToast(`${nextTheme === "dark" ? "Dark" : "Light"} mode enabled.`, "success");
});

menuToggle?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

function renderUser(user) {
    if (!userArea) return;

    if (user) {
        const name = user.displayName || user.email.split("@")[0];
        userArea.innerHTML = `
            <span class="welcome-user">Hi, ${escapeHtml(name)}</span>
            <button id="logout-btn" class="nav-button" type="button">Logout</button>
        `;
        document.getElementById("logout-btn").addEventListener("click", async () => {
            try {
                await signOut(auth);
                showToast("You have been logged out.", "success");
                window.location.href = "./index.html";
            } catch (error) {
                console.error("Logout error:", error);
                showToast("Logout failed. Please try again.", "error");
            }
        });
    } else {
        userArea.innerHTML = `<a href="./login.html">Login</a>`;
    }
}

function listenToCartCount(user) {
    if (!cartCount) return;

    if (unsubscribeCartCount) {
        unsubscribeCartCount();
        unsubscribeCartCount = null;
    }

    if (!user) {
        cartCount.textContent = "0";
        return;
    }

    const cartRef = collection(db, "users", user.uid, "cart");
    unsubscribeCartCount = onSnapshot(cartRef, (snapshot) => {
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

function showToast(message, type = "info") {
    let toastRegion = document.getElementById("toast-region");

    if (!toastRegion) {
        toastRegion = document.createElement("div");
        toastRegion.id = "toast-region";
        toastRegion.className = "toast-region";
        toastRegion.setAttribute("aria-live", "polite");
        document.body.appendChild(toastRegion);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastRegion.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add("leaving");
        window.setTimeout(() => toast.remove(), 250);
    }, 2800);
}

initTheme();

onAuthStateChanged(auth, (user) => {
    renderUser(user);
    listenToCartCount(user);
});

export { showToast };
