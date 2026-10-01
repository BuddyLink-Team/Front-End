import { useCallback } from 'react';
import { swipeProfile } from '../api/discoveryApi';

export const useSwipe = () => {
  const handleSwipe = useCallback(async (targetChildId, isLike, removeTopProfile) => {
    // Optimistic update: Xóa thẻ lập tức trên UI để trải nghiệm mượt mà
    if (removeTopProfile) {
      removeTopProfile();
    }

    try {
      await swipeProfile(targetChildId, isLike);
    } catch (error) {
      console.error('Lỗi khi swipe:', error);
      // TODO: Thêm toast notification báo lỗi
    }
  }, []);

  return { handleSwipe };
};
