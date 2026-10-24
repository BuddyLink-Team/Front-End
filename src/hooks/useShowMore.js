import { useCallback, useState } from 'react';

/** Suggestions and pickers show this many items before "Xem thêm" */
export const SHOW_MORE_PREVIEW_COUNT = 4;

/**
 * First items of a list with a "show more" toggle.
 * An item listed in `keepVisible` (e.g. the selected one) stays visible when the list is collapsed.
 *
 * @param {Array} items
 * @param {Object} [options]
 * @param {number} [options.previewCount=4]
 * @param {(item: any) => boolean} [options.keepVisible]
 * @returns {{ visibleItems: Array, hiddenCount: number, hasMore: boolean, isExpanded: boolean, toggle: () => void }}
 */
export const useShowMore = (items, { previewCount = SHOW_MORE_PREVIEW_COUNT, keepVisible } = {}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = useCallback(() => setIsExpanded((prev) => !prev), []);

  const hasMore = items.length > previewCount;
  const visibleItems =
    isExpanded || !hasMore
      ? items
      : items.filter((item, index) => index < previewCount || Boolean(keepVisible?.(item)));

  return { visibleItems, hiddenCount: items.length - visibleItems.length, hasMore, isExpanded, toggle };
};

export default useShowMore;
