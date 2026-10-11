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
