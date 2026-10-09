import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '../../../components/navigation/Tabs';
import { SearchBar } from '../../../components/search/SearchBar';
import { useDebounce } from '../../../hooks/useDebounce';
import useConnections from '../hooks/useConnections';
import ConnectionCard from '../components/ConnectionCard';
import ConnectionEmptyState from '../components/ConnectionEmptyState';
import QuickProfileCard from '../components/QuickProfileCard';

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TAB_DEFS = [
  { id: 'accepted', label: 'Bạn bè đã kết nối' },
  { id: 'pending', label: 'Lời mời kết nối' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Accent-insensitive Vietnamese normalisation for client-side search */
const normalise = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();

const matchesQuery = (conn, q) =>
  !q || [conn.childName, conn.parentName, conn.location].some((f) => normalise(f).includes(q));

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * ConnectionsPage — Main view for the /connections route.
 *
 * Data-flow (per FRONTEND_AI_GUIDE.md):
 *   Page → useConnections (hook) → connectionApi → apiClient → BE
 *
 * UI primitives used from src/components/:
 *   - Tabs (pill variant)
 *   - SearchBar
 *
 * Module components:
 *   - ConnectionCard, ConnectionEmptyState, QuickProfileCard
 */
const ConnectionsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { pending, accepted, isLoading, fetchError, accept, decline, remove } = useConnections();

  // Debounce search to avoid re-filtering every keystroke
  const debouncedQuery = useDebounce(normalise(searchQuery), 250);

  // Active list depends on tab
  const list = activeTab === 'pending' ? pending : accepted;

  // Client-side filtering
  const filtered = useMemo(
    () => list.filter((c) => matchesQuery(c, debouncedQuery)),
    [list, debouncedQuery]
  );

  // Quick profile sidebar
  const selectedConnection = useMemo(
    () => [...pending, ...accepted].find((c) => c.id === selectedId) ?? null,
    [pending, accepted, selectedId]
  );

  // Tabs with live counts
  const tabs = TAB_DEFS.map((t) => ({
    ...t,
    count: t.id === 'pending' ? pending.length : accepted.length,
  }));

  return (
    <div className="mx-auto px-margin py-space-md min-h-screen pb-20">
      {/* ── Pill Tabs ── */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pill"
        className="mb-space-md"
      />

      {/* ── Search bar ── */}
      <div className="mb-space-lg">
        <SearchBar
          id="connections-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm theo tên bé, phụ huynh hoặc địa chỉ..."
          className="max-w-md"
        />
      </div>

      {/* ── Error banner (fetch failure) ── */}
      {fetchError && !isLoading && (
        <div
          role="alert"
          className="mb-space-md px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm"
        >
          {fetchError}
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* ── Left: list ── */}
        <div className="lg:col-span-8 flex flex-col gap-space-sm">
          {isLoading ? (
            <div className="py-space-xl text-center text-text-muted text-sm">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <ConnectionEmptyState
              type={activeTab}
              isSearching={!!debouncedQuery && list.length > 0}
              onAction={() => navigate('/discovery')}
            />
          ) : (
            filtered.map((conn) => (
              <div
                key={conn.id}
                className="cursor-pointer"
                onClick={() => setSelectedId(conn.id)}
              >
                <ConnectionCard
                  connection={conn}
                  type={activeTab}
                  onAccept={accept}
                  onDecline={decline}
                  onRemove={remove}
                />
              </div>
            ))
          )}
        </div>

        {/* ── Right: Quick Profile ── */}
        <div className="lg:col-span-4 sticky top-24">
          <QuickProfileCard connection={selectedConnection} />
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
