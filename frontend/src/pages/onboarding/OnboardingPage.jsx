import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Code2,
  MapPin,
  Globe,
  Plus,
  X,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';
import { parseApiError } from '../../utils/helpers';


const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'TypeScript',
  'Python',
  'System Design',
  'MongoDB',
  'SQL',
  'Docker',
  'AWS',
  'GraphQL',
];

export const OnboardingPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form State preserved across step navigation
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');

  const [currentLocation, setCurrentLocation] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');

  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Pre-fill existing profile data if available
  useEffect(() => {
    let isMounted = true;
    const fetchExistingProfile = async () => {
      try {
        const res = await profileService.getProfile();
        const prof = res?.data || res;
        if (prof && isMounted) {
          if (prof.headline) setHeadline(prof.headline);
          if (prof.bio) setBio(prof.bio);
          if (prof.currentLocation) setCurrentLocation(prof.currentLocation);
          if (prof.preferredLocation) setPreferredLocation(prof.preferredLocation);
          if (Array.isArray(prof.skills)) setSkills(prof.skills);
          if (prof.socialLinks) {
            if (prof.socialLinks.github) setGithub(prof.socialLinks.github);
            if (prof.socialLinks.linkedin) setLinkedin(prof.socialLinks.linkedin);
            if (prof.socialLinks.portfolio) setPortfolio(prof.socialLinks.portfolio);
          }
        }
      } catch {
        // Fallback gracefully if profile is not created yet
      }
    };

    fetchExistingProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddSkill = (skillName, level = skillLevel) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const exists = skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSkills((prev) => [...prev, { name: trimmed, level }]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleNext = () => {
    setApiError('');
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setApiError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setApiError('');
    try {
      // 1. Update Core Profile
      await profileService.updateProfile({
        headline: headline.trim(),
        bio: bio.trim(),
        currentLocation: currentLocation.trim(),
        preferredLocation: preferredLocation.trim(),
        skills: skills.map((s) => ({ name: s.name, level: s.level || 'Intermediate' })),
      });

      // 2. Update Social Links
      if (github || linkedin || portfolio) {
        await profileService.updateSocialLinks({
          github: github.trim(),
          linkedin: linkedin.trim(),
          portfolio: portfolio.trim(),
        });
      }

      // 3. Refresh Context User State & Navigate to Dashboard
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }

  };

  const stepProgress = Math.round((currentStep / 6) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Top Header & Progress Indicator */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Candidate Onboarding Setup
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Welcome to InterviewIQ <span className="text-indigo-400">AI</span>
        </h1>
        <p className="text-xs text-slate-400">
          Step {currentStep} of 6 — Personalize your AI interview practice and ATS scoring engine.
        </p>

        <div className="pt-2 max-w-md mx-auto">
          <ProgressBar value={stepProgress} color="indigo" size="sm" showPercentage={false} />
        </div>
      </div>

      {apiError && (
        <Alert variant="danger" title="Onboarding Error" onClose={() => setApiError('')}>
          {apiError}
        </Alert>
      )}

      {/* STEP 1: WELCOME */}
      {currentStep === 1 && (
        <Card variant="glass">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-2 text-white shadow-lg shadow-indigo-500/20">
              <Rocket className="w-6 h-6" />
            </div>
            <CardTitle>Welcome, {user?.name || 'Candidate'}!</CardTitle>
            <CardDescription>
              Let's set up your career target, technical skills, and job preferences in under 2 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Briefcase className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="font-bold text-slate-200 mb-1">Tailored Interviews</h4>
                <p className="text-[11px] text-slate-400">Gemini voice practice matched to your exact target engineering role.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Code2 className="w-5 h-5 text-cyan-400 mb-2" />
                <h4 className="font-bold text-slate-200 mb-1">ATS Optimization</h4>
                <p className="text-[11px] text-slate-400">Keyword scoring tuned to your technical stack and skill levels.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-slate-200 mb-1">Adaptive Roadmap</h4>
                <p className="text-[11px] text-slate-400">Custom learning milestones designed to fill your technical gaps.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="primary" size="md" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: CAREER TARGET */}
      {currentStep === 2 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Career Target & Headline</CardTitle>
            <CardDescription>Specify your primary engineering title and professional background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Professional Headline / Target Role"
              placeholder="e.g. Senior Full Stack Engineer, Backend Developer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              leftIcon={<Briefcase className="w-4 h-4" />}
              helperText="This headline will be used by Gemini AI to calibrate interview difficulty."
            />
            <Textarea
              label="Career Bio / Summary (Optional)"
              placeholder="Briefly describe your technical background, preferred frameworks, and career goals..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Technical Skills
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: SKILLS */}
      {currentStep === 3 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Technical Skills & Proficiency</CardTitle>
            <CardDescription>Add the languages, frameworks, and tools you specialize in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter skill (e.g. React, Node.js)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  leftIcon={<Code2 className="w-4 h-4" />}
                />
              </div>
              <div className="w-36">
                <Select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </div>
              <Button variant="secondary" onClick={() => handleAddSkill(skillInput)} leftIcon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </div>

            {/* Popular Skills Quick Selector */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Add Popular Tech Stack:</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((item) => {
                  const isAdded = skills.some((s) => s.name.toLowerCase() === item.toLowerCase());
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddSkill(item)}
                      disabled={isAdded}
                      className={`
                        px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border
                        ${isAdded
                          ? 'bg-slate-900 text-slate-500 border-slate-800 opacity-50 cursor-not-allowed'
                          : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                        }
                      `.trim()}
                    >
                      + {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Skills List */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-300 mb-2">Selected Skills ({skills.length}):</p>
              {skills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No skills added yet. Click above or type a skill.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((sk, index) => (
                    <Badge key={index} variant="primary" style="soft" size="md">
                      <span>{sk.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({sk.level || 'Intermediate'})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="ml-1 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Experience
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: EXPERIENCE */}
      {currentStep === 4 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Experience & Focus Area</CardTitle>
            <CardDescription>Confirm your primary professional focus and years of experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Current Position / Title"
              placeholder="e.g. Software Engineer at TechCorp"
              value={headline || 'Software Engineering Candidate'}
              onChange={(e) => setHeadline(e.target.value)}
              leftIcon={<Briefcase className="w-4 h-4" />}
            />
            <Alert variant="info" title="Adaptive Question Selection">
              Gemini AI uses your title and skill levels to pick real-world coding and system design interview questions.
            </Alert>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Preferences & Links
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 5: PREFERENCES & SOCIAL LINKS */}
      {currentStep === 5 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Location Preferences & Social Links</CardTitle>
            <CardDescription>Provide location preferences and technical portfolio profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Location"
                placeholder="e.g. San Francisco, CA"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
              <Input
                label="Preferred Work Location"
                placeholder="e.g. Remote / New York"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Technical Profiles (Optional)</h4>
              <Input
                label="GitHub URL"
                placeholder="https://github.com/username"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
              />
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/username"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
              />
              <Input
                label="Portfolio / Personal Site"
                placeholder="https://yourportfolio.dev"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Review & Complete
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 6: COMPLETE */}
      {currentStep === 6 && (
        <Card variant="glass">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-emerald-300">Setup Ready!</CardTitle>
            <CardDescription>Review your candidate profile setup summary before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">Target Role:</span>
                <span className="font-semibold text-slate-200">{headline || 'Full Stack Candidate'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">Skills Added:</span>
                <span className="font-semibold text-slate-200">{skills.length} skills</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">Location:</span>
                <span className="font-semibold text-slate-200">{preferredLocation || currentLocation || 'Remote'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={handleCompleteOnboarding}
              isLoading={isSubmitting}
              leftIcon={<Rocket className="w-4 h-4" />}
            >
              Complete Setup & Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default OnboardingPage;
