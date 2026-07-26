# frontend-frameworks [(See English Translation)](./readme.md)

এই trial series-এর root README — প্রতিটি framework trial-এর জন্য এটি একমাত্র source of truth। Findings জমা হওয়ার সাথে সাথে spec টি evolve হয়। Time-box: প্রতি framework-এর জন্য 2 ঘণ্টা, সর্বোচ্চ 15 মিনিট overflow-সহ।

## Initial project setup (একবার করুন, কোনো trial শুরুর আগে)

```bash
mkdir frontend-frameworks
cd frontend-frameworks
git init
```

- এই `README.md` ফাইলটি `frontend-frameworks/` root-এ থাকে — পুরো trial series-এর single source of truth
- প্রতিটি framework নিজের sibling folder পায় (`svelte/`, `vue/`, `solid/`, `qwik/`, `htmx/`, `react/`) — এগুলি আগে থেকে তৈরি না, বরং সেই framework-এর trial শুরু করার সময় scaffold command-এর মাধ্যমে তৈরি হয় (নিচের Per-framework setup দেখুন)। Trial folder-গুলোর মধ্যে কোনো shared code বা config নেই।
- ঐচ্ছিক: root-এ একটি `.gitignore` যোগ করুন (`node_modules`, `dist`, `.env`) যাতে প্রতি trial-এ বারবার না লিখতে হয়:
  ```powershell
  "node_modules", "dist", ".env" | Set-Content .gitignore
  ```
- **Commit convention:** প্রতি trial-এ একটি commit, README লেখার সময় (trial শেষ হলে বা time-box শেষ হলে) — message format `<framework>: trial complete`। এটি পরবর্তীতে প্রতি framework-এর diffable checkpoint হিসেবে কাজ করবে।

## API setup (initial setup-এর অংশ, একবার তৈরি করুন, প্রতি trial-এ পুনরায় ব্যবহার করুন)

নিচের install command `json-server@1.0.0-beta.15` কে dev dependency হিসেবে pin করে (root `package.json`-এ listed)। এটি একবার run করুন, `bunx` করার প্রয়োজন নেই।

```bash
cd frontend-frameworks
bun install
mkdir api
```

`api/`-এর ভিতরে নিচের seed content দিয়ে `db.json` তৈরি করুন:

```json
{
  "$schema": "./node_modules/json-server/schema.json",
  "items": [
    { "id": "1", "title": "First item", "description": "The first test item", "done": false },
    { "id": "2", "title": "Second item", "description": "The second test item", "done": true }
  ]
}
```

Server start করুন (`frontend-frameworks/` root থেকে):

```bash
bun run server
```

এটি JSON Server কে `http://localhost:3000`-এ start করে। JSON Server 1+ ডিফল্টভাবেই file changes watch করে, তাই `--watch` flag-এর প্রয়োজন নেই।

এই terminal টি চালু রাখুন। Framework trial-এর জন্য একটি দ্বিতীয় terminal খুলুন।

- একটি data model, যার নাম `items` (v1-এ ids string, number নয়)
- আপনি যে endpoints ব্যবহার করবেন: `GET /items`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id`, `GET /items/:id`
- **প্রতিটি নতুন framework trial-এর আগে, fresh random seed দিয়ে `db.json` regenerate করুন** — একই schema, প্রতিবার ভিন্ন items। এটি trial-to-trial carryover প্রতিরোধ করে। Server restart-এর প্রয়োজন নেই — JSON Server 1+ automatically changes detect করে।
- v1 beta notes: ids string হয় (omit করলে auto-generated), pagination `_per_page`+`_page` ব্যবহার করে (`_limit`-এর পরিবর্তে), `--delay` সরিয়ে দেওয়া হয়েছে (পরিবর্তে browser DevTools network throttling ব্যবহার করুন)। v0 এবং v1 syntax মিশাবেন না।


<details>
<summary>সম্পূর্ণ json-server ব্যবহার নির্দেশিকা</summary>

### Routes

`items`-এর মতো array resources-এর জন্য:

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

| Operator      | Meaning                                |
| ------------- | -------------------------------------- |
| (none)        | equal (`eq`)                           |
| `lt`          | less than                              |
| `lte`         | less than or equal                     |
| `gt`          | greater than                           |
| `gte`         | greater than or equal                  |
| `eq`          | equal                                  |
| `ne`          | not equal                              |
| `in`          | included in comma-separated list       |
| `contains`    | string contains (case-insensitive)     |
| `startsWith`  | string starts with (case-insensitive)  |
| `endsWith`    | string ends with (case-insensitive)    |

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

`_per_page` ডিফল্ট `10`। Invalid values automatically normalized হয়।

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

JSON Server automatically `./public` directory থেকে files serve করে। Additional directories serve করতে:
```
json-server db.json -s ./static
```

### Migration notes (v0 → v1)

- **ID handling:** `id` সবসময় string, omit করলে auto-generated
- **Pagination:** `_per_page` + `_page` ব্যবহার করুন (`_limit` deprecated)
- **Relationships:** `_embed` ব্যবহার করুন (`_expand`-এর পরিবর্তে)
- **Request delays:** browser DevTools ব্যবহার করুন (Network tab > throttling) — `--delay` সরিয়ে দেওয়া হয়েছে

</details>

## Trial order (এই sequence অনুসরণ করুন)

Base frameworks আগে — এখানেই বেশিরভাগ trial time দেওয়া উচিত, কারণ এটি core reactivity model পরীক্ষা করে যা বেশিরভাগ dashboard-এর ভিত্তি:

1. Svelte
2. Vue
3. SolidJS
4. Qwik _(lower priority — এর প্রধান value, low hydration cost, login wall-এর পিছনে কম গুরুত্বপূর্ণ)_
5. htmx
6. React _(baseline — সবশেষে তৈরি করা হয়, যাতে অন্যান্য সব framework-এর সাথে direct comparison-এর জন্য fresh থাকে)_

Meta-frameworks — low priority, সব base-framework trial শেষ হওয়ার পর, এবং শুধুমাত্র সেই base framework-এর জন্য যেটি আপনার favorite হবে (সেই trial-এর README verdict অনুযায়ী)।

**API contract base-framework trials জুড়ে frozen থাকে।** `items` schema এবং endpoint contract প্রথম trial-এর শুরুতে lock হয় এবং পুরো base-framework series জুড়ে অপরিবর্তিত থাকে। Spec শুধুমাত্র meta-framework trials-এ evolve হতে পারে, যদি থাকে।

**Feature completion bar:** একটি feature complete বলে ধরা হবে যখন এটি **functional completeness**-এ পৌঁছায় — browser-এ correctly কাজ করে, basic error handling আছে, এবং কোনো known bug নেই। Styling polish, animations, বা production hardening প্রয়োজন নেই।

## Pages

| Page | Route | Protected | Description |
|---|---|---|---|
| Login | `/login` | না | কালো centered button → spinner → auto-redirect to `/` |
| Dashboard | `/` | **হ্যাঁ** | Table, search, sort, pagination, metrics, filter |
| Create item | `/items/new` | **হ্যাঁ** | Empty form → `POST /items` |
| View item | `/items/:id` | **হ্যাঁ** | Read-only display |
| Edit item | `/items/edit/:id` | **হ্যাঁ** | Pre-filled form → `PATCH /items/:id` |

`/login` ছাড়া সব routes `/login`-এ redirect করবে যদি authenticated না থাকে। Navbar-এ logout button দেখা যাবে logged in অবস্থায়।

## Build order (সময় শেষ হলে অবিলম্বে বন্ধ করুন)

**Items 1–3-এর জন্য loading states required** (list fetch, toggle, delete)। `isAuthenticated` framework-এর reactive primitive-এ store করুন (state/ref/signal/store)। `login()` এবং `logout()` functions এটি update করে।

### Part A — Dashboard (`/`)

1. **List items** — `GET /items` → table render, fetching অবস্থায় loading state
2. **Toggle done** — checkbox per row → `PATCH /items/:id` → UI-তে reflect, pending indicator
3. **Delete item** — trash icon → confirmation dialog → `DELETE /items/:id` → remove from UI, pending
4. **Metric cards** — table-এর উপরে 4 cards: total items, done count, not done count, deleted counter (session-only, delete-এ locally increment হয়, page reload-এ reset)
5. **Filter** — All / Active / Done buttons (client-side, কোনো API call নয়)
6. **Search** — text input → `GET /items?title:contains=` (input-এ refetch)
7. **Sort** — column header click → `GET /items?_sort=` (asc/desc toggle with `-` prefix)
8. **Pagination** — `GET /items?_page=&_per_page=10`। Table footer: "N–M of total T" left, prev/next right

### Part B — Item form + Auth

9. **Dynamic item form** — single component routes। Route pattern অনুযায়ী mode:
   - `/items/new` → empty form → `POST /items` → redirect to `/`
   - `/items/:id` → `GET /items/:id` → read-only display
   - `/items/edit/:id` → `GET /items/:id` → pre-filled form → `PATCH /items/:id` → redirect to `/`
10. **Route guard** — `/login` ছাড়া সব routes `/login`-এ redirect করবে যদি `isAuthenticated` false হয়
11. **Login / Logout** — `/login`-এ কালো centered "Login" button। Click → spinner (async delay) → `isAuthenticated = true` → redirect to `/`। Navbar-এ "Logout" authenticated pages-এ। Click → auth clear → redirect to `/login`।

## Layout (non-scored decoration, framework logic নেই)

- **Navbar:** Framework name left, logout button right
- **Add button:** Table-এর উপরে → navigates to `/items/new`
- **Table row actions:** View icon → `/items/:id`, Edit icon → `/items/edit/:id`, Delete icon → confirmation dialog
- **Table footer:** Range "N–M of total T" left, prev/next right
- **Footer:** "Built by Mehedi Hasan" left, GitHub link to `/framework-name/` right

## Router reference

প্রতিটি framework-এর **official router** ব্যবহার করুন (hand-rolled solution নয়):

| Framework | Router |
|---|---|
| Svelte | `svelte-routing` বা SvelteKit-এর built-in router |
| Vue | `vue-router` |
| SolidJS | `@solidjs/router` |
| Qwik | Qwik City-র built-in router |
| htmx | N/A — swaps via `hx-get`/`hx-target`, কোনো client router নেই |
| React | `react-router` |

## Explicitly OUT of scope (এগুলি তৈরি করবেন না)

- Styling/CSS polish বেয়ার usability-এর বাইরে
- Authentication (items 10–11-এর জন্য mock auth ঠিক আছে, real auth out of scope)
- Real backend, database, বা deployment
- Tests
- Animations/transitions
- Mobile responsiveness
- Error boundary polish (basic try/catch বা error message যথেষ্ট)

## Per-trial README template — build করার পরপরই প্রতিটি trial-এর নিজস্ব folder-এ লিখুন

Stop time-এর সাথেসাথেই impressions sections লিখুন (liked, disliked, async, routing ইত্যাদি) — friction/delight fresh থাকতে। **Verdict** পরের দিন পূরণ করুন — KEEP / CROSS-OFF / SECOND-LOOK সিদ্ধান্ত নেওয়ার আগে impressions-গুলিকে রাতভর settle হতে দিন।

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

| Base Framework | Meta-Framework                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| React          | Next.js                                                                                                  |
| Vue            | Nuxt                                                                                                     |
| Svelte         | SvelteKit                                                                                                |
| SolidJS        | SolidStart                                                                                               |
| Qwik           | Qwik City                                                                                                |
| Astro          | N/A — public-site slot-এর জন্য বিবেচিত, এই trial series-এর অংশ নয় (framework-agnostic shell/meta-layer) |
| htmx           | N/A (যেকোনো server-rendered backend-এর সাথে paired)                                                      |

**Favorite framework** হল highest-ranked KEEP, যা (a) time-to-complete, (b) syntax ergonomics, এবং (c) growth potential — এই তিনটি equal-weight composite-এর মাধ্যমে নির্ধারিত, কোনো single metric নয়। Composite টি advisory (কোন calculated formula নয়) — এটি প্রতিরোধ করার জন্য যে কোনো একটি শক্তিশালী impression পুরো ছবিকে overriding না করে।

## Conventions used in every trial

- **Package manager: Bun** — `bun create`, `bun install`, `bun run dev` (npm equivalents-এর পরিবর্তে)
- **Import alias:** `@/*` → `./src/*` in every trial's config, যাতে imports `../../components/ItemList`-এর পরিবর্তে `@/components/ItemList` পড়ে। প্রতিটি framework-এর config-এ যোগ করুন:
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
  - Qwik: same `tsconfig.json` paths entry; Qwik-এর Vite config একই `resolve.alias` block accept করে
  - htmx: skip — কোনো build step নেই, কোনো bundler নেই, alias প্রযোজ্য নয়

## Per-framework setup (প্রতি trial-এর জন্য এই pattern পুনরাবৃত্তি করুন)

### 1. Svelte

```bash
# frontend-frameworks/ root থেকে
bun create vite svelte --template svelte-ts
cd svelte
bun install
```

- Confirm করুন shared API চলছে (উপরের Setup section দেখুন) এবং `db.json` fresh seed দিয়ে regenerate করা হয়েছে
- Svelte dev server start করুন:
  ```bash
  bun run dev
  ```
- `@/*` alias যোগ করুন `vite.config.ts` এবং `tsconfig.json`-এ (উপরের Conventions দেখুন)
- Data fetch করুন `http://localhost:3000/items` থেকে
- এই folder-এ `README.md` তৈরি করুন উপরের Per-trial README template ব্যবহার করে (impressions এখন লিখুন, verdict আগামীকাল)
- Features-order-এ build করুন (Features section দেখুন): Part A items 1–7, তারপর Part B items 8–11
- Time-box: 2 ঘণ্টা। 2 ঘণ্টার mark-এ, চলমান feature শেষ করতে সর্বোচ্চ 15 মিনিট overflow দিন, তারপর বন্ধ করুন এবং README লিখুন।

### প্রতিটি বাকি framework-এর জন্য পুনরাবৃত্তি করুন

একই steps, শুধু scaffold command পরিবর্তিত হবে (এখনও Bun, এখনও `@/*` alias যোগ করুন):

| Framework | Scaffold command                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------ |
| Vue       | `bun create vite vue --template vue-ts`                                                          |
| SolidJS   | `bun create vite solid --template solid-ts`                                                      |
| Qwik      | `bun create qwik@latest` (empty app নির্বাচন করুন, `qwik/` folder-এ)                             |
| htmx      | কোনো scaffold নেই — plain `htmx/index.html` + `bunx serve`, CDN থেকে htmx script, কোনো alias নেই |
| React     | `bun create vite react --template react-ts`                                                      |
