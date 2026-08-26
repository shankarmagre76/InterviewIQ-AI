import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Button } from '../ui/Button.jsx';
import { Briefcase, MapPin, Calendar, Code, Users, Loader2 } from 'lucide-react';

const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const JOB_STATUSES = ['Active', 'Draft', 'Paused', 'Closed', 'Expired'];

/**
 * JobForm Component (F10.7)
 * Modal form for creating and editing job postings with validation matching backend schema.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Object|null} [props.job=null] - Initial job document for editing (null for create)
 * @param {Array<Object>} [props.companies=[]] - Companies list for company selector dropdown
 * @param {Function} props.onSubmit - Submission callback (formData) => Promise
 */
export const JobForm = ({
  isOpen,
  onClose,
  job = null,
  companies = [],
  onSubmit,
}) => {
  const isEditing = Boolean(job && job._id);

  const [formData, setFormData] = useState({
    title: '',
    companyId: '',
    location: '',
    workMode: WORK_MODES[0],
    employmentType: EMPLOYMENT_TYPES[0],
    status: JOB_STATUSES[0],
    openings: 1,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requiredSkills: '',
    minYears: 0,
    maxYears: 5,
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      const compId = typeof job.company === 'object' ? job.company?._id : job.company;

      setFormData({
        title: job.title || '',
        companyId: compId || (companies[0]?._id || ''),
        location: job.location || '',
        workMode: job.workMode || WORK_MODES[0],
        employmentType: job.employmentType || EMPLOYMENT_TYPES[0],
        status: job.status || JOB_STATUSES[0],
        openings: job.openings || 1,
        applicationDeadline: job.applicationDeadline
          ? new Date(job.applicationDeadline).toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills || '',
        minYears: job.experience?.minYears ?? 0,
        maxYears: job.experience?.maxYears ?? 5,
        description: job.description || '',
      });
    } else {
      setFormData({
        title: '',
        companyId: companies[0]?._id || '',
        location: '',
        workMode: WORK_MODES[0],
        employmentType: EMPLOYMENT_TYPES[0],
        status: JOB_STATUSES[0],
        openings: 1,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requiredSkills: '',
        minYears: 0,
        maxYears: 5,
        description: '',
      });
    }
    setErrors({});
  }, [job, companies, isOpen]);

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = 'Job title must be at least 3 characters.';
    }
    if (!formData.companyId) {
      errs.companyId = 'Company selection is required.';
    }
    if (!formData.location.trim()) {
      errs.location = 'Location is required.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errs.description = 'Description must be at least 20 characters.';
    }
    if (!formData.requiredSkills.trim()) {
      errs.requiredSkills = 'At least one required skill is required (comma-separated).';
    }
    if (formData.minYears > formData.maxYears) {
      errs.maxYears = 'Max experience years cannot be less than min experience years.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    const skillsArray = formData.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      company: formData.companyId,
      companyId: formData.companyId,
      location: formData.location.trim(),
      workMode: formData.workMode,
      employmentType: formData.employmentType,
      status: formData.status,
      openings: Number(formData.openings),
      applicationDeadline: formData.applicationDeadline,
      requiredSkills: skillsArray,
      description: formData.description.trim(),
      experience: {
        minYears: Number(formData.minYears),
        maxYears: Number(formData.maxYears),
      },
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Failed to submit job form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Job Posting: ${job?.title}` : 'Create New Job Posting'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title *"
            type="text"
            placeholder="e.g. Senior Frontend Engineer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
            required
          />

          <Select
            label="Company *"
            value={formData.companyId}
            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            error={errors.companyId}
            required
          >
            <option value="">Select Company</option>
            {companies.map((comp) => (
              <option key={comp._id} value={comp._id}>
                {comp.companyName} ({comp.industry || 'Company'})
              </option>
            ))}
          </Select>
        </div>

        {/* Location, Work Mode & Employment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Location *"
            type="text"
            placeholder="e.g. San Francisco, CA or Remote"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            error={errors.location}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            required
          />

          <Select
            label="Work Mode *"
            value={formData.workMode}
            onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
            required
          >
            {WORK_MODES.map((wm) => (
              <option key={wm} value={wm}>
                {wm}
              </option>
            ))}
          </Select>

          <Select
            label="Employment Type *"
            value={formData.employmentType}
            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
            required
          >
            {EMPLOYMENT_TYPES.map((et) => (
              <option key={et} value={et}>
                {et}
              </option>
            ))}
          </Select>
        </div>

        {/* Status, Openings & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Posting Status *"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          >
            {JOB_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Select>

          <Input
            label="Openings Count *"
            type="number"
            min={1}
            value={formData.openings}
            onChange={(e) => setFormData({ ...formData, openings: Number(e.target.value) })}
            leftIcon={<Users className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Application Deadline *"
            type="date"
            value={formData.applicationDeadline}
            onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
            required
          />
        </div>

        {/* Required Skills & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Required Skills (Comma-separated) *"
              type="text"
              placeholder="e.g. React, Node.js, TypeScript, Tailwind"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              error={errors.requiredSkills}
              leftIcon={<Code className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Min Yrs"
              type="number"
              min={0}
              max={50}
              value={formData.minYears}
              onChange={(e) => setFormData({ ...formData, minYears: Number(e.target.value) })}
            />
            <Input
              label="Max Yrs"
              type="number"
              min={0}
              max={50}
              value={formData.maxYears}
              onChange={(e) => setFormData({ ...formData, maxYears: Number(e.target.value) })}
              error={errors.maxYears}
            />
          </div>
        </div>

        {/* Description */}
        <Textarea
          label="Job Description *"
          placeholder="Provide detailed job specifications, key responsibilities, requirements, and benefits..."
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
          required
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {isEditing ? 'Save Changes' : 'Post Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JobForm;
