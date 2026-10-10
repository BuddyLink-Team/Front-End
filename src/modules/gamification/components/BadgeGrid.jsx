import React from 'react';
import BadgeCard from './BadgeCard';
import { FilterChips } from '../../../components/search/FilterChips';
import { EmptyState } from '../../../components/cards/EmptyState';

export function BadgeGrid({ filteredBadges, filter, filterOptions, setFilter }) {
  return (
    <div className="space-y-5">
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-headline-md text-on-surface tracking-tight">Huy hiệu</h2>
          <p className="text-body-md text-on-surface-variant">
            Mỗi huy hiệu được mở khóa một lần và giữ vĩnh viễn.
          </p>
        </div>
        <FilterChips options={filterOptions} selected={filter} onChange={setFilter} />
      </div>

      {filteredBadges.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBadges.map((badge) => (
            <BadgeCard key={badge.code} badge={badge} />
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có huy hiệu nào ở mục này" />
      )}
    </div>
  );
}

export default BadgeGrid;
