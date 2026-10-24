import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { markNotificationAsRead } from '../redux/notificationSlice';
import { openDirectConversation } from '../../chat/redux/chatSlice';
import { getNotificationMeta } from '../constants/notification.constants';

/**
 * Click on a notification (history page, bell dropdown, realtime toast):
 * mark it read, then open its target page.
 * @returns {(notification: Object) => Promise<void>}
 */
export const useOpenNotification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useCallback(
    async (notification) => {
      if (!notification) return;
      if (!notification.isRead) {
        dispatch(markNotificationAsRead(notification.id));
      }

      const meta = getNotificationMeta(notification.type);
      const senderId = notification.data?.senderId;
      if (meta.opensDirectChat && senderId) {
        try {
          // Same flow as "Nhắn tin" on /connections: open (or create) the 1-1 conversation
          const conversation = await dispatch(openDirectConversation(senderId)).unwrap();
          navigate(`/chat/${conversation.id}`);
          return;
        } catch {
          // Fall back to the conversation list below
        }
      }

      const targetPath = meta.getActionPath(notification.data);
      if (targetPath) {
        navigate(targetPath);
      }
    },
    [dispatch, navigate]
  );
};

export default useOpenNotification;
