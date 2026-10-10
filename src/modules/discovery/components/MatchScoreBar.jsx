import React from 'react';
import { Sparkles } from 'lucide-react';

export const MatchScoreBar = ({ score }) => {
  const getBarColor = () => {
    if (score >= 70) return 'bg-primary';
    if (score >= 40) return 'bg-secondary';
    return 'bg-on-surface-variant';
  };

  return (
    <div className="w-52 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-surface-container shadow-sm">
      <Sparkles size={14} strokeWidth={1.5} className="text-primary" />
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
