import React from 'react';
import { Star } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { useRatingFeedback } from '../hooks/useRatingFeedback';

const RATING_FORM_ID = 'playdate-rating-form';

export function RatingModal({ playdate, onClose, onSubmitted }) {
  const {
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
  } = useRatingFeedback({ playdate, onSubmitted });

  // The rating cannot be dismissed while it is being saved
  const handleClose = () => {
    if (!savingRef.current) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={
        <span className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-sm shrink-0">
            <Star size={20} className="fill-tertiary text-tertiary-dark" />
          </span>
          Buổi chơi của bạn thế nào?
        </span>
      }
      footer={
        <>
          <Button variant="ghost" disabled={submitting} onClick={handleClose}>
            Để sau
          </Button>
          <Button type="submit" form={RATING_FORM_ID} disabled={!rating} isLoading={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </>
      }
    >
      <p className="text-body-md text-on-surface-variant leading-relaxed">
        Playdate <strong className="text-on-surface font-semibold">“{playdate.activity}”</strong> đã hoàn thành. Hãy chia sẻ trải nghiệm để cộng đồng BuddyLink thêm gắn kết!
      </p>

      <form id={RATING_FORM_ID} onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* 5-Star Selection */}
        <fieldset disabled={submitting}>
          <legend className="text-label-lg font-semibold text-on-surface mb-3">
            Đánh giá của bạn
          </legend>
          <div className="flex gap-2" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = (hover || rating) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} sao`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHover(value)}
                  className="p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      isSelected
                        ? 'fill-tertiary-fixed text-tertiary-dark stroke-[1.5]'
                        : 'text-outline-variant stroke-[1.5]'
                    }
                  />
                </button>
              );
            })}
          </div>
          <p className="text-label-md text-on-surface-variant mt-2" aria-live="polite">
            {rating ? `${rating} / 5 sao` : 'Vui lòng chọn từ 1 đến 5 sao'}
          </p>
        </fieldset>

        {/* Feedback Textarea */}
        <Textarea
          id="playdate-feedback-input"
          label={
            <>
              Nhận xét <span className="font-normal text-on-surface-variant">(không bắt buộc)</span>
            </>
          }
          value={feedback}
          disabled={submitting}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Điều gì khiến buổi chơi đáng nhớ nhất?"
        />

        {error && (
          <p role="alert" className="text-error text-body-md font-medium">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default RatingModal;
