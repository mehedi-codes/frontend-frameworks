# Frontend Framework Trial Series

A structured methodology for comparing frontend frameworks by building the same CRUD application against the same backend spec within a fixed time-box. The domain is the trial methodology itself — the application model (`items`) is a deliberately generic test specimen, not a real business domain.

## Language

**Trial (noun)**:
A single time-boxed session (1–2 hours) where one framework is used to build the spec application. A trial starts at scaffold command and ends when the time-box expires or all features are complete, whichever comes first. The trial's output is a built application folder plus a README (written immediately at stop time) and a Verdict (filled in the next day).

**Trial Series**:
The full sequence of N base-framework trials, each run against the same evolving spec, with the shared API reset to a fresh randomly-generated seed between each trial. The series is the full comparison; a single trial is one data point.

**Spec Application**:
The canonical CRUD application defined in the Root README — a generic `items` resource with list, add, toggle, delete, edit, filter, derived count, and detail-route features plus routing patterns (params+loader, parallel fetch, route guard). It is a test specimen designed to exercise each framework's reactivity, async patterns, and routing, not a real product.

**Verdict**:
The outcome label assigned to a framework after its trial, chosen from three buckets:
- _KEEP_ — will use this framework for real work
- _CROSS-OFF_ — will not use this framework again
- _SECOND-LOOK_ — the base framework itself isn't a fit, but its meta-framework is worth evaluating for possible improvements

The Verdict is written the day after the trial ends (not at time-box stop), allowing impressions to settle overnight. The README impressions sections are written immediately at stop time.

**Meta-Framework Decision**:
After all base-framework trials, a meta-framework trial is done only for frameworks that received a SECOND-LOOK verdict. The favorite framework (the one you'd actually use) is the highest-ranked KEEP, determined by an equal-weight composite of time-to-complete, syntax ergonomics, and growth potential — not a single metric.

**Part A — Dashboard Zone**:
The mutation-heavy half of the spec (features 1–7: list, add, toggle, delete, edit, filter, derived count). Tests core reactivity, async mutation patterns, and loading states. The initial list fetch requires a loading indicator; mutation loading states (add, toggle, delete, edit) also require pending/optimistic indicators to test each framework's async ergonomics more deeply.

**Part B — Public Zone**:
The read-only half of the spec (features 8–11: detail route, route params+loader, parallel vs waterfall fetch, route guard). Tests routing with fetch-and-render views. No mutations, no edit/delete controls on these views.

**Time-Box**:
The soft stop rule: stop at the 2-hour mark but allow up to 15 minutes of overflow to finish an in-progress feature. If at the 2-hour mark you're within 15 minutes of completing a feature, finish it. Otherwise stop immediately. The trial README is written right at stop time, capturing impressions while fresh. Incomplete features are skipped — the feature-completion count becomes a data point in the comparison.

**Test Specimen**:
The `items` data model (`{ id, title, done, description }`) served by json-server. It is deliberately generic — not a real business entity — so framework ergonomics can be compared without domain-specific noise. The seed data is freshly randomized before each trial rather than reset to a fixed baseline, so each trial starts from a different initial state.

**Feature Completion**:
A feature is considered complete when it reaches functional completeness — it works correctly in the browser with basic error handling and no known bugs. No styling polish, animations, or production hardening is required.

**Seed Rotation**:
Before each trial, the `db.json` is regenerated with a fresh random dataset (same schema, different items). This prevents trial-to-trial carryover while also testing how each framework handles varying seed states.