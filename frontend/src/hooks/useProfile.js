import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';
import { parseApiError } from '../utils/helpers';

/**
 * Custom React Hook for Candidate Profile State & Action Management
 *
 * Provides reactive access to:
 * - Profile data (personal details, avatar, skills, education, experience, social links, resume)
 * - Profile completion percentage & breakdown
 * - Action handlers for creating, updating, and deleting sub-resources
 * - Standardized loading, error, and refetch states
 *
 * @param {Object} [options={}] - Options object
 * @param {boolean} [options.autoFetch=true] - Whether to fetch profile on mount
 * @returns {{
 *   profile: Object|null,
 *   completion: number,
 *   loading: boolean,
 *   actionLoading: boolean,
 *   error: string|null,
 *   fetchProfile: Function,
 *   fetchCompletion: Function,
 *   updateProfile: Function,
 *   uploadAvatar: Function,
 *   addSkill: Function,
 *   updateSkill: Function,
 *   deleteSkill: Function,
 *   addEducation: Function,
 *   updateEducation: Function,
 *   deleteEducation: Function,
 *   addExperience: Function,
 *   updateExperience: Function,
 *   deleteExperience: Function,
 *   updateSocialLinks: Function,
 *   uploadResume: Function,
 *   deleteResume: Function,
 *   refresh: Function
 * }}
 */
export const useProfile = (options = {}) => {
  const { autoFetch = true } = options;

  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(autoFetch);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch user profile details from backend
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      const payload = response?.data !== undefined ? response.data : response;
      setProfile(payload);
      return payload;
    } catch (err) {
      const errorMessage = parseApiError(err) || 'Failed to fetch user profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch profile completion score
   */
  const fetchCompletion = useCallback(async () => {
    try {
      const response = await profileService.getCompletion();
      const payload = response?.data !== undefined ? response.data : response;
      const score = payload?.completion ?? 0;
      setCompletion(score);
      return score;
    } catch (err) {
      console.error('Error fetching profile completion:', err);
      return 0;
    }
  }, []);

  /**
   * Refresh profile data and completion score simultaneously
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [profResult] = await Promise.all([fetchProfile(), fetchCompletion()]);
      return profResult;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchCompletion]);

  /**
   * Generic Action Wrapper for mutating operations
   */
  const runAction = async (actionFn) => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await actionFn();
      // Silently refresh profile and completion score after successful mutation
      await refresh();
      return result;
    } catch (err) {
      const msg = parseApiError(err) || 'Profile update failed';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /* Action Methods */
  const updateProfile = (data) => runAction(() => profileService.updateProfile(data));
  const uploadAvatar = (file) => runAction(() => profileService.uploadAvatar(file));

  const addSkill = (skill) => runAction(() => profileService.addSkill(skill));
  const updateSkill = (id, skill) => runAction(() => profileService.updateSkill(id, skill));
  const deleteSkill = (id) => runAction(() => profileService.deleteSkill(id));

  const addEducation = (edu) => runAction(() => profileService.addEducation(edu));
  const updateEducation = (id, edu) => runAction(() => profileService.updateEducation(id, edu));
  const deleteEducation = (id) => runAction(() => profileService.deleteEducation(id));

  const addExperience = (exp) => runAction(() => profileService.addExperience(exp));
  const updateExperience = (id, exp) => runAction(() => profileService.updateExperience(id, exp));
  const deleteExperience = (id) => runAction(() => profileService.deleteExperience(id));

  const updateSocialLinks = (social) => runAction(() => profileService.updateSocialLinks(social));

  const uploadResume = (file) => runAction(() => profileService.uploadResume(file));
  const deleteResume = () => runAction(() => profileService.deleteResume());

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  return {
    profile,
    completion,
    loading,
    actionLoading,
    error,
    fetchProfile,
    fetchCompletion,
    updateProfile,
    uploadAvatar,
    addSkill,
    updateSkill,
    deleteSkill,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    updateSocialLinks,
    uploadResume,
    deleteResume,
    refresh,
  };
};

export default useProfile;
