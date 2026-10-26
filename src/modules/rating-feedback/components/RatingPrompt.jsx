import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import RatingModal from './RatingModal';
import { usePendingRatings } from '../hooks/usePendingRatings';
import { USER_ROLES } from '../../../constants/role.constants';
import { APP_EVENTS } from '../../../constants/event.constants';
import { setRatingPromptOpen } from '../redux/ratingFeedbackSlice';

// Mounted once in the parent layout: detects completed playdates on any screen.
export default function RatingPrompt() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const paywallOpen = useSelector(state => state.subscription?.isPaywallOpen);
  const userId = user?._id || user?.id;
  const enabled = isAuthenticated && user?.role === USER_ROLES.PARENT;
  const { playdate, dismiss, remove } = usePendingRatings(enabled, userId);
  const isOpen = Boolean(enabled && playdate && !paywallOpen);
  // Let other popups (e.g. achievement celebration) wait until the rating is done
  useEffect(() => {
    dispatch(setRatingPromptOpen(isOpen));
  }, [dispatch, isOpen]);
  useEffect(() => () => dispatch(setRatingPromptOpen(false)), [dispatch]);
  if (!isOpen) return null;
  const close = () => dismiss(playdate._id);
  const submitted = () => {
    close();
    remove(playdate._id);
    toast.success('Đã gửi đánh giá. Cảm ơn bạn!');
    window.dispatchEvent(new Event(APP_EVENTS.PLAYDATE_RATING_SUBMITTED));
  };
  return <RatingModal key={playdate._id} playdate={playdate} onClose={close} onSubmitted={submitted} />;
}
