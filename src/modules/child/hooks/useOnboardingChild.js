import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { completeOnboarding, setError } from '../redux/childSlice';
import { childSchema, criteriaSchema, getFieldErrors } from '../validation/onboardingValidation';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { CHILD_ERROR_MESSAGES } from '../constants/childConstants';

export const useOnboardingChild = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error } = useSelector((state) => state.child);

  // Stepper state: 1: Parent Criteria, 2: Create Child Profile, 3: Success Completion
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // Form has 2 active input steps before completion screen
  const [isCompleted, setIsCompleted] = useState(false);

  // Matching criteria start with common defaults; location is left empty on purpose so the
  // parent enters their real area instead of submitting a pre-filled city
  const [formData, setFormData] = useState({
    // Parent Preferences (Step 1)
    preferredPlaydateDays: ['weekend'],
    preferredTimeSlots: ['morning', 'afternoon'],
    preferredLocations: ['park', 'kids_cafe'],
    maxDistanceKm: 10,
    ageMin: 2,
    ageMax: 8,
    city: '',
    area: '',
    address: '',

    // Child Details & Interests (Step 2)
    displayName: '',
    dateOfBirth: '',
    gender: 'boy',
    interests: [],
    favoriteActivities: [],
    personality: [],
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

  // Step validations use the shared Zod schemas (same rules as the full onboarding schema)
  const validateStep = (schema) => {
    const errors = getFieldErrors(schema, formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep1 = () => validateStep(criteriaSchema);
  const validateStep2 = () => validateStep(childSchema);

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

      // 2. Create Child profile
      const childPayload = {
        displayName: formData.displayName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        interests: formData.interests,
        favoriteActivities: formData.favoriteActivities,
        personality: formData.personality,
      };

      // Saves criteria then creates the child; the slice adds the child to the list
      await dispatch(
        completeOnboarding({ preferences: preferencesPayload, child: childPayload }),
      ).unwrap();

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

