import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { BarChart3, CheckCircle2, Clock, Lock } from 'lucide-react';
import { chatApi } from '../api/chatApi';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { CHAT_ERROR_MESSAGES } from '../constants/chat.constants.js';
import { cn } from '../../../utils/cn';

export const PollMessageCard = ({ message, currentParentId }) => {
  const toast = useToast();
  const [poll, setPoll] = useState(message.poll || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (message?.poll) {
      setPoll(message.poll);
    }
  }, [message?.poll]);

  const isClosed = Boolean(poll.isClosed);
  const isExpired = poll.deadline ? new Date() > new Date(poll.deadline) : false;
  const isVotingDisabled = isClosed || isExpired || isSubmitting;

  const totalVotes =
    poll.totalVotes ??
    (poll.options || []).reduce((acc, opt) => acc + (opt.voterParentIds || []).length, 0);

  const handleVote = async (optionId) => {
    if (isVotingDisabled) return;

    try {
      setIsSubmitting(true);
      const res = await chatApi.votePoll(message.id, optionId);
      if (res.data?.data?.poll) {
        setPoll(res.data.data.poll);
      }
    } catch (err) {
      toast.error(getApiErrorMsg(CHAT_ERROR_MESSAGES, err, 'Không thể gửi bình chọn.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-hairline-strong bg-surface-container-lowest p-4 shadow-sm space-y-3">
      {/* Poll Header */}
      <div className="flex items-start justify-between gap-2 border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary-dark">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-dark">
            Khảo sát giờ hẹn
          </span>
        </div>
        {isClosed || isExpired ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-label-xs font-medium text-on-surface-variant">
            <Lock className="w-3 h-3" /> Đã kết thúc
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-label-xs font-medium text-primary-dark border border-primary-border">
            Đang mở
          </span>
        )}
      </div>

      {/* Question */}
      <h4 className="text-sm font-bold text-on-surface leading-snug">
        {poll.question || 'Bình chọn thời gian hẹn chơi'}
      </h4>

      {/* Options List */}
      <div className="space-y-2">
        {(poll.options || []).map((option) => {
          const voterIds = (option.voterParentIds || []).map((id) => (id?._id || id)?.toString());
          const hasVoted =
            option.hasVoted ??
            (currentParentId ? voterIds.includes(currentParentId.toString()) : false);
          const count = option.voteCount ?? voterIds.length;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <button
              key={option.id}
              type="button"
              disabled={isVotingDisabled}
              onClick={() => handleVote(option.id)}
              className={cn(
                'relative w-full overflow-hidden rounded-xl border p-2.5 text-left transition-all',
                hasVoted
                  ? 'border-primary bg-primary-soft/40 shadow-xs'
                  : 'border-hairline hover:border-outline hover:bg-surface-container-low/40',
                isVotingDisabled && 'cursor-default',
              )}
            >
              {/* Vote Percentage Fill Bar */}
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-all duration-300 pointer-events-none',
                  hasVoted ? 'bg-primary/15' : 'bg-surface-container/60',
                )}
                style={{ width: `${percent}%` }}
              />

              <div className="relative flex items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                      hasVoted
                        ? 'border-primary bg-primary text-white'
                        : 'border-outline/60 bg-surface-container-lowest',
                    )}
                  >
                    {hasVoted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={cn(
                      'text-xs break-words leading-tight',
                      hasVoted ? 'font-bold text-primary-dark' : 'font-medium text-on-surface',
                    )}
                  >
                    {option.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-label-xs font-semibold text-on-surface-variant">
                  <span>{percent}%</span>
                  <span className="text-outline">({count})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1 text-label-xs text-outline">
        <span>Tổng cộng: {totalVotes} lượt bình chọn</span>
        {poll.deadline && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Hạn chót: {dayjs(poll.deadline).format('DD/MM HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
};

PollMessageCard.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    poll: PropTypes.shape({
      question: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          date: PropTypes.string,
          time: PropTypes.string,
          voterParentIds: PropTypes.array,
          voteCount: PropTypes.number,
          hasVoted: PropTypes.bool,
        }),
      ),
      deadline: PropTypes.string,
      isClosed: PropTypes.bool,
      totalVotes: PropTypes.number,
    }),
  }).isRequired,
  currentParentId: PropTypes.string,
};

export default PollMessageCard;

