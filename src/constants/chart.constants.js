/**
 * Chart sizes for recharts props (they take numbers, not Tailwind classes).
 * The chart height itself is the `h-chart` token in tailwind.config.js.
 */
export const CHART_SIZE = Object.freeze({
  TICK_FONT: 12, // Matches text-xs
  Y_AXIS_WIDTH: 80, // Room for VND amounts on the y axis
  BAR_MAX: 48,
  BAR_RADIUS: 8, // Matches rounded (0.5rem) on the top corners
  MARGIN_TOP: 8,
  MARGIN_RIGHT: 8,
});

/** CSS variables (styles/index.css, filled from tailwind.config.js) the charts are painted with */
export const CHART_COLOR_VARS = Object.freeze({
  BAR: '--color-primary',
  GRID: '--color-hairline',
  TICK: '--color-text-muted',
});
