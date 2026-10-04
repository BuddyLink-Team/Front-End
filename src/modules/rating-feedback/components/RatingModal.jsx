import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';
import { useRatingFeedback } from '../hooks/useRatingFeedback';

export function RatingModal({ playdate, onClose, onSubmitted }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

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

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button')?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !savingRef.current) {
        closeRef.current();
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusableNodes = [
          ...dialogRef.current.querySelectorAll(
            'button:not(:disabled), textarea:not(:disabled), input:not(:disabled)'
          ),
        ];
        const first = focusableNodes[0];
        const last = focusableNodes.at(-1);

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [savingRef]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!savingRef.current) onClose();
        }}
      />

      {/* Modal Dialog */}
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-dialog-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-3xl border border-outline-variant/30 bg-white p-6 sm:p-8 shadow-modal"
      >
        {/* Close Button */}
        <button
          type="button"
          aria-label="Đóng đánh giá"
          disabled={submitting}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <X size={20} />
        </button>

        {/* Icon Header */}
        <div className="w-14 h-14 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-5 shadow-sm">
          <Star size={28} className="fill-tertiary text-tertiary-dark" />
        </div>

        <h2 id="rating-dialog-title" className="text-headline-md font-semibold text-on-surface">
          Buổi chơi của bạn thế nào?
        </h2>
        <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
          Playdate <strong className="text-on-surface font-semibold">“{playdate.activity}”</strong> đã hoàn thành. Hãy chia sẻ trải nghiệm để cộng đồng BuddyLink thêm gắn kết!
        </p>

        {/* Rating Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
          <div>
            <label htmlFor="playdate-feedback-input" className="text-label-lg font-semibold text-on-surface">
              Nhận xét <span className="font-normal text-on-surface-variant">(không bắt buộc)</span>
            </label>
            <textarea
              id="playdate-feedback-input"
              value={feedback}
              disabled={submitting}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Điều gì khiến buổi chơi đáng nhớ nhất?"
              className="mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-3 text-body-md resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Error message */}
          {error && (
            <p role="alert" className="text-error text-body-md font-medium">
              {error}
            </p>
          )}

          {/* Modal Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-label-md font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
            >
              Để sau
            </button>
            <button
              type="submit"
              disabled={!rating || submitting}
              className="px-6 py-2.5 rounded-full text-label-md font-semibold bg-primary text-on-primary hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}

export default RatingModal;
