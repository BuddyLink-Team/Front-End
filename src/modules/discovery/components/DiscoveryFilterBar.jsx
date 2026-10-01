import React from 'react';

export const DiscoveryFilterBar = ({ meta }) => {
  return (
    <div className="w-full max-w-[740px] flex flex-col gap-3 mb-6 z-10 relative">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full bg-surface-container-lowest p-2.5 sm:px-4 sm:py-3 rounded-2xl border border-outline-variant/40 shadow-sm transition-all">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2.5 bg-surface-container-low hover:bg-surface-container hover:border-primary-container border border-outline-variant/30 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm group">
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-sm shadow-xs flex-shrink-0">
              🐻
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-on-surface-variant font-medium leading-none">
                Đang tìm bạn cho:
              </span>
              <span className="text-sm font-bold text-on-surface leading-tight mt-0.5 group-hover:text-primary transition-colors">
                Bé của bạn
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant ml-1">
              expand_more
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-surface-container-high/60">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span className="text-xs font-semibold text-on-surface">
                {meta?.remainingViews !== undefined ? `${meta.remainingViews} lượt` : '...'}
              </span>
            </div>
          </div>
          {!meta?.isPremium && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold hover:bg-tertiary-container hover:text-on-tertiary-container transition-all shadow-sm active:scale-95 flex-shrink-0" type="button">
              <span className="text-xs">👑</span>
              <span className="font-medium">Nâng cấp</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <button className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 hover:border-primary hover:bg-[#E8F3EB]/60 text-on-surface text-xs font-medium transition-all shadow-xs" type="button">
            <span className="text-xs">📍</span>
            <span className="text-on-surface-variant group-hover:text-on-surface">Bán kính:</span>
            <span className="font-semibold text-primary">Tất cả</span>
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant group-hover:text-primary transition-colors">keyboard_arrow_down</span>
          </button>
          <button className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 hover:border-primary hover:bg-[#E8F3EB]/60 text-on-surface text-xs font-medium transition-all shadow-xs" type="button">
            <span className="text-xs">👶</span>
            <span className="text-on-surface-variant group-hover:text-on-surface">Độ tuổi:</span>
            <span className="font-semibold text-primary">Tất cả</span>
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant group-hover:text-primary transition-colors">keyboard_arrow_down</span>
          </button>
        </div>
      </div>
    </div>
  );
};
