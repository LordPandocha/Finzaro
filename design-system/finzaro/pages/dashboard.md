# Dashboard page override

- Main visual anchor: full-width actual-vs-forecast day chart with a clear today boundary and a forecast label.
- KPI order: net profit → income → expenses → margin.
- Beneath the forecast, use three equal cards: marketplace profit, income/expenses trend, latest operations.
- The left rail stays vertical and pinned to the left edge at every viewport width. On phones it collapses to a narrow icon rail with accessible labels, an internal scroll area for navigation, and the streak/theme controls near the bottom. Never convert it to a top horizontal navigation.
- The target visual density is deliberately high. Prefer concise supporting text, legible axes, and tabular numerals over adding more empty card padding.
- The main forecast is not a prediction guarantee. Keep the “примерная” / cautious projection framing and the 10% discount marker.
- When there are no operations, show an explanatory empty state instead of hiding the forecast card.
- Streak milestones are: 1, 3, 7, 14, 30, 60, 100, 180, and 365 consecutive visit days. The streak is a habit feature, not a profit KPI.

- **Monthly bars must not imply certainty:** use recorded operations for past days and a visibly distinct forecast for future days. Forecast bars vary using available weekday/history patterns, while their average is normalized to preserve the existing conservative monthly estimate (−10%). Add a note that the daily split is an estimate.
- **Always-side navigation:** on phone widths keep a fixed, icon-led vertical rail at the left. Do not convert the navigation into a top header. Keep touch targets large enough and provide tooltips/accessibility labels for icon-only navigation.
- **Readable dense data:** primary numbers and labels need clear contrast. Keep secondary copy around 12px or more and primary table/row values around 14px or above; don't shrink text just to fit more columns. Prefer a readable one-column card stack on phones, with the month chart horizontally scrollable in its own container.
- **Meaningful hover/focus:** clickable rows must show an unmistakable background, left accent, or focus outline. Hover must not be the only interaction state; keep keyboard focus visible.
- **Streak rewards are a collection, not just labels:** show what each milestone unlocks, progress toward the next reward, a record, and a tasteful unlock animation. Respect reduced-motion settings.


## Theme contract (global, mandatory)
- The selected theme applies to every visible section of the app, not only older forms: header, side rail, KPI tiles, profit forecast, marketplace rows, daily income/expense trend, recent activity, goals, streak dialog, tables, operation rows, inventory, fee editor, import/export panels and settings.
- Use the semantic bridge from `MASTER.md`; never hard-code a dark surface or text colour inside a reusable component.
- Each KPI can use a distinct theme-driven semantic accent (`--acc`, `--acc2`, `--neg`, `--b3`) while its background, border and type inherit active theme surfaces.
- Donut and line-series palettes must be theme-derived CSS variables rather than a fixed list of hexadecimal colours.
- Hover, selected and keyboard-focus styles should tint the active theme accent into the theme card surface. Use an obvious focus ring, preserve contrast, and respect `prefers-reduced-motion`.

- **Single profit source of truth:** monthly forecast and extended “profit by day” chart must call the same `marketplaceProfitOps` transformation, including FIFO COGS rows and stock closures. Don't bypass it when marketplace filter is “all”; otherwise the same date can show different profit in the two charts.
- **Selection totals are mandatory:** after dragging across days, persistently show day count/range plus summed revenue, expenses/fees, and net profit. During drag, label totals as a preview; after pointer release, compute and show exact totals. Don't mutate the preset/date-range status line from pointer-move handlers.
- **Hover values must survive long enough to read:** charts update a visible readout on pointer hover, click/tap, and keyboard focus. Pointer leave may hide the cursor-following tooltip but must not blank the visible detail immediately.
- **Revenue/expense line chart:** every day needs a transparent, keyboard-focusable hitbox with a full accessible label, and a persistent readout for date, income, expenses, and net result. Native SVG `<title>` alone is not a sufficient primary interaction.
- **Permanent rail implementation:** use a viewport-fixed sidebar with a matching content offset, and test scroll position. Sticky can attach to an unintended scrolling ancestor when overflow is set on ancestors; see MDN's position notes: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position.
- **Pointer/touch testing:** use Pointer Events for drag-range selection, but do not reject touch pointers based on mouse-only button semantics. Keep a visible non-hover path for touch and keyboard users. See https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events.

- **Touch day selection is opt-in:** on mobile, chart touch should scroll the page by default. A visible “Выделять дни” toggle enables the drag/tap-selection interaction and only then applies `touch-action:none`. Mouse users can still drag the range with the pointer.
- **Negative expense/refund days:** the income-versus-expense chart must include negative values in its vertical scale and draw the zero baseline correctly; don't let refunds or fee reversals render below the SVG viewport.

- **Inventory is not an immediate P&L expense:** a purchase leaves profit unchanged; only the sold portion is recognized as FIFO COGS on the sale date. Remaining stock keeps its carrying cost; manual stock closure is an expense on the write-off date.
- **Cross-marketplace inventory:** match normalized game/category + item name. A sale from another marketplace can consume those lots.
- **Inventory shortage:** if logged purchases cover 5 units and the user records a sale of 6, do not block the operation. COGS uses the available 5 units; report 1 uncosted unit and never create negative stock.
- **Delete must trigger dependent recomputation:** after the database accepts removal, rebuild stock/FIFO, operation lists, summaries, KPI, marketplace/game tables, dashboard graphs and shortage flags; refresh the undo state. Server failure must leave the existing UI/data intact.


## Automatic streak and restore UX contract
- Every distinct local calendar day when the user opens Finzaro automatically adds that date to `streakVisits`; repeated reloads on the same day do not add extra days.
- Preserve the legacy `visits`, former `streakCheckins`, and best-run data through migration.
- A gap of one or two adjacent missed dates can be restored if the user returns within 48 hours. Give two restore credits per calendar month, show the remaining count, and require an explicit click to spend one credit. Never auto-consume recovery.
- A return after a break should surface a recoverable-streak CTA via the modal and a one-time toast. If recovery is used, put the missed date back into the visit ledger and recalculate the streak/reward tier.
- Use evolving flame styles and concise milestone language rather than a large grid of cosmetic cards. Show a seven-day visit calendar, next milestone, personal best, and restore credits.
- Hide the analytic hover-detail card while one or more days are selected; only show the selected-range totals under the analytics chart. Restore the detail card when selection is cleared.
