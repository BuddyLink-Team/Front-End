import { useState, useCallback } from 'react';
import { swipeProfile } from '../api/discoveryApi';
import { useToast } from '../../../hooks/useToast';

export const useSwipe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError } = useToast();

  const handleSwipe = useCallback(async (targetChildId, isLike, removeTopProfile) => {
    // Optimistic update: remove card immediately for smooth UX
    if (removeTopProfile) {
      removeTopProfile();
    }

    try {
      setIsLoading(true);
      await swipeProfile(targetChildId, isLike);
    } catch (error) {
      showError(error?.message || 'Có lỗi xảy ra khi thực hiện hành động này');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  return { handleSwipe, isLoading };
};
