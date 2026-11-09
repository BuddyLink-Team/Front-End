import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE, ICON_STROKE } from '../../../../constants/icon.constants';

/**
 * Status changes only (the drawer closes from its header): start a pending report, conclude or dismiss
 * an open one through the conclusion dialog, reopen a closed one. Sanctions are applied in the body.
 */
export const ReportDrawerFooter = ({
  report,
  actionState,
  isActionLoading,
  onClaim,
  onAskConclusion,
  onAskReopen,
}) => {
  const { isPending, isReviewing, isClosed, hasOfficialActions } = actionState;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
      {!isClosed ? (
        <Button
          type="button"
          variant="outline"
          // A sanctioned report had a violation: it is concluded, never dismissed
          disabled={isActionLoading || hasOfficialActions}
          title={
            hasOfficialActions
              ? 'Báo cáo đã có chế tài nên không thể bác bỏ'
              : undefined
          }
          onClick={() => onAskConclusion('dismiss')}
        >
          Bác bỏ báo cáo
        </Button>
      ) : (
        <span />
      )}
      {isPending && (
        <Button
          type="button"
          variant="primary"
          disabled={isActionLoading}
          onClick={() => onClaim(report.id)}
        >
          Bắt đầu xử lý
        </Button>
      )}
      {isReviewing && (
        <Button
          type="button"
          variant="primary"
          disabled={isActionLoading}
          onClick={() => onAskConclusion('resolve')}
        >
          Kết luận & đóng báo cáo
        </Button>
      )}
      {isClosed && (
        <Button
          type="button"
          variant="primary"
          disabled={isActionLoading}
          leftIcon={
            <RotateCcw size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
          }
          onClick={onAskReopen}
        >
          Mở lại vụ việc
        </Button>
      )}
    </div>
  );
};

export default ReportDrawerFooter;
