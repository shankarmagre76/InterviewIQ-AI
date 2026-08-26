import React, { useState, useEffect } from 'react';
import { GraduationCap, Save, X, Calendar, Award, Building2, BookOpen } from 'lucide-react';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

export const EducationForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}) => {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    institute: '',
    degree: '',
    branch: '',
    startYear: currentYear - 4,
    endYear: currentYear,
    current: false,
    cgpa: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        institute: initialValues.institute || '',
        degree: initialValues.degree || '',
        branch: initialValues.branch || '',
        startYear: initialValues.startYear || currentYear - 4,
        endYear: initialValues.endYear || currentYear,
        current: Boolean(initialValues.current),
        cgpa: initialValues.cgpa !== undefined && initialValues.cgpa !== null ? String(initialValues.cgpa) : '',
      });
    }
  }, [initialValues, currentYear]);

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
    const trimmedInstitute = formData.institute.trim();
    const trimmedDegree = formData.degree.trim();
    const startYr = Number(formData.startYear);
    const endYr = Number(formData.endYear);

    if (!trimmedInstitute) {
      errors.institute = 'Institute / College name is required.';
    } else if (trimmedInstitute.length > 100) {
      errors.institute = 'Institute name cannot exceed 100 characters.';
    }

    if (!trimmedDegree) {
      errors.degree = 'Degree name is required.';
    } else if (trimmedDegree.length > 100) {
      errors.degree = 'Degree name cannot exceed 100 characters.';
    }

    if (formData.branch && formData.branch.trim().length > 100) {
      errors.branch = 'Branch / Specialization cannot exceed 100 characters.';
    }

    if (!formData.startYear || isNaN(startYr)) {
      errors.startYear = 'Start year is required.';
    } else if (startYr < 1950 || startYr > 2100) {
      errors.startYear = 'Start year must be between 1950 and 2100.';
    }

    if (!formData.current && formData.endYear) {
      if (isNaN(endYr) || endYr < 1950 || endYr > 2100) {
        errors.endYear = 'End year must be between 1950 and 2100.';
      } else if (endYr < startYr) {
        errors.endYear = 'End year cannot be prior to start year.';
      }
    }

    if (formData.cgpa !== '' && formData.cgpa !== null) {
      const cgpaNum = Number(formData.cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 100) {
        errors.cgpa = 'CGPA / Grade must be a number between 0 and 100.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      institute: formData.institute.trim(),
      degree: formData.degree.trim(),
      branch: formData.branch.trim(),
      startYear: Number(formData.startYear),
      endYear: formData.current ? null : (formData.endYear ? Number(formData.endYear) : null),
      current: Boolean(formData.current),
      cgpa: formData.cgpa !== '' ? Number(formData.cgpa) : null,
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-4 ${className}`.trim()}>
      <Input
        label="Institute / University Name"
        name="institute"
        value={formData.institute}
        onChange={handleInputChange}
        placeholder="e.g. Stanford University / IIT Bombay"
        leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
        error={fieldErrors.institute}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Degree"
          name="degree"
          value={formData.degree}
          onChange={handleInputChange}
          placeholder="e.g. B.Tech / Bachelor of Science"
          leftIcon={<GraduationCap className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.degree}
          required
        />

        <Input
          label="Branch / Field of Study"
          name="branch"
          value={formData.branch}
          onChange={handleInputChange}
          placeholder="e.g. Computer Science & Engineering"
          leftIcon={<BookOpen className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.branch}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Start Year"
          type="number"
          name="startYear"
          value={formData.startYear}
          onChange={handleInputChange}
          min="1950"
          max="2100"
          leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.startYear}
          required
        />

        <Input
          label="End Year"
          type="number"
          name="endYear"
          value={formData.endYear}
          onChange={handleInputChange}
          min="1950"
          max="2100"
          disabled={formData.current}
          leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.endYear}
        />

        <Input
          label="CGPA / Grade (Score)"
          type="number"
          step="0.01"
          name="cgpa"
          value={formData.cgpa}
          onChange={handleInputChange}
          placeholder="e.g. 8.5 or 3.9"
          leftIcon={<Award className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.cgpa}
          helperText="Out of 10 or 100 scale."
        />
      </div>

      <div className="pt-1">
        <Checkbox
          id="current-edu-checkbox"
          name="current"
          checked={formData.current}
          onChange={handleInputChange}
          label="I am currently studying here"
        />
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
          {initialValues ? 'Update Education' : 'Add Education Record'}
        </Button>
      </div>
    </form>
  );
};

export default EducationForm;
