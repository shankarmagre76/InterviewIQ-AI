import React, { useState, useEffect } from 'react';
import { Link2, GitBranch, Globe, Code2, Terminal, Code, Save, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;

export const SocialLinksForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    linkedin: '',
    github: '',
    portfolio: '',
    leetcode: '',
    hackerrank: '',
    codechef: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        linkedin: initialValues.linkedin || '',
        github: initialValues.github || '',
        portfolio: initialValues.portfolio || '',
        leetcode: initialValues.leetcode || '',
        hackerrank: initialValues.hackerrank || '',
        codechef: initialValues.codechef || '',
      });
    }
  }, [initialValues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};

    const platforms = ['linkedin', 'github', 'portfolio', 'leetcode', 'hackerrank', 'codechef'];

    platforms.forEach((platform) => {
      const val = formData[platform]?.trim();
      if (val && !URL_REGEX.test(val)) {
        errors[platform] = `Please enter a valid ${platform} URL.`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      linkedin: formData.linkedin.trim(),
      github: formData.github.trim(),
      portfolio: formData.portfolio.trim(),
      leetcode: formData.leetcode.trim(),
      hackerrank: formData.hackerrank.trim(),
      codechef: formData.codechef.trim(),
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-4 ${className}`.trim()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="LinkedIn Profile"
          name="linkedin"
          value={formData.linkedin}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/username"
          leftIcon={<Link2 className="w-4 h-4 text-blue-400" />}
          error={fieldErrors.linkedin}
        />

        <Input
          label="GitHub Profile"
          name="github"
          value={formData.github}
          onChange={handleInputChange}
          placeholder="https://github.com/username"
          leftIcon={<GitBranch className="w-4 h-4 text-slate-300" />}
          error={fieldErrors.github}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Personal Portfolio / Website"
          name="portfolio"
          value={formData.portfolio}
          onChange={handleInputChange}
          placeholder="https://myportfolio.dev"
          leftIcon={<Globe className="w-4 h-4 text-emerald-400" />}
          error={fieldErrors.portfolio}
        />

        <Input
          label="LeetCode Profile"
          name="leetcode"
          value={formData.leetcode}
          onChange={handleInputChange}
          placeholder="https://leetcode.com/username"
          leftIcon={<Code2 className="w-4 h-4 text-amber-400" />}
          error={fieldErrors.leetcode}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="HackerRank Profile"
          name="hackerrank"
          value={formData.hackerrank}
          onChange={handleInputChange}
          placeholder="https://hackerrank.com/username"
          leftIcon={<Terminal className="w-4 h-4 text-emerald-400" />}
          error={fieldErrors.hackerrank}
        />

        <Input
          label="CodeChef Profile"
          name="codechef"
          value={formData.codechef}
          onChange={handleInputChange}
          placeholder="https://codechef.com/users/username"
          leftIcon={<Code className="w-4 h-4 text-rose-400" />}
          error={fieldErrors.codechef}
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
          Save Social Links
        </Button>
      </div>
    </form>
  );
};

export default SocialLinksForm;
