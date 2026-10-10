import PropTypes from 'prop-types';
import { MapPin, MessageCircle, UserMinus } from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { cn } from '../../../utils/cn';
import { CONNECTION_ACTIONS, CONNECTION_LISTS } from '../constants/connection.constants';

const MAX_INTERESTS = 3;

/**
 * One connection of the list: an incoming request (Decline / Accept), a sent request (Withdraw)
 * or a connected family (Message / Remove). Selecting the card shows its quick profile.
 */
const ConnectionCard = ({ connection, type, isSelected, isBusy, onSelect, onAction, onMessage }) => {
  const { parentName, childName, childAge, isVerified, interests, area, avatarUrl } = connection;
  const title = childName ? `${childName}${childAge !== null ? ` (${childAge} tuổi)` : ''}` : parentName;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(connection.id);
    }
  };

  return (
    <Card
      padding="sm"
      hoverable
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(connection.id)}
      onKeyDown={handleKeyDown}
      className={cn('focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40', isSelected && 'border-primary')}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar src={avatarUrl} alt={parentName} size="lg" fallbackText={parentName.slice(0, 2).toUpperCase()} />

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-title-md text-text-primary truncate">{title}</h3>
              {isVerified && <VerifiedBadge size="sm" iconOnly />}
            </div>
            {childName && <p className="text-sm text-text-muted truncate">Phụ huynh: {parentName}</p>}

            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {interests.slice(0, MAX_INTERESTS).map((interest) => (
                  <InterestTag key={interest} label={interest} />
                ))}
              </div>
            )}

            {area && (
              <p className="flex items-center gap-1 text-sm text-text-muted truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                {area}
              </p>
            )}
          </div>
        </div>

        {/* Actions: stopPropagation so they do not select the card */}
        <div
          className="flex items-center gap-2 self-end sm:self-center shrink-0"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          role="presentation"
        >
          {type === CONNECTION_LISTS.INCOMING && (
            <>
              <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => onAction(CONNECTION_ACTIONS.DECLINE, connection)}>
                Từ chối
              </Button>
              <Button variant="primary" size="sm" disabled={isBusy} onClick={() => onAction(CONNECTION_ACTIONS.ACCEPT, connection)}>
                Chấp nhận
              </Button>
            </>
          )}

          {type === CONNECTION_LISTS.OUTGOING && (
            <Button variant="outline" size="sm" disabled={isBusy} onClick={() => onAction(CONNECTION_ACTIONS.CANCEL, connection)}>
              Thu hồi lời mời
            </Button>
          )}

          {type === CONNECTION_LISTS.ACCEPTED && (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MessageCircle className="w-4 h-4" strokeWidth={1.5} />}
                onClick={() => onMessage(connection)}
              >
                Nhắn tin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                aria-label="Hủy kết nối"
                title="Hủy kết nối"
                onClick={() => onAction(CONNECTION_ACTIONS.REMOVE, connection)}
              >
                <UserMinus className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

ConnectionCard.propTypes = {
  connection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentName: PropTypes.string.isRequired,
    childName: PropTypes.string,
    childAge: PropTypes.number,
    isVerified: PropTypes.bool,
    interests: PropTypes.arrayOf(PropTypes.string),
    area: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(Object.values(CONNECTION_LISTS)).isRequired,
  isSelected: PropTypes.bool,
  isBusy: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  onMessage: PropTypes.func.isRequired,
};

export default ConnectionCard;
