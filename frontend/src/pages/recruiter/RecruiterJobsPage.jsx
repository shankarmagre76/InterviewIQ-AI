import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, Edit, Trash2, Building2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/LoadingState';
import { Badge } from '../../components/ui/Badge';

export const RecruiterJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [myCompany, setMyCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const defaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    location: '',
    workMode: 'Remote',
    employmentType: 'Full-time',
    minExpYears: 1,
    maxExpYears: 5,
    salaryMin: 50000,
    salaryMax: 100000,
    applicationDeadline: defaultDeadline(),
    status: 'Active',
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, companyRes] = await Promise.all([
        api.get('/jobs/my-jobs'),
        api.get('/companies/my-company'),
      ]);
      if (jobsRes.data?.success) {
        setJobs(jobsRes.data.data?.items || jobsRes.data.data || []);
      }
      if (companyRes.data?.success) {
        setMyCompany(companyRes.data.data || null);
      }
    } catch (err) {
      console.error('Failed to fetch recruiter jobs or company profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenModal = (job = null) => {
    if (!job && !myCompany) {
      alert('You must create your Company Profile first before posting job listings.');
      navigate('/recruiter/company');
      return;
    }

    setErrors([]);
    setMessage(null);
    if (job) {
      setEditingJob(job);
      setForm({
        title: job.title || '',
        description: job.description || '',
        requiredSkills: Array.isArray(job.requiredSkills)
          ? job.requiredSkills.join(', ')
          : Array.isArray(job.skills)
          ? job.skills.join(', ')
          : '',
        location: job.location || 'Remote',
        workMode: job.workMode || 'Remote',
        employmentType: job.employmentType || 'Full-time',
        minExpYears: job.experience?.minYears ?? job.minExp ?? 1,
        maxExpYears: job.experience?.maxYears ?? job.maxExp ?? 5,
        salaryMin: job.salary?.min ?? job.salaryRange?.min ?? 50000,
        salaryMax: job.salary?.max ?? job.salaryRange?.max ?? 100000,
        applicationDeadline: job.applicationDeadline
          ? new Date(job.applicationDeadline).toISOString().split('T')[0]
          : defaultDeadline(),
        status: job.status || 'Active',
      });
    } else {
      setEditingJob(null);
      setForm({
        title: '',
        description: '',
        requiredSkills: '',
        location: 'Remote',
        workMode: 'Remote',
        employmentType: 'Full-time',
        minExpYears: 1,
        maxExpYears: 5,
        salaryMin: 50000,
        salaryMax: 100000,
        applicationDeadline: defaultDeadline(),
        status: 'Active',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    setMessage(null);

    if (!editingJob && !myCompany?._id) {
      setErrors(['You need to create your company profile before posting a job.']);
      setSaving(false);
      return;
    }

    const skillsArray = form.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: form.title,
      description: form.description,
      requiredSkills: skillsArray.length > 0 ? skillsArray : ['Software Development'],
      experience: {
        minYears: Number(form.minExpYears) || 0,
        maxYears: Number(form.maxExpYears) || 5,
      },
      salary: {
        min: Number(form.salaryMin) || 0,
        max: Number(form.salaryMax) || 0,
        currency: 'USD',
        period: 'Yearly',
        isDisclosed: true,
      },
      location: form.location || 'Remote',
      workMode: form.workMode,
      employmentType: form.employmentType,
      applicationDeadline: new Date(form.applicationDeadline).toISOString(),
      status: form.status,
    };

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes?.errors && Array.isArray(errRes.errors)) {
        setErrors(errRes.errors.map((e) => e.message || e.msg));
      } else {
        setMessage(errRes?.message || 'Failed to save job listing');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400 font-medium">Loading Job Postings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" /> Manage Job Postings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, update, and manage candidate applications for your company's open roles.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Create New Job Posting
        </button>
      </div>

      {/* No Company Profile Warning Notice */}
      {!myCompany && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>You haven't set up a Company Profile yet. A Company Profile is required before posting job listings.</span>
          </div>
          <Link
            to="/recruiter/company"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shrink-0"
          >
            Create Company Profile
          </Link>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No active job listings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't posted any job listings yet. Click the button above to publish your first position.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-white line-clamp-1">{job.title}</h3>
                  <Badge variant={job.status === 'Active' ? 'success' : 'neutral'} size="sm">
                    {job.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <Badge variant="primary" style="soft" size="sm">{job.workMode || 'Remote'}</Badge>
                  <Badge variant="neutral" style="soft" size="sm">{job.employmentType || 'Full-time'}</Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{job.location || 'Location Unspecified'}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(job)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition-colors cursor-pointer"
                    title="Edit Job"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs transition-colors cursor-pointer"
                    title="Delete Job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Job */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white">
              {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h2>

            {message && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
                {message}
              </div>
            )}

            {errors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
                <div className="font-bold">Please resolve the following errors:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company</label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-medium">
                  {myCompany?.companyName || 'Your Company Profile'}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Description * (min 20 characters)</label>
                <textarea
                  rows="3"
                  required
                  minLength={20}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe key responsibilities and technical role details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Required Skills * (comma separated)</label>
                <input
                  type="text"
                  required
                  value={form.requiredSkills}
                  onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                  placeholder="e.g. React, Node.js, TypeScript, MongoDB"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Mode *</label>
                  <select
                    value={form.workMode}
                    onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Type *</label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={form.applicationDeadline}
                    onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={form.minExpYears}
                    onChange={(e) => setForm({ ...form, minExpYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={form.maxExpYears}
                    onChange={(e) => setForm({ ...form, maxExpYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !myCompany}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Spinner size="sm" /> : null}
                  <span>{saving ? 'Saving...' : 'Save Job Posting'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobsPage;
