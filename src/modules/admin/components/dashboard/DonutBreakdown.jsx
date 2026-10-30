import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_SIZE } from '../../../../constants/chart.constants';
import { getCssColor } from '../../../../utils/chartUtils';
import { formatCount } from '../../../../utils/formatters';

const DonutTooltip = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-white px-3 py-2 shadow-popover text-xs">
      <p className="font-semibold text-text-primary">{payload[0].name}</p>
      <p className="text-text-muted mt-0.5">
        {formatCount(payload[0].value)} {unit}
      </p>
    </div>
  );
};

/**
 * Donut with the total in its center, next to one line per segment.
 *
 * @param {Array<{ key: string, label: string, count: number, colorVar: string, dotClass: string }>} segments
 * @param {string} totalLabel - Below the total, in the center
 * @param {string} unit - After the count in the tooltip
 */
export const DonutBreakdown = ({ segments, totalLabel, unit }) => {
  const total = segments.reduce((sum, { count }) => sum + count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="count"
              nameKey="label"
              innerRadius={CHART_SIZE.PIE_INNER_RADIUS}
              outerRadius={CHART_SIZE.PIE_OUTER_RADIUS}
              paddingAngle={CHART_SIZE.PIE_PADDING_ANGLE}
            >
              {segments.map(({ key, colorVar }) => (
                <Cell key={key} fill={getCssColor(colorVar)} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip unit={unit} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-title-md font-semibold text-text-primary">{formatCount(total)}</span>
          <span className="text-label-sm text-text-muted">{totalLabel}</span>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map(({ key, label, count, dotClass }) => (
          <div key={key} className="flex items-center justify-between py-1 border-b border-hairline text-label-md">
            <span className="flex items-center gap-2 text-text-primary">
              <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
              {label}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">{formatCount(count)}</span>
              <span className="text-text-muted w-10 text-right">{Math.round((count / total) * 100)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutBreakdown;
