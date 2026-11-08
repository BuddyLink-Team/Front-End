/**
 * The host can bring several own children to one playdate (BUD-49). The API sends `hostChildren`
 * (main child first); older playdates and drafts only have `hostChild`.
 */

/**
 * Every child of the host, main child first
 * @param {{ hostChild?: Object|null, hostChildren?: Array<Object> }} playdate - Playdate or AI plan draft
 * @returns {Array<Object>}
 */
export const hostChildrenOf = (playdate) => {
  const list = playdate?.hostChildren?.filter((child) => child?.displayName) || [];
  if (list.length) return list;
  return playdate?.hostChild ? [playdate.hostChild] : [];
};

/**
 * "Na", "Na, Bin": names of the host's children
 * @param {Object} playdate
 * @returns {string}
 */
export const hostChildNames = (playdate) =>
  hostChildrenOf(playdate)
    .map((child) => child.displayName)
    .filter(Boolean)
    .join(', ');
