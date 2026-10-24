import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import tailwindConfig from '../../tailwind.config.js';

// tailwind-merge only knows Tailwind's stock scale. Without this, custom tokens are misread:
// `text-label-md` is taken for a text color (and dropped next to `text-white`), and
// `px-space-md` / `max-w-shell` are kept alongside `px-3` / `max-w-md` instead of replacing them.
// The token names are read from tailwind.config.js, so new tokens are picked up automatically.
const tokens = tailwindConfig.theme.extend;
const keysOf = (themeKey) => Object.keys(tokens[themeKey] || {});

// tailwind-merge class group -> [class prefix, tailwind.config.js theme key]
const TOKEN_GROUPS = {
  'font-size': ['text', 'fontSize'],
  shadow: ['shadow', 'boxShadow'],
  rounded: ['rounded', 'borderRadius'],
  'border-w': ['border', 'borderWidth'],
  w: ['w', 'width'],
  h: ['h', 'height'],
  'min-w': ['min-w', 'minWidth'],
  'min-h': ['min-h', 'minHeight'],
  'max-w': ['max-w', 'maxWidth'],
  'max-h': ['max-h', 'maxHeight'],
  'grid-cols': ['grid-cols', 'gridTemplateColumns'],
  z: ['z', 'zIndex'],
  'stroke-w': ['stroke', 'strokeWidth'],
  scale: ['scale', 'scale'],
  'underline-offset': ['underline-offset', 'textUnderlineOffset'],
  ease: ['ease', 'transitionTimingFunction'],
  duration: ['duration', 'transitionDuration'],
};

const classGroups = Object.fromEntries(
  Object.entries(TOKEN_GROUPS).map(([group, [prefix, themeKey]]) => [
    group,
    [{ [prefix]: keysOf(themeKey) }],
  ])
);

const twMerge = extendTailwindMerge({
  extend: {
    // Spacing tokens feed every spacing utility (p, m, gap, inset, space-x...)
    theme: { spacing: keysOf('spacing') },
    classGroups,
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
