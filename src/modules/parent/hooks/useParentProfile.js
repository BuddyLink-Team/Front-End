import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { parentApi } from '../api/parentApi';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { PARENT_ERROR_MESSAGES } from '../constants/parentConstants';
import {
  setParentProfile,
  updateParentProfile,
  updateParentAvatar,
  setParentChildren,
  setParentLoading,
  setParentUpdating,
  setParentUploadingAvatar,
  setParentError,
} from '../redux/parentSlice';

export const useParentProfile = () => {
  const dispatch = useDispatch();
  const {
    profile,
    children,
    isLoading,
    isUpdating,
    isUploadingAvatar,
    error: errorMessage,
  } = useSelector((state) => state.parent);

  // Fetch full parent profile & children
  const fetchProfileData = useCallback(async () => {
    dispatch(setParentLoading(true));
    dispatch(setParentError(null));
    try {
      const [profileRes, childrenRes] = await Promise.all([
        parentApi.getMyProfile(),
        parentApi.getMyChildren().catch(() => ({ data: [] })),
      ]);

      const profileData = profileRes.data || profileRes;
      const childrenData = childrenRes.data || childrenRes || [];

      dispatch(setParentProfile(profileData));
      dispatch(setParentChildren(Array.isArray(childrenData) ? childrenData : []));
    } catch (error) {
      const msg = getApiErrorMsg(
        PARENT_ERROR_MESSAGES,
        error,
        'Không thể tải thông tin hồ sơ phụ huynh. Vui lòng tải lại trang!',
      );
      dispatch(setParentError(msg));
      toast.error(msg);
    } finally {
      dispatch(setParentLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    // Only fetch if profile is not already in Redux
    if (!profile) {
      fetchProfileData();
    }
  }, [fetchProfileData, profile]);

  // Update Profile details
  const updateProfile = async (updateData) => {
    dispatch(setParentUpdating(true));
    dispatch(setParentError(null));
    try {
      const res = await parentApi.updateProfile(updateData);
      const updated = res.data || res;
      dispatch(updateParentProfile(updated));
      toast.success('Cập nhật thông tin hồ sơ thành công!');
      return { success: true, data: updated };
    } catch (error) {
      const msg = getApiErrorMsg(
        PARENT_ERROR_MESSAGES,
        error,
        'Cập nhật thông tin thất bại. Vui lòng kiểm tra lại!',
      );
      dispatch(setParentError(msg));
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      dispatch(setParentUpdating(false));
    }
  };

  // Upload Avatar file directly to Cloudinary
  const uploadAvatar = async (file) => {
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB. Vui lòng chọn ảnh nhỏ hơn!');
      return { success: false };
    }

    const formData = new FormData();
    formData.append('avatar', file);

    dispatch(setParentUploadingAvatar(true));
    try {
      const res = await parentApi.uploadAvatar(formData);
      const updatedUser = res.data || res;
      const newAvatarUrl = updatedUser.avatarUrl || updatedUser.parent?.avatarUrl;

      dispatch(updateParentAvatar(newAvatarUrl));
      toast.success('Tải ảnh đại diện lên thành công! 🎉');
      return { success: true, avatarUrl: newAvatarUrl };
    } catch (error) {
      const msg = getApiErrorMsg(
        PARENT_ERROR_MESSAGES,
        error,
        'Tải ảnh đại diện thất bại. Vui lòng thử lại!',
      );
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      dispatch(setParentUploadingAvatar(false));
    }
  };

  // Change account password
  const changePassword = async ({ currentPassword, newPassword, confirmNewPassword }) => {
    try {
      await parentApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      return { success: true };
    } catch (error) {
      const msg = getApiErrorMsg(
        PARENT_ERROR_MESSAGES,
        error,
        'Đổi mật khẩu không thành công. Vui lòng kiểm tra lại!',
      );
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
