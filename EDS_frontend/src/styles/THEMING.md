# Theming & Dark Mode

One system drives every color in the app. Follow these rules and light/dark
stay uniform automatically.

## How it works

1. **`tokens.css`** is the single source of truth. It defines raw brand colors
   (`--color-*`) and **semantic tokens** (`--theme-*`, `--chart-*`) whose values
   swap between light and dark.
2. The active mode is the **`data-theme`** attribute on `<html>` (`light` /
    `dark`). Changing it re-computes every `var(--theme-*)`.
3. **`ThemeContext`** (`src/context/ThemeContext.jsx`) is the only thing that
   writes `data-theme` + `localStorage`. Read it with `useTheme()`.

```
--color-*  (raw palette, fixed)
   → --theme-* / --chart-*  (semantic, swap per mode)   ← tokens.css
      → components read the semantic tokens
```

## Rules

**Never hardcode a color** (`#hex`, `rgb()`, `text-gray-500`, `bg-white`) for
anything that should respond to the theme. Use a semantic token instead.

| Need            | Use                                                        |
| --------------- | ---------------------------------------------------------- |
| Background      | `var(--theme-bg-primary / -secondary / -tertiary)`         |
| Text            | `var(--theme-text-primary / -secondary / -muted)`          |
| Border          | `var(--theme-border-light / -medium)`                      |
| Success/Error…  | `var(--theme-success / -error / -warning / -info)`         |
| Brand red       | `var(--color-primary)` — intentionally the same in both modes |

In JSX this works three ways, all equivalent:

```jsx
// inline style
<div style={{ color: "var(--theme-text-primary)" }} />
// Tailwind arbitrary value
<div className="text-[var(--theme-text-primary)]" />
// a CSS class in dashboard.css that uses the token
<div className="dashboard-card" />
```

## Charts

ApexCharts takes colors as JS props, so it can't read CSS. Use the bridge:

```jsx
import { useChartColors } from "../../hooks/useChartColors";

const c = useChartColors(); // { axis, grid, label, title, tooltip, bg, series[] }
// axis/grid/label/title → chrome   tooltip → "light"|"dark"   series → brand palette
```

- Feed `c.axis`, `c.grid`, `c.label`, `c.title` into axis/label/grid styles.
- Set `tooltip.theme: c.tooltip`.
- Use `c.series` for data colors (same brand family in both modes).
- For imperative ApexCharts (`new ApexCharts(...)` in a `useEffect`), add `c`
  to the effect's dependency array so it redraws on theme change.

## Ant Design

Two layers theme Ant components:

1. **`App.jsx`** switches `ConfigProvider`'s algorithm to `theme.darkAlgorithm`
   in dark mode — the baseline dark palette. `colorPrimary` stays red.
2. **`antd-theme.css`** pins Ant components to our `--theme-*` tokens and adds
   the brand-red accents (table header tint, red row-hover sweep, primary
   buttons, steps), so Ant matches the dashboard exactly.

Put any new `[data-theme="dark"] .ant-*` rule in **`antd-theme.css`** — never
in `dashboard.css`. Keeping all Ant theming in one file is the whole point.

## CSS file map

| File | Responsibility |
| ---- | -------------- |
| `tokens.css` | Design tokens — the only place colors are *defined*. Imported first. |
| `antd-theme.css` | All `[data-theme="dark"] .ant-*` component theming. |
| `dashboard.css` | Dashboard layout & custom `.dashboard-*` components (no Ant overrides). |
| `homepage.css` | Landing / marketing pages. |
| `legal.css` | Privacy / terms pages. |
| `index.css` | Global base (body, headings) + a few global Ant tweaks. Imports the above. |

Load order (set in `index.css`): tokens → dashboard → antd-theme → tailwind.
