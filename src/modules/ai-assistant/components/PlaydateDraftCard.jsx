import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Shapes,
  StickyNote,
  Timer,
  TriangleAlert,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { ReadOnlyField } from '../../playdate/components/PlaydateFormLayout';
import { ParticipantCard } from '../../playdate/components/PlaydateDetailParts';
import { formatDurationLabel } from '../../playdate/constants/playdate.constants';
import { formatPlaydateTimeRange } from '../../playdate/utils/playdateTime';
import { PLACE_TYPE_LABELS } from '../../playdate/constants/playdate.constants';
import { familyDistanceText, LINK_CLASS } from '../../playdate/utils/suggestionFormatters';
import { googleMapsSearchUrl } from '../utils/aiAssistantUtils';
import { OptionLinks } from './OptionLinks';
import { ToolCardFrame } from './ToolCardFrame';
import {
  AI_CARD_TONES,
  AI_CARD_TYPES,
  AI_CHOICE_STATUS,
  AI_LINK_KINDS,
  AI_TONE_CYCLE,
  DRAFT_WARNING_TEXT,
} from '../constants/ai-assistant.constants';

// Same three parts as the playdate detail page (PlaydateFormLayout)
const Part = ({ step, title, children }) => (
  <section className="space-y-2">
    <h3 className="flex items-center gap-2 text-label-md uppercase tracking-wider text-on-surface-variant">
      <span className="flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-label-sm font-semibold text-primary-dark">
        {step}
      </span>
      {title}
    </h3>
    {children}
  </section>
);

Part.propTypes = {
  step: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

/**
 * Last step of a plan: every detail of the playdate, laid out like its detail page, with the button that
 * creates it. Once created the card is read only and links to the playdate.
 *
 * @param {Object} card - playdate_draft card ({ draft, status, playdateId })
 * @param {() => void} onConfirm - Creates the playdate (through the assistant)
 * @param {boolean} [disabled] - A message is being sent, or this is not the current plan any more
 */
export const PlaydateDraftCard = ({ card, onConfirm, disabled = false }) => {
  const { draft } = card;
  const parent = useSelector((state) => state.parent.profile);
  const isCreated = card.status === AI_CHOICE_STATUS.ANSWERED && Boolean(card.playdateId);
  const warnings = [...new Set((draft.warnings || []).map((warning) => warning.code))].filter((code) => DRAFT_WARNING_TEXT[code]);
  const place = draft.placeDetails || {};
  const mapsUrl = googleMapsSearchUrl(draft.location || {});
  const placeLinks = [
    place.osmUrl && { kind: AI_LINK_KINDS.OSM, href: place.osmUrl },
    mapsUrl && { kind: AI_LINK_KINDS.GOOGLE_MAPS, href: mapsUrl },
  ].filter(Boolean);

  return (
    <ToolCardFrame
      tone={AI_CARD_TONES[AI_CARD_TYPES.PLAYDATE_DRAFT]}
      icon={CalendarCheck}
      title={isCreated ? 'Đã tạo lịch hẹn chơi' : 'Chi tiết lịch hẹn chơi'}
      className="border-tertiary-border space-y-4"
      aside={
        isCreated && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary-border bg-primary-soft px-2 py-0.5 text-label-sm font-medium text-primary-ink">
            <CheckCircle2 className="w-3 h-3" /> Đã gửi lời mời
          </span>
        )
      }
    >
      <Part step={1} title="Bé & bạn chơi">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ParticipantCard
            parent={{ fullName: parent?.fullName, avatarUrl: parent?.avatarUrl, isVerified: parent?.isVerified }}
            childName={draft.hostChild?.displayName}
            status="host"
          />
          {draft.participants.map((p) => (
            <ParticipantCard
              key={p.childId}
              parent={{ fullName: p.parentName }}
              childName={p.childName}
              status="pending"
              badgeLabel={isCreated ? undefined : 'Sẽ được mời'}
            />
          ))}
        </div>
        {draft.participants.length === 0 && <p className="text-xs text-text-muted">Chưa mời bạn nào, bạn có thể mời sau.</p>}
      </Part>

      <Part step={2} title="Thời gian & địa điểm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ReadOnlyField label="Ngày" icon={CalendarIcon}>
            {formatDate(draft.scheduledDate)}
          </ReadOnlyField>
          <ReadOnlyField label="Giờ" icon={Clock}>
            {formatPlaydateTimeRange(draft)}
          </ReadOnlyField>
          <ReadOnlyField label="Thời lượng" icon={Timer}>
            {formatDurationLabel(draft.durationMinutes)}
          </ReadOnlyField>
        </div>
        {draft.location && (
          <ReadOnlyField label="Địa điểm" icon={MapPin}>
            <div className="space-y-1">
              <p className="font-semibold">{draft.location.name}</p>
              {(place.placeType || (draft.location.address && draft.location.address !== draft.location.name)) && (
                <p className="text-xs text-text-muted">
                  {[
                    PLACE_TYPE_LABELS[place.placeType] || place.placeType,
                    draft.location.address !== draft.location.name ? draft.location.address : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {place.familyDistances?.length > 0 && (
                <p className="flex items-center gap-1 text-xs text-text-muted">
                  <Navigation className="w-3 h-3 shrink-0" /> {familyDistanceText(place.familyDistances)}
                </p>
              )}
              {place.openingHours && (
                <p className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3 shrink-0" /> {place.openingHours}
                </p>
              )}
              <OptionLinks links={placeLinks} />
            </div>
          </ReadOnlyField>
        )}
      </Part>

      <Part step={3} title="Hoạt động & ghi chú">
        <ReadOnlyField label="Hoạt động" icon={Shapes}>
          {draft.activity}
        </ReadOnlyField>
        {draft.agenda?.length > 0 && (
          <ReadOnlyField label="Hoạt động chính">
            <ol className="space-y-1">
              {draft.agenda.map((item, index) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className={cn(
                      'flex w-5 h-5 shrink-0 items-center justify-center rounded-full text-label-sm font-semibold',
                      AI_TONE_CYCLE[index % AI_TONE_CYCLE.length].tile,
                    )}
                  >
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </ReadOnlyField>
        )}
        {draft.extraNote && (
          <ReadOnlyField label="Lời nhắn từ người tổ chức" icon={StickyNote}>
            <span className="leading-relaxed">{draft.extraNote}</span>
          </ReadOnlyField>
        )}
      </Part>

      {warnings.length > 0 && !isCreated && (
        <ul className="space-y-1">
          {warnings.map((code) => (
            <li
              key={code}
              className="flex items-center gap-1.5 rounded-lg border border-tertiary-border bg-tertiary-soft px-2 py-1 text-xs text-tertiary-dark"
            >
              <TriangleAlert className="w-3.5 h-3.5 shrink-0" /> {DRAFT_WARNING_TEXT[code]}
            </li>
          ))}
        </ul>
      )}

      {isCreated ? (
        <Link to={`/playdates/${card.playdateId}`} className={LINK_CLASS}>
          <CalendarCheck className="w-3.5 h-3.5" /> Xem lịch hẹn
        </Link>
      ) : (
        <Button
          className="w-full sm:w-auto"
          disabled={disabled}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          onClick={onConfirm}
        >
          Xác nhận tạo lịch hẹn
        </Button>
      )}
    </ToolCardFrame>
  );
};

PlaydateDraftCard.propTypes = {
  card: PropTypes.shape({
    status: PropTypes.string,
    playdateId: PropTypes.string,
    draft: PropTypes.shape({
      activity: PropTypes.string,
      scheduledDate: PropTypes.string,
      time: PropTypes.string,
      endTime: PropTypes.string,
      durationMinutes: PropTypes.number,
      location: PropTypes.shape({ name: PropTypes.string, address: PropTypes.string }),
      placeDetails: PropTypes.shape({
        placeType: PropTypes.string,
        openingHours: PropTypes.string,
        osmUrl: PropTypes.string,
        familyDistances: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, distanceKm: PropTypes.number })),
      }),
      hostChild: PropTypes.shape({ displayName: PropTypes.string }),
      participants: PropTypes.arrayOf(
        PropTypes.shape({ childId: PropTypes.string, childName: PropTypes.string, parentName: PropTypes.string }),
      ).isRequired,
      agenda: PropTypes.arrayOf(PropTypes.string),
      extraNote: PropTypes.string,
      warnings: PropTypes.array,
    }).isRequired,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PlaydateDraftCard;
