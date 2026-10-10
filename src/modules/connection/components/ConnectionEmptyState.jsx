import PropTypes from 'prop-types';
import { Users } from 'lucide-react';
import { EmptyState } from '../../../components/cards/EmptyState';
import { CONNECTION_LISTS } from '../constants/connection.constants';

/** Messages keyed by list */
const CONTENT = {
  [CONNECTION_LISTS.INCOMING]: {
    title: 'Chưa có lời mời kết nối nào',
    description: 'Khi có phụ huynh gửi lời mời kết nối, chúng sẽ xuất hiện ở đây để bạn xem xét.',
  },
  [CONNECTION_LISTS.OUTGOING]: {
    title: 'Bạn chưa gửi lời mời nào',
    description: 'Thích một hồ sơ ở trang Khám phá để gửi lời mời kết nối tới gia đình đó.',
  },
  [CONNECTION_LISTS.ACCEPTED]: {
    title: 'Bạn chưa kết nối với ai',
    description: 'Hãy khám phá cộng đồng và gửi lời mời kết nối để tìm bạn chơi tuyệt vời cho bé nhé!',
  },
  search: {
    title: 'Không tìm thấy kết quả phù hợp',
    description: 'Hãy thử tìm theo tên bé, tên phụ huynh hoặc khu vực khác.',
  },
};

/**
 * Shared EmptyState with the connection-specific content
 */
const ConnectionEmptyState = ({ type, isSearching = false, onDiscover }) => {
  const { title, description } = CONTENT[isSearching ? 'search' : type] ?? CONTENT[CONNECTION_LISTS.ACCEPTED];
  const canDiscover = !isSearching && type !== CONNECTION_LISTS.INCOMING;

  return (
    <EmptyState
      icon={<Users className="w-7 h-7" strokeWidth={1.5} />}
      title={title}
      description={description}
      actionLabel={canDiscover ? 'Khám phá ngay' : undefined}
      onAction={canDiscover ? onDiscover : undefined}
    />
  );
};

ConnectionEmptyState.propTypes = {
  type: PropTypes.oneOf(Object.values(CONNECTION_LISTS)).isRequired,
  isSearching: PropTypes.bool,
  onDiscover: PropTypes.func,
};

export default ConnectionEmptyState;
