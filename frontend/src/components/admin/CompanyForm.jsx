import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Button } from '../ui/Button.jsx';
import { Building2, Globe, Mail, MapPin, Calendar, Loader2 } from 'lucide-react';

const INDUSTRIES = [
  'Information Technology',
  'Software Development',
  'Finance',
  'Healthcare',
  'E-commerce',
  'EdTech',
  'AI/ML',
  'Cybersecurity',
  'Fintech',
  'Telecommunications',
  'Other',
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const HIRING_STATUSES = ['Actively Hiring', 'Hiring Freeze', 'Not Hiring', 'Closed'];

/**
 * CompanyForm Component (F10.6)
 * Modal form for creating or editing company profiles with client-side validation matching backend schema.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Object|null} [props.company=null] - Initial company document for editing (null for create)
 * @param {Function} props.onSubmit - Submission callback (formData) => Promise
 */
export const CompanyForm = ({
  isOpen,
  onClose,
  company = null,
  onSubmit,
}) => {
  const isEditing = Boolean(company && company._id);

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: INDUSTRIES[0],
    headquarters: '',
    companySize: COMPANY_SIZES[0],
    foundedYear: new Date().getFullYear(),
    email: '',
    phone: '',
    description: '',
    hiringStatus: HIRING_STATUSES[0],
    companyLogo: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        website: company.website || '',
        industry: company.industry || INDUSTRIES[0],
        headquarters: company.headquarters || '',
        companySize: company.companySize || COMPANY_SIZES[0],
        foundedYear: company.foundedYear || new Date().getFullYear(),
        email: company.email || '',
        phone: company.phone || '',
        description: company.description || '',
        hiringStatus: company.hiringStatus || HIRING_STATUSES[0],
        companyLogo: company.companyLogo || '',
      });
    } else {
      setFormData({
        companyName: '',
        website: '',
        industry: INDUSTRIES[0],
        headquarters: '',
        companySize: COMPANY_SIZES[0],
        foundedYear: new Date().getFullYear(),
        email: '',
        phone: '',
        description: '',
        hiringStatus: HIRING_STATUSES[0],
        companyLogo: '',
      });
    }
    setErrors({});
  }, [company, isOpen]);

  const validateForm = () => {
    const errs = {};
    if (!formData.companyName.trim() || formData.companyName.trim().length < 2) {
      errs.companyName = 'Company name must be at least 2 characters.';
    }
    if (!formData.website.trim()) {
      errs.website = 'Website URL is required.';
    } else if (!/^https?:\/\/.+/.test(formData.website.trim())) {
      errs.website = 'Website URL must begin with http:// or https://';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.';
    }
    if (!formData.headquarters.trim()) {
      errs.headquarters = 'Headquarters location is required.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Contact email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid contact email.';
    }
    if (!formData.foundedYear || formData.foundedYear < 1800 || formData.foundedYear > new Date().getFullYear()) {
      errs.foundedYear = `Founded year must be between 1800 and ${new Date().getFullYear()}.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Failed to submit company form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Company: ${company?.companyName}` : 'Create New Company Profile'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Company Name & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            type="text"
            placeholder="e.g. Acme Tech Solutions"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            error={errors.companyName}
            leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Website URL *"
            type="text"
            placeholder="https://acme.example.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            error={errors.website}
            leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
            required
          />
        </div>

        {/* Industry & Company Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Industry *"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            required
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </Select>

          <Select
            label="Company Size *"
            value={formData.companySize}
            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            required
          >
            {COMPANY_SIZES.map((sz) => (
              <option key={sz} value={sz}>
                {sz} employees
              </option>
            ))}
          </Select>
        </div>

        {/* Headquarters & Contact Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Headquarters Location *"
            type="text"
            placeholder="e.g. San Francisco, CA, USA"
            value={formData.headquarters}
            onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
            error={errors.headquarters}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Contact Email *"
            type="email"
            placeholder="careers@acme.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />
        </div>

        {/* Founded Year & Hiring Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Founded Year *"
            type="number"
            placeholder="2020"
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: Number(e.target.value) })}
            error={errors.foundedYear}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
            required
          />

          <Select
            label="Hiring Status *"
            value={formData.hiringStatus}
            onChange={(e) => setFormData({ ...formData, hiringStatus: e.target.value })}
            required
          >
            {HIRING_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Select>
        </div>

        {/* Company Description */}
        <Textarea
          label="Company Description *"
          placeholder="Provide an overview of the company, product focus, work culture..."
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
          required
        />

        {/* Form Action Buttons */}
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
            {isEditing ? 'Save Changes' : 'Create Company'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyForm;
