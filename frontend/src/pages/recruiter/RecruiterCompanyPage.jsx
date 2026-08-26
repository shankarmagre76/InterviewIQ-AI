import React, { useState, useEffect } from 'react';
import { Building2, Save, Globe, MapPin, Users, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/LoadingState';
import { useAuth } from '../../hooks/useAuth';

const INDUSTRIES = [
  'Software Development',
  'Information Technology',
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

export const RecruiterCompanyPage = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState([]);

  const [form, setForm] = useState({
    companyName: '',
    industry: 'Software Development',
    website: '',
    headquarters: '',
    companySize: '11-50',
    foundedYear: new Date().getFullYear(),
    email: user?.email || '',
    phone: '',
    hiringStatus: 'Actively Hiring',
    description: '',
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await api.get('/companies/my-company');
        const comp = res.data?.data;
        if (comp && comp._id) {
          setCompany(comp);
          setForm({
            companyName: comp.companyName || comp.name || '',
            industry: comp.industry || 'Software Development',
            website: comp.website || '',
            headquarters: comp.headquarters || comp.location || '',
            companySize: comp.companySize || '11-50',
            foundedYear: comp.foundedYear || 2020,
            email: comp.email || user?.email || '',
            phone: comp.phone || '',
            hiringStatus: comp.hiringStatus || 'Actively Hiring',
            description: comp.description || '',
          });
        } else {
          setCompany(null);
        }
      } catch (err) {
        console.error('Failed to fetch company profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrors([]);

    const payload = {
      ...form,
      foundedYear: Number(form.foundedYear) || 2020,
    };

    try {
      if (company?._id) {
        const res = await api.put(`/companies/${company._id}`, payload);
        if (res.data?.data) setCompany(res.data.data);
        setMessage('Company profile updated successfully!');
      } else {
        const res = await api.post('/companies', payload);
        if (res.data?.data) setCompany(res.data.data);
        setMessage('Company profile created successfully!');
      }
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes?.errors && Array.isArray(errRes.errors)) {
        setErrors(errRes.errors.map((e) => e.message || e.msg));
      } else {
        setMessage(errRes?.message || 'Failed to save company profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400 font-medium">Loading Company Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-400" /> {company?._id ? 'Company Profile' : 'Create Company Profile'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {company?._id
            ? 'Manage your organization details, hiring status, contact info, and company profile.'
            : 'Set up your company profile once to post and manage job listings.'}
        </p>
      </div>

      {!company?._id && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          No company profile found. Please create your organization's company profile below before posting jobs.
        </div>
      )}

      {message && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          {message}
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
          <div className="font-bold">Please resolve the following errors:</div>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="e.g. NexaSphere Technologies"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry *</label>
            <select
              name="industry"
              value={form.industry}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website URL *</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="https://company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Headquarters Location *</label>
            <input
              type="text"
              name="headquarters"
              value={form.headquarters}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Pune, India or San Francisco, CA"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Size *</label>
            <select
              name="companySize"
              value={form.companySize}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} employees
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Founded Year *</label>
            <input
              type="number"
              name="foundedYear"
              value={form.foundedYear}
              onChange={handleChange}
              required
              min="1800"
              max={new Date().getFullYear()}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="2020"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="contact@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hiring Status</label>
            <select
              name="hiringStatus"
              value={form.hiringStatus}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              {HIRING_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Description * (min 10 characters)</label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
            minLength={10}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            placeholder="Describe your company mission, core solutions, and tech stack..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Profile...' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterCompanyPage;
