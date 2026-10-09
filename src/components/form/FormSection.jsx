import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Form section: title and description on the left, fields on the right (stacked on mobile).
 * Sections placed one after another are separated by a hairline.
 */
export const FormSection = ({
  title,
  description,
  icon: Icon,
  required = false,
  optional = false,
  aside,
  children,
  className,
}) => {
  return (
    <section
      className={cn(
        'grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-3 lg:gap-8 py-6 first:pt-0 last:pb-0 border-t border-hairline first:border-t-0',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
            <span>
              {title}
              {required && <span className="text-error"> *</span>}
              {optional && <span className="font-normal text-text-muted"> (tùy chọn)</span>}
            </span>
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
