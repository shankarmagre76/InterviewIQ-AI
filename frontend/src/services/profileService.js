import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const profileService = {
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.PROFILE.BASE);
    return response.data;
  },

  async getCompletion() {
    const response = await api.get(API_ENDPOINTS.PROFILE.COMPLETION);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.BASE, profileData);
    return response.data;
  },

  async uploadAvatar(formData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Skills
  async getSkills() {
    const response = await api.get(API_ENDPOINTS.PROFILE.SKILLS);
    return response.data;
  },

  async addSkill(skillData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.SKILLS, skillData);
    return response.data;
  },

  async updateSkill(id, skillData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.SKILL_BY_ID(id), skillData);
    return response.data;
  },

  async deleteSkill(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.SKILL_BY_ID(id));
    return response.data;
  },

  // Education
  async getEducation() {
    const response = await api.get(API_ENDPOINTS.PROFILE.EDUCATION);
    return response.data;
  },

  async addEducation(eduData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.EDUCATION, eduData);
    return response.data;
  },

  async updateEducation(id, eduData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.EDUCATION_BY_ID(id), eduData);
    return response.data;
  },

  async deleteEducation(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.EDUCATION_BY_ID(id));
    return response.data;
  },

  // Experience
  async getExperience() {
    const response = await api.get(API_ENDPOINTS.PROFILE.EXPERIENCE);
    return response.data;
  },

  async addExperience(expData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.EXPERIENCE, expData);
    return response.data;
  },

  async updateExperience(id, expData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.EXPERIENCE_BY_ID(id), expData);
    return response.data;
  },

  async deleteExperience(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.EXPERIENCE_BY_ID(id));
    return response.data;
  },

  // Social Links
  async getSocialLinks() {
    const response = await api.get(API_ENDPOINTS.PROFILE.SOCIAL_LINKS);
    return response.data;
  },

  async updateSocialLinks(socialData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.SOCIAL_LINKS, socialData);
    return response.data;
  },

  async deleteProfile() {
    const response = await api.delete(API_ENDPOINTS.PROFILE.BASE);
    return response.data;
  },
};

export default profileService;
