import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { fetchChildById, createChild, updateChild, deleteChild, setError } from '../redux/childSlice';
import { childSchema, getFieldErrors } from '../validation/onboardingValidation';
import { getApiErrorMsg, getErrorCode } from '../../../utils/errorUtils';
import { CHILD_ERROR_CODES, CHILD_ERROR_MESSAGES } from '../constants/childConstants';

const EMPTY_FORM = {
  displayName: '',
  dateOfBirth: '',
  gender: 'boy',
  interests: [],
  favoriteActivities: [],
  personality: [],
};

const toFormData = (child) => ({
  displayName: child.displayName || '',
  dateOfBirth: child.dateOfBirth ? child.dateOfBirth.split('T')[0] : '',
  gender: child.gender || 'boy',
  interests: child.interests || [],
  favoriteActivities: child.favoriteActivities || [],
  personality: child.personality || [],
});

/**
 * Create / edit child profile form. API calls live in the child slice thunks.
 */
export const useChildForm = () => {
  const toast = useToast();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { children, isLoading } = useSelector((state) => state.child);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isFetchingChild, setIsFetchingChild] = useState(isEditMode);
  const [isDeleting, setIsDeleting] = useState(false);

  // If edit mode, load existing child info (either from the store or the API)
  useEffect(() => {
    if (!isEditMode) return;

    const existingChild = children.find((c) => (c.id || c._id) === id);
    if (existingChild) {
      setFormData(toFormData(existingChild));
      setIsFetchingChild(false);
      return;
    }

    const loadChild = async () => {
      setIsFetchingChild(true);
      try {
        const child = await dispatch(fetchChildById(id)).unwrap();
        setFormData(toFormData(child));
      } catch {
        toast.error('Không tìm thấy thông tin hồ sơ bé');
        navigate('/children', { replace: true });
      } finally {
        setIsFetchingChild(false);
      }
    };

    loadChild();
  }, [id, isEditMode, children, navigate, toast, dispatch]);

  // Update single field
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Multi-select toggle helper (interests, activities, personality)
  const toggleArrayItem = useCallback((field, item) => {
    setFormData((prev) => {
      const currentList = prev[field] || [];
      const updatedList = currentList.includes(item)
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];
      return { ...prev, [field]: updatedList };
    });
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Validate using Zod schema
  const validate = () => {
    const errors = getFieldErrors(childSchema, formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit create or edit
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    const payload = {
      displayName: formData.displayName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      interests: formData.interests,
      favoriteActivities: formData.favoriteActivities,
      personality: formData.personality,
    };

    try {
      if (isEditMode) {
        await dispatch(updateChild({ id, payload })).unwrap();
        toast.success('Cập nhật hồ sơ bé thành công! 🎉');
      } else {
        await dispatch(createChild(payload)).unwrap();
        toast.success('Tạo hồ sơ bé mới thành công! 🎉');
      }

      navigate('/children');
    } catch (err) {
      // The global PaywallModal is opened by apiClient for quota errors
      if (getErrorCode(err) === CHILD_ERROR_CODES.CHILD_QUOTA_EXCEEDED) return;

      const fallback = isEditMode ? 'Cập nhật hồ sơ bé thất bại' : 'Tạo hồ sơ bé thất bại';
      const msg = getApiErrorMsg(CHILD_ERROR_MESSAGES, err, fallback);
      dispatch(setError(msg));
      toast.error(msg);
    }
  };

  // Delete child (when in edit mode)
  const handleDeleteChild = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteChild(id)).unwrap();
      toast.success('Đã xóa hồ sơ bé thành công!');
      navigate('/children');
    } catch (err) {
      toast.error(
        getApiErrorMsg(CHILD_ERROR_MESSAGES, err, 'Xóa hồ sơ bé không thành công. Vui lòng thử lại!'),
      );
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
    updateField,
    toggleArrayItem,
    handleSubmit,
    handleDeleteChild,
    onCancel: () => navigate('/children'),
  };
};

export default useChildForm;
