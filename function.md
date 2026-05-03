# TriMesh — Function Reference

A plain-English explanation of every function in the codebase, organized by file. Each entry answers: **what it does**, **what it receives**, and **what it returns or causes to happen**.

---

## Table of Contents

### Server
- [src/index.ts](#srcindexts)
- [src/lib/prisma.ts](#srclibprismats)
- [src/middleware/auth.middleware.ts](#srcmiddlewareauthmiddlewarets)
- [src/middleware/error.middleware.ts](#srcmiddlewareerror-middlewarets)
- [src/controllers/auth.controller.ts](#srccontrollersauthcontrollerts)
- [src/controllers/model.controller.ts](#srccontrollersmodelcontrollerts)
- [src/controllers/user.controller.ts](#srccontrollersusercontrollerts)
- [src/routes/auth.routes.ts](#srcroutesauthroutests)
- [src/routes/model.routes.ts](#srcroutesmodelroutests)
- [src/routes/user.routes.ts](#srcroutesuserroutests)

### Client
- [lib/api.ts](#libapits)
- [lib/hooks/useUser.ts](#libhooksuseusertspage)
- [lib/hooks/useModels.ts](#libhooksusemodels)
- [types/index.ts](#typesindexts)
- [proxy.ts](#proxyts)
- [components/Navbar.tsx](#componentsnavbartsx)
- [components/UserAvatar.tsx](#componentsuseravatartsx)
- [components/AuthForm.tsx](#componentsauthformtsx)
- [components/ModelCard.tsx](#componentsmodelcardtsx)
- [components/ModelGrid.tsx](#componentsmodelgridtsx)
- [components/CategoryFilter.tsx](#componentscategoryfiltertsx)
- [app/page.tsx](#appapagetsx)
- [app/layout.tsx](#applayouttsx)
- [app/(auth)/login/page.tsx](#appauthlonginpagetsx)
- [app/(auth)/signup/page.tsx](#appauthsignuppagetsx)
- [app/browse/page.tsx](#appbrowsepagetsx)
- [app/models/[id]/page.tsx](#appmodelsidpagetsx)
- [app/dashboard/page.tsx](#appdashboardpagetsx)
- [app/upload/page.tsx](#appuploadpagetsx)

---

## SERVER

---

### `src/index.ts`

The entry point that boots the Express server.

**What it does:**
- Loads `.env` variables into `process.env` via `dotenv/config`
- Creates an Express app instance
- Attaches CORS so the frontend (`CLIENT_URL`) can make requests
- Attaches `express.json()` so request bodies are parsed as JSON
- Mounts the three route groups at their URL prefixes
- Registers a `/health` endpoint that returns `{ status: "ok" }` — useful for deployment health checks
- Registers the global error handler as the last middleware
- Starts the HTTP server on `PORT` (default `5000`)

**No exported functions** — this file just runs when Node.js starts.

---

### `src/lib/prisma.ts`

Creates and exports a single shared Prisma database client.

---

#### `createPrismaClient()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | A new `PrismaClient` instance connected to the database |

**What it does:**  
Reads `DATABASE_URL` from the environment, creates a `pg.Pool` (a PostgreSQL connection pool), wraps it in a `PrismaPg` driver adapter (required by Prisma v7), and returns a fully configured `PrismaClient`. This is the object used throughout the app to talk to the database.

**Why a singleton?**  
In development, Next.js hot-reloads modules, which would create a new database connection on every file save. The pattern `globalForPrisma.prisma || createPrismaClient()` reuses the existing client if it already exists on the global object, avoiding connection exhaustion.

---

### `src/middleware/auth.middleware.ts`

---

#### `protect(req, res, next)`

| | |
|---|---|
| **Receives** | Express `Request`, `Response`, `NextFunction` |
| **Returns** | Nothing — either calls `next()` or sends a 401 response |

**What it does:**  
This is a route guard. It reads the `Authorization` header from the incoming request, expects it in the format `Bearer <token>`, and verifies the token against `JWT_SECRET`.

- If there is **no token** → responds `401 Unauthorized` and stops.
- If the token is **invalid or expired** → responds `401 Invalid token` and stops.
- If the token is **valid** → decodes it, attaches `{ id }` to `req.user`, and calls `next()` so the actual route handler can run.

Any route that calls `protect` before its handler is a protected route — the user must be logged in to access it.

---

### `src/middleware/error.middleware.ts`

---

#### `errorHandler(err, req, res, next)`

| | |
|---|---|
| **Receives** | An `Error` object, Express `Request`, `Response`, `NextFunction` |
| **Returns** | Nothing — sends a 500 JSON response |

**What it does:**  
This is the global catch-all for unhandled errors. If any route handler throws an error that is not caught internally, Express forwards it here. It logs the full stack trace to the server console and sends `{ message: "..." }` back to the client with status 500. Registered last in `index.ts` so it only receives errors, not normal requests.

---

### `src/controllers/auth.controller.ts`

---

#### `signToken(id)`

| | |
|---|---|
| **Receives** | `id` — the UUID string of a user |
| **Returns** | A signed JWT string |

**What it does:**  
A private helper. Creates a JSON Web Token that encodes the user's `id` as the payload, signs it with `JWT_SECRET`, and sets it to expire in 7 days. This token is what the client stores and sends on every authenticated request.

---

#### `signup(req, res)` — `POST /api/auth/signup`

| | |
|---|---|
| **Receives** | `req.body`: `{ email, username, password }` |
| **Returns** | `201` with `{ token, user }` — or an error |

**What it does:**
1. Validates that `email`, `username`, and `password` are all present.
2. Checks if the email is already taken — if so, returns `409 Conflict`.
3. Hashes the password using `bcrypt` with 10 salt rounds (so plain-text is never stored).
4. Creates a new `User` row in the database.
5. Signs a JWT for the new user and returns it alongside the user's public info.

---

#### `login(req, res)` — `POST /api/auth/login`

| | |
|---|---|
| **Receives** | `req.body`: `{ email, password }` |
| **Returns** | `200` with `{ token, user }` — or an error |

**What it does:**
1. Validates that both fields are present.
2. Looks up the user by email.
3. Compares the submitted password against the stored bcrypt hash. If either the user doesn't exist or the password doesn't match, returns `401 Invalid credentials` (deliberately ambiguous to prevent user enumeration).
4. Signs a JWT and returns it.

---

#### `getMe(req, res)` — `GET /api/auth/me`

| | |
|---|---|
| **Receives** | `req.user.id` set by the `protect` middleware |
| **Returns** | `200` with the current user's profile fields |

**What it does:**  
Fetches the logged-in user from the database using the ID decoded from their JWT. Returns `id`, `email`, `username`, `bio`, and `createdAt`. If for some reason the user no longer exists (deleted account), returns `404`.

---

### `src/controllers/model.controller.ts`

---

#### `getModels(req, res)` — `GET /api/models`

| | |
|---|---|
| **Receives** | Optional `req.query.category` filter |
| **Returns** | `200` with an array of models, newest first |

**What it does:**  
Fetches all 3D model records from the database. If a `?category=Gaming` query parameter is provided, it filters results to only that category. Each model includes the uploader's username. Returns an empty array if nothing matches — never a 404.

---

#### `getModel(req, res)` — `GET /api/models/:id`

| | |
|---|---|
| **Receives** | `req.params.id` — the model UUID |
| **Returns** | `200` with the full model object — or `404` |

**What it does:**  
Fetches a single model by its ID, including the uploader's `id` and `username`. Returns `404` if no model exists with that ID.

---

#### `createModel(req, res)` — `POST /api/models`

| | |
|---|---|
| **Receives** | `req.user.id` (from JWT) + `req.body`: `{ title, description, category, previewImage, fileUrl?, tags? }` |
| **Returns** | `201` with the newly created model |

**What it does:**
1. Validates that the four required fields (`title`, `description`, `category`, `previewImage`) are present.
2. Normalises `tags` — accepts an array; defaults to `[]` if missing or not an array.
3. Writes the new `Model` row with `userId` set to the logged-in user.
4. Returns the created record.

---

#### `deleteModel(req, res)` — `DELETE /api/models/:id`

| | |
|---|---|
| **Receives** | `req.params.id` + `req.user.id` |
| **Returns** | `200 { message: "Model deleted" }` — or `404`/`403` |

**What it does:**
1. Looks up the model. Returns `404` if not found.
2. Checks that `model.userId === req.user.id`. Returns `403 Forbidden` if someone else tries to delete it.
3. Deletes all `SavedModel` bookmark rows referencing this model first (to avoid a foreign key violation), then deletes the model itself.

---

### `src/controllers/user.controller.ts`

---

#### `getDashboard(req, res)` — `GET /api/user/dashboard`

| | |
|---|---|
| **Receives** | `req.user.id` |
| **Returns** | `200` with `{ uploads: Model[], saved: Model[] }` |

**What it does:**  
Fetches two lists in parallel using `Promise.all`:
- **uploads** — all models the logged-in user has created, newest first.
- **saved** — all models the user has bookmarked, retrieved by joining through the `SavedModel` table, and flattened so the response contains the model objects directly.

---

#### `saveModel(req, res)` — `POST /api/user/save/:modelId`

| | |
|---|---|
| **Receives** | `req.user.id` + `req.params.modelId` |
| **Returns** | `200` with the `SavedModel` record |

**What it does:**  
Bookmarks a model for the logged-in user. Uses Prisma's `upsert` with the composite unique key `userId_modelId`, so clicking "Save" twice does not create duplicate records — it's idempotent. Returns `404` if the model doesn't exist.

---

#### `unsaveModel(req, res)` — `DELETE /api/user/save/:modelId`

| | |
|---|---|
| **Receives** | `req.user.id` + `req.params.modelId` |
| **Returns** | `200 { message: "Removed from saved" }` |

**What it does:**  
Removes the bookmark. Uses `deleteMany` with both `userId` and `modelId` so it only removes the current user's bookmark, not anyone else's. Always returns 200 even if the bookmark didn't exist.

---

### `src/routes/auth.routes.ts`

Wires HTTP verbs + paths to controller functions for the `/api/auth` prefix.

| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| POST | `/signup` | — | `signup` |
| POST | `/login` | — | `login` |
| GET | `/me` | `protect` | `getMe` |

---

### `src/routes/model.routes.ts`

Wires HTTP verbs + paths to controller functions for the `/api/models` prefix.

| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| GET | `/` | — | `getModels` |
| GET | `/:id` | — | `getModel` |
| POST | `/` | `protect` | `createModel` |
| DELETE | `/:id` | `protect` | `deleteModel` |

---

### `src/routes/user.routes.ts`

Wires HTTP verbs + paths to controller functions for the `/api/user` prefix.

| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| GET | `/dashboard` | `protect` | `getDashboard` |
| POST | `/save/:modelId` | `protect` | `saveModel` |
| DELETE | `/save/:modelId` | `protect` | `unsaveModel` |

---

---

## CLIENT

---

### `lib/api.ts`

Creates and exports a pre-configured Axios instance used by every client-side API call.

**What it does:**  
Sets `baseURL` to `NEXT_PUBLIC_API_URL` (the Express server URL). Registers a **request interceptor** that runs before every HTTP request: it checks `localStorage` for a `token` and, if found, attaches it as the `Authorization: Bearer <token>` header automatically. This means every component that uses `api` gets authentication for free — they never need to manually add the header.

The `typeof window !== 'undefined'` guard prevents this from crashing during server-side rendering, since `localStorage` only exists in the browser.

---

### `lib/hooks/useUser.ts`

---

#### `useUser()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | `{ user, loading, setUser, logout }` |

**What it does:**  
A React hook that manages the currently logged-in user's state across the whole app.

- On first render, checks `localStorage` for a token. If none, sets `loading = false` immediately.
- If a token exists, calls `GET /api/auth/me` to verify it and load the user's profile. If the token is expired or invalid, it removes it from `localStorage` and sets `user = null`.
- `loading` is `true` while the request is in flight — used by the Navbar to avoid flashing the wrong auth state.
- `logout()` clears the token from `localStorage`, nulls the user, and redirects to the home page with a hard reload.

---

### `lib/hooks/useModels.ts`

---

#### `useModels(category?)`

| | |
|---|---|
| **Receives** | Optional `category` string filter |
| **Returns** | `{ models, loading, error }` |

**What it does:**  
A React hook that fetches the list of 3D models from the API. Re-fetches automatically whenever `category` changes (when the user clicks a filter pill). Encodes the category in the URL query string to avoid injection issues. Sets `error` if the request fails so the UI can show a message instead of silently breaking.

---

### `types/index.ts`

Defines all shared TypeScript types and constants used across the client.

| Type / Constant | What it represents |
|---|---|
| `User` | A logged-in user: `id`, `email`, `username`, optional `bio` and `createdAt` |
| `Model` | A 3D asset: all fields including `tags[]`, `downloadCount`, and the nested `user` object |
| `SavedModel` | A bookmark record linking a `User` to a `Model` |
| `DashboardData` | The shape of the `/api/user/dashboard` response: `{ uploads, saved }` |
| `CATEGORIES` | A `const` array of the 6 valid category strings — used in filters and the upload form dropdown |
| `Category` | A TypeScript union type derived from `CATEGORIES` (`"Gaming" \| "Architecture" \| ...`) |

---

### `proxy.ts`

The Next.js 16 route proxy (renamed from `middleware.ts` in v16).

---

#### `proxy(request)`

| | |
|---|---|
| **Receives** | A `NextRequest` object |
| **Returns** | Either a redirect `Response` or `NextResponse.next()` (pass-through) |

**What it does:**  
Runs on the **server edge** before any page is rendered. Checks whether the requested path is in the `PROTECTED` list (`/dashboard` or `/upload`). If it is and there is no `token` cookie, it redirects the user to `/login` before the page ever loads. If the token is present or the route is public, it passes through with `NextResponse.next()`.

The `config.matcher` tells Next.js to only run this function on the two protected paths — it does not run on every request.

**Note:** The token is stored as both `localStorage` (for the Axios interceptor) and a cookie (for this proxy) when the user logs in.

---

### `components/Navbar.tsx`

---

#### `Navbar()`

| | |
|---|---|
| **Receives** | Nothing (no props) |
| **Returns** | The sticky top navigation bar JSX |

**What it does:**  
Renders the global navigation bar present on every page. Uses the `useUser` hook to know whether anyone is logged in:
- While loading → renders nothing in the auth area (prevents flash of wrong state).
- If logged in → renders a `UserAvatar` with a dropdown menu.
- If logged out → renders Login link + Sign Up button.

Always shows the TriMesh logo (links to `/`) and a Browse link.

---

### `components/UserAvatar.tsx`

---

#### `UserAvatar({ user, onLogout })`

| | |
|---|---|
| **Receives** | `user: User`, `onLogout: () => void` |
| **Returns** | A circular avatar button with a dropdown menu |

**What it does:**  
Shows the first two letters of the username as a violet circle button. Clicking it toggles a dropdown menu that shows the user's name and email, plus links to Dashboard and Upload Model, and a Logout button that calls `onLogout`.

The `open` state is local — the dropdown is toggled purely in the browser with no server calls.

---

### `components/AuthForm.tsx`

---

#### `AuthForm({ mode })`

| | |
|---|---|
| **Receives** | `mode: "login" \| "signup"` |
| **Returns** | A `<form>` element with controlled inputs |

**What it does:**  
A single reusable form component that handles both login and signup depending on `mode`.

**Internal functions:**

**`handleChange(e)`**  
Updates the `form` state object when any input changes. Uses the input's `name` attribute as the key so one handler covers all fields.

**`handleSubmit(e)`**  
Runs when the form is submitted:
1. Prevents the browser's default page reload.
2. Builds the request payload (signup includes `username`; login does not).
3. POSTs to `/api/auth/login` or `/api/auth/signup`.
4. On success: saves the JWT to `localStorage` and also sets it as a browser cookie (needed by the `proxy.ts` server guard), then navigates to `/dashboard`.
5. On failure: displays the server's error message (e.g. "Email already registered").

---

### `components/ModelCard.tsx`

---

#### `ModelCard({ model })`

| | |
|---|---|
| **Receives** | `model: Model` |
| **Returns** | A card JSX element that links to the model's detail page |

**What it does:**  
Renders a single 3D model as a clickable card showing the preview image (with a zoom-on-hover effect), title, category badge, description (capped at 2 lines), uploader name, download count, and up to 3 hashtags. The entire card is a `<Link>` pointing to `/models/<id>`.

---

### `components/ModelGrid.tsx`

---

#### `ModelGrid({ models, loading })`

| | |
|---|---|
| **Receives** | `models: Model[]`, optional `loading: boolean` |
| **Returns** | A responsive grid of cards — or a skeleton/empty state |

**What it does:**  
Handles three display states for the model list:
1. **Loading** (`loading = true`) → renders 8 pulsing skeleton placeholder cards.
2. **Empty** (`models.length === 0`) → renders an empty-state message with an icon.
3. **Has data** → renders a responsive grid (1 → 2 → 3 → 4 columns at increasing breakpoints) of `ModelCard` components.

---

### `components/CategoryFilter.tsx`

---

#### `CategoryFilter({ selected, onChange })`

| | |
|---|---|
| **Receives** | `selected: string \| null` (current category), `onChange: (category \| null) => void` |
| **Returns** | A row of pill buttons |

**What it does:**  
Renders an "All" button followed by one button per category from `CATEGORIES`. The active button (matching `selected`) is styled with a filled violet background; inactive ones are grey. Clicking a button calls `onChange` with the category string (or `null` for "All"), which triggers a re-fetch in the parent's `useModels` hook.

---

### `app/page.tsx`

---

#### `HomePage()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | The landing page JSX |

**What it does:**  
The root page at `/`. Contains two sections:
1. **Hero** — large headline, tagline, and two CTA buttons (Browse Models + Start Uploading).
2. **Category grid** — six cards, one per category, each linking to `/browse?category=<name>` so clicking a category goes straight to a filtered Browse view.

This is a static server component (no `'use client'`, no data fetching).

---

### `app/layout.tsx`

---

#### `RootLayout({ children })`

| | |
|---|---|
| **Receives** | `children: React.ReactNode` — whatever page is currently being rendered |
| **Returns** | The full HTML shell |

**What it does:**  
Wraps every single page in the app. Sets the `<html>` tag with Geist font variables, sets page metadata (title and description shown in browser tabs), renders the `<Navbar>` above all page content, and applies the base background and text colour to `<body>`.

---

### `app/(auth)/login/page.tsx`

---

#### `LoginPage()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | The login page JSX |

**What it does:**  
A static wrapper page. Renders a centred card with a heading, a subheading, and the `<AuthForm mode="login" />` component. Also shows a "Don't have an account? Sign up" link below the form. All the actual login logic lives inside `AuthForm`.

---

### `app/(auth)/signup/page.tsx`

---

#### `SignupPage()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | The signup page JSX |

**What it does:**  
Identical structure to `LoginPage` but passes `mode="signup"` to `AuthForm`, which causes the username field to appear. Shows an "Already have an account? Sign in" link.

---

### `app/browse/page.tsx`

---

#### `BrowsePage()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | The browse/gallery page JSX |

**What it does:**  
The outer page shell. Renders the heading and wraps `BrowseContent` in a `<Suspense>` boundary with a skeleton fallback — required by Next.js 16 whenever `useSearchParams` is used inside a client component.

---

#### `BrowseContent()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | The filter + grid section JSX |

**What it does:**  
The inner client component that does the actual work:
- Reads the `?category=` query parameter from the URL on first render (so the landing page category links work).
- Stores the active category in local state.
- Passes it to `useModels` to fetch filtered results.
- Syncs state if the URL query param changes via a `useEffect`.
- Renders `<CategoryFilter>` and `<ModelGrid>`.

---

### `app/models/[id]/page.tsx`

---

#### `ModelDetailPage()`

| | |
|---|---|
| **Receives** | Nothing — reads the `id` URL segment via `useParams` |
| **Returns** | The full model detail page JSX, or a skeleton while loading |

**What it does:**  
Displays all information about a single model. On mount, fetches `GET /api/models/:id`. If the model doesn't exist, redirects to `/browse`.

**Internal functions:**

**`handleSave()`**  
Toggles the bookmark state for the currently logged-in user. If not logged in, redirects to `/login`. If already saved, calls `DELETE /api/user/save/:id` and flips `saved` to `false`. Otherwise calls `POST /api/user/save/:id` and flips `saved` to `true`.

**`handleDelete()`**  
Shown only if the logged-in user is the model's owner (`isOwner`). Shows a native browser confirmation dialog. If confirmed, calls `DELETE /api/models/:id`, then redirects to `/dashboard`.

---

### `app/dashboard/page.tsx`

---

#### `DashboardPage()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | The user dashboard page JSX |

**What it does:**  
On mount, fetches `GET /api/user/dashboard` which returns both `uploads` and `saved` arrays. Renders a two-tab interface:
- **Uploads** tab — all models the user has created.
- **Saved** tab — all models the user has bookmarked.

The active tab is stored in local state (`tab`). Switching tabs just changes which array from the already-loaded `data` object is displayed — no extra API call needed. Shows a count badge on each tab. Shows empty-state prompts with helpful links when a tab is empty.

---

### `app/upload/page.tsx`

---

#### `UploadPage()`

| | |
|---|---|
| **Receives** | Nothing |
| **Returns** | The upload form page JSX |

**What it does:**  
A protected page (the `proxy.ts` guard redirects unauthenticated users before this loads). Renders a form with fields for all model metadata.

**Internal functions:**

**`handleChange(e)`**  
Generic change handler for all form inputs, textareas, and selects. Uses the element's `name` attribute to update the matching key in the `form` state object.

**`handleSubmit(e)`**  
Runs on form submission:
1. Prevents default reload.
2. Parses the `tags` string by splitting on commas, trimming whitespace, lowercasing, and removing empties — turning `"character, Lowpoly, rigged"` into `["character", "lowpoly", "rigged"]`.
3. POSTs to `POST /api/models` with the form data (the Axios interceptor attaches the auth token automatically).
4. On success, navigates to the new model's detail page.
5. On failure, shows the server's error message.
