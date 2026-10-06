import React from 'react';

const DEFAULT_TITLE = 'Bạn đã xem hết các hồ sơ quanh đây!';
const DEFAULT_DESCRIPTION =
  'Hãy thử mở rộng bán kính tìm kiếm hoặc thay đổi bộ lọc để khám phá thêm nhiều người bạn thú vị khác cho bé nhé.';

export const EmptyDiscovery = ({ icon = '🌍', title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, action }) => {
  return (
    <div className="w-full max-w-[740px] bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 shadow-md p-10 flex flex-col items-center justify-center gap-4 text-center mt-10">
      <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center text-4xl mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-on-surface font-headline-md">
        {title}
      </h3>
      <p className="text-on-surface-variant max-w-md">
        {description}
      </p>
      {action}
    </div>
  );
};
