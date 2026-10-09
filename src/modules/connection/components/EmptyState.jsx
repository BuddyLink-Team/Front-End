import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const MESSAGES = {
  pending: {
    title: 'Chưa có lời mời kết nối nào',
    desc: 'Khi có phụ huynh khác gửi lời mời kết nối, chúng sẽ xuất hiện ở đây để bạn có thể xem xét.',
  },
  accepted: {
    title: 'Bạn chưa kết nối với ai',
    desc: 'Hãy khám phá cộng đồng và gửi lời mời kết nối để tìm những người bạn chơi tuyệt vời cho bé nhé!',
  },
  search: {
    title: 'Không tìm thấy kết quả phù hợp',
    desc: 'Hãy thử tìm bằng tên bé, tên phụ huynh hoặc khu vực khác.',
  },
};

const EmptyState = ({ type = 'accepted', isSearching = false }) => {
  const { title, desc } = isSearching ? MESSAGES.search : MESSAGES[type];
  return (
    <div className="flex flex-col items-center justify-center p-space-xl bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(45,55,72,0.02)] text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-space-md">
        <Users className="w-8 h-8" />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{desc}</p>
      {type === 'accepted' && !isSearching && (
        <Link
          to="/discovery"
          className="mt-space-md px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:scale-[1.02] transition-transform shadow-[0_2px_8px_rgba(123,174,127,0.3)]"
        >
          Khám phá ngay
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
