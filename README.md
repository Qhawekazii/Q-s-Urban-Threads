# Q's Urban Threads

A Firebase-powered streetwear e-commerce assignment using HTML, CSS, JavaScript, Firebase Authentication and Firestore.

## Pages

- `index.html` — landing page and category entry points
- `shop.html` — Firestore product grid with search, category filtering and price/name sorting
- `login.html` — email/password signup and login
- `cart.html` — protected user cart stored in Firestore

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
5. Run the project through Live Server or any static web server.

If Firebase CLI is available and you are signed in, deploy the rules with:

```bash
firebase deploy --only firestore:rules
```

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

## Implemented features

- Products load dynamically from the Firestore `products` collection.
- Search checks product name, category and description.
- Category filtering uses the categories available in Firestore.
- Sorting supports featured, price low-to-high, price high-to-low and name A-to-Z.
- Email/password signup creates a matching `users/{uid}` Firestore document.
- Login/logout state persists through Firebase Authentication.
- The navbar shows the signed-in user's name or email and keeps cart count updated.
- Cart items are stored under `users/{uid}/cart/{productId}`.
- Cart supports add, remove, increase, decrease, empty state, subtotal and total.
- Cart and checkout controls are protected from logged-out users.
- Dark mode, toast notifications and mobile navigation are available across pages.

## Firestore rules summary

- `products` are publicly readable.
- Product writes are blocked from client-side code.
- Users can read/write only their own `users/{uid}` document.
- Users can read/write only their own `users/{uid}/cart/{productId}` documents.

## Netlify deployment

- Build command: leave blank
- Publish directory: `.`

## Important

The Firebase web API key is not a password; it is normally included in browser applications. The important protection is Firestore Security Rules and Firebase Authentication. Never add a Firebase service-account private key to this frontend project.
