/**
 * Chart sizes for recharts props (they take numbers, not Tailwind classes).
 * The chart height itself is the `h-chart` token in tailwind.config.js.
 */
export const CHART_SIZE = Object.freeze({
  TICK_FONT: 12, // Matches text-xs
  Y_AXIS_WIDTH: 80, // Room for VND amounts on the y axis
  Y_AXIS_WIDTH_COMPACT: 48,
  BAR_MAX: 48,
  BAR_MAX_SM: 36,
  BAR_RADIUS: 8, // Matches rounded (0.5rem) on the top corners
  BAR_RADIUS_SM: 6,
  MARGIN_TOP: 8,
  MARGIN_RIGHT: 8,
  PIE_INNER_RADIUS: 50,
  PIE_OUTER_RADIUS: 75,
  PIE_PADDING_ANGLE: 2,
  LINE_STROKE: 2.5,
  DOT_RADIUS: 4,
  ACTIVE_DOT_RADIUS: 6,
});

/** CSS variables (styles/index.css, filled from tailwind.config.js) the charts are painted with */
export const CHART_COLOR_VARS = Object.freeze({
  BAR: '--color-primary',
  GRID: '--color-hairline',
  TICK: '--color-text-muted',
  PRIMARY: '--color-primary',
  PRIMARY_DARK: '--color-primary-dark',
  SECONDARY: '--color-secondary',
  TERTIARY: '--color-tertiary',
  TERTIARY_DARK: '--color-tertiary-dark',
  ERROR: '--color-error',
  MUTED: '--color-text-muted',
});
