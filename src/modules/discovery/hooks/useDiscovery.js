import { useState, useEffect, useCallback } from 'react';
import { getDiscoveryProfiles } from '../api/discoveryApi';

export const useDiscovery = (filters) => {
  const [profiles, setProfiles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const filterString = JSON.stringify(filters || {});

  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const parsedFilters = filterString ? JSON.parse(filterString) : {};
      const response = await getDiscoveryProfiles(parsedFilters);
      setProfiles(response.data?.profiles || []);
      setMeta(response.data?.meta || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi tải danh sách khám phá');
    } finally {
      setIsLoading(false);
    }
  }, [filterString]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const removeTopProfile = useCallback(() => {
    setProfiles((prev) => prev.slice(1));
  }, []);

  return {
    profiles,
    meta,
    isLoading,
    error,
    refetch: fetchProfiles,
    removeTopProfile
  };
};
