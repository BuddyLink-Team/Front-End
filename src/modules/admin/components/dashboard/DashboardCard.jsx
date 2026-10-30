import React from 'react';
import { Card } from '../../../../components/cards/Card';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { Skeleton } from '../../../../components/feedback/Skeleton';

/**
 * One block of the dashboard statistics: title, then a skeleton, an empty state or the content.
 *
 * @param {string} title
 * @param {string} description
 * @param {boolean} isLoading
 * @param {boolean} isEmpty
 * @param {React.ReactNode} emptyIcon
 * @param {string} emptyTitle
 * @param {string} emptyDescription
 * @param {React.ReactNode} [aside] - Figure shown next to the title
 * @param {React.ReactNode} children
 */
export const DashboardCard = ({
  title,
  description,
  isLoading,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  aside,
  children,
}) => {
  let content = children;
  if (isLoading) {
    content = <Skeleton data-testid="dashboard-card-skeleton" className="w-full h-chart rounded-2xl" />;
  } else if (isEmpty) {
    content = <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} className="h-chart" />;
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-md text-text-primary">{title}</h2>
          <p className="text-body-md text-text-muted mt-1">{description}</p>
        </div>
        {!isLoading && !isEmpty && aside}
      </div>
      {content}
    </Card>
  );
};

export default DashboardCard;
