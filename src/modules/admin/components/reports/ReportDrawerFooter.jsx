import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE, ICON_STROKE } from '../../../../constants/icon.constants';

/**
 * The decision of the case (the drawer closes from its header): no violation or violation on an open
 * case, both through the decision dialog; reopen on a closed one.
 */
export const ReportDrawerFooter = ({
  actionState,
  isActionLoading,
  onAskDecision,
  onAskReopen,
}) => {
  const { isClosed, hasOfficialActions } = actionState;

  if (isClosed) {
    return (
      <div className="flex w-full justify-end">
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
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        // A sanctioned case had a violation: it is never dismissed
        disabled={isActionLoading || hasOfficialActions}
        title={
          hasOfficialActions
            ? 'Vụ việc đã có chế tài nên không thể bác bỏ'
            : undefined
        }
        onClick={() => onAskDecision('dismiss')}
      >
        Không vi phạm — bác bỏ
      </Button>
      <Button
        type="button"
        variant="primary"
        disabled={isActionLoading}
        onClick={() => onAskDecision('violation')}
      >
        Có vi phạm — xử lý
      </Button>
    </div>
  );
};

export default ReportDrawerFooter;
