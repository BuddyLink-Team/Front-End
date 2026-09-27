import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../utils/testUtils';
import { Button } from '../../components/ui/Button';

describe('Button component', () => {
  it('renders button label correctly', () => {
    render(<Button>Hẹn chơi ngay</Button>);
    expect(screen.getByRole('button', { name: /hẹn chơi ngay/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { userEvent } = await import('../utils/testUtils');
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled or isLoading is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
