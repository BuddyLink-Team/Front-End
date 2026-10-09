import { Users } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '../../../components/cards/EmptyState';

/** Messages keyed by tab type */
const CONTENT = {
  pending: {
    title: 'Chưa có lời mời kết nối nào',
    description:
      'Khi có phụ huynh gửi lời mời kết nối, chúng sẽ xuất hiện ở đây để bạn xem xét.',
  },
  accepted: {
    title: 'Bạn chưa kết nối với ai',
    description:
      'Hãy khám phá cộng đồng và gửi lời mời kết nối để tìm bạn chơi tuyệt vời cho bé nhé!',
  },
  search: {
    title: 'Không tìm thấy kết quả phù hợp',
    description: 'Hãy thử tìm theo tên bé, tên phụ huynh hoặc khu vực khác.',
  },
};

/**
 * ConnectionEmptyState — wraps the shared EmptyState with connection-specific content.
 * Keeps module-specific strings co-located here, not scattered in pages or shared components.
 */
const ConnectionEmptyState = ({ type = 'accepted', isSearching = false, onAction }) => {
  const key = isSearching ? 'search' : type;
  const { title, description } = CONTENT[key] ?? CONTENT.accepted;

  return (
    <SharedEmptyState
      icon={<Users className="w-7 h-7" strokeWidth={1.5} />}
      title={title}
      description={description}
      actionLabel={type === 'accepted' && !isSearching ? 'Khám phá ngay' : undefined}
      onAction={type === 'accepted' && !isSearching ? onAction : undefined}
    />
  );
};

export default ConnectionEmptyState;
