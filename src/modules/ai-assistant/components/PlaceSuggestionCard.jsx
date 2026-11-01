import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, Trees, Coffee, FerrisWheel, BookOpen, Building2, Palette, Clock, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PLACE_TYPE_LABELS } from '../../playdate/constants/playdate.constants';
import { formatKm } from '../../playdate/utils/suggestionFormatters';
import { cn } from '../../../utils/cn';
import { OptionLinks } from './OptionLinks';
import { ToolCardFrame } from './ToolCardFrame';
import { AI_CARD_TONES, AI_CARD_TYPES, AI_TONES } from '../constants/ai-assistant.constants';

// Places have no photo: a tile with the place type's icon (the same as the playdate place search) stands in for the Stitch picture
const PLACE_TYPE_TILES = {
  park: { icon: Trees, tone: AI_TONES.primary },
  playground: { icon: FerrisWheel, tone: AI_TONES.primary },
  kids_cafe: { icon: Coffee, tone: AI_TONES.tertiary },
  library: { icon: BookOpen, tone: AI_TONES.secondary },
  sports_center: { icon: Building2, tone: AI_TONES.secondary },
  workshop: { icon: Palette, tone: AI_TONES.tertiary },
};
const DEFAULT_TILE = { icon: MapPin, tone: AI_TONES.primary };

/**
 * Places near the parent's home, from the assistant (Stitch "Top địa điểm phù hợp").
 * Each place opens on a map and can start a playdate plan there.
 *
 * @param {Array<Object>} items - { id, name, address, placeType, distanceKm, openingHours, links }
 * @param {(place: Object) => void} onUsePlace - "Dùng cho lịch hẹn"
 * @param {boolean} [disabled]
 */
export const PlaceSuggestionCard = ({ items, onUsePlace, disabled = false }) => (
  <ToolCardFrame tone={AI_CARD_TONES[AI_CARD_TYPES.PLACE_SUGGESTIONS]} icon={MapPin} title="Địa điểm gần nhà">
    {items.length === 0 ? (
      <p className="text-xs text-text-muted">Chưa tìm thấy địa điểm phù hợp quanh nhà bạn.</p>
    ) : (
      <ul className="space-y-2">
        {items.map((place) => {
          const { icon: Icon, tone } = PLACE_TYPE_TILES[place.placeType] || DEFAULT_TILE;
          return (
            <li
              key={place.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-hairline-strong shadow-sm p-3"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className={cn('flex w-12 h-12 shrink-0 items-center justify-center rounded-xl', tone.tile)}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-text-primary break-words">{place.name}</p>
                  <p className="text-label-sm text-text-muted break-words">
                    {[PLACE_TYPE_LABELS[place.placeType] || place.placeType, place.distanceKm != null ? `Cách ${formatKm(place.distanceKm)}` : null, place.address]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {place.openingHours && (
                    <p className="flex items-center gap-1 text-label-sm text-text-muted">
                      <Clock className="w-3 h-3" /> {place.openingHours}
                    </p>
                  )}
                  <OptionLinks links={place.links} />
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0"
                disabled={disabled}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                onClick={() => onUsePlace(place)}
              >
                Dùng cho lịch hẹn
              </Button>
            </li>
          );
        })}
      </ul>
    )}
  </ToolCardFrame>
);

PlaceSuggestionCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string,
      placeType: PropTypes.string,
      distanceKm: PropTypes.number,
      openingHours: PropTypes.string,
      links: PropTypes.array,
    }),
  ).isRequired,
  onUsePlace: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PlaceSuggestionCard;
