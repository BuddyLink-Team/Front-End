import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchChildPublicProfile, clearChildDetail } from '../redux/discoverySlice';
import {
  DAY_LABELS,
  DEFAULT_CHILD_AVATARS,
  DISCOVERY_ERROR_MESSAGES,
  GENDER_LABELS,
  LOCATION_LABELS,
  TIME_LABELS,
} from '../constants/discoveryConstants';
import { CHILD_GENDERS } from '../../child/constants/childConstants';

const PROFILE_ERROR_FALLBACK = 'Không thể tải thông tin hồ sơ bé';

const translate = (labels, values = []) => values.map((v) => labels[v] || v);

/**
 * Fetch a child's public profile (via the discovery slice) when childId is set,
 * and shape it for the detail modal.
 *
 * @param {string|null} childId - The ID of the child to fetch
 * @returns {{ profile: Object|null, view: Object|null, isLoading: boolean, error: string|null }}
 */
export const useChildProfile = (childId) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { profile, isLoading, error } = useSelector((state) => state.discovery.childDetail);

  useEffect(() => {
    if (!childId) {
      dispatch(clearChildDetail());
      return;
    }
    dispatch(fetchChildPublicProfile(childId))
      .unwrap()
      .catch((err) => toast.error(getApiErrorMsg(DISCOVERY_ERROR_MESSAGES, err, PROFILE_ERROR_FALLBACK)));
  }, [childId, dispatch, toast]);

  const view = useMemo(() => {
    if (!profile) return null;
    const preferences = profile.parent?.preferences || {};
    return {
      genderLabel: GENDER_LABELS[profile.gender] || GENDER_LABELS[CHILD_GENDERS.OTHER],
      avatarSrc: DEFAULT_CHILD_AVATARS[profile.gender] || DEFAULT_CHILD_AVATARS.DEFAULT,
      interests: [...(profile.interests || []), ...(profile.favoriteActivities || [])],
      preferredLocations: translate(LOCATION_LABELS, preferences.preferredLocations),
      preferredPlaydateDays: translate(DAY_LABELS, preferences.preferredPlaydateDays),
      preferredTimeSlots: translate(TIME_LABELS, preferences.preferredTimeSlots),
    };
  }, [profile]);

  return {
    profile,
    view,
    isLoading,
    error: error ? getApiErrorMsg(DISCOVERY_ERROR_MESSAGES, error, PROFILE_ERROR_FALLBACK) : null,
  };
};

export default useChildProfile;
