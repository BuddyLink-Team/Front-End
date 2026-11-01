import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import { PlaymateSelector } from './PlaymateSelector';
import { playdateApi } from '../api/playdateApi';
import { removeAccents } from '../../../utils/formatters';
import { INVITE_FRIENDS_FETCH_LIMIT } from '../constants/playdate.constants';

const normalize = (text) => removeAccents(text).toLowerCase().trim();

/**
 * Host invites more friends' children to an upcoming playdate (e.g. once every invitee declined).
 * Lists the children of connected families ranked for the host child, without the families still invited or joined
 * (a family who declined or left can be invited again);
 * several children of a family can be picked, as at creation.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Object} playdate - hostChildId and participants (families invited, with their answer)
 * @param {(participants: Array<{ parentId: string, childId: string }>) => Promise<boolean>} onInvite - true once sent
 * @param {boolean} [isSubmitting]
 */
export const InvitePlaymatesModal = ({ isOpen, onClose, playdate, onInvite, isSubmitting = false }) => {
  const [lists, setLists] = useState({ matched: [], others: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;
    setSelected([]);
    setQuery('');
    setIsLoading(true);
    setHasError(false);
    playdateApi
      .getFriends({ childId: playdate.hostChildId, limit: INVITE_FRIENDS_FETCH_LIMIT })
      .then((response) => {
        if (!active) return;
        const invited = new Set(
          (playdate.participants || []).filter((p) => p.status !== 'declined').map((p) => p.parentId)
        );
        const notInvited = (entries = []) => entries.filter((entry) => !invited.has(entry.parent.id));
        setLists({ matched: notInvited(response?.data?.matched), others: notInvited(response?.data?.others) });
      })
      .catch(() => active && setHasError(true))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [isOpen, playdate.hostChildId, playdate.participants]);

  // Searched by the child's or the parent's name, accents ignored
  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!term) return lists;
    const matches = (entry) => normalize(`${entry.child.displayName} ${entry.parent.fullName}`).includes(term);
    return { matched: lists.matched.filter(matches), others: lists.others.filter(matches) };
  }, [lists, query]);

  const toggle = (entry) =>
    setSelected((prev) =>
      prev.some((p) => p.childId === entry.child.id)
        ? prev.filter((p) => p.childId !== entry.child.id)
        : [...prev, { parentId: entry.parent.id, childId: entry.child.id }]
    );

  const submit = async () => {
    if (await onInvite(selected)) onClose();
  };

  const isEmpty = !isLoading && !hasError && lists.matched.length + lists.others.length === 0;
  const noMatch = !isEmpty && filtered.matched.length + filtered.others.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mời thêm bạn"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={submit} isLoading={isSubmitting} disabled={!selected.length}>
            Gửi lời mời{selected.length ? ` (${selected.length})` : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Chọn bé nhà bạn bè đã kết nối. Các gia đình đã được mời vào buổi hẹn này không hiện ở đây.
        </p>
        <label className="relative block">
          <span className="sr-only">Tìm bạn</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên bé hoặc phụ huynh"
            className="w-full rounded-xl border border-hairline-strong bg-surface-container-lowest py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </label>
        {isLoading && <p className="text-sm text-text-muted">Đang tải danh sách bạn bè…</p>}
        {hasError && <p className="text-sm text-error">Không tải được danh sách bạn bè, bạn thử lại sau nhé.</p>}
        {isEmpty && <p className="text-sm text-text-muted">Không còn gia đình bạn bè nào để mời thêm.</p>}
        {noMatch && <p className="text-sm text-text-muted">Không tìm thấy “{query.trim()}”.</p>}
        {!isLoading && !hasError && (
          <PlaymateSelector
            matched={filtered.matched}
            others={filtered.others}
            selectedChildIds={selected.map((p) => p.childId)}
            onToggle={toggle}
          />
        )}
      </div>
    </Modal>
  );
};

InvitePlaymatesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  playdate: PropTypes.shape({
    hostChildId: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({ parentId: PropTypes.string })),
  }).isRequired,
  onInvite: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default InvitePlaymatesModal;
