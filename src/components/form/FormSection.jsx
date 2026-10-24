import React from 'react';
import { cn } from '../../utils/cn';

const SECTION_CLASS = 'py-6 first:pt-0 last:pb-0 border-t border-hairline first:border-t-0';

const TitleText = ({ title, required, optional }) => (
  <span>
    {title}
    {required && <span className="text-error"> *</span>}
    {optional && <span className="font-normal text-text-muted"> (tùy chọn)</span>}
  </span>
);

/**
 * Form section. Sections placed one after another are separated by a hairline.
 * - layout "columns" (default): title and description on the left, fields on the right (stacked on mobile).
 * - layout "stacked": a header row (step number or icon, title, aside) with the fields below it,
 *   for step-by-step forms (e.g. create playdate).
 *
 * @param {number} [props.step] - Step number shown in the badge of a stacked section (instead of the icon)
 */
export const FormSection = ({
  title,
  description,
  icon: Icon,
  required = false,
  optional = false,
  aside,
  layout = 'columns',
  step,
  children,
  className,
}) => {
  if (layout === 'stacked') {
    return (
      <section className={cn(SECTION_CLASS, 'space-y-4', className)}>
        <header className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center shrink-0 text-sm font-bold"
            aria-hidden="true"
          >
            {step ?? (Icon && <Icon className="w-4 h-4" />)}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5 pt-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-title-md text-text-primary">
                {step && <span className="sr-only">Bước {step}: </span>}
                <TitleText title={title} required={required} optional={optional} />
              </h2>
              {aside && <div className="text-xs text-text-muted shrink-0">{aside}</div>}
            </div>
            {description && <p className="text-xs text-text-muted leading-relaxed">{description}</p>}
          </div>
        </header>
        <div className="min-w-0 space-y-3 sm:pl-11">{children}</div>
      </section>
    );
  }

  return (
    <section className={cn('grid grid-cols-1 lg:grid-cols-form-section gap-3 lg:gap-8', SECTION_CLASS, className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
            <TitleText title={title} required={required} optional={optional} />
          </h2>
          {/* On mobile the aside (e.g. a counter) sits next to the title */}
          {aside && <div className="lg:hidden text-xs text-text-muted shrink-0">{aside}</div>}
        </div>
        {description && <p className="text-xs text-text-muted leading-relaxed">{description}</p>}
        {aside && <div className="hidden lg:block text-xs text-text-muted pt-1">{aside}</div>}
      </div>
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
};

export default FormSection;
