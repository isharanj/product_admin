# Product Admin Dashboard

A production-oriented Product Admin Dashboard built with Next.js, React, TypeScript, Tailwind CSS, and Axios against the public [DummyJSON](https://dummyjson.com) API.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- DummyJSON

## Features

- Email/password-style login via DummyJSON auth (`emilys` / `emilyspass`)
- Route protection with Next.js middleware (cookie) + client AuthGuard
- Logout with auth state cleared
- Product list with desktop table + mobile cards
- Debounced search with AbortController + stale-response protection
- Category filtering
- Sorting by price, rating, and title (asc/desc)
- Pagination with page size 10 / 20 / 50
- URL-driven state for page, page size, search, category, and sort
- Product details with images and reviews
- Not-found handling for invalid product IDs
- Add / edit / delete products with validation and confirmation
- Session-local mutation layer (DummyJSON does not persist writes)
- Loading skeletons, empty states, normalized API errors, and retry actions
- Responsive admin shell with sidebar navigation

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

## Environment

Copy `.env.example` if you want to override the API base URL:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | DummyJSON base URL | `https://dummyjson.com` |

No secrets are required for this assignment.

## Authentication

Demo credentials (provided by DummyJSON):

- Username: `emilys`
- Password: `emilyspass`

Login calls `POST /auth/login` and stores:

1. `accessToken` in `localStorage` (Axios Authorization header)
2. The same token in a non-HttpOnly cookie (`pad_access_token`) so middleware can protect routes
3. Basic user profile in `localStorage`

### Auth storage tradeoff

A non-HttpOnly cookie is readable by JavaScript. That is weaker than an HttpOnly cookie issued by a first-party backend, but DummyJSON returns the JWT to the browser and this is a frontend assignment against a public demo API. The goal is realistic client auth + middleware protection, not pretending this is hardened production security.

## API

All HTTP traffic uses a shared Axios instance in `src/lib/api/axios.ts`.

Key endpoints:

- `POST /auth/login`
- `GET /products`
- `GET /products/search?q=`
- `GET /products/categories`
- `GET /products/category/{category}`
- `GET /products/{id}`
- `POST /products/add`
- `PUT /products/{id}`
- `DELETE /products/{id}`

UI components never construct these URLs directly; they call typed service functions.

## URL State

The products page stores the following query parameters:

- `page`
- `pageSize`
- `search`
- `category`
- `sort` (example: `price-asc`, `rating-desc`, `title-asc`)

Example:

```text
/products?page=2&pageSize=20&search=phone&category=smartphones&sort=price-asc
```

Refreshing or sharing the URL restores the same list state. Invalid values (non-numeric pages, unsupported page sizes, unknown sort keys) are sanitized instead of crashing the page. Out-of-range pages are normalized to a valid page.

## Search + Category Limitation

DummyJSON cannot combine search and category filtering in one server-side query.

This app’s behavior:

- Search only → `GET /products/search?q=...`
- Category only → `GET /products/category/{category}`
- Neither → `GET /products`
- Both search and category → fetch search results, then apply category filtering on the client, then sort and paginate the filtered dataset locally

Pagination counts (`Showing X–Y of Z`) reflect the filtered dataset when client-side filtering is active.

## Mutations

DummyJSON simulates:

- `POST /products/add`
- `PUT /products/{id}`
- `DELETE /products/{id}`

Those writes are **not** permanently persisted by the remote API.

After a successful mutation response, the dashboard updates a session-scoped mutation store (React Context) so:

- created products appear
- edited products update
- deleted products disappear

for the remainder of the browser session. Reloading the tab keeps auth, but local product mutations live in memory and will reset on a full remount/refresh of the JS runtime (documented intentionally).

> DummyJSON simulates mutations and does not persist them. The dashboard applies successful mutations to local application state so the UI remains consistent during the session.

When session mutations exist, the products list prefers a client pipeline over pure server pagination so totals and pages stay coherent.

## Race Condition

Search is debounced (400ms). That alone is not enough.

Each products request:

1. Aborts the previous in-flight request with `AbortController`
2. Increments a monotonic `requestId`
3. Ignores responses whose `requestId` is no longer current

You can stress this with DummyJSON’s delay helper (for example `&delay=2000`). Typing `iphone` → `iphone 15` → `iphone 15 pro` quickly must only keep the latest result.

## Error Handling

- `normalizeApiError()` converts Axios/network failures into a stable `ApiError`
- Axios interceptors attach bearer tokens and handle 401 redirects without login-looping
- Screens show human-readable messages + Retry where appropriate

## Architecture Notes

```text
src/
  app/                 # App Router pages
  components/          # UI, auth, products, layout
  context/             # Session product mutations
  hooks/               # useAuth, useProducts, useDebounce
  lib/api/             # Axios instance + services
  lib/auth/            # constants + storage helpers
  lib/products/        # URL state, sorting, mutation merge
  types/               # Shared TypeScript types
```

API logic stays outside UI components. URL query params are the source of truth for list filters.

## AI Usage

AI was used as a development assistant for implementation ideas, debugging, refactoring suggestions and documentation. All generated code was reviewed and adapted to the application's requirements.

## Challenges

Preventing stale search responses from replacing newer results when requests resolve out of order was the main correctness challenge. Debounce reduces traffic, but slow responses can still finish late. The solution combines request cancellation and request-id gating so only the latest search wins.

Keeping DummyJSON’s simulated writes visible without pretending the server persisted them was the second challenge. A lightweight mutation context overlays creates/updates/deletes onto fetched results for the session.

## Tradeoffs / Decisions

1. **Token in cookie + localStorage** — enables middleware protection while keeping Axios simple. Not HttpOnly; acceptable for this demo API assignment.
2. **Client pipeline when search+category or mutations are active** — DummyJSON cannot express those cases correctly with pure server pagination.
3. **No React Query / Redux / table libraries** — keeps the assignment inspectable and dependency-light.
4. **`<img>` for product media** — avoids fighting remote image edge cases while still providing alt text and responsive layout.
5. **Session mutations are in-memory** — honest about DummyJSON behavior; no fake backend/database was added.

## Remaining Limitations

- DummyJSON writes are simulated only.
- Auth is demo-grade, not production hardening.
- Local mutation state resets when the JS app fully remounts/refreshes.
- Category values that DummyJSON rejects may surface as empty/error states from the API.

## Deploy

Suggested next steps:

1. Push this repository to GitHub
2. Import the project in Vercel
3. Set `NEXT_PUBLIC_API_BASE_URL` if needed (defaults already work)
4. Deploy
