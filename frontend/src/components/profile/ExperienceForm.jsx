import React, { useState, useEffect } from 'react';
import { Briefcase, Save, X, Calendar, MapPin, Building2, FileText, Clock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

export const ExperienceForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    employmentType: 'Full-time',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      const formatDateStr = (val) => {
        if (!val) return '';
        try {
          return new Date(val).toISOString().split('T')[0];
        } catch {
          return String(val).split('T')[0] || '';
        }
      };

      setFormData({
        company: initialValues.company || '',
        position: initialValues.position || '',
        employmentType: initialValues.employmentType || 'Full-time',
        location: initialValues.location || '',
        startDate: formatDateStr(initialValues.startDate),
        endDate: formatDateStr(initialValues.endDate),
        current: Boolean(initialValues.current),
        description: initialValues.description || '',
      });
    }
  }, [initialValues]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    const trimmedCompany = formData.company.trim();
    const trimmedPosition = formData.position.trim();

    if (!trimmedCompany) {
      errors.company = 'Company name is required.';
    } else if (trimmedCompany.length > 100) {
      errors.company = 'Company name cannot exceed 100 characters.';
    }

    if (!trimmedPosition) {
      errors.position = 'Job position / title is required.';
    } else if (trimmedPosition.length > 100) {
      errors.position = 'Position title cannot exceed 100 characters.';
    }

    if (formData.location && formData.location.trim().length > 100) {
      errors.location = 'Location cannot exceed 100 characters.';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required.';
    }

    if (!formData.current && formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = 'End date cannot be prior to start date.';
      }
    }

    if (formData.description && formData.description.trim().length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      company: formData.company.trim(),
      position: formData.position.trim(),
      employmentType: formData.employmentType,
      location: formData.location.trim(),
      startDate: formData.startDate,
      endDate: formData.current ? null : (formData.endDate || null),
      current: Boolean(formData.current),
      description: formData.description.trim(),
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-4 ${className}`.trim()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="e.g. Google / Microsoft / TechCorp"
          leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.company}
          required
        />

        <Input
          label="Job Position / Title"
          name="position"
          value={formData.position}
          onChange={handleInputChange}
          placeholder="e.g. Senior Software Engineer"
          leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.position}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Employment Type"
          name="employmentType"
          value={formData.employmentType}
          onChange={handleInputChange}
          options={[
            { value: 'Full-time', label: 'Full-time' },
            { value: 'Part-time', label: 'Part-time' },
            { value: 'Contract', label: 'Contract' },
            { value: 'Internship', label: 'Internship' },
            { value: 'Freelance', label: 'Freelance' },
            { value: 'Self-employed', label: 'Self-employed' },
          ]}
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g. San Francisco, CA / Remote"
          leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.location}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
          leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.startDate}
          required
        />

        <Input
          label="End Date"
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
          disabled={formData.current}
          leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.endDate}
        />
      </div>

      <div className="pt-1">
        <Checkbox
          id="current-exp-checkbox"
          name="current"
          checked={formData.current}
          onChange={handleInputChange}
          label="I am currently working in this role"
        />
      </div>

      <div className="space-y-1">
        <Textarea
          label="Role Responsibilities & Achievements"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your key technical responsibilities, projects delivered, tools used, and business impact..."
          rows={4}
          error={fieldErrors.description}
        />
        <div className="flex justify-end text-[11px] text-slate-500 font-mono">
          <span>{formData.description.length}/1000 chars</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            leftIcon={<X className="w-4 h-4" />}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {initialValues ? 'Update Experience' : 'Add Experience Record'}
        </Button>
      </div>
    </form>
  );
};

export default ExperienceForm;
