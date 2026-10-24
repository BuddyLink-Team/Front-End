import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';
import { cn } from '../../../utils/cn';

export const MatchScoreBar = ({ score, className }) => {
  const getBarColor = () => {
    if (score >= 70) return 'bg-primary';
    if (score >= 40) return 'bg-secondary';
    return 'bg-on-surface-variant';
  };

  return (
    <div
      className={cn(
        'w-52 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-surface-container shadow-sm',
        className,
      )}
    >
      <HeartHandshake size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.THIN} className="text-primary" />
      <span className="font-bold text-xs text-on-surface">{score}% Tương thích</span>
      <div className="w-10 h-1.5 rounded-full bg-surface-container overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getBarColor()}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};
