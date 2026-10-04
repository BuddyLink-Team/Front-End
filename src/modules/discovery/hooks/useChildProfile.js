import { useState, useEffect, useRef } from 'react';
import { getChildPublicProfile } from '../api/discoveryApi';
import { useToast } from '../../../hooks/useToast';

/**
 * Custom hook to fetch and manage a child's public profile.
 * Triggers a fetch when childId changes (and is non-null).
 *
 * @param {string|null} childId - The ID of the child to fetch
 * @returns {{ profile: Object|null, isLoading: boolean, error: string|null }}
 */
export const useChildProfile = (childId) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  useEffect(() => {
    if (!childId) {
      setProfile(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getChildPublicProfile(childId);
        if (!cancelled) {
          setProfile(response.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err?.message || 'Không thể tải thông tin hồ sơ bé';
          setError(message);
          showErrorRef.current(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [childId]);

  return { profile, isLoading, error };
};
