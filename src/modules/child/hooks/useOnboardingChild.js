import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import childApi from '../api/childApi';
import {
  setChildren,
  addChild,
  setLoading,
  setError,
  updateOnboardingDraft,
  resetOnboardingDraft,
} from '../redux/childSlice';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { CHILD_ERROR_MESSAGES } from '../constants/childConstants';

export const useOnboardingChild = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { onboardingDraft, isLoading, error } = useSelector((state) => state.child);

  // Stepper state: 1: Parent Criteria, 2: Create Child Profile, 3: Success Completion
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // Form has 2 active input steps before completion screen
  const [isCompleted, setIsCompleted] = useState(false);

  // Local form state initialized from draft
  const [formData, setFormData] = useState({
    // Parent Preferences (Step 1)
    preferredPlaydateDays: onboardingDraft.preferences.preferredPlaydateDays || ['weekend'],
    preferredTimeSlots: onboardingDraft.preferences.preferredTimeSlots || ['morning', 'afternoon'],
    preferredLocations: onboardingDraft.preferences.preferredLocations || ['park', 'kids_cafe'],
    maxDistanceKm: onboardingDraft.preferences.maxDistanceKm || 10,
    ageMin: onboardingDraft.preferences.preferredAgeRange?.min || 2,
    ageMax: onboardingDraft.preferences.preferredAgeRange?.max || 8,
    city: onboardingDraft.location.city || 'Hồ Chí Minh',
    area: onboardingDraft.location.area || 'Quận 1',
    address: onboardingDraft.location.address || '',

    // Child Details & Interests (Step 2)
    displayName: onboardingDraft.child.displayName || '',
    dateOfBirth: onboardingDraft.child.dateOfBirth || '',
    gender: onboardingDraft.child.gender || 'boy',
    interests: onboardingDraft.child.interests || [],
    favoriteActivities: onboardingDraft.child.favoriteActivities || [],
    personality: onboardingDraft.child.personality || [],
  });

  const [formErrors, setFormErrors] = useState({});

  // Field updater
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Multi-select toggle helper (for interests, activities, personality, etc.)
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

  // Step 1 validation: Parent Criteria & Location
  const validateStep1 = () => {
    const errors = {};
    if (!formData.preferredPlaydateDays || formData.preferredPlaydateDays.length === 0) {
      errors.preferredPlaydateDays = 'Vui lòng chọn ngày rảnh trong tuần';
    }
    if (!formData.preferredTimeSlots || formData.preferredTimeSlots.length === 0) {
      errors.preferredTimeSlots = 'Vui lòng chọn khung giờ hẹn chơi';
    }
    if (!formData.preferredLocations || formData.preferredLocations.length === 0) {
      errors.preferredLocations = 'Vui lòng chọn địa điểm ưa thích';
    }
    if (!formData.city) {
      errors.city = 'Vui lòng nhập Tỉnh / Thành phố';
    }
    if (!formData.area) {
      errors.area = 'Vui lòng nhập Phường / Xã';
    }
    if (formData.ageMin > formData.ageMax) {
      errors.ageMax = 'Độ tuổi tối đa phải lớn hơn hoặc bằng độ tuổi tối thiểu';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 validation: Child Basic Info & Interests
  const validateStep2 = () => {
    const errors = {};
    if (!formData.displayName || formData.displayName.trim().length < 2) {
      errors.displayName = 'Vui lòng nhập tên bé (ít nhất 2 ký tự)';
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Vui lòng chọn ngày sinh của bé';
    }
    if (!formData.gender) {
      errors.gender = 'Vui lòng chọn giới tính';
    }
    if (!formData.interests || formData.interests.length === 0) {
      errors.interests = 'Vui lòng chọn ít nhất 1 sở thích cho bé';
    }
    if (!formData.favoriteActivities || formData.favoriteActivities.length === 0) {
      errors.favoriteActivities = 'Vui lòng chọn ít nhất 1 hoạt động ưa thích';
    }
    if (!formData.personality || formData.personality.length === 0) {
      errors.personality = 'Vui lòng chọn ít nhất 1 nét tính cách nổi bật';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Stepper navigation
  const nextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Final submission of both Parent Preferences and Child Profile
  const submitOnboarding = async () => {
    if (!validateStep2()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const resolvedAddress = formData.address?.trim()
        ? formData.address.trim()
        : [formData.area, formData.city].filter(Boolean).join(', ');

      // 1. Update Parent Criteria & Preferences
      const preferencesPayload = {
        location: {
          address: resolvedAddress,
          area: formData.area,
          city: formData.city,
        },
        preferences: {
          preferredPlaydateDays: formData.preferredPlaydateDays,
          preferredTimeSlots: formData.preferredTimeSlots,
          preferredLocations: formData.preferredLocations,
          maxDistanceKm: Number(formData.maxDistanceKm) || 10,
          preferredAgeRange: {
            min: Number(formData.ageMin) || 2,
            max: Number(formData.ageMax) || 8,
          },
          languages: ['Vietnamese'],
        },
      };

      await childApi.updateOnboardingPreferences(preferencesPayload);

      // 2. Create Child profile
      const childPayload = {
        displayName: formData.displayName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        interests: formData.interests,
        favoriteActivities: formData.favoriteActivities,
        personality: formData.personality,
      };

      const childRes = await childApi.createChild(childPayload);
      const createdChild = childRes.data || childRes;
      dispatch(addChild(createdChild));

      dispatch(resetOnboardingDraft());
      setIsCompleted(true);
      setCurrentStep(3); // Move to completion step
      toast.success('Thiết lập hồ sơ bé & tiêu chí ghép bạn thành công! 🎉');
      return { success: true };
    } catch (err) {
      const msg = getApiErrorMsg(
        CHILD_ERROR_MESSAGES,
        err,
        'Không thể lưu hồ sơ và tiêu chí. Vui lòng thử lại!',
      );
      dispatch(setError(msg));
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const completeAndExplore = () => {
    navigate('/discovery', { replace: true });
  };

  return {
    user,
    currentStep,
    totalSteps,
    isCompleted,
    formData,
    formErrors,
    isLoading,
    error,
    updateField,
    toggleArrayItem,
    nextStep,
    prevStep,
    submitOnboarding,
    completeAndExplore,
  };
};

export default useOnboardingChild;

