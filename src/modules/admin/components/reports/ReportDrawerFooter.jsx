import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE, ICON_STROKE } from '../../../../constants/icon.constants';

const NEEDS_SANCTION_HINT = 'Cần thi hành ít nhất 1 chế tài trước khi đánh dấu đã xử lý.';

/**
 * Actions that move a report to another status. A pending report can only be started or dismissed
 * (clear spam or duplicate); a reviewing one is resolved with its sanctions, or explicitly without any.
 */
export const ReportDrawerFooter = ({
  report,
  actionState,
  isActionLoading,
  resolution,
  onClose,
  onClaim,
  onTakeover,
  onAskReopen,
}) => {
  const { isPending, isReviewing, isClosed, hasActions } = actionState;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 w-full">
      <Button type="button" variant="ghost" onClick={onClose} className="border border-hairline">
        Đóng
      </Button>
      {isReviewing && (
        <Button type="button" variant="outline" disabled={isActionLoading} onClick={() => onTakeover(report.id)}>
          Tiếp quản vụ việc
        </Button>
      )}
      {!isClosed && (
        <Button type="button" variant="outline" disabled={isActionLoading} onClick={resolution.dismiss}>
          Bác bỏ
        </Button>
      )}
      {isPending && (
        <Button type="button" variant="primary" disabled={isActionLoading} onClick={() => onClaim(report.id)}>
          Bắt đầu xử lý
        </Button>
      )}
      {isReviewing && !hasActions && (
        <Button type="button" variant="outline" disabled={isActionLoading} onClick={resolution.resolveWithoutAction}>
          Đóng, không kỷ luật
        </Button>
      )}
      {isReviewing && (
        <Button
          type="button"
          variant="primary"
          disabled={isActionLoading || !hasActions}
          title={hasActions ? undefined : NEEDS_SANCTION_HINT}
          onClick={resolution.markResolved}
        >
          Đánh dấu đã xử lý
        </Button>
      )}
      {isClosed && (
        <Button
          type="button"
          variant="primary"
          disabled={isActionLoading}
          leftIcon={<RotateCcw size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />}
          onClick={onAskReopen}
        >
          Mở lại vụ việc
        </Button>
      )}
    </div>
  );
};

export default ReportDrawerFooter;
