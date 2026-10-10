import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { PARENT_ERROR_MESSAGES, MAX_AVATAR_SIZE_BYTES } from '../constants/parentConstants';
import {
  fetchMyParentProfile,
  saveParentProfile,
  uploadParentAvatar,
  changeAccountPassword,
  setParentError,
} from '../redux/parentSlice';
import { fetchMyChildren } from '../../child/redux/childSlice';

/**
 * Parent profile screen logic. API calls live in the parent/child slice thunks; the auth slice
 * syncs the session copy (Navbar, guards, rotated tokens) from the same thunks.
 */
export const useParentProfile = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const {
    profile,
    isLoading,
    isUpdating,
    isUploadingAvatar,
    error: errorMessage,
  } = useSelector((state) => state.parent);
  const children = useSelector((state) => state.child.children);

  const toErrorMessage = useCallback(
    (error, fallback) => getApiErrorMsg(PARENT_ERROR_MESSAGES, error, fallback),
    [],
  );

  // Fetch full parent profile & children
  const fetchProfileData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchMyParentProfile()).unwrap(),
        // The children count is secondary on this screen: a failure here must not block the profile
        dispatch(fetchMyChildren()),
      ]);
    } catch (error) {
      const msg = toErrorMessage(error, 'Không thể tải thông tin hồ sơ phụ huynh. Vui lòng tải lại trang!');
      dispatch(setParentError(msg));
      toast.error(msg);
    }
  }, [dispatch, toast, toErrorMessage]);

  useEffect(() => {
    // Only fetch if profile is not already in Redux
    if (!profile) {
      fetchProfileData();
    }
  }, [fetchProfileData, profile]);

  // Update Profile details
  const updateProfile = async (updateData) => {
    try {
      const updated = await dispatch(saveParentProfile(updateData)).unwrap();
      toast.success('Cập nhật thông tin hồ sơ thành công!');
      return { success: true, data: updated };
    } catch (error) {
      const msg = toErrorMessage(error, 'Cập nhật thông tin thất bại. Vui lòng kiểm tra lại!');
      dispatch(setParentError(msg));
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Upload Avatar file to Cloud Storage
  const uploadAvatar = async (file) => {
    if (!file) return { success: false };

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error('Kích thước ảnh tối đa 5MB. Vui lòng chọn ảnh nhỏ hơn!');
      return { success: false };
    }

    try {
      const result = await dispatch(uploadParentAvatar(file)).unwrap();
      toast.success('Tải ảnh đại diện lên thành công! 🎉');
      return { success: true, avatarUrl: result?.avatarUrl };
    } catch (error) {
      const msg = toErrorMessage(error, 'Tải ảnh đại diện thất bại. Vui lòng thử lại!');
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Change account password (other sessions are revoked; this device receives new tokens)
  const changePassword = async ({ currentPassword, newPassword, confirmNewPassword }) => {
    try {
      await dispatch(
        changeAccountPassword({ currentPassword, newPassword, confirmNewPassword }),
      ).unwrap();
      toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      return { success: true };
    } catch (error) {
      const msg = toErrorMessage(error, 'Đổi mật khẩu không thành công. Vui lòng kiểm tra lại!');
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    profile,
    children,
    isLoading,
    isUpdating,
    isUploadingAvatar,
    errorMessage,
    fetchProfileData,
    updateProfile,
    uploadAvatar,
    changePassword,
  };
};

export default useParentProfile;
