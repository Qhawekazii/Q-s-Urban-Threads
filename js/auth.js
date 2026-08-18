import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import { auth, db } from "./firebaseConfig.js";
import { showToast } from "./main.js";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

function showMessage(element, message, type = "error") {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

function friendlyAuthError(code) {
    const messages = {
        "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Your password must be at least 6 characters.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/missing-password": "Please enter your password.",
        "auth/too-many-requests": "Too many attempts. Please wait a little and try again.",
        "auth/network-request-failed": "Network problem. Check your internet connection and try again."
    };
    return messages[code] || "Something went wrong. Please try again.";
}

signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const message = document.getElementById("signup-message");
    const button = signupForm.querySelector("button[type='submit']");

    if (name.length < 2) {
        showMessage(message, "Please enter your name.");
        return;
    }

    if (password.length < 6) {
        showMessage(message, "Your password must be at least 6 characters.");
        return;
    }

    try {
        button.disabled = true;
        button.textContent = "Creating...";
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });

        await setDoc(doc(db, "users", credential.user.uid), {
            uid: credential.user.uid,
            name,
            email,
            createdAt: serverTimestamp()
        }, { merge: true });

        showMessage(message, "Account created successfully! Redirecting...", "success");
        showToast("Account created. Welcome to Q's Urban Threads.", "success");
        signupForm.reset();

        setTimeout(() => {
            window.location.href = "./shop.html";
        }, 800);
    } catch (error) {
        console.error("Signup error:", error);
        showMessage(message, friendlyAuthError(error.code));
        showToast(friendlyAuthError(error.code), "error");
    } finally {
        button.disabled = false;
        button.textContent = "Create Account";
    }
});

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");
    const button = loginForm.querySelector("button[type='submit']");

    try {
        button.disabled = true;
        button.textContent = "Logging in...";
        await signInWithEmailAndPassword(auth, email, password);

        showMessage(message, "Login successful! Redirecting...", "success");
        showToast("Logged in successfully.", "success");

        setTimeout(() => {
            window.location.href = "./shop.html";
        }, 700);
    } catch (error) {
        console.error("Login error:", error);
        showMessage(message, friendlyAuthError(error.code));
        showToast(friendlyAuthError(error.code), "error");
    } finally {
        button.disabled = false;
        button.textContent = "Login";
    }
});
