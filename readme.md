# frontend-frameworks [(বাংলা অনুবাদ দেখুন)](./readme.bn.md)

Root README for this trial series — the single source of truth every framework trial follows. Spec evolves as findings accumulate. Time-box: 2 hours per framework, with up to 15 min overflow.

## Initial project setup (do this once, before any trial)

```bash
mkdir frontend-frameworks
cd frontend-frameworks
git init
```

- This `README.md` file lives at `frontend-frameworks/` root — the single source of truth for the whole trial series
- Each framework gets its own sibling folder (`svelte/`, `vue/`, `solid/`, `qwik/`, `htmx/`, `react/`) — created fresh at the start of that framework's trial via its scaffold command (see Per-framework setup below), not upfront. No shared code or config between trial folders.
- Optional: add a root `.gitignore` (`node_modules`, `dist`, `.env`) so it's not repeated per trial:
  ```powershell
  "node_modules", "dist", ".env" | Set-Content .gitignore
  ```
- **Commit convention:** one commit per trial, made at README-write time (once the trial is done/time-boxed out) — message format `<framework>: trial complete`. This gives you a diffable checkpoint per framework later if you want to compare how much got built in the time box.

## API setup (part of initial setup, build once, reuse for every trial)

The install command below pins `json-server@1.0.0-beta.15` as a dev dependency (listed in the root `package.json`). Run it once, never `bunx` again.

```bash
cd frontend-frameworks
bun install
mkdir api
```

Create `db.json` inside `api/` with the seed content below:

```json
{
  "$schema": "./node_modules/json-server/schema.json",
  "items": [
    { "id": "1", "title": "First item", "description": "The first test item", "done": false },
    { "id": "2", "title": "Second item", "description": "The second test item", "done": true }
  ]
}
```

Start the server (from `frontend-frameworks/` root):

```bash
bun run server
```

Starts JSON Server on `http://localhost:3000`. JSON Server 1+ watches for file changes by default, so no `--watch` flag needed.

Leave this terminal running. Open a second terminal for the framework trial.

- One data model, called `items` (ids are strings in v1, not numbers)
- Endpoints you'll use: `GET /items`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id`, `GET /items/:id`
- **Before each new framework trial, regenerate `db.json` with a fresh random seed** — same schema, different items each time. Prevents trial-to-trial carryover and tests each framework against varying seed states. No server restart needed — JSON Server 1+ detects changes automatically.
- v1 beta notes: ids are strings (auto-generated if omitted), pagination uses `_per_page`+`_page` instead of `_limit`, `--delay` was removed (use browser DevTools network throttling instead). Don't mix v0 and v1 syntax.


<details>
<summary>Full json-server usage guide</summary>

### Routes

For array resources like `items`:

```
GET    /items
GET    /items/:id
POST   /items
PUT    /items/:id
PATCH  /items/:id
DELETE /items/:id
```

### Query params

**Conditions** — `field:operator=value`:

| Operator  | Meaning                                  |
| --------- | ---------------------------------------- |
| (none)    | equal (`eq`)                             |
| `lt`      | less than                                |
| `lte`     | less than or equal                       |
| `gt`      | greater than                             |
| `gte`     | greater than or equal                    |
| `eq`      | equal                                    |
| `ne`      | not equal                                |
| `in`      | included in comma-separated list         |
| `contains`| string contains (case-insensitive)       |
| `startsWith`| string starts with (case-insensitive)  |
| `endsWith`| string ends with (case-insensitive)      |

Examples:
```
GET /items?views:gt=100
GET /items?title:contains=hello
GET /items?id:in=1,2,3
GET /items?title:startsWith=Hello
```

**Sort:**
```
GET /items?_sort=-views
GET /items?_sort=title
GET /items?_sort=author.name,-views
```

**Pagination:**
```
GET /items?_page=1&_per_page=25
```

Response:
```json
{
  "first": 1,
  "prev": null,
  "next": 2,
  "last": 4,
  "pages": 4,
  "items": 100,
  "data": [ { "id": "1", "title": "...", "views": 100 } ]
}
```

`_per_page` defaults to `10`. Invalid values are normalized.

**Embed related resources:**
```
GET /items?_embed=comments
```

**Complex filter with `_where`:**
```
GET /items?_where={"or":[{"views":{"gt":100}},{"author":{"name":{"lt":"m"}}}]}
```

### Delete dependents

```
DELETE /items/1?_dependent=comments
```

### Static files

JSON Server automatically serves files from `./public`. To serve additional directories:
```
json-server db.json -s ./static
```

### Migration notes (v0 → v1)

- **ID handling:** `id` is always a string, auto-generated if omitted
- **Pagination:** Use `_per_page` + `_page` instead of deprecated `_limit`
- **Relationships:** Use `_embed` instead of `_expand`
- **Request delays:** Use browser DevTools (Network tab > throttling) instead of removed `--delay`

</details>

## Trial order (follow this sequence)

Base frameworks first — this is where most trial time should go, since it tests the core reactivity model most dashboards actually depend on:

1. Svelte
2. Vue
3. SolidJS
4. Qwik _(lower priority — its main value, low hydration cost, matters less behind a login wall)_
5. htmx
6. React _(baseline — built last, so it's fresh in mind for direct comparison against everything else)_

Meta-frameworks — low priority, deferred until after all base-framework trials, and only for whichever base framework becomes your favorite (per that trial's README verdict).

**API contract is frozen during base-framework trials.** The `items` schema and endpoint contract lock at the start of the first trial and remain unchanged across the entire base-framework series. The spec may evolve only during meta-framework trials, if any.

**Feature completion bar:** A feature is complete when it reaches **functional completeness** — it works correctly in the browser with basic error handling and no known bugs. No styling polish, animations, or production hardening is required.

## Pages

| Page | Route | Protected | Description |
|---|---|---|---|
| Login | `/login` | No | Black centered button → spinner → auto-redirect to `/` |
| Dashboard | `/` | **Yes** | Table, search, sort, pagination, metrics, filter |
| Create item | `/items/new` | **Yes** | Empty form → `POST /items` |
| View item | `/items/:id` | **Yes** | Read-only display |
| Edit item | `/items/edit/:id` | **Yes** | Pre-filled form → `PATCH /items/:id` |

All routes except `/login` redirect to `/login` if not authenticated. Top-right navbar shows logout button when logged in.

## Build order (stop immediately if time runs out)

**Loading states required for items 1–3** (list fetch, toggle, delete). Store `isAuthenticated` in whatever reactive primitive the framework provides (state/ref/signal/store). `login()` and `logout()` functions update it.

### Part A — Dashboard (`/`)

1. **List items** — `GET /items` → render table, show loading state while fetching
2. **Toggle done** — checkbox per row → `PATCH /items/:id` → reflect in UI, show pending indicator
3. **Delete item** — trash icon → confirmation dialog → `DELETE /items/:id` → remove from UI, show pending
4. **Metric cards** — 4 cards above the table: total items, done count, not done count, deleted counter (session-only, increments locally on delete, resets on page reload)
5. **Filter** — All / Active / Done buttons (client-side, no API call)
6. **Search** — text input → `GET /items?title:contains=` (refetches on input)
7. **Sort** — click column header → `GET /items?_sort=` (toggle asc/desc with `-` prefix)
8. **Pagination** — `GET /items?_page=&_per_page=10`. Table footer: "N–M of total T" left, prev/next right

### Part B — Item form + Auth

9. **Dynamic item form** — single component routes. Mode from route pattern:
   - `/items/new` → empty form → `POST /items` → redirect to `/`
   - `/items/:id` → `GET /items/:id` → read-only display
   - `/items/edit/:id` → `GET /items/:id` → pre-filled form → `PATCH /items/:id` → redirect to `/`
10. **Route guard** — all routes except `/login` redirect to `/login` if `isAuthenticated` is false
11. **Login / Logout** — `/login` shows black centered "Login" button. Click → spinner (async delay) → `isAuthenticated = true` → redirect to `/`. Navbar shows "Logout" on authenticated pages. Click → clear auth → redirect to `/login`.

## Layout (non-scored decoration, no framework logic)

- **Navbar:** Framework name left, logout button right
- **Add button:** Above table → navigates to `/items/new`
- **Table row actions:** View icon → `/items/:id`, Edit icon → `/items/edit/:id`, Delete icon → confirmation dialog
- **Table footer:** Range "N–M of total T" left, prev/next right
- **Footer:** "Built by Mehedi Hasan" left, GitHub link to `/framework-name/` right

## Router reference

Use each framework's **official router** (not a hand-rolled solution):

| Framework | Router |
|---|---|
| Svelte | `svelte-routing` or SvelteKit's built-in router |
| Vue | `vue-router` |
| SolidJS | `@solidjs/router` |
| Qwik | Qwik City's built-in router |
| htmx | N/A — swaps via `hx-get`/`hx-target`, no client router |
| React | `react-router` |

## Explicitly OUT of scope (do not build)

- Styling/CSS polish beyond bare usability
- Authentication (mock auth for items 10–11 is fine, real auth is out)
- Real backend, database, or deployment
- Tests
- Animations/transitions
- Mobile responsiveness
- Error boundary polish (a basic try/catch or error message is enough)

## Per-trial README template — write one in every trial's own folder, right after building

Write the impressions sections immediately at stop time (liked, disliked, async, routing, etc.) while the friction/delight is fresh. Fill in the **Verdict** the next day — let impressions settle overnight before deciding KEEP / CROSS-OFF / SECOND-LOOK.

```md
# <Framework Name> — Trial

## Start time

<timestamp when you started this trial>

## End time

<timestamp when you stopped — subtract from start time to get actual hours spent>

## What I liked

-

## What I didn't like

-

## State management

<hooks / stores / signals / runes / proxies — how it actually worked in practice>

## Async & loading states

<how fetch/mutate/loading was handled>

## Routing (list -> detail, params+loader, parallel fetch, route guard)

<how it felt, any friction>

## Would this scale past a small trial app?

<red flags for real dashboard/table-heavy use, if any>

## Was my dislike about syntax/reactivity, or about missing tooling

(routing/data-fetching) that a meta-framework would solve?
<syntax issue = skip meta-framework / tooling gap = meta-framework worth a look>

## Verdict (fill in next day)

<KEEP / CROSS-OFF / SECOND-LOOK>
```

## Base framework ↔ meta-framework reference

| Base Framework | Meta-Framework                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| React          | Next.js                                                                                                               |
| Vue            | Nuxt                                                                                                                  |
| Svelte         | SvelteKit                                                                                                             |
| SolidJS        | SolidStart                                                                                                            |
| Qwik           | Qwik City                                                                                                             |
| Astro          | N/A — considered for the public-site slot, not part of this trial series (framework-agnostic shell/meta-layer itself) |
| htmx           | N/A (pairs with any server-rendered backend)                                                                          |

**Favorite framework** is the highest-ranked KEEP, determined by an equal-weight composite of (a) time-to-complete, (b) syntax ergonomics, and (c) growth potential — not a single metric. The composite is advisory (not a calculated formula) — it exists to prevent any one strong impression from overriding the full picture.

## Conventions used in every trial

- **Package manager: Bun** — `bun create`, `bun install`, `bun run dev` instead of the npm equivalents
- **Import alias:** `@/*` → `./src/*` in every trial's config, so imports read `@/components/ItemList` instead of `../../components/ItemList`. Add to each framework's config:
  - Vite-based (Svelte, Vue, Solid, React): in `vite.config.ts`
    ```ts
    import path from "path";
    export default defineConfig({
      resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    });
    ```
    plus in `tsconfig.json`:
    ```json
    { "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
    ```
  - Qwik: same `tsconfig.json` paths entry; Qwik's Vite config accepts the same `resolve.alias` block
  - htmx: skip — no build step, no bundler, alias doesn't apply

## Per-framework setup (repeat this pattern for every trial)

### 1. Svelte

```bash
# from frontend-frameworks/ root
bun create vite svelte --template svelte-ts
cd svelte
bun install
```

- Confirm the shared API is running (see Setup section above) and `db.json` has been regenerated with a fresh seed
- Start the Svelte dev server:
  ```bash
  bun run dev
  ```
- Add the `@/*` alias to `vite.config.ts` and `tsconfig.json` (see Conventions above)
- Fetch data from `http://localhost:3000/items`
- Create `README.md` in this folder using the Per-trial README template above (write impressions now, verdict tomorrow)
- Build features in order (see Features section): Part A items 1–7, then Part B items 8–11
- Time-box: 2 hours. At the 2-hour mark, allow up to 15 minutes overflow to finish an in-progress feature, then stop and write the README.

### Repeat for each remaining framework

Same steps, swapped scaffolding command only (still Bun, still add the `@/*` alias):

| Framework | Scaffold command                                                                    |
| --------- | ----------------------------------------------------------------------------------- |
| Vue       | `bun create vite vue --template vue-ts`                                             |
| SolidJS   | `bun create vite solid --template solid-ts`                                         |
| Qwik      | `bun create qwik@latest` (choose empty app, into `qwik/` folder)                    |
| htmx      | No scaffold — plain `htmx/index.html` + `bunx serve`, htmx script via CDN, no alias |
| React     | `bun create vite react --template react-ts`                                         |
