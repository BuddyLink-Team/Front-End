/**
 * Display helpers of the planning suggestions, shared by the Create Playdate form (PlanningSuggestions)
 * and the AI assistant's choice cards.
 */

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * "2026-11-01" -> "CN 01/11" (the date of a slot is a calendar day, read it without a time zone shift)
 * @param {string} date - "YYYY-MM-DD"
 * @returns {string}
 */
export const formatSlotDay = (date) => {
  const [year, month, day] = date.split('-').map(Number);
  const weekDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS[weekDay]} ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
};

/**
 * How well a suggested slot fits the families' preferred days and times
 * @param {{ matchedParents: number, totalParents: number }} slot
 * @returns {string}
 */
export const slotFitText = ({ matchedParents, totalParents }) => {
  if (!matchedParents) return 'Chưa ai đặt lịch ưu tiên';
  if (matchedParents === totalParents) return totalParents > 1 ? 'Hợp với cả các gia đình' : 'Hợp với lịch ưu tiên của bạn';
  return `Hợp với ${matchedParents}/${totalParents} gia đình`;
};

/** 1.5 -> "1,5 km" */
export const formatKm = (km) => `${String(km).replace('.', ',')} km`;

/**
 * "Nhà bạn 1,2 km · Mẹ Lan 2,4 km": from each family's ward center to the place
 * @param {Array<{ label: string, distanceKm: number }>} [familyDistances]
 * @returns {string}
 */
export const familyDistanceText = (familyDistances = []) =>
  familyDistances.map((d) => `${d.label} ${formatKm(d.distanceKm)}`).join(' · ');

// Selectable suggestion chip (time slot, activity, place, AI choice option)
export const CHIP_CLASS = 'text-left px-3 py-2 rounded-xl border transition-colors flex flex-col gap-0.5 min-w-0';
export const chipState = (isActive) =>
  isActive
    ? 'border-primary bg-primary-soft text-text-primary shadow-2xs'
    : 'border-hairline bg-surface-container-lowest hover:border-primary-border hover:bg-surface-container-low';
export const LINK_CLASS = 'inline-flex items-center gap-1 text-label-sm font-semibold text-primary-dark hover:underline';
