import React from 'react';

export const MatchScoreBar = ({ score }) => {
  const getBarColor = () => {
    if (score >= 70) return '#7BAE7F';
    if (score >= 40) return '#4A90E2';
    return '#A0AEC0';
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/40 shadow-sm">
      <span className="material-symbols-outlined text-[14px] text-[#7BAE7F]">auto_awesome</span>
      <span className="font-bold text-xs text-gray-800">{score}% Tương thích</span>
      <div className="w-10 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: getBarColor() }}
        ></div>
      </div>
    </div>
  );
};
