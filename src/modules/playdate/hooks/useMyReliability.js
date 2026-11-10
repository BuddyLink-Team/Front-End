import { useEffect, useState } from 'react';
import playdateApi from '../api/playdateApi.js';

/**
 * Own reliability (GET /playdates/reliability/me): late leaves over the last 90 days.
 * A failure only hides the card: the profile page keeps working.
 * @returns {{ reliability: Object|null, isLoading: boolean }}
 */
export const useMyReliability = () => {
  const [reliability, setReliability] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    playdateApi
      .getMyReliability()
      .then((res) => {
        if (isActive) setReliability(res?.data || null);
      })
      .catch(() => {
        if (isActive) setReliability(null);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  return { reliability, isLoading };
};

export default useMyReliability;
