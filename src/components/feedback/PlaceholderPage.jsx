import React from 'react';
import { Card } from '../cards/Card';

export const PlaceholderPage = ({ title, description }) => {
  return (
    <Card className="min-h-[280px] flex flex-col justify-center items-center text-center p-8">
      <h1 className="text-xl font-bold text-text-primary">{title}</h1>
      <p className="text-sm text-text-muted mt-2 max-w-md">
        {description || 'Trang này sẽ được nối UI và API ở bước tiếp theo.'}
      </p>
    </Card>
  );
};

export default PlaceholderPage;
