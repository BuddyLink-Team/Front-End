export const PLAYDATE_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REPORTED: 'reported',
  COMPLETED: 'completed',
};

export const PLAYDATE_ERROR_MAP = {
  PARENT_NOT_FOUND: 'Không tìm thấy thông tin phụ huynh.',
  PLAYDATE_NOT_FOUND: 'Không tìm thấy thông tin buổi hẹn chơi.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  FORBIDDEN_RESCHEDULE: 'Chỉ người tổ chức hoặc phụ huynh đã đồng ý tham gia mới có quyền đề xuất đổi lịch.',
  INVALID_PLAYDATE_STATUS: 'Trạng thái buổi hẹn không hợp lệ để thao tác.',
  NOT_INVITED: 'Bạn không có trong danh sách được mời của buổi hẹn này.',
  ALREADY_RESPONDED: 'Bạn đã phản hồi lời mời tham gia này rồi.',
  ALREADY_CANCELLED: 'Buổi hẹn chơi này đã được hủy trước đó.',
  ALREADY_VOTED: 'Bạn đã bỏ phiếu hoặc đề xuất đổi lịch này đã kết thúc.',
  NOT_AUTHORIZED_TO_VOTE: 'Bạn không có quyền bỏ phiếu cho đề xuất đổi lịch này.',
  RESCHEDULE_NOT_FOUND: 'Không tìm thấy đề xuất đổi lịch đang chờ phản hồi.',
  QUOTA_EXCEEDED: 'Bạn đã đạt giới hạn tạo buổi hẹn trong tháng của gói hiện tại.',
  NOT_CONNECTED_FRIEND: 'Chỉ có thể mời các phụ huynh đã có trong danh sách bạn bè kết nối.',
  CANNOT_RESPOND_CANCELLED: 'Không thể phản hồi buổi hẹn đã bị hủy.',
  CANNOT_RESPOND_COMPLETED: 'Không thể phản hồi buổi hẹn đã hoàn thành.',
  HOST_CANNOT_RSVP: 'Người tổ chức không cần phản hồi lời mời của chính mình.',
};
