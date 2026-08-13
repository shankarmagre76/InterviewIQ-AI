import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Edit3,
  FileText,
  Settings,
  Sparkles,
  Save,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useToast } from '../../hooks/useToast';

import { PageHeader } from '../../components/common/PageHeader';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileSummary } from '../../components/profile/ProfileSummary';
import { ProfileStats } from '../../components/profile/ProfileStats';
import { ProfileCompletionCard } from '../../components/profile/ProfileCompletionCard';
import { PersonalInfoForm } from '../../components/profile/PersonalInfoForm';
import { EducationSection } from '../../components/profile/EducationSection';
import { ExperienceSection } from '../../components/profile/ExperienceSection';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Spinner, SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const {
    profile,
    completion,
    loading,
    actionLoading,
    error,
    refresh,
    updateProfile,
    uploadAvatar,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
  } = useProfile({ autoFetch: true });

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'personal-info' | 'education' | 'experience'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
  });

  useEffect(() => {
    if (profile) {
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
      });
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Candidate profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile details.');
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success('Profile avatar uploaded successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to upload profile avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSectionNavigation = (sectionKey) => {
    switch (sectionKey) {
      case 'resume':
        navigate('/resume');
        break;
      case 'education':
        setActiveTab('education');
        break;
      case 'experience':
        setActiveTab('experience');
        break;
      case 'skills':
      case 'certifications':
      case 'projects':
      default:
        setActiveTab('personal-info');
        break;
    }
  };

  if (loading && !profile) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Career Profile Overview"
          description="Manage your professional background, target job roles, and profile completion."
        />
        <div className="grid grid-cols-1 gap-6">
          <SkeletonCard className="h-48" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} className="h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonCard className="lg:col-span-2 h-96" />
            <SkeletonCard className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Career Profile Overview"
          description="Manage your professional background, target job roles, and profile completion."
        />
        <ErrorState
          title="Unable to Load Candidate Profile"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Career Profile Overview"
          description="Manage your professional background, target job roles, and profile completion."
        />
        <EmptyState
          title="No Profile Found"
          description="We couldn't retrieve your candidate profile. Create or initialize your profile to get started."
          primaryAction={{
            label: 'Initialize Profile',
            onClick: handleOpenEditModal,
            icon: <User className="w-4 h-4" />,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Career Profile & Work Experience"
        description="Manage your professional identity, target career role, work history, education, and profile completion."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            leftIcon={<Settings className="w-4 h-4 text-indigo-400" />}
          >
            Account Settings
          </Button>
        }
      />

      {/* Main Profile Header Banner */}
      <ProfileHeader
        profile={profile}
        user={user}
        onEditProfile={() => setActiveTab('personal-info')}
        onUploadAvatar={handleAvatarUpload}
        uploadingAvatar={uploadingAvatar}
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Profile Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('personal-info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'personal-info'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'experience'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span>Work Experience ({profile?.experience?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'education'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span>Education ({profile?.education?.length || 0})</span>
        </button>
      </div>

      {activeTab === 'overview' ? (
        /* Tab 1: Profile Overview */
        <>
          {/* Quick Career Stats Breakdown Grid */}
          <ProfileStats profile={profile} onSectionClick={handleSectionNavigation} />

          {/* Main Content Layout: Summary vs Completion */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <ProfileSummary profile={profile} user={user} />

              {/* Work Experience Section */}
              <ExperienceSection
                experienceList={profile?.experience || []}
                onAddExperience={addExperience}
                onUpdateExperience={updateExperience}
                onDeleteExperience={deleteExperience}
                loading={actionLoading}
              />

              {/* Education Section */}
              <EducationSection
                educationList={profile?.education || []}
                onAddEducation={addEducation}
                onUpdateEducation={updateEducation}
                onDeleteEducation={deleteEducation}
                loading={actionLoading}
              />
            </div>

            <div className="space-y-6">
              <ProfileCompletionCard
                completion={completion}
                profile={profile}
                onEditProfile={() => setActiveTab('personal-info')}
              />

              {/* Quick Action Shortcuts Card */}
              <Card variant="glass" className="border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Quick Profile Shortcuts</CardTitle>
                  <CardDescription>Direct candidate section access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setActiveTab('experience')}
                    leftIcon={<Briefcase className="w-4 h-4 text-emerald-400" />}
                  >
                    Manage Work Experience ({profile?.experience?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setActiveTab('education')}
                    leftIcon={<GraduationCap className="w-4 h-4 text-cyan-400" />}
                  >
                    Manage Education ({profile?.education?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setActiveTab('personal-info')}
                    leftIcon={<User className="w-4 h-4 text-indigo-400" />}
                  >
                    Edit Personal Info
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => navigate('/resume')}
                    leftIcon={<FileText className="w-4 h-4 text-emerald-400" />}
                  >
                    Manage Resume & Documents
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : activeTab === 'personal-info' ? (
        /* Tab 2: Personal Information Management (F4.3) */
        <div className="max-w-5xl mx-auto">
          <PersonalInfoForm
            profile={profile}
            user={user}
            onProfileUpdated={refresh}
          />
        </div>
      ) : activeTab === 'experience' ? (
        /* Tab 3: Experience Management (F4.5) */
        <div className="max-w-5xl mx-auto">
          <ExperienceSection
            experienceList={profile?.experience || []}
            onAddExperience={addExperience}
            onUpdateExperience={updateExperience}
            onDeleteExperience={deleteExperience}
            loading={actionLoading}
          />
        </div>
      ) : (
        /* Tab 4: Education Management (F4.4) */
        <div className="max-w-5xl mx-auto">
          <EducationSection
            educationList={profile?.education || []}
            onAddEducation={addEducation}
            onUpdateEducation={updateEducation}
            onDeleteEducation={deleteEducation}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Quick Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Quick Edit Profile"
        description="Update your display details and career headline."
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={handleCloseEditModal} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              loading={actionLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="e.g. Jane"
              required
            />

            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="e.g. Doe"
              required
            />
          </div>

          <Input
            label="Target Career Role / Headline"
            name="headline"
            value={formData.headline}
            onChange={handleInputChange}
            placeholder="e.g. Senior Full Stack Engineer | React & Node.js"
          />

          <Textarea
            label="Bio / Professional Summary"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Summarize your technical strengths..."
            rows={4}
          />
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
