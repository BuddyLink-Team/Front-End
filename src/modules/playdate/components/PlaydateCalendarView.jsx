import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/cards/EmptyState';
import { PlaydateCard } from './PlaydateCard';
import { PLAYDATE_STATUS_META } from '../constants/playdateConstants';

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const PlaydateCalendarView = ({
  playdates = [],
  onComplete,
  completingId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Group playdates by date string 'YYYY-MM-DD'
  const playdatesByDate = useMemo(() => {
    const map = {};
    playdates.forEach((item) => {
      if (!item.scheduledDate) return;
      const d = new Date(item.scheduledDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(item);
    });
    return map;
  }, [playdates]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday is index 0 in Vietnam (0 = Sunday in JS, so adjust)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Preceding padding days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const date = new Date(year, month - 1, dayNum);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        date,
        key,
        dayNum,
        isCurrentMonth: false,
        events: playdatesByDate[key] || [],
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= lastDayOfMonth.getDate(); dayNum++) {
      const date = new Date(year, month, dayNum);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        date,
        key,
        dayNum,
        isCurrentMonth: true,
        events: playdatesByDate[key] || [],
      });
    }

    // Following padding days to fill 35 or 42 cells (5 or 6 weeks)
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const date = new Date(year, month + 1, dayNum);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        date,
        key,
        dayNum,
        isCurrentMonth: false,
        events: playdatesByDate[key] || [],
      });
    }

    return days;
  }, [year, month, playdatesByDate]);

  // Selected date key
  const selectedKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedEvents = playdatesByDate[selectedKey] || [];

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-hairline shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-dark flex items-center justify-center font-semibold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-text-primary capitalize">
              {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-text-muted">
              {playdates.length} sự kiện trong lịch trình của bạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs font-semibold"
          >
            Hôm nay
          </Button>
          <div className="flex items-center border border-hairline rounded-xl overflow-hidden bg-surface-container-low">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-surface-container-lowest text-text-muted hover:text-text-primary transition-colors border-r border-hairline"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-surface-container-lowest text-text-muted hover:text-text-primary transition-colors"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-surface-container-lowest rounded-2xl border border-hairline shadow-2xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-hairline bg-surface-container-low text-center text-xs font-semibold text-text-muted">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={d} className={`py-3 ${i >= 5 ? 'text-primary-dark' : ''}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Days cells grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-hairline">
          {calendarDays.map((cell) => {
            const hasEvents = cell.events.length > 0;
            const today = isToday(cell.date);
            const active = isSelected(cell.date);

            return (
              <button
                type="button"
                key={cell.key}
                onClick={() => setSelectedDate(cell.date)}
                className={`min-h-[90px] md:min-h-[110px] p-2 text-left flex flex-col justify-between cursor-pointer transition-colors relative ${
                  !cell.isCurrentMonth
                    ? 'bg-surface-container-low text-text-muted/40'
                    : 'bg-surface-container-lowest hover:bg-primary-soft'
                } ${active ? 'bg-primary-soft ring-2 ring-inset ring-primary' : ''}`}
              >
                {/* Date header in cell */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${
                      today
                        ? 'bg-primary text-primary-on-primary shadow-2xs font-semibold'
                        : active
                        ? 'text-primary font-semibold'
                        : cell.isCurrentMonth
                        ? 'text-text-primary'
                        : 'text-text-muted/50'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {hasEvents && (
                    <span className="text-[10px] font-semibold text-text-muted bg-surface-container-low border border-hairline px-1.5 py-0.2 rounded-full">
                      {cell.events.length}
                    </span>
                  )}
                </div>

                {/* Event previews in cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {cell.events.slice(0, 2).map((evt) => {
                    const statusKey = evt.displayStatus || evt.status;
                    const meta = PLAYDATE_STATUS_META[statusKey] || PLAYDATE_STATUS_META.confirmed;

                    return (
                      <div
                        key={evt.id}
                        className="text-[10px] md:text-xs px-1.5 py-0.5 rounded truncate font-medium border border-hairline bg-surface-container-low text-text-primary flex items-center gap-1"
                        title={`${evt.activity} (${evt.time}) - ${meta.label}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotClass}`} />
                        <span className="truncate">
                          <span className="font-semibold">{evt.time}</span> {evt.activity}
                        </span>
                      </div>
                    );
                  })}

                  {cell.events.length > 2 && (
                    <div className="text-[10px] text-text-muted font-medium text-center">
                      +{cell.events.length - 2} sự kiện nữa
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              Lịch trình ngày {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-soft text-primary-dark font-semibold">
              {selectedEvents.length} buổi hẹn
            </span>
          </div>
        </div>

        {selectedEvents.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="w-6 h-6" />}
            title="Không có buổi hẹn nào trong ngày này"
            description="Chọn ngày khác có đánh dấu trên lịch hoặc tạo buổi hẹn mới cùng bạn chơi của bé."
          />
        ) : (
          <div className="gap-4">
            {selectedEvents.map((evt) => (
              <PlaydateCard
                key={evt.id}
                playdate={evt}
                onComplete={onComplete}
                isCompleting={completingId === evt.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaydateCalendarView;
