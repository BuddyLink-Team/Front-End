import PropTypes from 'prop-types';
import { MousePointerClick, CalendarPlus, MessageCircle, ShieldOff, Clock, MapPin, CalendarDays } from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { EmptyState } from '../../../components/cards/EmptyState';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { CONNECTION_ACTIONS, CONNECTION_LISTS } from '../constants/connection.constants';

const GENDER_LABELS = { boy: 'Bé trai', girl: 'Bé gái' };

const PreferenceRow = ({ icon: Icon, label, values }) =>
  values.length > 0 ? (
    <div className="space-y-1.5">
      <h4 className="text-label-sm uppercase tracking-wider text-text-muted">{label}</h4>
      <div className="flex items-start gap-2 text-body-md text-text-primary">
        <Icon className="w-4 h-4 mt-1 shrink-0 text-primary" strokeWidth={1.5} />
        <span>{values.join(', ')}</span>
      </div>
    </div>
  ) : null;

PreferenceRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
};

/**
 * Quick profile of the selected connection (right column of the connections page)
 */
const QuickProfileCard = ({ connection, type, onAction, onMessage, onInvite }) => {
  if (!connection) {
    return (
      <Card>
        <EmptyState
          icon={<MousePointerClick className="w-7 h-7" strokeWidth={1.5} />}
          title="Chưa chọn hồ sơ nào"
          description="Chọn một gia đình trong danh sách để xem thông tin nhanh ở đây."
        />
      </Card>
    );
  }

  const { parentName, childName, childAge, childGender, isVerified, interests, area, avatarUrl } = connection;
  const subtitle = [
    childAge !== null ? `Bé ${childAge} tuổi` : null,
    GENDER_LABELS[childGender] || null,
    area || 'Chưa cập nhật khu vực',
  ]
    .filter(Boolean)
    .join(' • ');
  const isConnected = type === CONNECTION_LISTS.ACCEPTED;

  return (
    <Card className="space-y-5">
      <span className="text-label-sm uppercase tracking-wider text-text-muted">Hồ sơ xem nhanh</span>

      <div className="flex flex-col items-center text-center gap-2">
        <Avatar src={avatarUrl} alt={parentName} size="xl" fallbackText={parentName.slice(0, 2).toUpperCase()} />
        <h3 className="text-headline-md text-text-primary">{childName ? `${childName} & ${parentName}` : parentName}</h3>
        <p className="text-body-md text-text-muted">{subtitle}</p>
        {isVerified && <VerifiedBadge text="Phụ huynh đã xác thực" size="sm" />}
      </div>

      <div className="space-y-4 border-t border-hairline pt-4">
        {interests.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-label-sm uppercase tracking-wider text-text-muted">Sở thích & trò chơi yêu thích</h4>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest) => (
                <InterestTag key={interest} label={interest} />
              ))}
            </div>
          </div>
        )}
        <PreferenceRow icon={CalendarDays} label="Ngày thuận tiện" values={connection.preferredDays} />
        <PreferenceRow icon={Clock} label="Khung giờ thuận tiện" values={connection.preferredTimeSlots} />
        <PreferenceRow icon={MapPin} label="Địa điểm chơi ưa thích" values={connection.preferredLocations} />
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        {isConnected && (
          <>
            <Button
              variant="primary"
              leftIcon={<CalendarPlus className="w-4 h-4" strokeWidth={1.5} />}
              onClick={() => onInvite(connection)}
            >
              Mời bé hẹn chơi
            </Button>
            <Button
              variant="secondary"
              leftIcon={<MessageCircle className="w-4 h-4" strokeWidth={1.5} />}
              onClick={() => onMessage(connection)}
            >
              Nhắn tin
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          className="text-error"
          leftIcon={<ShieldOff className="w-4 h-4" strokeWidth={1.5} />}
          onClick={() => onAction(CONNECTION_ACTIONS.BLOCK, connection)}
        >
          Chặn người dùng
        </Button>
      </div>
    </Card>
  );
};

QuickProfileCard.propTypes = {
  connection: PropTypes.shape({
    parentName: PropTypes.string.isRequired,
    childName: PropTypes.string,
    childAge: PropTypes.number,
    childGender: PropTypes.string,
    isVerified: PropTypes.bool,
    interests: PropTypes.arrayOf(PropTypes.string),
    area: PropTypes.string,
    avatarUrl: PropTypes.string,
    preferredDays: PropTypes.arrayOf(PropTypes.string),
    preferredTimeSlots: PropTypes.arrayOf(PropTypes.string),
    preferredLocations: PropTypes.arrayOf(PropTypes.string),
  }),
  type: PropTypes.oneOf(Object.values(CONNECTION_LISTS)),
  onAction: PropTypes.func.isRequired,
  onMessage: PropTypes.func.isRequired,
  onInvite: PropTypes.func.isRequired,
};

export default QuickProfileCard;
