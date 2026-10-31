import React from 'react';
import { Ban, CalendarX, ShieldAlert, Trash2, TriangleAlert, UserX } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Select } from '../../../../components/ui/Select';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { REPORT_SUSPEND_DURATIONS } from '../../constants/admin.constants';
import { ReportSection } from './ReportChips';

/**
 * Quick sanction buttons. Each one asks for confirmation first (see useReportInvestigation).
 */
export const ReportSanctionPanel = ({ targetType, actionState, suspendDays, onSuspendDaysChange, onAskSanction, isActionLoading }) => {
  const { appliedActions, canWarn, canDeleteMessage, canCancelPlaydate, canSuspend, canBan } = actionState;

  return (
    <ReportSection icon={ShieldAlert} title="Thi hành chế tài">
      <p className="text-label-sm text-text-muted">Mỗi thao tác được ghi lại vào nhật ký kiểm duyệt.</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isActionLoading || !canWarn}
          leftIcon={<TriangleAlert size={ICON_SIZE.XS} />}
          onClick={() => onAskSanction('warn')}
        >
          {appliedActions.has('warn') ? 'Đã cảnh cáo' : 'Cảnh cáo'}
        </Button>

        {targetType === 'message' && (
          <Button
            size="sm"
            variant="danger"
            disabled={isActionLoading || !canDeleteMessage}
            leftIcon={<Trash2 size={ICON_SIZE.XS} />}
            onClick={() => onAskSanction('delete_message')}
          >
            {appliedActions.has('delete_message') ? 'Đã xóa tin nhắn' : 'Xóa tin nhắn'}
          </Button>
        )}

        {targetType === 'playdate' && (
          <Button
            size="sm"
            variant="danger"
            disabled={isActionLoading || !canCancelPlaydate}
            leftIcon={<CalendarX size={ICON_SIZE.XS} />}
            onClick={() => onAskSanction('cancel_playdate')}
          >
            {appliedActions.has('cancel_playdate') ? 'Đã hủy cuộc hẹn' : 'Hủy cuộc hẹn'}
          </Button>
        )}

        <div className="flex items-center gap-1.5">
          <div className="w-28">
            <Select
              aria-label="Thời hạn đình chỉ"
              value={suspendDays}
              disabled={isActionLoading || !canSuspend}
              onChange={(event) => onSuspendDaysChange(Number(event.target.value))}
            >
              {REPORT_SUSPEND_DURATIONS.map((days) => (
                <option key={days} value={days}>
                  {days} ngày
                </option>
              ))}
            </Select>
          </div>
          <Button
            size="sm"
            variant="danger"
            disabled={isActionLoading || !canSuspend}
            leftIcon={<UserX size={ICON_SIZE.XS} />}
            onClick={() => onAskSanction('suspend')}
          >
            {appliedActions.has('suspend') ? 'Đã đình chỉ' : 'Tạm đình chỉ'}
          </Button>
        </div>

        <Button
          size="sm"
          variant="danger"
          disabled={isActionLoading || !canBan}
          leftIcon={<Ban size={ICON_SIZE.XS} />}
          onClick={() => onAskSanction('ban')}
        >
          {canBan ? 'Khóa vĩnh viễn' : 'Đã khóa vĩnh viễn'}
        </Button>
      </div>
    </ReportSection>
  );
};

export default ReportSanctionPanel;
