import { useSelector } from 'react-redux';

export const useUnreadNotificationCount = () =>
  useSelector((state) => state.notification.unreadCount);

export default useUnreadNotificationCount;
