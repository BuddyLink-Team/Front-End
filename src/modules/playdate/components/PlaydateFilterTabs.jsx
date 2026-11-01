import React from 'react';
import { PLAYDATE_TABS } from '../constants/playdate.constants';
import { Tabs } from '../../../components/navigation/Tabs';
import { cn } from '../../../utils/cn';

export const PlaydateFilterTabs = ({
  activeTab = 'all',
  onChange,
  counts = {},
  className,
}) => {
  const tabsWithCounts = PLAYDATE_TABS.map((tab) => ({
    ...tab,
    count: counts[tab.id] ?? 0,
  }));

  return (
    <Tabs
      tabs={tabsWithCounts}
      activeTab={activeTab}
      onChange={onChange}
      className={cn('no-scrollbar', className)}
    />
  );
};

export default PlaydateFilterTabs;
