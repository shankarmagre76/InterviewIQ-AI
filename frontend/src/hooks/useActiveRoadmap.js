import { useState, useEffect, useCallback } from 'react';
import { roadmapService } from '../services/roadmapService';
import { parseApiError } from '../utils/helpers';

/**
 * Custom hook to fetch and manage candidate's active AI Learning Roadmap.
 * 
 * Reuses roadmapService.getActiveRoadmap() to avoid API logic duplication.
 */
export const useActiveRoadmap = (autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchActiveRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await roadmapService.getActiveRoadmap();
      // Handle response wrapping { statusCode, data: { roadmap, tasks, progress }, message }
      const payload = response?.data !== undefined ? response.data : response;
      setData(payload);
      return payload;
    } catch (err) {
      const errorMessage = parseApiError(err) || 'Failed to fetch active learning roadmap';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchActiveRoadmap();
    }
  }, [fetchActiveRoadmap, autoFetch]);

  return {
    roadmapData: data,
    roadmap: data?.roadmap || null,
    tasks: data?.tasks || [],
    progress: data?.progress ?? data?.roadmap?.overallProgress ?? 0,
    loading,
    error,
    refresh: fetchActiveRoadmap,
    fetchActiveRoadmap,
  };
};

export default useActiveRoadmap;
