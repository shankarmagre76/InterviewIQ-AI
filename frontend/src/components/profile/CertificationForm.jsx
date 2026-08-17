import React, { useState, useEffect } from 'react';
import { Award, Save, X, Calendar, ExternalLink, ShieldCheck, Building2, Hash } from 'lucide-react';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;

export const CertificationForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    doesNotExpire: false,
    credentialId: '',
    credentialUrl: '',
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
        title: initialValues.title || initialValues.name || '',
        issuingOrganization: initialValues.issuingOrganization || '',
        issueDate: formatDateStr(initialValues.issueDate),
        expiryDate: formatDateStr(initialValues.expiryDate),
        doesNotExpire: Boolean(initialValues.doesNotExpire),
        credentialId: initialValues.credentialId || '',
        credentialUrl: initialValues.credentialUrl || '',
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
    const trimmedOrg = formData.issuingOrganization.trim();

    if (!trimmedTitle) {
      errors.title = 'Certification name is required.';
    } else if (trimmedTitle.length > 100) {
      errors.title = 'Certification name cannot exceed 100 characters.';
    }

    if (!trimmedOrg) {
      errors.issuingOrganization = 'Issuing organization is required.';
    } else if (trimmedOrg.length > 100) {
      errors.issuingOrganization = 'Issuing organization cannot exceed 100 characters.';
    }

    if (formData.credentialId && formData.credentialId.trim().length > 100) {
      errors.credentialId = 'Credential ID cannot exceed 100 characters.';
    }

    if (formData.credentialUrl && formData.credentialUrl.trim()) {
      if (!URL_REGEX.test(formData.credentialUrl.trim())) {
        errors.credentialUrl = 'Please enter a valid Credential URL.';
      }
    }

    if (!formData.doesNotExpire && formData.expiryDate && formData.issueDate) {
      const issue = new Date(formData.issueDate);
      const expiry = new Date(formData.expiryDate);
      if (expiry < issue) {
        errors.expiryDate = 'Expiry date cannot be prior to issue date.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      name: formData.title.trim(),
      issuingOrganization: formData.issuingOrganization.trim(),
      issueDate: formData.issueDate || null,
      expiryDate: formData.doesNotExpire ? null : (formData.expiryDate || null),
      doesNotExpire: Boolean(formData.doesNotExpire),
      credentialId: formData.credentialId.trim(),
      credentialUrl: formData.credentialUrl.trim(),
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-4 ${className}`.trim()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Certification Name"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g. AWS Certified Solutions Architect"
          leftIcon={<Award className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.title}
          required
        />

        <Input
          label="Issuing Organization"
          name="issuingOrganization"
          value={formData.issuingOrganization}
          onChange={handleInputChange}
          placeholder="e.g. Amazon Web Services / Meta / Coursera"
          leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.issuingOrganization}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Credential ID / License Number"
          name="credentialId"
          value={formData.credentialId}
          onChange={handleInputChange}
          placeholder="e.g. AWS-12345678"
          leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.credentialId}
        />

        <Input
          label="Verification URL"
          name="credentialUrl"
          value={formData.credentialUrl}
          onChange={handleInputChange}
          placeholder="https://credly.com/badges/your-badge"
          leftIcon={<ExternalLink className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.credentialUrl}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Issue Date"
          type="date"
          name="issueDate"
          value={formData.issueDate}
          onChange={handleInputChange}
          leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
        />

        <Input
          label="Expiration Date"
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleInputChange}
          disabled={formData.doesNotExpire}
          leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          error={fieldErrors.expiryDate}
        />
      </div>

      <div className="pt-1">
        <Checkbox
          id="does-not-expire-checkbox"
          name="doesNotExpire"
          checked={formData.doesNotExpire}
          onChange={handleInputChange}
          label="This certification does not expire"
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
          {initialValues ? 'Update Certification' : 'Add Certification Record'}
        </Button>
      </div>
    </form>
  );
};

export default CertificationForm;
