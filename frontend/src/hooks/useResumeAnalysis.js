import { useState, useEffect, useCallback, useRef } from 'react';
import { resumeAnalysisService } from '../services/resumeAnalysisService.js';
import { parseApiError } from '../utils/helpers.js';
import { useToast } from './useToast.js';

const PROGRESS_STAGES = [
  'Reading PDF document & extracting text...',
  'Analyzing skills & work experience metrics...',
  'Evaluating ATS keyword density with Google Gemini AI...',
  'Calculating overall candidate match score...',
  'Structuring personalized career recommendations...',
];

/**
 * Custom React Hook for Managing AI Resume Analysis Workflow
 * Handles fetching latest reports, initiating Gemini AI analysis, progressive loading feedback, error states, and history.
 */
export const useResumeAnalysis = (options = { autoFetch: true }) => {
  const toast = useToast();

  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(options.autoFetch !== false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState(null);

  const progressIntervalRef = useRef(null);

  /**
   * Response Structure Validator
   * Ensures the AI payload contains mandatory schema fields before updating state.
   */
  const validateAnalysisResponse = (data) => {
    if (!data || typeof data !== 'object') return false;
    return typeof data.atsScore === 'number' || Boolean(data._id);
  };

  /**
   * Fetch candidate's latest active analysis report and history
   */
  const fetchLatestAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [latestRes, historyRes] = await Promise.allSettled([
        resumeAnalysisService.getLatestAnalysis(),
        resumeAnalysisService.getAnalysisHistory(),
      ]);

      if (latestRes.status === 'fulfilled' && latestRes.value?.data) {
        const payload = latestRes.value.data;
        if (validateAnalysisResponse(payload)) {
          setAnalysis(payload);
        }
      } else {
        setAnalysis(null);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value?.data) {
        setHistory(Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
      }
    } catch (err) {
      // 404 is expected if user has not analyzed a resume yet
      if (err?.response?.status !== 404) {
        setError(parseApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchLatestAnalysis();
    }
  }, [fetchLatestAnalysis, options.autoFetch]);

  /**
   * Helper to animate progressive status messages during synchronous Gemini AI processing
   */
  const startProgressAnimation = () => {
    let stageIndex = 0;
    setProgressStage(PROGRESS_STAGES[0]);

    progressIntervalRef.current = setInterval(() => {
      stageIndex += 1;
      if (stageIndex < PROGRESS_STAGES.length) {
        setProgressStage(PROGRESS_STAGES[stageIndex]);
      }
    }, 1800);
  };

  const stopProgressAnimation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgressStage('');
  };

  /**
   * Initiate AI Resume Analysis via Google Gemini
   * @param {Object} [params={}] - { resumeId?: string, targetRole?: string, experienceLevel?: string, provider?: string }
   */
  const analyzeResume = async (params = {}) => {
    setAnalyzing(true);
    setError(null);
    startProgressAnimation();

    try {
      const response = await resumeAnalysisService.analyzeResume(params);
      const reportData = response?.data || response;

      if (!validateAnalysisResponse(reportData)) {
        throw new Error('Received malformed response structure from AI service.');
      }

      setAnalysis(reportData);
      toast.success('Resume analyzed successfully by Google Gemini AI!');

      // Refresh analysis history after new report is generated
      try {
        const historyRes = await resumeAnalysisService.getAnalysisHistory();
        if (historyRes?.data) {
          setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
        }
      } catch {
        // Non-critical
      }

      return reportData;
    } catch (err) {
      const parsedErr = parseApiError(err);
      setError(parsedErr);
      toast.error(parsedErr);
      throw err;
    } finally {
      stopProgressAnimation();
      setAnalyzing(false);
    }
  };

  /**
   * Delete specific analysis report by ID
   * @param {string} id - Analysis Report ID
   */
  const deleteAnalysis = async (id) => {
    try {
      await resumeAnalysisService.deleteAnalysis(id);
      toast.success('Analysis report deleted successfully.');
      fetchLatestAnalysis();
    } catch (err) {
      const parsedErr = parseApiError(err);
      toast.error(parsedErr);
      throw err;
    }
  };

  return {
    analysis,
    history,
    loading,
    analyzing,
    progressStage,
    error,
    analyzeResume,
    fetchLatestAnalysis,
    deleteAnalysis,
    refetch: fetchLatestAnalysis,
  };
};

export default useResumeAnalysis;
