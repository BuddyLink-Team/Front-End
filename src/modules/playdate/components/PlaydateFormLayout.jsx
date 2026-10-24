import React from 'react';
import PropTypes from 'prop-types';
import { Calendar as CalendarIcon, MapPin, Users, Baby, Shapes } from 'lucide-react';
import { FormSection } from '../../../components/form/FormSection';
import { PlaydateSummaryRow } from './PlaydateSummaryRow';
import { formatDate } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

// The three steps of a playdate, shared by the create form and the playdate details
const STEPS = [
  { key: 'family', title: 'Bé & bạn chơi' },
  { key: 'schedule', title: 'Thời gian & địa điểm' },
  { key: 'activity', title: 'Hoạt động & ghi chú' },
];

/**
 * A value shown like a filled form field (playdate details are read-only)
 */
export const ReadOnlyField = ({ label, icon: Icon, children, className }) => (
  <div className={cn('space-y-1.5 min-w-0', className)}>
    <p className="text-sm font-medium text-text-primary">{label}</p>
    <div className="px-4 py-2.5 rounded-xl border border-hairline bg-surface-container-low text-sm text-text-primary flex items-start gap-2 min-w-0">
      {Icon && <Icon className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />}
      <div className="min-w-0 break-words">{children || <span className="text-text-muted">—</span>}</div>
    </div>
  </div>
);

ReadOnlyField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Layout of a playdate (create form and details): header, banners, the three steps in a card,
 * then a summary panel (sticky on desktop) with the actions.
 *
 * @param {Object} props.steps - { family, schedule, activity }: content of each step
 * @param {Object} [props.stepProps] - Extra FormSection props per step (description, required, aside)
 * @param {Object} props.summary - { childName, playmates, scheduledDate, timeRange, placeName, activity }
 * @param {React.ReactNode} props.actions - Buttons under the summary
 * @param {React.ReactNode} [props.mobileActions] - Action bar shown under the form on mobile (create form)
 */
export const PlaydateFormLayout = ({
  header,
  banners,
  steps,
  stepProps = {},
  after,
  summary,
  actions,
  asideNote,
  mobileActions,
  as: Container = 'div',
  containerProps,
  children,
}) => (
  <div className="w-full max-w-6xl mx-auto pb-16 space-y-6">
    {header}
    {banners}

    <Container className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" {...containerProps}>
      <div className="lg:col-span-8 bg-surface-container-lowest border border-hairline rounded-2xl p-5 sm:p-8 shadow-2xs">
        {STEPS.map(({ key, title }, index) => (
          <FormSection key={key} layout="stacked" step={index + 1} title={title} {...stepProps[key]}>
            {steps[key]}
          </FormSection>
        ))}
        {after}
      </div>

      <aside className={cn('lg:col-span-4 lg:sticky lg:top-6', mobileActions ? 'hidden lg:block' : 'order-first lg:order-none')}>
        <div className="bg-surface-container-lowest border border-hairline rounded-2xl p-5 lg:p-6 shadow-2xs space-y-5">
          <div className="hidden lg:block space-y-3.5">
            <p className="text-sm font-semibold text-text-primary">Tóm tắt buổi hẹn</p>
            <PlaydateSummaryRow icon={Baby} label="Bé tham gia" value={summary.childName} />
            <PlaydateSummaryRow icon={Users} label="Bạn chơi" value={summary.playmates} />
            <PlaydateSummaryRow
              icon={CalendarIcon}
              label="Thời gian"
              value={[formatDate(summary.scheduledDate), summary.timeRange].filter(Boolean).join(' · ')}
            />
            <PlaydateSummaryRow icon={MapPin} label="Địa điểm" value={summary.placeName} />
            <PlaydateSummaryRow icon={Shapes} label="Hoạt động" value={summary.activity} />
          </div>
          <div className="lg:pt-5 lg:border-t lg:border-hairline space-y-2.5">{actions}</div>
        </div>
        {asideNote}
      </aside>

      {mobileActions}
    </Container>

    {children}
  </div>
);

PlaydateFormLayout.propTypes = {
  header: PropTypes.node.isRequired,
  banners: PropTypes.node,
  steps: PropTypes.shape({
    family: PropTypes.node,
    schedule: PropTypes.node,
    activity: PropTypes.node,
  }).isRequired,
  stepProps: PropTypes.object,
  after: PropTypes.node,
  summary: PropTypes.shape({
    childName: PropTypes.string,
    playmates: PropTypes.string,
    scheduledDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    timeRange: PropTypes.string,
    placeName: PropTypes.string,
    activity: PropTypes.string,
  }).isRequired,
  actions: PropTypes.node,
  asideNote: PropTypes.node,
  mobileActions: PropTypes.node,
  as: PropTypes.elementType,
  containerProps: PropTypes.object,
  children: PropTypes.node,
};

export default PlaydateFormLayout;
