import React, { useState, useEffect } from 'react';
import { FolderGit2, Save, X, Calendar, GitBranch, Globe, Code2, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;

export const ProjectForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    role: '',
    startDate: '',
    endDate: '',
    current: false,
    githubUrl: '',
    liveUrl: '',
    projectType: 'Personal',
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

      const techStr = Array.isArray(initialValues.technologies)
        ? initialValues.technologies.join(', ')
        : initialValues.technologies || '';

      setFormData({
        title: initialValues.title || initialValues.name || '',
        description: initialValues.description || '',
        technologies: techStr,
        role: initialValues.role || '',
        startDate: formatDateStr(initialValues.startDate),
        endDate: formatDateStr(initialValues.endDate),
        current: Boolean(initialValues.current),
        githubUrl: initialValues.githubUrl || '',
        liveUrl: initialValues.liveUrl || '',
        projectType: initialValues.projectType || 'Personal',
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
    const trimmedTitle = formData.title.trim();

    if (!trimmedTitle) {
      errors.title = 'Project name is required.';
    } else if (trimmedTitle.length > 100) {
      errors.title = 'Project name cannot exceed 100 characters.';
    }

    if (formData.role && formData.role.trim().length > 100) {
      errors.role = 'Role title cannot exceed 100 characters.';
    }

    if (formData.githubUrl && formData.githubUrl.trim()) {
      if (!URL_REGEX.test(formData.githubUrl.trim())) {
        errors.githubUrl = 'Please enter a valid GitHub URL.';
      }
    }

    if (formData.liveUrl && formData.liveUrl.trim()) {
      if (!URL_REGEX.test(formData.liveUrl.trim())) {
        errors.liveUrl = 'Please enter a valid Live Demo URL.';
      }
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

    const techArray = formData.technologies
      ? formData.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title: formData.title.trim(),
      name: formData.title.trim(),
      description: formData.description.trim(),
      technologies: techArray,
      role: formData.role.trim(),
      startDate: formData.startDate || null,
      endDate: formData.current ? null : (formData.endDate || null),
      current: Boolean(formData.current),
      githubUrl: formData.githubUrl.trim(),
      liveUrl: formData.liveUrl.trim(),
      projectType: formData.projectType,
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-4 ${className}`.trim()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Project Name"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g. InterviewIQ AI Platform"
          leftIcon={<FolderGit2 className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.title}
          required
        />

        <Select
          label="Project Type"
          name="projectType"
          value={formData.projectType}
          onChange={handleInputChange}
          options={[
            { value: 'Personal', label: 'Personal Project' },
            { value: 'Academic', label: 'Academic / Capstone' },
            { value: 'Professional', label: 'Professional / Client' },
            { value: 'Open Source', label: 'Open Source Contribution' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Role / Contribution"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          placeholder="e.g. Lead Architect / Full Stack Developer"
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.role}
        />

        <Input
          label="Technologies & Tech Stack"
          name="technologies"
          value={formData.technologies}
          onChange={handleInputChange}
          placeholder="e.g. React, Node.js, MongoDB, Tailwind CSS (comma-separated)"
          leftIcon={<Code2 className="w-4 h-4 text-slate-400" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="GitHub Repository URL"
          name="githubUrl"
          value={formData.githubUrl}
          onChange={handleInputChange}
          placeholder="https://github.com/username/project"
          leftIcon={<GitBranch className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.githubUrl}
        />

        <Input
          label="Live Demo / Deployment URL"
          name="liveUrl"
          value={formData.liveUrl}
          onChange={handleInputChange}
          placeholder="https://myproject.app"
          leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.liveUrl}
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
          id="current-project-checkbox"
          name="current"
          checked={formData.current}
          onChange={handleInputChange}
          label="I am currently working on this project"
        />
      </div>

      <div className="space-y-1">
        <Textarea
          label="Project Description & Key Features"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe problem solved, architecture, key metrics, and features built..."
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
          {initialValues ? 'Update Project' : 'Add Project Record'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
