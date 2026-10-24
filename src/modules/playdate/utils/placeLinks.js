/**
 * Google Maps directions to a place
 * @param {[number, number]} coordinates - [lng, lat] (GeoJSON order, as returned by the places API)
 * @returns {string|null}
 */
export const googleMapsDirectionsUrl = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
  const [lng, lat] = coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

/**
 * [lng, lat] of a place or a playdate location ({ type: 'Point', coordinates } or a plain array)
 * @param {Object|Array|null} value
 * @returns {[number, number]|null}
 */
export const toLngLat = (value) => {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.coordinates) ? value.coordinates : null;
};
