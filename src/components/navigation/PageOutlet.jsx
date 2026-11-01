import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '../feedback/Spinner';

/**
 * Route outlet of a layout: a page chunk still downloading only shows a spinner in the content area,
 * instead of suspending up to the full-page fallback in the route tree and hiding the layout with it.
 */
export const PageOutlet = () => (
  <Suspense
    fallback={
      <div role="status" aria-label="Đang tải trang" className="min-h-page flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }
  >
    <Outlet />
  </Suspense>
);

export default PageOutlet;
