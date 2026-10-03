import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import childApi from '../api/childApi';
import {
  addChild,
  updateChildInList,
  setLoading,
  setError,
} from '../redux/childSlice';
import { childSchema } from '../validation/onboardingValidation';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { CHILD_ERROR_MESSAGES } from '../constants/childConstants';

export const useChildForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { children, isLoading } = useSelector((state) => state.child);

  const [formData, setFormData] = useState({
    displayName: '',
    dateOfBirth: '',
    gender: 'boy',
    interests: [],
    favoriteActivities: [],
    personality: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [isFetchingChild, setIsFetchingChild] = useState(isEditMode);

  // If edit mode, load existing child info (either from redux store or API)
  useEffect(() => {
    if (!isEditMode) return;

    const existingChild = children.find((c) => (c.id || c._id) === id);
    if (existingChild) {
      setFormData({
        displayName: existingChild.displayName || '',
        dateOfBirth: existingChild.dateOfBirth
          ? existingChild.dateOfBirth.split('T')[0]
          : '',
        gender: existingChild.gender || 'boy',
        interests: existingChild.interests || [],
        favoriteActivities: existingChild.favoriteActivities || [],
        personality: existingChild.personality || [],
      });
      setIsFetchingChild(false);
      return;
    }

    // Fetch from API if not in store
    const fetchChild = async () => {
      setIsFetchingChild(true);
      try {
        const res = await childApi.getChildById(id);
        const childData = res.data || res;
        setFormData({
          displayName: childData.displayName || '',
          dateOfBirth: childData.dateOfBirth
            ? childData.dateOfBirth.split('T')[0]
            : '',
          gender: childData.gender || 'boy',
          interests: childData.interests || [],
          favoriteActivities: childData.favoriteActivities || [],
          personality: childData.personality || [],
        });
      } catch (err) {
        toast.error('Không tìm thấy thông tin hồ sơ bé');
        navigate('/children', { replace: true });
      } finally {
        setIsFetchingChild(false);
      }
    };

    fetchChild();
  }, [id, isEditMode, children, navigate]);

  // Update single field
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Multi-select toggle helper (interests, activities, personality)
  const toggleArrayItem = useCallback((field, item) => {
    setFormData((prev) => {
      const currentList = prev[field] || [];
      const exists = currentList.includes(item);
      const updatedList = exists
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];
      return { ...prev, [field]: updatedList };
    });
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Validate using Zod schema
  const validate = () => {
    const result = childSchema.safeParse(formData);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((err) => {
        const fieldName = err.path[0];
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = err.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const [quotaExceededError, setQuotaExceededError] = useState(null);

  // Submit create or edit
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    setQuotaExceededError(null);

    try {
      const payload = {
        displayName: formData.displayName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        interests: formData.interests,
        favoriteActivities: formData.favoriteActivities,
        personality: formData.personality,
      };

      if (isEditMode) {
        const res = await childApi.updateChild(id, payload);
        const updatedChild = res.data || res;
        dispatch(updateChildInList(updatedChild));
        toast.success('Cập nhật hồ sơ bé thành công! 🎉');
      } else {
        const res = await childApi.createChild(payload);
        const newChild = res.data || res;
        dispatch(addChild(newChild));
        toast.success('Tạo hồ sơ bé mới thành công! 🎉');
      }

      navigate('/children');
    } catch (err) {
      const errorCode = err?.response?.data?.error?.code || err?.code;
      if (errorCode === 'CHILD_QUOTA_EXCEEDED') {
        const quotaMsg =
          err?.response?.data?.message ||
          'Bạn đã đạt giới hạn số lượng hồ sơ bé trong gói hiện tại.';
        setQuotaExceededError(quotaMsg);
      } else {
        const fallback = isEditMode
          ? 'Cập nhật hồ sơ bé thất bại'
          : 'Tạo hồ sơ bé thất bại';
        const msg = getApiErrorMsg(CHILD_ERROR_MESSAGES, err, fallback);
        dispatch(setError(msg));
        toast.error(msg);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  // Delete child (when in edit mode)
  const handleDeleteChild = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await childApi.deleteChild(id);
      dispatch(removeChildFromList(id));
      toast.success('Đã xóa hồ sơ bé thành công!');
      navigate('/children');
    } catch (err) {
      const msg = getApiErrorMsg(
        CHILD_ERROR_MESSAGES,
        err,
        'Xóa hồ sơ bé không thành công. Vui lòng thử lại!',
      );
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isEditMode,
    formData,
    formErrors,
    isLoading: isLoading || isFetchingChild,
    isDeleting,
    isFetchingChild,
    quotaExceededError,
    setQuotaExceededError,
    updateField,
    toggleArrayItem,
    handleSubmit,
    handleDeleteChild,
    onCancel: () => navigate('/children'),
  };
};

export default useChildForm;
