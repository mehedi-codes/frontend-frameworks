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
  ```bash
  echo -e "node_modules\ndist\n.env" > .gitignore
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
  "items": [
    { "id": "1", "title": "First item", "done": false, "description": "The first test item" },
    { "id": "2", "title": "Second item", "done": true, "description": "The second test item" }
  ]
}
```

Start the server (from `frontend-frameworks/` root):

```bash
bun run server
```

This runs `json-server --watch api/db.json --port 3001`. The `--watch` flag is included so edits to `db.json` are picked up without restart — verify this empirically the first time you run it (edit a title, hit `GET /items`, check if the change appears). If `--watch` doesn't work in v1 beta, remove it from `package.json` `"scripts"`.

Leave this terminal running. Open a second terminal for the framework trial.

- One data model, called `items` (ids are strings in v1, not numbers)
- Endpoints you'll use: `GET /items`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id`, `GET /items/:id`
- **Before each new framework trial, regenerate `db.json` with a fresh random seed** — same schema, different items each time. Prevents trial-to-trial carryover and tests each framework against varying seed states. After regenerating, restart the server if `--watch` verification showed edits don't reflect live.
- v1 beta notes: ids are strings (auto-generated if omitted), pagination uses `_per_page`+`_page` instead of `_limit`, `--delay` was removed (use browser DevTools network throttling instead). Don't mix v0 and v1 syntax.

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

## Features (build in this order — stop immediately if time runs out)

**Part A — with operations (mutation, dashboard-style):**

1. **List items** — fetch from `GET /items`, render list, show loading state while fetching
2. **Add an item** — form input + submit → `POST /items` → update list, show pending indicator
3. **Toggle done** — checkbox/click → `PATCH /items/:id` → reflect in UI, show pending indicator
4. **Delete an item** — button → `DELETE /items/:id` → remove from UI, show pending indicator
5. **Edit an item's title** — inline edit (double-click or edit button) → `PATCH /items/:id`, show pending indicator
6. **Filter view** — All / Active / Done (client-side, no API call needed)
7. **Derived count** — "X items left" computed from current items (tests reactivity/computed values)

**Mutation loading/pending state — required for all mutation features.** Items 1–5 all require visible loading or pending indicators during their async operations. The initial list fetch (item 1) must show a loading state. Items 2–5 (add, toggle, delete, edit) must also show a pending or optimistic UI state during the mutation. This tests each framework's async ergonomics more deeply — how naturally does it handle fire-and-update vs fire-and-refetch?

**Part B — without operations (read-only, public-site-style):** 8. **Detail route** — click an item in the list → route to a detail view → fetch `GET /items/:id`, display it read-only (no edit/delete controls on this view) 9. **Route params + loader** — the detail view reads the `:id` param from the URL and fetches the item via a loader function before the component renders 10. **Parallel vs waterfall fetch** — render a view that fetches two independent resources in parallel (e.g., item detail + related items list) to test each router's loader composition patterns 11. **Route guard** — protect the detail route with a mock auth guard that redirects unauthenticated users away

- Use each framework's **official router** (not a manual/hand-rolled solution), so routing friction reflects the framework's own tooling, not an ad-hoc implementation:
  | Framework | Router                                                                                                                        |
  | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
  | Svelte    | `svelte-routing` or SvelteKit's built-in router if you end up using it later — for plain Svelte, `svelte-routing`             |
  | Vue       | `vue-router`                                                                                                                  |
  | SolidJS   | `@solidjs/router`                                                                                                             |
  | Qwik      | Qwik City's built-in router (comes with the framework)                                                                        |
  | htmx      | N/A — htmx swaps content via `hx-get`/`hx-target`, no client router; use two static pages or one page with a swapped fragment |
  | React     | `react-router`                                                                                                                |

## Explicitly OUT of scope (do not build)

- Styling/CSS polish beyond bare usability
- Authentication (mock auth guard for item 11 is fine, real auth is out)
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
- Fetch data from `http://localhost:3001/items`
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
