import { useEffect, useState } from 'react';
import { playdateApi } from '../../playdate/api/playdateApi';
import { AI_LIMITS } from '../constants/ai-assistant.constants';

/**
 * Children of the connected families who can be invited with one own child
 * (GET /playdates/friends?childId=), as search items of the playmates card.
 * The list is loaded once and searched on the device: the API only searches parent names.
 *
 * @param {string} [hostChildId]
 * @returns {{ items: Array<{ value: string, label: string, description: string }>, isLoading: boolean, hasError: boolean }}
 */
export function useInvitableChildren(hostChildId) {
  const [state, setState] = useState({ items: [], isLoading: Boolean(hostChildId), hasError: false });

  useEffect(() => {
    if (!hostChildId) return undefined;
    let active = true;
    setState({ items: [], isLoading: true, hasError: false });
    playdateApi
      .getFriends({ childId: hostChildId, limit: AI_LIMITS.FRIENDS_FETCH_LIMIT })
      .then((response) => {
        if (!active) return;
        const { matched = [], others = [] } = response?.data || {};
        const items = [...matched, ...others].map(({ child, parent }) => ({
          value: String(child.id),
          label: child.displayName,
          description: [child.age != null ? `${child.age} tuổi` : null, `bé nhà ${parent.fullName}`].filter(Boolean).join(' · '),
        }));
        setState({ items, isLoading: false, hasError: false });
      })
      .catch(() => active && setState({ items: [], isLoading: false, hasError: true }));
    return () => {
      active = false;
    };
  }, [hostChildId]);

  return state;
}

export default useInvitableChildren;
