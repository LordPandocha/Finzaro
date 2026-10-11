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

Use the existing CSS custom properties for user-selected themes where practical. Dashboard surfaces intentionally retain the dark palette to match the approved reference.

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
- Inventory COGS is generated through the current FIFO calculation. Never introduce a second independent profit formula in UI-only widgets; aggregate the same transformed operations.
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
