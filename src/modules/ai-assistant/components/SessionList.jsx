import React from 'react';
import PropTypes from 'prop-types';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { useAISessions } from '../hooks/useAISessions';
import { SESSION_GROUP_LABELS } from '../constants/ai-assistant.constants';

/**
 * Conversation history (Stitch left column): new conversation, sessions grouped by day, delete
 * @param {Function} [onSelected] - Called after a conversation is picked (e.g. close the mobile sheet)
 */
export const SessionList = ({ onSelected }) => {
  const {
    groups,
    activeSessionId,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    selectSession,
    startNewSession,
    pendingDeleteId,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useAISessions();

  const pick = (id) => {
    selectSession(id);
    onSelected?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      <Button
        variant="secondary"
        className="w-full justify-start"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => {
          startNewSession();
          onSelected?.();
        }}
      >
        Cuộc trò chuyện mới
      </Button>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        <p className="text-label-md uppercase tracking-wider text-outline">Lịch sử trò chuyện</p>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-9 rounded-xl" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-xs text-text-muted">Chưa có cuộc trò chuyện nào.</p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="space-y-1">
              <p className="px-2 text-label-sm font-semibold uppercase text-on-surface-variant">{SESSION_GROUP_LABELS[group.key]}</p>
              {group.sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    className={cn(
                      'group flex items-center gap-1 rounded-xl pr-1 transition-colors',
                      isActive ? 'chat-conversation-item-active shadow-xs' : 'hover:bg-surface-container-low',
                    )}
                  >
                    <button
                      type="button"
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => pick(session.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm text-on-surface"
                    >
                      <MessageCircle className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary-dark' : 'text-on-surface-variant')} />
                      <span className={cn('truncate', isActive && 'font-semibold text-on-surface')}>{session.title}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Xóa "${session.title}"`}
                      onClick={() => requestDelete(session.id)}
                      className="shrink-0 rounded-lg p-1.5 text-text-muted opacity-100 transition-opacity hover:text-error lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        )}
        {hasMore && (
          <Button variant="ghost" size="sm" className="w-full" isLoading={isLoadingMore} onClick={loadMore}>
            Xem thêm
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Xóa cuộc trò chuyện?"
        description="Cuộc trò chuyện sẽ bị xóa khỏi lịch sử. Lượt trò chuyện đã dùng trong tháng không được hoàn lại."
        confirmLabel="Xóa"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

SessionList.propTypes = {
  onSelected: PropTypes.func,
};

export default SessionList;
