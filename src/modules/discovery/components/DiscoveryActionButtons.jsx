import React from 'react';

export const DiscoveryActionButtons = ({ onPass, onLike }) => {
  return (
    <div className="flex gap-3 pt-1">
      <button
        onClick={onPass}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-95"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
        Bỏ qua
      </button>
      <button
        onClick={onLike}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#7BAE7F] text-white font-semibold text-sm hover:bg-[#689B6C] transition-all duration-200 active:scale-95 shadow-md shadow-[#7BAE7F]/25"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">send</span>
        Gửi kết nối
      </button>
    </div>
  );
};
