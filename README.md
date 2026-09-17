## rn-store (Bazaar)

Portfolio React Native E-commerce app. Six complete flows, typed end to end, not a pile of half-done screens.

## Demo path
Login → search → product → cart → checkout → orders.

## Stack
- Expo + TypeScript (strict).
- React Navigation (auth stack, nested native stacks, bottom tabs).
- TanStack Query for catalog/product (server state: cache, pagination, retry).
- Zustand for session, cart, and orders (client state). Cart is not in React Query because it is not server-backed here.
- DummyJSON for products, search, categories, and JWT login. Orders cannot persist there, so they are written to AsyncStorage keyed by user id.


## Architecture

```
src/
  core/           providers, React Navigation, QueryClient
  features/      auth, catalog, product, cart, checkout, orders, profile
  shared/        API client, theme tokens, UI, formatters
```

- API client attaches the JWT, maps errors, and logs out on 401.
- Catalog `FlatList` is paginated (`useInfiniteQuery`), memoized cards, windowing tuned, search debounced.
- Prices from DummyJSON are USD; they are converted and shown as ₹ with `en-IN`.
- Checkout is India-shaped: 10-digit mobile, pincode, Pay on delivery vs UPI/card. UPI/card opens a mock payment sheet.

```
UI ──► TanStack Query ──► API client + JWT ──► DummyJSON
UI ──► Zustand cart/session/orders ──► AsyncStorage
```

## Run

-npm install
-npx expo start / npm start


Open in **Expo Go** (iOS or Android).

**Demo login** (from [DummyJSON users](https://dummyjson.com/users)):

- username: `emilys`
- password: `emilyspass`

Tap the hint on the login screen to fill them.






