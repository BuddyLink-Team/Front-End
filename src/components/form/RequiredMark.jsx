import React from 'react';

/**
 * Red star after the label of a required field
 */
export const RequiredMark = () => (
  <span className="text-error" aria-hidden="true">
    {' *'}
  </span>
);

export default RequiredMark;
