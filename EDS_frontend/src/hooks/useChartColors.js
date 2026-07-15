import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

/**
 * useChartColors — bridges the CSS `--chart-*` tokens (tokens.css) into the
 * JS color props that ApexCharts needs.
 *
 * ApexCharts can't read CSS variables, so we resolve them with
 * getComputedStyle and recompute whenever `resolvedTheme` changes. tokens.css
 * stays the single source of truth — change a color there and charts follow.
 *
 * Returns:
 *   axis, grid, label, title  → hex strings for chrome
 *   tooltip                   → "light" | "dark" (ApexCharts tooltip.theme)
 *   series                    → ordered brand palette (same in both modes)
 */
export function useChartColors() {
  const { resolvedTheme } = useTheme();

  return useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const v = (name, fallback) => {
      const value = css.getPropertyValue(name).trim();
      return value || fallback;
    };

    return {
      axis: v("--chart-axis", "#4b5563"),
      grid: v("--chart-grid", "#e5e7eb"),
      label: v("--chart-label", "#1f2937"),
      title: v("--chart-title", "#1f2937"),
      tooltip: v("--chart-tooltip", "light"),
      // card background — used for pie/donut slice borders so they blend in
      bg: v("--theme-bg-primary", "#ffffff"),
      series: [
        v("--chart-series-1", "#ae272d"),
        v("--chart-series-2", "#A01F2F"),
        v("--chart-series-3", "#E05A5F"),
        v("--chart-series-4", "#8e2024"),
        v("--chart-series-5", "#F59E0B"),
        v("--chart-series-6", "#10B981"),
        v("--chart-series-7", "#3B82F6"),
        v("--chart-series-8", "#8B5CF6"),
      ],
    };
    // resolvedTheme drives the recompute: when it changes, the data-theme
    // attribute has already updated, so getComputedStyle returns new values.
  }, [resolvedTheme]);
}
