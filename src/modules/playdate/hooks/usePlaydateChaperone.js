import { useState, useCallback, useEffect } from 'react';
import playdateApi from '../api/playdateApi.js';
import { useToast } from '../../../hooks/useToast.js';
import { getApiErrorMsg } from '../../../utils/errorUtils.js';
import { PLAYDATE_ERROR_MESSAGES, CHAPERONE_ACTIONS } from '../constants/playdate.constants.js';

const EMPTY_SUMMARY = Object.freeze({
  requiredChaperones: 1,
  confirmedChaperones: 0,
  missingChaperones: 1,
  isChaperoneSufficient: false,
  isChaperoneConfirmedByMe: false,
});

/**
 * Adults coming with the children of a playdate (BUD-49 B5). The counts come from the server
 * (`chaperoneSummary` of GET /playdates/:id): 1 adult per 2 children under 5, 1 per 3 older children,
 * 1 per child for water activities. Errors are shown as a toast.
 * @param {Object|null} playdate
 */
export const usePlaydateChaperone = (playdate) => {
  const toast = useToast();
  const [summary, setSummary] = useState(playdate?.chaperoneSummary || EMPTY_SUMMARY);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (playdate?.chaperoneSummary) setSummary(playdate.chaperoneSummary);
  }, [playdate?.chaperoneSummary]);

  const playdateId = playdate?.id;
  const toggle = useCallback(async () => {
    if (!playdateId) return;
    const action = summary.isChaperoneConfirmedByMe ? CHAPERONE_ACTIONS.CANCEL : CHAPERONE_ACTIONS.CONFIRM;
    try {
      setIsUpdating(true);
      const res = await playdateApi.toggleChaperone(playdateId, action);
      if (res?.data?.chaperoneSummary) setSummary(res.data.chaperoneSummary);
      toast.success(
        action === CHAPERONE_ACTIONS.CONFIRM ? 'Đã xác nhận tham gia làm người lớn đi kèm' : 'Đã hủy đăng ký người lớn đi kèm'
      );
    } catch (err) {
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Không thể cập nhật trạng thái người đi kèm'));
    } finally {
      setIsUpdating(false);
    }
  }, [playdateId, summary.isChaperoneConfirmedByMe, toast]);

  return { summary, toggle, isUpdating };
};

export default usePlaydateChaperone;
