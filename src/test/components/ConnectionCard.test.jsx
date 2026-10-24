import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../utils/testUtils';
import ConnectionCard from '../../modules/connection/components/ConnectionCard';
import { CONNECTION_LISTS } from '../../modules/connection/constants/connection.constants';

const baseConnection = {
  id: 'conn-1',
  parentName: 'Trần Thị Mai',
  childName: 'Bông',
  childAge: 5,
  isVerified: true,
  interests: [],
  area: 'Hải Châu',
  avatarUrl: null,
};

const PAIR = {
  key: 'k1_k2',
  myChildId: 'k1',
  myChildName: 'Bin',
  partnerChildId: 'k2',
  partnerChildName: 'Bông',
  partnerChildAge: 5,
  source: 'discovery',
  matchScore: 82,
};

const renderCard = (connection, type) =>
  renderWithProviders(
    <ConnectionCard
      connection={connection}
      type={type}
      onSelect={vi.fn()}
      onAction={vi.fn()}
      onMessage={vi.fn()}
    />
  );

describe('ConnectionCard child pairs', () => {
  it('shows the matched children of a connected family', () => {
    renderCard({ ...baseConnection, childPairs: [PAIR] }, CONNECTION_LISTS.ACCEPTED);
    expect(screen.getByRole('listitem')).toHaveTextContent('Bông (5 tuổi) ↔ Bin');
  });

  it('reads an incoming request from the requester side', () => {
    renderCard({ ...baseConnection, childPairs: [PAIR] }, CONNECTION_LISTS.INCOMING);
    expect(screen.getByRole('listitem')).toHaveTextContent('Muốn kết nối: Bông (5 tuổi) ↔ bé Bin của bạn');
  });

  it('keeps the single child display for a connection without pairs', () => {
    renderCard({ ...baseConnection, childPairs: [] }, CONNECTION_LISTS.ACCEPTED);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.getByText('Bông (5 tuổi)')).toBeInTheDocument();
  });
});
