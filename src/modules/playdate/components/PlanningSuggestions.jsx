import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CalendarCheck, MapPin, Lightbulb, Navigation, Info } from 'lucide-react';
import { ShowMoreButton } from '../../../components/ui/ShowMoreButton';
import { useShowMore } from '../../../hooks/useShowMore';
import { cn } from '../../../utils/cn';
import { ICON_STROKE } from '../../../constants/icon.constants';
import { PLACE_TYPE_LABELS, TIME_SLOT_LABELS, formatDurationLabel } from '../constants/playdate.constants';
import { googleMapsDirectionsUrl } from '../utils/placeLinks';
import {
  formatSlotDay,
  slotFitText,
  familyDistanceText,
  CHIP_CLASS,
  chipState,
  LINK_CLASS,
} from '../utils/suggestionFormatters';

const SuggestionHeading = ({ icon: Icon, children, isRefreshing }) => (
  <p className="flex items-center gap-1.5 text-label-md uppercase tracking-wider text-text-muted">
    <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={ICON_STROKE.DEFAULT} />
    {children}
    {isRefreshing && <span className="normal-case tracking-normal text-label-sm text-text-muted/80">· đang cập nhật…</span>}
  </p>
);

SuggestionHeading.propTypes = {
  icon: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
  isRefreshing: PropTypes.bool,
};

const LoadingRow = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {[0, 1].map((i) => (
      <div key={i} className="h-14 bg-surface-container-low rounded-xl animate-pulse" />
    ))}
  </div>
);

// While newer results load, the current ones stay visible but dimmed
const listClass = (isRefreshing) => cn('grid grid-cols-1 sm:grid-cols-2 gap-2 transition-opacity', isRefreshing && 'opacity-60');

// Shown when the families set no playdate preferences, so there is nothing to rank yet
export const SuggestionEmptyHint = () => (
  <p className="text-xs text-text-muted">
    Chưa có gợi ý — hãy cập nhật{' '}
    <Link to="/profile/edit" className="font-medium text-primary-dark hover:underline">
      lịch & địa điểm ưa thích trong hồ sơ
    </Link>
    .
  </p>
);

const queryShape = {
  isLoading: PropTypes.bool,
  isRefreshing: PropTypes.bool,
};

/**
 * Suggested start times ("T7 01/11 · 09:00 · Hợp với cả các gia đình"); a click fills date + time
 */
export const TimeSlotSuggestions = memo(({ slots, isLoading, isRefreshing, selectedDate, selectedTime, onSelect }) => {
  const isSelected = (slot) => slot.date === selectedDate && slot.time === selectedTime;
  const { visibleItems, hiddenCount, hasMore, isExpanded, toggle } = useShowMore(slots, { keepVisible: isSelected });

  return (
    <div className="space-y-2">
      <SuggestionHeading icon={CalendarCheck} isRefreshing={isRefreshing}>Gợi ý thời gian</SuggestionHeading>
      {isLoading ? (
        <LoadingRow />
      ) : slots.length === 0 ? (
        <SuggestionEmptyHint />
      ) : (
        <>
          <div className={listClass(isRefreshing)}>
            {visibleItems.map((slot) => (
              <button
                key={`${slot.date}-${slot.time}`}
                type="button"
                aria-pressed={isSelected(slot)}
                onClick={() => onSelect(slot)}
                className={cn(CHIP_CLASS, chipState(isSelected(slot)))}
              >
                <span className="text-sm font-semibold text-text-primary">
                  {formatSlotDay(slot.date)} · {slot.time}
                </span>
                <span className="text-label-sm text-text-muted break-words">
                  {TIME_SLOT_LABELS[slot.timeSlot]} · {slotFitText(slot)}
                </span>
              </button>
            ))}
          </div>
          {hasMore && <ShowMoreButton isExpanded={isExpanded} hiddenCount={hiddenCount} unit="khung giờ" onToggle={toggle} />}
        </>
      )}
    </div>
  );
});

TimeSlotSuggestions.displayName = 'TimeSlotSuggestions';
TimeSlotSuggestions.propTypes = {
  slots: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      timeSlot: PropTypes.string,
      matchedParents: PropTypes.number,
      totalParents: PropTypes.number,
    })
  ).isRequired,
  ...queryShape,
  selectedDate: PropTypes.string,
  selectedTime: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

/**
 * Places around the families (places API, OpenStreetMap data): preferred place types first.
 * Each place shows its distance to every family and can be opened in details or on Google Maps.
 */
export const PlaceSuggestionList = memo(({ places, isLoading, isRefreshing, selectedName, onSelect, onViewDetail }) => {
  const isSelected = (place) => place.name === selectedName;
  const { visibleItems, hiddenCount, hasMore, isExpanded, toggle } = useShowMore(places, { keepVisible: isSelected });

  return (
    <div className="space-y-2">
      <SuggestionHeading icon={MapPin} isRefreshing={isRefreshing}>Địa điểm gợi ý gần các gia đình</SuggestionHeading>
      {isLoading ? (
        <LoadingRow />
      ) : places.length === 0 ? (
        <p className="text-xs text-text-muted">Chưa tìm được địa điểm gần các gia đình — hãy tìm hoặc nhập địa chỉ bên dưới.</p>
      ) : (
        <>
          <div className={listClass(isRefreshing)}>
            {visibleItems.map((place) => {
              const mapsUrl = googleMapsDirectionsUrl(place.coordinates);
              return (
                <div key={place.id} className={cn('rounded-xl border transition-colors', chipState(isSelected(place)))}>
                  <button
                    type="button"
                    aria-pressed={isSelected(place)}
                    aria-label={`Chọn ${place.name}`}
                    onClick={() => onSelect(place)}
                    className="w-full text-left px-3 pt-2 flex flex-col gap-0.5 min-w-0"
                  >
                    <span className="text-sm font-semibold text-text-primary break-words">{place.name}</span>
                    <span className="text-label-sm text-text-muted break-words">
                      {[PLACE_TYPE_LABELS[place.type] || place.type, place.isPreferredType ? 'Loại địa điểm cả nhà thích' : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    {place.familyDistances?.length > 0 && (
                      <span className="text-label-sm text-text-muted break-words">
                        Cách {familyDistanceText(place.familyDistances)}
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-3 px-3 pb-2 pt-1">
                    <button type="button" onClick={() => onViewDetail(place)} className={LINK_CLASS}>
                      <Info className="w-3 h-3" /> Chi tiết
                    </button>
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        <Navigation className="w-3 h-3" /> Google Maps
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {hasMore && <ShowMoreButton isExpanded={isExpanded} hiddenCount={hiddenCount} unit="địa điểm" onToggle={toggle} />}
        </>
      )}
    </div>
  );
});

PlaceSuggestionList.displayName = 'PlaceSuggestionList';
PlaceSuggestionList.propTypes = {
  places: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      isPreferredType: PropTypes.bool,
      coordinates: PropTypes.arrayOf(PropTypes.number),
      familyDistances: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.string, distanceKm: PropTypes.number })
      ),
    })
  ).isRequired,
  ...queryShape,
  selectedName: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

/**
 * Activities the children share an interest in, with the reason ("Cả hai bé đều thích xếp hình lego")
 */
export const ActivitySuggestionChips = memo(({ activities, isLoading, isRefreshing, selected, onSelect }) => {
  const isSelected = (activity) => activity.title === selected;
  const { visibleItems, hiddenCount, hasMore, isExpanded, toggle } = useShowMore(activities, { keepVisible: isSelected });

  return (
    <div className="space-y-2">
      <SuggestionHeading icon={Lightbulb} isRefreshing={isRefreshing}>Gợi ý theo sở thích của các bé</SuggestionHeading>
      {isLoading ? (
        <LoadingRow />
      ) : (
        <>
          <div className={listClass(isRefreshing)}>
            {visibleItems.map((activity) => (
              <button
                key={activity.key}
                type="button"
                aria-pressed={isSelected(activity)}
                onClick={() => onSelect(activity)}
                className={cn(CHIP_CLASS, chipState(isSelected(activity)))}
              >
                <span className="text-sm font-semibold text-text-primary break-words">{activity.title}</span>
                <span className="text-label-sm text-text-muted break-words">
                  {activity.reason}
                  {activity.durationMinutes ? ` · khoảng ${formatDurationLabel(activity.durationMinutes)}` : ''}
                </span>
              </button>
            ))}
          </div>
          {hasMore && <ShowMoreButton isExpanded={isExpanded} hiddenCount={hiddenCount} unit="hoạt động" onToggle={toggle} />}
        </>
      )}
    </div>
  );
});

ActivitySuggestionChips.displayName = 'ActivitySuggestionChips';
ActivitySuggestionChips.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      reason: PropTypes.string,
      durationMinutes: PropTypes.number,
    })
  ).isRequired,
  ...queryShape,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
