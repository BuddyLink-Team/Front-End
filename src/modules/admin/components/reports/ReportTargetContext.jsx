import React from 'react';
import { Calendar, MessageSquare, User } from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { cn } from '../../../../utils/cn';
import { formatDate, formatDateTime, formatTimeRange } from '../../../../utils/formatters';
import { PARTICIPANT_STATUS_DISPLAY, PLAYDATE_STATUS_DISPLAY } from '../../constants/admin.constants';
import { ReportSection } from './ReportChips';

const TARGET_ICONS = { message: MessageSquare, playdate: Calendar, user: User };

const MessageContext = ({ context }) => {
  const reportedId = context.reportedMessage.id;
  return (
    <>
      <p className="text-label-sm text-text-muted">Đoạn hội thoại quanh tin nhắn bị báo cáo:</p>
      <div className="space-y-2.5 max-h-80 overflow-y-auto p-3 rounded-xl bg-surface-muted border border-hairline">
        {context.surroundingMessages.map((message) => {
          const isReported = message.id === reportedId;
          return (
            <div
              key={message.id}
              data-testid={isReported ? 'reported-message' : undefined}
              className={cn(
                'p-3 rounded-xl border',
                isReported
                  ? 'bg-error-soft border-error text-error-dark font-medium'
                  : 'bg-surface-container-lowest border-hairline text-text-primary'
              )}
            >
              <div className="flex items-center justify-between text-label-xs mb-1">
                <span className="font-semibold">{message.senderName}</span>
                <span className={isReported ? undefined : 'text-text-muted'}>{formatDateTime(message.createdAt)}</span>
              </div>
              <p className="text-label-md">{message.content}</p>
              {message.mediaUrl && (
                <img src={message.mediaUrl} alt="Ảnh trong tin nhắn" className="mt-2 max-h-32 rounded-lg object-cover" />
              )}
              {isReported && (
                <span className="inline-block mt-1 text-label-xs font-semibold">
                  Tin nhắn bị báo cáo{message.isDeleted ? ' (đã gỡ)' : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

const PlaydateContext = ({ playdate }) => {
  const statusDisplay = PLAYDATE_STATUS_DISPLAY[playdate.status];
  const host = playdate.host?.parent;
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-text-primary">{playdate.activity || 'Cuộc hẹn chơi'}</p>
        {statusDisplay && <StatusChip status={playdate.status} {...statusDisplay} />}
      </div>
      <p className="text-label-md text-text-muted">
        {formatDate(playdate.scheduledDate)} · {formatTimeRange(playdate.time, playdate.durationMinutes)}
      </p>
      <p className="text-label-md text-text-muted">
        {[playdate.location?.name, playdate.location?.address].filter(Boolean).join(', ') || '—'}
      </p>
      <p className="text-label-md text-text-muted">
        Người tổ chức: <span className="font-medium text-text-primary">{host?.fullName || '—'}</span>
        {playdate.host?.child?.displayName ? ` (${playdate.host.child.displayName})` : ''}
      </p>
      <div className="space-y-2 pt-2 border-t border-hairline">
        <p className="text-label-sm text-text-muted">Người tham gia ({playdate.participants?.length || 0}):</p>
        {(playdate.participants || []).map((participant) => {
          const display = PARTICIPANT_STATUS_DISPLAY[participant.status];
          return (
            <div key={`${participant.parentId}-${participant.childId}`} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar src={participant.parent?.avatarUrl} alt={participant.parent?.fullName} size="sm" />
                <span className="text-label-md text-text-primary truncate">
                  {participant.parent?.fullName || 'Người dùng BuddyLink'}
                  {participant.child?.displayName ? ` (${participant.child.displayName})` : ''}
                </span>
              </div>
              {display && <StatusChip status={participant.status} {...display} />}
            </div>
          );
        })}
      </div>
    </>
  );
};

const UserContext = ({ context, reportedUser }) => (
  <div className="flex items-center gap-3">
    <Avatar src={reportedUser.avatarUrl} alt={reportedUser.fullName} size="lg" />
    <div className="min-w-0 text-label-md text-text-muted">
      <p className="font-semibold text-text-primary truncate">{reportedUser.fullName}</p>
      <p>{context.childrenCount ?? 0} hồ sơ bé đang hoạt động</p>
      <p>{reportedUser.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản đang bị khóa'}</p>
      <p>{reportedUser.strikeCount ?? 0} lần cảnh cáo</p>
    </div>
  </div>
);

/**
 * What was reported: the chat excerpt, the playdate or the account
 */
export const ReportTargetContext = ({ report }) => {
  const { targetContext: context, targetType } = report;

  const renderContext = () => {
    if (targetType === 'message' && context?.reportedMessage) return <MessageContext context={context} />;
    if (targetType === 'playdate' && context?.playdate) return <PlaydateContext playdate={context.playdate} />;
    if (targetType === 'user' && context) return <UserContext context={context} reportedUser={report.reportedUser} />;
    return <p className="text-text-muted">Đối tượng bị báo cáo không còn tồn tại.</p>;
  };

  return (
    <ReportSection icon={TARGET_ICONS[targetType]} title="Ngữ cảnh đối tượng vi phạm">
      {renderContext()}
    </ReportSection>
  );
};

export default ReportTargetContext;
