import { useState, useRef } from 'react';
import { ratingFeedbackApi } from '../api/ratingFeedbackApi';
import { RATING_ERROR_CODES, RATING_FEEDBACK_ERROR_MESSAGES } from '../constants/rating-feedback.constants';
import { getApiErrorMsg, getErrorCode } from '../../../utils/errorUtils';

export function useRatingFeedback({ playdate, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const savingRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    if (!rating) {
      setError('Vui lòng chọn số sao đánh giá.');
      return;
    }

    savingRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      await ratingFeedbackApi.submit(playdate._id, {
        rating,
        feedback: feedback.trim(),
      });
      if (onSubmitted) onSubmitted();
    } catch (err) {
      if (getErrorCode(err) === RATING_ERROR_CODES.RATING_ALREADY_EXISTS) {
        if (onSubmitted) onSubmitted();
      } else {
        setError(getApiErrorMsg(RATING_FEEDBACK_ERROR_MESSAGES, err, 'Không thể gửi đánh giá. Vui lòng thử lại.'));
      }
    } finally {
      savingRef.current = false;
      setSubmitting(false);
    }
  };

  return {
    rating,
    setRating,
    hover,
    setHover,
    feedback,
    setFeedback,
    submitting,
    error,
    savingRef,
    handleSubmit,
  };
}
