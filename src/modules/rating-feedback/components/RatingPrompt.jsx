import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import RatingModal from './RatingModal';
import { ratingFeedbackApi } from '../api/ratingFeedbackApi';
import { USER_ROLES } from '../../../constants/role.constants';

// Mounted once in the parent layout: detects completed playdates on any screen.
export default function RatingPrompt() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const paywallOpen = useSelector(state => state.subscription?.isPaywallOpen);
  const [pending, setPending] = useState([]);
  const [dismissed, setDismissed] = useState(() => new Set());
  const userId = user?._id || user?.id;
  const enabled = isAuthenticated && user?.role === USER_ROLES.PARENT;
  useEffect(() => {
    setPending([]);
    setDismissed(new Set());
    if (!enabled) return undefined;
    let active = true, loading = false;
    const check = async () => {
      if (loading || document.visibilityState === 'hidden') return;
      loading = true;
      try {
        const response = await ratingFeedbackApi.getPending();
        if (active) setPending(response.data);
      } catch (error) {
        // Keep the parent screen usable; retry on focus / the next poll.
        if (import.meta.env.DEV) console.warn('Không thể tải Playdate cần đánh giá:', error.message);
      } finally { loading = false; }
    };
    void check();
    const timer = window.setInterval(check, 30000);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [enabled, userId]);
  const playdate = pending.find(item => !dismissed.has(item._id));
  if (!enabled || !playdate || paywallOpen) return null;
  const close = () => setDismissed(previous => new Set([...previous, playdate._id]));
  const submitted = () => {
    close();
    setPending(previous => previous.filter(item => item._id !== playdate._id));
    toast.success('Đã gửi đánh giá. Cảm ơn bạn!');
    window.dispatchEvent(new Event('playdate-rating-submitted'));
  };
  return <RatingModal key={playdate._id} playdate={playdate} onClose={close} onSubmitted={submitted} />;
}
