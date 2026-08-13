import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Edit3,
  X,
  Save,
  Lock,
  Code,
  ExternalLink,
  Award,
  CheckCircle2,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useToast } from '../../hooks/useToast';
import { profileService } from '../../services/profileService';
import { parseApiError } from '../../utils/helpers';

const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const PersonalInfoForm = ({
  profile,
  user,
  onProfileUpdated,
  className = '',
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields State matching backend Profile schema & User model
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: 'Prefer not to say',
    dateOfBirth: '',
    headline: '',
    bio: '',
    currentLocation: '',
    preferredLocation: '',
    website: '',
    github: '',
    linkedin: '',
    portfolio: '',
    leetcode: '',
    hackerrank: '',
    codechef: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize and preserve existing profile values
  useEffect(() => {
    if (profile) {
      const social = profile.socialLinks || {};
      setFormData({
        firstName: profile.firstName || user?.firstName || '',
        lastName: profile.lastName || user?.lastName || '',
        phone: profile.phone || '',
        gender: profile.gender || 'Prefer not to say',
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
          : '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        currentLocation: profile.currentLocation || '',
        preferredLocation: profile.preferredLocation || '',
        website: profile.website || '',
        github: social.github || '',
        linkedin: social.linkedin || '',
        portfolio: social.portfolio || '',
        leetcode: social.leetcode || '',
        hackerrank: social.hackerrank || '',
        codechef: social.codechef || '',
      });
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error as candidate types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError('');
  };

  /**
   * Client-side Validation strictly matching backend rules
   */
  const validateForm = () => {
    const errors = {};
    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();

    // First Name: min 2, max 50
    if (!trimmedFirst) {
      errors.firstName = 'First name is required.';
    } else if (trimmedFirst.length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    } else if (trimmedFirst.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters.';
    }

    // Last Name: min 2, max 50
    if (!trimmedLast) {
      errors.lastName = 'Last name is required.';
    } else if (trimmedLast.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    } else if (trimmedLast.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters.';
    }

    // Phone: optional, valid format if provided
    if (formData.phone && formData.phone.trim()) {
      if (!PHONE_REGEX.test(formData.phone.trim())) {
        errors.phone = 'Please provide a valid phone number.';
      }
    }

    // Headline: optional, max 100
    if (formData.headline && formData.headline.trim().length > 100) {
      errors.headline = 'Headline cannot exceed 100 characters.';
    }

    // Bio: optional, max 500
    if (formData.bio && formData.bio.trim().length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters.';
    }

    // Date of Birth: optional, cannot be future date
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (dob > new Date()) {
        errors.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    // Locations: optional, max 100
    if (formData.currentLocation && formData.currentLocation.trim().length > 100) {
      errors.currentLocation = 'Current location cannot exceed 100 characters.';
    }
    if (formData.preferredLocation && formData.preferredLocation.trim().length > 100) {
      errors.preferredLocation = 'Preferred location cannot exceed 100 characters.';
    }

    // Website: optional, URL validation
    if (formData.website && formData.website.trim()) {
      if (!URL_REGEX.test(formData.website.trim())) {
        errors.website = 'Please enter a valid URL (e.g. https://myportfolio.com).';
      }
    }

    // Social URLs: optional, URL validation
    const socialFields = ['github', 'linkedin', 'portfolio', 'leetcode', 'hackerrank', 'codechef'];
    socialFields.forEach((field) => {
      const val = formData[field]?.trim();
      if (val && !URL_REGEX.test(val)) {
        errors[field] = `Please enter a valid URL for ${field}.`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare Basic Profile Payload
      const profilePayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        headline: formData.headline.trim(),
        bio: formData.bio.trim(),
        currentLocation: formData.currentLocation.trim(),
        preferredLocation: formData.preferredLocation.trim(),
        website: formData.website.trim(),
      };

      // 2. Prepare Social Links Payload
      const socialPayload = {
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        portfolio: formData.portfolio.trim(),
        leetcode: formData.leetcode.trim(),
        hackerrank: formData.hackerrank.trim(),
        codechef: formData.codechef.trim(),
      };

      // Execute both backend updates in parallel
      await Promise.all([
        profileService.updateProfile(profilePayload),
        profileService.updateSocialLinks(socialPayload),
      ]);

      const msg = 'Personal information updated successfully!';
      setSuccessMessage(msg);
      toast.success(msg);
      setIsEditing(false);

      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setApiError(parsed);

      // Map backend validation errors array to field errors if available
      const backendErrors = err?.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        const mappedErrors = {};
        backendErrors.forEach((item) => {
          if (item.field) {
            mappedErrors[item.field] = item.message;
          }
        });
        setFieldErrors(mappedErrors);
      }

      toast.error(parsed || 'Failed to update personal information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Revert form state back to active profile props
    if (profile) {
      const social = profile.socialLinks || {};
      setFormData({
        firstName: profile.firstName || user?.firstName || '',
        lastName: profile.lastName || user?.lastName || '',
        phone: profile.phone || '',
        gender: profile.gender || 'Prefer not to say',
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
          : '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        currentLocation: profile.currentLocation || '',
        preferredLocation: profile.preferredLocation || '',
        website: profile.website || '',
        github: social.github || '',
        linkedin: social.linkedin || '',
        portfolio: social.portfolio || '',
        leetcode: social.leetcode || '',
        hackerrank: social.hackerrank || '',
        codechef: social.codechef || '',
      });
    }
    setFieldErrors({});
    setApiError('');
    setIsEditing(false);
  };

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span>Personal Information Management</span>
            </CardTitle>
            <CardDescription>
              Manage your personal identity, contact preferences, location, and social profiles.
            </CardDescription>
          </div>

          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="w-4 h-4 text-indigo-400" />}
            >
              Edit Information
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Success Alert Feedback */}
        {successMessage && !isEditing && (
          <Alert
            variant="success"
            title="Success"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        {/* Global API Error Alert */}
        {apiError && (
          <Alert variant="danger" title="Update Error" onClose={() => setApiError('')}>
            {apiError}
          </Alert>
        )}

        {isEditing ? (
          /* ==========================================================================
             Interactive Form (Edit Mode)
             ========================================================================== */
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Section 1: Basic Identity & Headline */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
                1. Basic Identity & Target Role
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Jane"
                  error={fieldErrors.firstName}
                  required
                  autoComplete="given-name"
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  error={fieldErrors.lastName}
                  required
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Target Role / Professional Headline"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="e.g. Senior Full Stack Engineer | React & Node.js"
                helperText="Maximum 100 characters."
                error={fieldErrors.headline}
              />

              <div className="space-y-1">
                <Textarea
                  label="Bio / Career Summary"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your career accomplishments, expertise, and target objectives..."
                  rows={4}
                  error={fieldErrors.bio}
                />
                <div className="flex justify-end text-[11px] text-slate-500 font-mono">
                  <span>{formData.bio.length}/500 chars</span>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Location */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
                2. Contact & Work Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  value={user?.email || profile?.user?.email || ''}
                  disabled
                  leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
                  rightIcon={<Lock className="w-3.5 h-3.5 text-slate-500" />}
                  helperText="Primary email is linked to your authentication account."
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 019-2834"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={fieldErrors.phone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Location"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA, USA"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={fieldErrors.currentLocation}
                />

                <Input
                  label="Preferred Work Location"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Remote / New York, NY"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={fieldErrors.preferredLocation}
                />
              </div>
            </div>

            {/* Section 3: Personal Attributes */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                3. Personal Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  error={fieldErrors.dateOfBirth}
                />

                <Input
                  label="Personal Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://janedoe.dev"
                  leftIcon={<Globe className="w-4 h-4" />}
                  error={fieldErrors.website}
                />
              </div>
            </div>

            {/* Section 4: Social & Coding Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
                4. Social & Developer Links
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GitHub Profile"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  leftIcon={<Code className="w-4 h-4" />}
                  error={fieldErrors.github}
                />

                <Input
                  label="LinkedIn Profile"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                  error={fieldErrors.linkedin}
                />

                <Input
                  label="LeetCode Profile"
                  name="leetcode"
                  value={formData.leetcode}
                  onChange={handleInputChange}
                  placeholder="https://leetcode.com/username"
                  leftIcon={<Code className="w-4 h-4" />}
                  error={fieldErrors.leetcode}
                />

                <Input
                  label="HackerRank Profile"
                  name="hackerrank"
                  value={formData.hackerrank}
                  onChange={handleInputChange}
                  placeholder="https://hackerrank.com/username"
                  leftIcon={<Award className="w-4 h-4" />}
                  error={fieldErrors.hackerrank}
                />
              </div>
            </div>

            {/* Form Footer Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                leftIcon={<X className="w-4 h-4" />}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Personal Information
              </Button>
            </div>
          </form>
        ) : (
          /* ==========================================================================
             Read-Only View Mode (Presentation View)
             ========================================================================== */
          <div className="space-y-6">
            {/* Bio Preview */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Headline & Summary</span>
              <p className="text-sm font-semibold text-indigo-300">{formData.headline || 'No headline set'}</p>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {formData.bio || 'No candidate bio provided.'}
              </p>
            </div>

            {/* Attribute Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 font-medium block">Full Name</span>
                <span className="font-semibold text-slate-100 text-sm">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 font-medium block">Email Address</span>
                <span className="font-semibold text-slate-100 text-sm truncate block">
                  {user?.email || profile?.user?.email || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 font-medium block">Phone Number</span>
                <span className="font-semibold text-slate-100 text-sm">{formData.phone || 'Not set'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 font-medium block">Gender</span>
                <span className="font-semibold text-slate-100 text-sm">{formData.gender}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 font-medium block">Date of Birth</span>
                <span className="font-semibold text-slate-100 text-sm">
                  {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not set'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 font-medium block">Current Location</span>
                <span className="font-semibold text-slate-100 text-sm">{formData.currentLocation || 'Not set'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 font-medium block">Preferred Location</span>
                <span className="font-semibold text-slate-100 text-sm">{formData.preferredLocation || 'Not set'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 col-span-1 sm:col-span-2">
                <span className="text-slate-500 font-medium block">Website</span>
                {formData.website ? (
                  <a
                    href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-cyan-400 hover:underline truncate block"
                  >
                    {formData.website}
                  </a>
                ) : (
                  <span className="font-semibold text-slate-400 text-sm">Not set</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
