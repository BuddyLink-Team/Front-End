import React from 'react';
import { Card } from '../cards/Card';
import { cn } from '../../utils/cn';

/**
 * @param {string} [titleClassName] - Optional title style override (merged last, so it wins over the default)
 */
export const PlaceholderPage = ({ title, description, titleClassName }) => {
  return (
    <Card className="min-h-placeholder flex flex-col justify-center items-center text-center p-8">
      <h1 className={cn('text-xl font-bold text-text-primary', titleClassName)}>{title}</h1>
      <p className="text-sm text-text-muted mt-2 max-w-md">
        {description || 'Trang này sẽ được nối UI và API ở bước tiếp theo.'}
      </p>
    </Card>
  );
};

export default PlaceholderPage;
