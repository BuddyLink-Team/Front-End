import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '../../../components/navigation/Tabs';
import { SearchBar } from '../../../components/search/SearchBar';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Pagination } from '../../../components/navigation/Pagination';
import useConnections from '../hooks/useConnections';
import ConnectionCard from '../components/ConnectionCard';
import ConnectionEmptyState from '../components/ConnectionEmptyState';
import QuickProfileCard from '../components/QuickProfileCard';
import { CONNECTION_CONFIRM, CONNECTION_LISTS, CONNECTION_TABS } from '../constants/connection.constants';

/**
 * /connections: accepted connections, incoming and sent requests (paginated and searched by the
 * backend), with a quick profile column.
 * Data flow: Page -> useConnections (hook) -> connection slice thunks -> connectionApi -> apiClient
 */
const ConnectionsPage = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const {
    lists,
    totals,
    activeList: activeTab,
    setActiveList: setActiveTab,
    searchQuery,
    setSearchQuery,
    isSearching,
    page,
    totalPages,
    changePage,
    isLoading,
    pendingActionId,
    fetchError,
    pendingConfirm,
    isConfirming,
    requestAction,
    cancelAction,
    confirmAction,
    openChat,
    invitePlaydate,
  } = useConnections();

  const list = lists[activeTab];

  // Quick profile of the selected card (any list), with the list it belongs to
  const selected = useMemo(() => {
    for (const listId of Object.values(CONNECTION_LISTS)) {
      const connection = lists[listId].find((c) => c.id === selectedId);
      if (connection) return { connection, type: listId };
    }
    return null;
  }, [lists, selectedId]);

  const tabs = CONNECTION_TABS.map((tab) => ({ ...tab, count: totals[tab.id] }));
  const confirmContent = pendingConfirm ? CONNECTION_CONFIRM[pendingConfirm.action] : null;

  return (
    <div className="mx-auto px-margin py-space-md pb-20 space-y-space-md">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Tìm theo tên bé, phụ huynh hoặc khu vực..."
        className="max-w-md"
      />

      {fetchError && !isLoading && (
        <div role="alert" className="px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-sm">
          {isLoading && list.length === 0 ? (
            Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)
          ) : list.length === 0 ? (
            <ConnectionEmptyState
              type={activeTab}
              isSearching={isSearching}
              onDiscover={() => navigate('/discovery')}
            />
          ) : (
            list.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                type={activeTab}
                isSelected={connection.id === selectedId}
                isBusy={connection.id === pendingActionId}
                onSelect={setSelectedId}
                onAction={requestAction}
                onMessage={openChat}
              />
            ))
          )}
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={changePage} className="justify-center pt-2" />
          )}
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <QuickProfileCard
            connection={selected?.connection || null}
            type={selected?.type}
            onAction={requestAction}
            onMessage={openChat}
            onInvite={invitePlaydate}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmContent)}
        title={confirmContent?.title}
        description={confirmContent?.description(pendingConfirm.connection.parentName)}
        confirmLabel={confirmContent?.confirmLabel}
        cancelLabel="Để sau"
        variant={confirmContent?.variant}
        isLoading={isConfirming}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />
    </div>
  );
};

export default ConnectionsPage;
