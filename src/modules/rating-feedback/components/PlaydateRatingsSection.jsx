import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquareQuote, Star } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { FormSection } from '../../../components/form/FormSection';
import { APP_EVENTS } from '../../../constants/event.constants';
import { formatDate } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { usePlaydateRatings } from '../hooks/usePlaydateRatings';
import RatingModal from './RatingModal';

const StarRow = ({ value, className }) => (
  <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value}/5 sao`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          'w-3.5 h-3.5',
          star <= Math.round(value) ? 'fill-tertiary text-tertiary-dark' : 'text-outline-variant',
        )}
      />
    ))}
  </span>
);

/** Ratings & feedback of a completed playdate, shown on the playdate detail page */
export function PlaydateRatingsSection({ playdate }) {
  const { summary, ratings, canRate, isLoading } = usePlaydateRatings(playdate?.id);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const handleSubmitted = () => {
    setIsRatingOpen(false);
    toast.success('Đã gửi đánh giá. Cảm ơn bạn!');
    window.dispatchEvent(new Event(APP_EVENTS.PLAYDATE_RATING_SUBMITTED));
  };

  return (
    <FormSection
      title="Đánh giá & cảm nhận"
      description="Chia sẻ của các phụ huynh sau buổi chơi."
      icon={MessageSquareQuote}
      aside={
        summary.count > 0 && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
            <Star className="w-4 h-4 fill-tertiary text-tertiary-dark" />
            {summary.average.toFixed(1)}
            <span className="font-normal text-text-muted">({summary.count} đánh giá)</span>
          </span>
        )
      }
    >
      {canRate && (
        <div className="p-4 rounded-2xl bg-tertiary-soft border border-tertiary-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-text-primary">Buổi chơi của bạn thế nào? Hãy để lại đánh giá nhé!</p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsRatingOpen(true)}
            leftIcon={<Star className="w-3.5 h-3.5" />}
            className="rounded-full shrink-0 self-start sm:self-auto"
          >
            Đánh giá buổi chơi
          </Button>
        </div>
      )}

      {isLoading && ratings.length === 0 ? (
        <div className="h-20 rounded-2xl bg-surface-container-low animate-pulse" />
      ) : ratings.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">Chưa có đánh giá nào cho buổi hẹn này.</p>
      ) : (
        ratings.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl border border-hairline bg-surface-container-lowest flex items-start gap-3">
            <Avatar src={item.parent.avatarUrl} alt={item.parent.fullName || 'Phụ huynh'} size="md" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {item.parent.fullName || 'Phụ huynh'}
                </p>
                {item.isMine && (
                  <span className="text-label-xs font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary-ink border border-primary-border">
                    Của bạn
                  </span>
                )}
                <span className="text-xs text-text-muted ml-auto">{formatDate(item.createdAt)}</span>
              </div>
              <StarRow value={item.rating} />
              {item.feedback && (
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{item.feedback}</p>
              )}
            </div>
          </div>
        ))
      )}

      {isRatingOpen && (
        <RatingModal
          // The rating hook posts to /playdates/:_id/ratings
          playdate={{ ...playdate, _id: playdate.id }}
          onClose={() => setIsRatingOpen(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </FormSection>
  );
}

export default PlaydateRatingsSection;
