import { PLAYDATE_TABS } from '../constants/playdateConstants';
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
    <div
      className={cn(
        'inline-flex items-center p-1 bg-surface-container-low rounded-full border border-hairline overflow-x-auto max-w-full no-scrollbar',
        className
      )}
    >
      {tabsWithCounts.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-150 select-none whitespace-nowrap',
              isActive
                ? 'bg-primary text-white shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-white/60'
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count !== 'undefined' && (
              <span
                className={cn(
                  'text-[10px] md:text-xs px-2 py-0.5 rounded-full font-semibold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-text-muted border border-hairline'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PlaydateFilterTabs;
