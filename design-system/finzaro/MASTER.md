# Finzaro — product design system

## Product and visual intent
Finzaro is a Russian-language profit tracker for sellers of digital goods across marketplaces. The primary workflow is quick daily bookkeeping with an at-a-glance answer to four questions: how much profit is real, what the month may finish at, which marketplace contributes most, and what happened most recently.

**Direction:** dense, dark fintech analytics. Prioritize information hierarchy over decorative space. The dashboard should feel like a live instrument panel, not a marketing landing page.

## Design tokens
| Token | Value | Use |
|---|---|---|
| App canvas | `#07111F` | Main application shell |
| Sidebar | `#06101D` / `#071222` | Navigation surface |
| Card | `#0B1929` / `#0D1C2F` | Widgets and analysis |
| Divider | `#1A334E` | Quiet structure |
| Primary text | `#F3F8FF` | Totals and important labels |
| Muted text | `#819CBE` | Metadata and axis labels |
| Actual / positive | `#20D9C4` | Recorded profit and revenue |
| Forecast | `#546CFF` → `#9C6CFF` | Projected part of chart |
| Expense / negative | `#EF5B9F` | Costs and negative values |
| Cool supporting accent | `#22B8E8` | Income or secondary metrics |
| Radius | 11–15 px | Cards and controls |
| Motion | 150–250 ms | Short state feedback; respect reduced motion |

Use semantic CSS custom properties across every component. The active user-selected theme must colour the sidebar, cards, tables, inputs, charts, dialogs, badges, hover/focus states and achievement surfaces consistently. Never pin the dashboard to a fixed dark palette; Obsidian is one theme option, not the design-system baseline.

## Information architecture
1. **Header:** section heading, month navigation, marketplace filters.
2. **KPI row:** overall profit, income, expenses, margin; compare with prior month only when the data supports a meaningful comparison.
3. **Monthly forecast:** recorded daily values and cautious remaining-day projection; actual and projected periods must be visually distinct.
4. **Three-up insights:** marketplace profitability, daily income-vs-expense trend, latest operations.
5. **Secondary row:** short statistics, monthly goal progress, streak rewards, and best/worst performers.
6. **Existing work area:** games/categories, operation list, and extended analytics remain available below the dashboard.
7. **Sidebar shortcuts:** home, operations, stock, analytics, marketplaces, calculator, import/export, settings.

## Data and accounting invariants
- Keep the existing vanilla JavaScript and single-file runtime unless the owner explicitly approves a stack migration.
- The `agg` function remains the source of truth for income, costs, fees, withdrawals, and net profit.
- Purchases are inventory assets, not immediate profit expenses. Inventory COGS is recognized only for units sold (FIFO) or explicitly written off. Never introduce a second independent profit formula in UI-only widgets; aggregate the same transformed operations. Sales may exceed logged purchases: keep the sale, cap COGS at available stock, never create negative stock or block saving, and visibly flag the uncosted quantity so it can be reconciled.
- Withdrawals are transfers, not profit expenses; only the configured withdrawal fee can affect profit.
- Monthly projection is based on past daily history, blends longer and recent averages, then applies the cautious 10% reduction already defined in `fcForecastFromDaily`.
- Empty states should preserve the structure of the dashboard and invite the first operation rather than invent data.
- The streak measures consecutive local calendar days of visiting the app, not the number or value of sales.

## Interaction and accessibility
- Every sidebar shortcut must route to an existing view, dialog, or filter.
- Keep keyboard-visible focus rings, descriptive labels for icon-only actions, and legends that name both chart series.
- Never use colour as the only signal: label actual/projection and income/expense in text.
- Motion is decorative only; respect `prefers-reduced-motion`.
- Mobile navigation wraps or scrolls without forcing horizontal overflow on the whole page. KPI cards collapse to two columns, secondary widgets to one.
- Preserve saved operation data, custom fees, marketplace settings, inventory markers, import markers, and JSON backup compatibility.

## Streak reward ladder
1 day — First Spark; 3 — Spark; 7 — Week of Fire; 14 — Steady Flame; 30 — Hot Month; 60 — Keeper of the Flame; 100 — Finzaro Legend; 180 — Half-Year Flame; 365 — Eternal Fire.
Rewards are cosmetic acknowledgements saved in local storage. Do not gate accounting features behind them or reset a user's records when the appearance changes.

## Maintenance notes
This is a static GitHub Pages-style app; most implementation lives in `index.html`. Many renderer functions query elements by ID, so before moving a node, preserve its ID and ensure there is still exactly one copy. The social preview and icon are maintained in `assets/finzaro-og.svg` and `assets/finzaro-icon.svg`.


## Global semantic theme bridge
All UI components must consume the existing theme variables (`--bg`, `--card`, `--c2`, `--pop`, `--tx`, `--mut`, `--line`, `--acc`, `--acc2`, `--acl`, `--pos`, `--neg`, `--b1`, `--b2`, `--b3`, `--sh`). Components should not copy a dark palette's hex values into component CSS. A semantic bridge in `:root` maps theme tokens into surface/text/border/interaction roles.

- Surface hierarchy: `--bg` canvas, `--card` cards, `--c2` nested surfaces/inputs, `--pop` dialogs/overlays.
- Text hierarchy: `--tx` primary content, `--mut` supporting copy, `--acl` accent link/action text where contrast is appropriate.
- Interactive: `--acc` primary accent, `--acc2` secondary accent, `--line` dividers, `--sh` elevation, semantic `--pos` / `--neg` states.
- Use `color-mix(in srgb, <semantic token> X%, var(--card))` for tinted surfaces and selected/hover states. Don't use hard-coded navy, white, teal, orange or violet for structural surfaces.
- Data visualizations can use `--acc`, `--acc2`, `--b1`, `--b2`, `--b3`, `--pos` and `--neg` as a theme-derived series palette. Keep status meaning clear and keep axis/legend contrast.
- Theme-specific style differences (e.g. maximal's thicker border/shadow) are allowed, but semantic colour roles still come from tokens.


## Inventory accounting policy (source of truth)
- Identify inventory by normalized game/category plus item name. Do not split inventory solely by sales marketplace; a unit may be bought on one marketplace and sold on another.
- FIFO lot events are ordered by date, with purchases before sales on the same date because the user records date but not time.
- Buying stock does not by itself increase or decrease profit. A purchase lot's remaining cost is held in inventory and only its sold portion becomes COGS on the sale date. Explicitly written-off units become expense on the write-off date.
- When a sale asks for more units than logged stock, consume only available units, set the uncosted shortage on that sale, and continue normally. Don't create a negative lot, throw a validation error, or invent a cost for the missing part.
- When an operation is deleted, recompute FIFO allocation and all dependent profit views, summaries, charts and stock-gap flags from the remaining source operations. Update the UI immediately after the server accepts deletion and retain the undo/restore path.
- Keep cash/operations history distinct from profit-and-loss: purchase rows remain visible in the raw operation ledger, but not as direct P&L expenses.


## Daily streak and check-in contract
- The fire streak is a **confirmed daily finance review**, not an automatic visit counter. Each day can be marked once; the user explicitly confirms they reviewed income, expenses, and inventory/stock.
- Preserve the previous `visits` history during migration so a user's existing run and best streak are not discarded. New streak entries are stored separately under `streakCheckins`. A missed day resets the active run but never erases the best record.
- The streak window should make the current day actionable: if yesterday was checked but today is not, show the active run and a clear check-in call to action.
- The streak dialog should stay useful and restrained: one daily check-in, last-7-day activity strip, a real 7-day financial summary, current progress, and a collapsed milestone history. Avoid a large grid of fake cosmetic rewards.
- The weekly summary should show actual income, expenses and profit from the same P&L/FIFO pipeline as the dashboard; compare it with the previous seven calendar days. The streak itself must not require a sale—review-only days count.
