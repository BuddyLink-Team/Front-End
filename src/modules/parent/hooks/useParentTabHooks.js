import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parentInfoSchema, changePasswordSchema } from '../validation/parentValidation';

/**
 * Hook for Profile Header Card (avatar file upload trigger)
 */
export const useProfileAvatar = ({ onAvatarUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarUpload?.(file);
      e.target.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    handleFileChange,
    triggerUpload,
  };
};

/**
 * Hook for Profile Info Tab form management
 */
export const useProfileInfo = ({ profile, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(parentInfoSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      bio: profile?.bio || '',
      city: profile?.location?.city || '',
      area: profile?.location?.area || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        city: profile.location?.city || '',
        area: profile.location?.area || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    // The form has no address field: always rebuild it from the area and city just entered,
    // otherwise the previously saved address would be sent back unchanged
    const resolvedAddress = [data.area?.trim(), data.city?.trim()].filter(Boolean).join(', ');

    return onUpdate?.({
      fullName: data.fullName,
      bio: data.bio,
      location: {
        city: data.city,
        area: data.area,
        address: resolvedAddress,
      },
    });
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
  };
};

/**
 * Hook for Playdate Preferences Tab state management
 */
export const useProfilePreferences = ({ profile, onUpdate }) => {
  const currentPrefs = profile?.preferences || {};

  const [preferredDays, setPreferredDays] = useState(
    currentPrefs.preferredPlaydateDays || []
  );
  const [preferredSlots, setPreferredSlots] = useState(
    currentPrefs.preferredTimeSlots || []
  );
  const [preferredLocs, setPreferredLocs] = useState(
    currentPrefs.preferredLocations || []
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState(
    currentPrefs.maxDistanceKm ?? 10
  );
  const [ageMin, setAgeMin] = useState(
    currentPrefs.preferredAgeRange?.min ?? 2
  );
  const [ageMax, setAgeMax] = useState(
    currentPrefs.preferredAgeRange?.max ?? 8
  );

  useEffect(() => {
    if (profile?.preferences) {
      setPreferredDays(profile.preferences.preferredPlaydateDays || []);
      setPreferredSlots(profile.preferences.preferredTimeSlots || []);
      setPreferredLocs(profile.preferences.preferredLocations || []);
      setMaxDistanceKm(profile.preferences.maxDistanceKm ?? 10);
      setAgeMin(profile.preferences.preferredAgeRange?.min ?? 2);
      setAgeMax(profile.preferences.preferredAgeRange?.max ?? 8);
    }
  }, [profile]);

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleToggleDay = (day) => toggleItem(preferredDays, setPreferredDays, day);
  const handleToggleSlot = (slot) => toggleItem(preferredSlots, setPreferredSlots, slot);
  const handleToggleLoc = (loc) => toggleItem(preferredLocs, setPreferredLocs, loc);

  const handleSave = async () => {
    return onUpdate?.({
      preferences: {
        preferredPlaydateDays: preferredDays,
        preferredTimeSlots: preferredSlots,
        preferredLocations: preferredLocs,
        maxDistanceKm: Number(maxDistanceKm) || 10,
        preferredAgeRange: {
          min: Number(ageMin) || 1,
          max: Number(ageMax) || 12,
        },
      },
    });
  };

  return {
    preferredDays,
    preferredSlots,
    preferredLocs,
    maxDistanceKm,
    setMaxDistanceKm,
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
    handleToggleDay,
    handleToggleSlot,
    handleToggleLoc,
    handleSave,
  };
};

/**
 * Hook for Profile Security & Privacy Tab
 */
export const useProfileSecurity = ({ profile, onUpdate, onChangePassword }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const currentPrivacy = profile?.privacySettings || {};

  const [isProfileHidden, setIsProfileHidden] = useState(
    Boolean(currentPrivacy.isProfileHidden)
  );
  const [connectionPrivacy, setConnectionPrivacy] = useState(
    currentPrivacy.connectionPrivacy || 'everyone'
  );

  useEffect(() => {
    if (profile?.privacySettings) {
      setIsProfileHidden(Boolean(profile.privacySettings.isProfileHidden));
      setConnectionPrivacy(profile.privacySettings.connectionPrivacy || 'everyone');
    }
  }, [profile]);

  const handleSavePrivacy = async () => {
    return onUpdate?.({
      privacySettings: {
        isProfileHidden,
        connectionPrivacy,
      },
    });
  };

  const handleChangePasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    const res = await onChangePassword?.(data);
    setIsChangingPassword(false);
    return res;
  };

  return {
    isProfileHidden,
    setIsProfileHidden,
    connectionPrivacy,
    setConnectionPrivacy,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    isChangingPassword,
    handleSavePrivacy,
    handleChangePasswordSubmit,
  };
};

/**
 * Hook for Change Password Modal Form
 */
export const useChangePassword = ({ onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleFormSubmit = async (data) => {
    const res = await onSubmit?.(data);
    if (res?.success) {
      reset();
      onClose?.();
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(handleFormSubmit),
    errors,
    reset,
  };
};
