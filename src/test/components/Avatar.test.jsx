import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../../components/ui/Avatar';

describe('Avatar initials fallback', () => {
  it('renders a fixed-size circle for the 2xl size', () => {
    render(<Avatar alt="Nguyen Van An" size="2xl" />);
    const initials = screen.getByText('NA');
    expect(initials.className).toContain('rounded-full');
    expect(initials.className).toContain('w-24');
    expect(initials.className).toContain('h-24');
  });

  it('falls back to the md box for an unknown size', () => {
    render(<Avatar alt="Binh" size="huge" />);
    const initials = screen.getByText('B');
    expect(initials.className).toContain('w-10');
    expect(initials.className).toContain('h-10');
  });
});
