# Q's Urban Threads

Q's Urban Threads is a responsive streetwear storefront built for a Firebase e-commerce assignment. It uses plain HTML, CSS, and JavaScript with Firebase Authentication and Cloud Firestore. The app lets visitors browse a live product catalogue, search and filter products, create an account, and maintain a private shopping cart.

## App overview

The experience is organized around four pages:

- `index.html` - branded home page, hero section, and category entry points.
- `shop.html` - Firestore-backed product catalogue with search, category filtering, and sorting.
- `login.html` - email/password login and account creation.
- `cart.html` - authenticated users' private cart with quantity controls, removal, and totals.

Every page shares the same navigation, favicon, responsive styling, theme toggle, authentication state, and cart count. The visual system uses pale pink, deep pink, black, rounded controls, a playful heading font, card lift effects, and pink hover glows. Dark mode preserves the pink accent system with a dark background and deep-pink footer.

## Main user flows

### Browse and discover

1. A visitor starts on the home page.
2. Category cards link to the shop with a category query parameter.
3. The shop loads products from the Firestore `products` collection.
4. Search matches product names, descriptions, and categories.
5. The category filter is populated from the categories returned by Firestore.
6. Products can be sorted by featured order, price, or name.

### Create an account and sign in

1. A visitor opens the Login page.
2. Signup validates the name and minimum password length in the browser.
3. Firebase Authentication creates the email/password account.
4. A matching profile is stored at `users/{uid}` in Firestore.
5. Login and logout state persists through Firebase Authentication.
6. The navigation displays the user's name, or the part of the email before `@` when no display name exists.

### Manage a cart

1. Logged-out visitors are sent to Login when they try to add a product.
2. Signed-in users can add products from the shop.
3. Cart items are stored at `users/{uid}/cart/{productId}`.
4. Users can increase or decrease quantities and remove items.
5. The cart displays item count, subtotal, delivery text, and total.
6. The Checkout button is currently a protected placeholder that reports that payment integration is ready; no payment gateway is connected.

## Firebase setup

The Firebase web configuration is kept in `js/firebaseConfig.js`. The browser configuration includes the Firebase project identifiers required by the client SDK. The API key is not a service-account secret, but Firestore Rules and Authentication must still be configured correctly.

Before testing, complete these steps in Firebase Console:

1. Enable Authentication -> Sign-in method -> Email/Password.
2. Create a Cloud Firestore database.
3. Create a `products` collection.
4. Add product documents using the required fields below.
5. Publish the rules from `firestore.rules`.
6. Add the deployed site domain to Authentication -> Settings -> Authorized domains when needed.

### Product document shape

```json
{
   "name": "Oversized Hoodie",
   "price": 449.99,
   "category": "Hoodies",
   "description": "Soft cotton hoodie in an oversized fit.",
   "imageURL": "https://example.com/hoodie.jpg"
}
```

The shop only renders documents that contain a product id, name, price, category, description, and image URL.

## Firestore security model

The rules in `firestore.rules` enforce these boundaries:

- Products are publicly readable.
- Product writes are blocked from browser code.
- A signed-in user can read and write only their own `users/{uid}` profile.
- A signed-in user can read and write only their own `users/{uid}/cart/{productId}` documents.
- User profiles are restricted to the expected fields and preserve the profile uid.
- Cart items are restricted to expected fields, positive integer quantities, and quantities from 1 to 99.

Products should be added through Firebase Console or trusted administrative tooling. The client does not expose a product seeding function.

## Project structure

```text
index.html              Home page
shop.html               Product catalogue
login.html              Login and signup
cart.html               Private cart
css/style.css           Shared theme, layout, responsive rules, and interactions
js/firebaseConfig.js    Firebase initialization and exported services
js/main.js              Navigation, theme, auth state, cart count, and toasts
js/auth.js              Login, signup, profile creation, and auth errors
js/products.js          Product loading, validation, search, filters, sorting, and add-to-cart
js/cart.js              Protected cart rendering and cart controls
js/cartService.js       Firestore cart operations
firestore.rules         Firestore access and field validation rules
assets/favicon.svg      Local site favicon
```

## Implemented features

- Responsive home, shop, login, and cart pages.
- Dynamic Firestore product loading with loading and error states.
- Search across product name, category, and description.
- Dynamic category filtering.
- Featured, price ascending, price descending, and name sorting.
- Email/password signup and login.
- User profile creation with display name and email.
- Persistent Firebase auth state and logout.
- Private per-user Firestore carts.
- Add, remove, increase, and decrease cart operations.
- Empty-cart and logged-out cart states.
- Subtotal, total, and cart quantity count.
- Protected add-to-cart and cart access behavior.
- Persistent light/dark theme preference using `localStorage`.
- Mobile navigation menu.
- Toast notifications for auth and cart feedback.
- Keyboard focus indicators and labeled cart controls.
- Local SVG favicon.
- Pale-pink, black, and deep-pink visual theme with responsive card hover effects.

## Running locally

This is a static frontend and does not require a build step. Run it through Live Server or another static web server so ES modules and Firebase requests work correctly.

Recommended flow:

1. Open the project in VS Code.
2. Start Live Server from `index.html`, or use another local static server.
3. Confirm Firebase is configured before opening Shop or Login.
4. Test both logged-out and logged-in flows.

Do not open the HTML files directly with a `file://` URL.

## Deployment

### Netlify

- Build command: leave blank.
- Publish directory: `.`

### Firebase CLI

If Firebase CLI is installed and authenticated, deploy the Firestore rules with:

```bash
firebase deploy --only firestore:rules
```

The hosting provider must serve the project as a static site. After deployment, verify the deployed domain in Firebase Authentication settings.

## Manual verification checklist

- Home page loads and category links open the correct shop filter.
- Shop products load from Firestore.
- Search, category filtering, sorting, loading, empty, and error states work.
- Signup creates both an Auth user and a `users/{uid}` document.
- Login redirects to Shop and displays the signed-in user.
- Logout clears the signed-in navigation state.
- Logged-out users cannot access another user's cart.
- Logged-in users can add, update, and remove cart items.
- Cart totals update after every quantity change.
- Theme preference persists after refresh.
- Navigation and grids remain usable on mobile widths.
- Keyboard users can see focus indicators and operate the forms and controls.

## Current limitations

- Checkout is a protected UI placeholder; it does not process payments or create orders.
- Product price data stored in a cart is supplied by the browser. The current rules validate its type, but a production checkout should recalculate prices from trusted product data on a server.
- Products must be created in Firebase Console or trusted admin tooling because client-side product writes are disabled.

## Security note

Never place a Firebase service-account private key in this frontend project. The browser Firebase configuration is expected to be public. The important protections are Firebase Authentication and restrictive Firestore Rules.
