import { MapPin, MessageCircle, UserMinus } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';

/**
 * ConnectionCard — domain card for a single connection entry.
 *
 * Renders two layouts:
 *  - `pending` : incoming request with Accept (primary) + Decline (ghost) buttons.
 *  - `accepted`: connected friend with Message + Remove actions.
 *
 * Uses shared <Avatar /> (border-2 border-white, online dot built-in) and
 * shared <Button /> variants per BuddyLink Design System (DESIGN.md).
 */
const ConnectionCard = ({ connection, type, onAccept, onDecline, onRemove }) => {
  const { childName, childAge, parentName, isVerified, interests, location, avatarUrl, isOnline } =
    connection;

  const ageText = childAge !== null && childAge !== undefined ? ` (${childAge} tuổi)` : '';

  return (
    <div className="bg-white border border-hairline rounded-2xl p-5 hover:shadow-sm transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* ── Avatar + Info ── */}
        <div className="flex items-center gap-4 min-w-0">
          <Avatar
            src={avatarUrl}
            alt={childName}
            size="lg"
            isOnline={isOnline}
          />

          <div className="min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-text-primary truncate">
                {childName}{ageText}
              </h3>
              <span className="text-text-muted text-sm">•</span>
              <span className="text-sm text-text-muted truncate">{parentName}</span>
              {isVerified && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#3D6841] text-[11px] font-medium">
                  Uy tín
                </span>
              )}
            </div>

            {/* Interests */}
            {interests && (
              <p className="text-sm text-text-muted truncate mt-0.5">{interests}</p>
            )}

            {/* Location */}
            {location && (
              <p className="flex items-center gap-1 text-sm text-text-muted mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                {location}
              </p>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        {/* stopPropagation so clicking buttons doesn't trigger card onClick */}
        <div
          className="flex items-center gap-2 self-end sm:self-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {type === 'pending' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDecline?.(connection.id)}
              >
                Từ chối
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAccept?.(connection.id)}
              >
                Chấp nhận
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<MessageCircle className="w-4 h-4" strokeWidth={1.5} />}
              >
                Nhắn tin
              </Button>
              <button
                type="button"
                title="Hủy kết nối"
                onClick={() => onRemove?.(connection.id)}
                className="p-2 rounded-xl text-text-muted hover:bg-surface-container-low hover:text-error transition-colors"
              >
                <UserMinus className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
