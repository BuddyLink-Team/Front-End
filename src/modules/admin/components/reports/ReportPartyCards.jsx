import React from 'react';
import { Avatar } from '../../../../components/ui/Avatar';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { formatDateTime } from '../../../../utils/formatters';

const PartyCard = ({ title, badge, person, chip }) => (
  <div className="rounded-2xl border border-hairline p-4 bg-surface-container-lowest space-y-3 text-body-md">
    <span className="block text-label-sm font-semibold text-text-muted uppercase">{title}</span>
    <div className="flex items-center gap-3">
      <Avatar src={person.avatarUrl} alt={person.fullName} size="md" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text-primary break-words">{person.fullName}</p>
        <p className="text-label-sm text-text-muted break-words">{person.email || '—'}</p>
        <p className="text-label-sm text-text-muted">{person.phone || '—'}</p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-label-xs bg-surface-muted text-text-primary px-2 py-0.5 rounded-full">{badge}</span>
      {chip}
    </div>
  </div>
);

const toAccountChip = ({ isActive, isBanned, suspensionUntil }) => {
  if (isActive) return { tone: 'success', label: 'Hoạt động' };
  if (isBanned) return { tone: 'danger', label: 'Đã khóa vĩnh viễn' };
  if (suspensionUntil) return { tone: 'warning', label: `Đình chỉ đến ${formatDateTime(suspensionUntil)}` };
  return { tone: 'danger', label: 'Đã khóa' };
};

/**
 * Who reported whom
 */
export const ReportPartyCards = ({ reporter, reportedUser }) => (
  <div className="space-y-4">
    <PartyCard
      title="Người báo cáo"
      badge={`${reporter.totalReportsSubmitted ?? 0} báo cáo đã gửi`}
      person={reporter}
    />
    <PartyCard
      title="Người bị báo cáo"
      badge={`${reportedUser.strikeCount ?? 0} lần cảnh cáo`}
      person={reportedUser}
      chip={<StatusChip {...toAccountChip(reportedUser)} />}
    />
  </div>
);

export default ReportPartyCards;
