# Q's Urban Threads

A Firebase-powered streetwear e-commerce assignment using HTML, CSS, JavaScript, Firebase Authentication and Firestore.

## Firebase connection

`js/firebaseConfig.js` contains the Firebase web configuration.

All other JavaScript files import `auth` and/or `db` from that file.

## Before testing

1. In Firebase Console, enable:
   - Authentication → Sign-in method → Email/Password
   - Firestore Database
2. Create a Firestore collection called `products`.
3. Add products with these fields:
   - `name` — string
   - `price` — number
   - `category` — string
   - `description` — string
   - `imageURL` — string
4. Publish the contents of `firestore.rules` in Firebase Console → Firestore Database → Rules.
5. Run the project through Live Server. Do not open HTML files using `file:///`.

## Example product

{
  "name": "Oversized Hoodie",
  "price": 49.99,
  "category": "Hoodies",
  "description": "Soft cotton hoodie in oversized fit.",
  "imageURL": "https://example.com/hoodie.jpg"
}

## Project flow

index.html
→ main.js
→ firebaseConfig.js
→ Firebase

login.html
→ auth.js
→ Firebase Authentication + user profile in Firestore

shop.html
→ products.js
→ products collection

cart.html
→ cart.js + cartService.js
→ users/{uid}/cart/{productId}

## Important

The Firebase web API key is not a password; it is normally included in browser applications. The important protection is Firestore Security Rules and Firebase Authentication. Never add a Firebase service-account private key to this frontend project.
