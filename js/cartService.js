import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import { db } from "./firebaseConfig.js";

function cartItemRef(uid, productId) {
    return doc(db, "users", uid, "cart", productId);
}

async function addToCart(uid, product) {
    const ref = cartItemRef(uid, product.id);
    const existing = await getDoc(ref);
    const currentQuantity = existing.exists() ? Number(existing.data().quantity || 0) : 0;

    await setDoc(ref, {
        productId: product.id,
        name: product.name,
        price: Number(product.price || 0),
        imageURL: product.imageURL || "",
        quantity: currentQuantity + 1
    });
}

async function setCartQuantity(uid, item, quantity) {
    const ref = cartItemRef(uid, item.productId);

    if (quantity <= 0) {
        await deleteDoc(ref);
        return;
    }

    await setDoc(ref, {
        ...item,
        price: Number(item.price || 0),
        quantity
    });
}

async function removeFromCart(uid, productId) {
    await deleteDoc(cartItemRef(uid, productId));
}

function listenToCart(uid, callback) {
    return onSnapshot(collection(db, "users", uid, "cart"), (snapshot) => {
        const items = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data()
        }));
        callback(items);
    });
}

export { addToCart, setCartQuantity, removeFromCart, listenToCart };
