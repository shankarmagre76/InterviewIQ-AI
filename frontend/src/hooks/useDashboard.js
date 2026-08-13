import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';
import { parseApiError } from '../utils/helpers';

/**
 * Custom React Hook for Dashboard Data Management
 * 
 * Manages fetching, state lifecycle (loading, data, error), and refetching
 * for all Dashboard API endpoints in InterviewIQ AI.
 * 
 * Supports view types:
 * - 'main' / 'overview' -> getDashboard()
 * - 'resume' -> getResumeAnalytics()
 * - 'interviews' / 'interview' -> getInterviewAnalytics()
 * - 'applications' / 'application' -> getApplicationAnalytics()
 * - 'career-readiness' / 'careerReadiness' -> getCareerReadiness()
 * - 'activity' -> getActivity()
 *
 * @param {string} [viewType='main'] - Target dashboard analytics section
 * @param {Object} [params={}] - Query parameters for endpoint (e.g. { page, limit, type })
 * @param {Object} [options={}] - Hook options (e.g. { autoFetch: true })
 * @returns {{ data: any, loading: boolean, error: string|null, refresh: Function, fetchData: Function }}
 */
export const useDashboard = (viewType = 'main', params = {}, options = {}) => {
  const { autoFetch = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  // Serialized params ref to avoid infinite re-render fetch loops
  const paramsRef = useRef(params);
  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [serializedParams]);

  /**
   * Primary fetcher function to call the corresponding dashboardService API endpoint
   */
  const fetchData = useCallback(
    async (overrideParams = null) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = overrideParams || paramsRef.current;
        let response;

        switch (viewType) {
          case 'resume':
            response = await dashboardService.getResumeAnalytics(queryParams);
            break;
          case 'interviews':
          case 'interview':
            response = await dashboardService.getInterviewAnalytics(queryParams);
            break;
          case 'applications':
          case 'application':
            response = await dashboardService.getApplicationAnalytics(queryParams);
            break;
          case 'career-readiness':
          case 'careerReadiness':
            response = await dashboardService.getCareerReadiness(queryParams);
            break;
          case 'activity':
            response = await dashboardService.getActivity(queryParams);
            break;
          case 'main':
          case 'overview':
          default:
            response = await dashboardService.getDashboard(queryParams);
            break;
        }

        // Unwrap standard Express ApiResponse format: { statusCode, data, message, success }
        const payload = response?.data !== undefined ? response.data : response;
        
        // Light normalization for defensive UI fallback rendering
        const normalizedData = normalizeDashboardData(viewType, payload);
        setData(normalizedData);
        return normalizedData;
      } catch (err) {
        const errorMessage = parseApiError(err) || 'Failed to retrieve dashboard analytics';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [viewType, serializedParams]
  );

  /**
   * Manual refresh trigger to force re-fetch from backend
   */
  const refresh = useCallback(
    (overrideParams = null) => {
      return fetchData(overrideParams);
    },
    [fetchData]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refresh,
    fetchData,
  };
};

/**
 * Helper to ensure safe fallback structures for charts and UI elements
 */
function normalizeDashboardData(viewType, payload) {
  if (!payload) return payload;

  switch (viewType) {
    case 'main':
    case 'overview':
      return {
        ...payload,
        profile: payload.profile || { completionPercentage: 0, targetRole: 'Candidate', skillsCount: 0 },
        resume: payload.resume || { hasResume: false, latestATSScore: 0, previousATSScore: 0, scoreImprovement: 0, analysisCount: 0 },
        interviews: payload.interviews || { total: 0, completed: 0, averageScore: 0, bestScore: 0, latestScore: 0 },
        applications: payload.applications || { total: 0, applied: 0, underReview: 0, interview: 0, offered: 0, rejected: 0, withdrawn: 0, interviewConversionRate: 0, offerConversionRate: 0 },
        savedJobs: payload.savedJobs || { total: 0 },
        careerReadiness: payload.careerReadiness || { overallScore: 0, resumeScore: 0, interviewScore: 0, profileScore: 0, applicationScore: 0, recommendations: [] },
        recentActivity: payload.recentActivity || [],
      };
    case 'resume':
      return {
        ...payload,
        scoreHistory: payload.scoreHistory || [],
        missingSkills: payload.missingSkills || [],
        recommendedSkills: payload.recommendedSkills || [],
      };
    case 'interviews':
    case 'interview':
      return {
        ...payload,
        scoreHistory: payload.scoreHistory || [],
        recentInterviews: payload.recentInterviews || [],
      };
    case 'applications':
    case 'application':
      return {
        ...payload,
        statusDistribution: payload.statusDistribution || [],
        recruitmentFunnel: payload.recruitmentFunnel || [],
        applicationTrend: payload.applicationTrend || [],
        topCompanies: payload.topCompanies || [],
        byLocation: payload.byLocation || [],
        recentApplications: payload.recentApplications || [],
      };
    case 'activity':
      return {
        ...payload,
        activities: payload.activities || [],
        pagination: payload.pagination || { total: 0, page: 1, limit: 10, pages: 1 },
      };
    case 'career-readiness':
    case 'careerReadiness':
      return {
        ...payload,
        recommendations: payload.recommendations || [],
        actionPlan: payload.actionPlan || [],
      };
    default:
      return payload;
  }
}

export default useDashboard;
