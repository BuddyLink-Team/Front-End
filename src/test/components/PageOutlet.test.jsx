import React, { Suspense, lazy } from 'react';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { PageOutlet } from '../../components/navigation/PageOutlet';

const FirstPage = () => <p>Trang đầu</p>;

describe('PageOutlet', () => {
  it('keeps the layout on screen while the next page chunk downloads', async () => {
    let finishDownload;
    const SlowPage = lazy(
      () =>
        new Promise((resolve) => {
          finishDownload = () => resolve({ default: () => <p>Trang chậm</p> });
        })
    );

    render(
      <MemoryRouter initialEntries={['/first']}>
        <Suspense fallback={<p>Tải toàn màn hình</p>}>
          <Routes>
            <Route
              element={
                <>
                  <Link to="/slow">Thanh điều hướng</Link>
                  <PageOutlet />
                </>
              }
            >
              <Route path="/first" element={<FirstPage />} />
              <Route path="/slow" element={<SlowPage />} />
            </Route>
          </Routes>
        </Suspense>
      </MemoryRouter>
    );

    const navLink = screen.getByRole('link', { name: 'Thanh điều hướng' });
    fireEvent.click(navLink);

    expect(await screen.findByRole('status', { name: 'Đang tải trang' })).toBeInTheDocument();
    expect(screen.queryByText('Tải toàn màn hình')).not.toBeInTheDocument();
    expect(navLink).toBeVisible();

    finishDownload();

    expect(await screen.findByText('Trang chậm')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Thanh điều hướng' })).toBe(navLink);
  });
});
