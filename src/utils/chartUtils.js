// SVG attributes need real colors: read the palette variables that styles/index.css fills from tailwind.config.js
export const getCssColor = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;
