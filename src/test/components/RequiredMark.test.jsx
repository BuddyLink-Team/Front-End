import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Combobox } from '../../components/ui/Combobox';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';

const FIELDS = [
  ['Input', Input],
  ['Textarea', Textarea],
  ['Select', Select],
  ['PasswordInput', PasswordInput],
  ['Combobox', Combobox],
];

const SOURCES = import.meta.glob(['../../**/*.jsx', '!../../test/**'], { query: '?raw', import: 'default', eager: true });

describe('required fields', () => {
  it.each(FIELDS)('%s shows a red star and leaves validation to the form', (_name, Field) => {
    render(<Field id="field" label="Tên" required onChange={() => {}} />);

    const star = screen.getByText('*');
    expect(star).toHaveClass('text-error');
    const field = screen.getByLabelText(/^Tên/);
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(field).not.toHaveAttribute('required');
  });

  it.each(FIELDS)('%s has no star when it is optional', (_name, Field) => {
    render(<Field id="field" label="Tên" onChange={() => {}} />);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('marks a required reason in the confirm dialog in red', () => {
    render(
      <ConfirmDialog open title="Hủy" description="Mô tả" reason={{ required: true, label: 'Lý do hủy' }} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getByText('*')).toHaveClass('text-error');
  });

  it('never writes the star into the text of a label', () => {
    const offenders = Object.keys(SOURCES).filter((path) => /label=(?:"[^"\n]*\*\s*"|\{`[^`\n]*\*[^`\n]*`\})/.test(SOURCES[path]));

    expect(Object.keys(SOURCES).length).toBeGreaterThan(100);
    expect(offenders).toEqual([]);
  });
});
