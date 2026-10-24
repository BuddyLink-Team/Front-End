import React from 'react';
import PropTypes from 'prop-types';
import { CalendarCheck, CalendarX, TriangleAlert } from 'lucide-react';
import { cn } from '../../../utils/cn';

const busyText = (b) => `${b.childName} ${b.start}–${b.end}`;

/**
 * What the children already have that day, and whether the picked time clashes with it:
 * - the own child busy → the time cannot be used (red), with the next free time to pick;
 * - another family's child busy → a warning only (that parent cannot accept until it is solved).
 * Shown as soon as a date is picked, before the form is sent.
 */
export const ScheduleAvailability = ({ busy, ownConflicts, otherConflicts, freeTime, onPickFreeTime, isLoading }) => {
  if (isLoading && busy.length === 0) {
    return <p className="text-xs text-text-muted">Đang kiểm tra lịch của các bé…</p>;
  }

  return (
    <div className={cn('space-y-2 transition-opacity', isLoading && 'opacity-60')} aria-live="polite">
      {busy.length === 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-text-muted">
          <CalendarCheck className="w-3.5 h-3.5 text-primary" />
          Ngày này các bé chưa có hẹn nào khác.
        </p>
      ) : (
        <p className="flex items-start gap-1.5 text-xs text-text-muted">
          <CalendarCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Lịch bận trong ngày: <span className="text-text-primary">{busy.map(busyText).join(' · ')}</span>
          </span>
        </p>
      )}

      {ownConflicts.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 rounded-xl border border-error-container bg-error-container/30 text-xs text-error">
          <span className="flex items-center gap-1.5">
            <CalendarX className="w-3.5 h-3.5 shrink-0" />
            {ownConflicts.map(busyText).join(', ')}: trùng giờ bạn chọn, không thể dùng giờ này.
          </span>
          {freeTime ? (
            <button
              type="button"
              onClick={() => onPickFreeTime(freeTime)}
              className="font-semibold underline underline-offset-2 hover:no-underline"
            >
              Chọn {freeTime} (giờ trống gần nhất)
            </button>
          ) : (
            <span>Hãy chọn ngày khác.</span>
          )}
        </div>
      )}

      {otherConflicts.length > 0 && (
        <p className="flex items-start gap-1.5 px-3 py-2 rounded-xl border text-xs bg-tertiary-soft text-tertiary-dark border-tertiary-border">
          <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {otherConflicts.map(busyText).join(', ')}: đã có hẹn khác trùng giờ — phụ huynh của bé sẽ chưa nhận lời được.
          </span>
        </p>
      )}
    </div>
  );
};

const busyShape = PropTypes.shape({
  childId: PropTypes.string,
  childName: PropTypes.string,
  start: PropTypes.string,
  end: PropTypes.string,
  isOwnChild: PropTypes.bool,
});

ScheduleAvailability.propTypes = {
  busy: PropTypes.arrayOf(busyShape).isRequired,
  ownConflicts: PropTypes.arrayOf(busyShape).isRequired,
  otherConflicts: PropTypes.arrayOf(busyShape).isRequired,
  freeTime: PropTypes.string,
  onPickFreeTime: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default ScheduleAvailability;
