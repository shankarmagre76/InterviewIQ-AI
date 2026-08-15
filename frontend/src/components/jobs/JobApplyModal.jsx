import React, { useState, useEffect } from 'react';
import { Send, FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { resumeService } from '../../services/resumeService';
import { applicationService } from '../../services/applicationService';
import { parseApiError } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';

export const JobApplyModal = ({
  isOpen = false,
  onClose,
  job = null,
  onSuccess,
}) => {
  const toast = useToast();

  const [activeResume, setActiveResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchActiveResume();
      setCoverLetter('');
      setError(null);
    }
  }, [isOpen]);

  const fetchActiveResume = async () => {
    setLoadingResume(true);
    setError(null);
    try {
      const response = await resumeService.getResume();
      const resData = response?.data || response;
      setActiveResume(resData);
    } catch (err) {
      // 404 means candidate has no uploaded resume document
      setActiveResume(null);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!job) return;

    if (!activeResume || !activeResume._id) {
      setError('Please upload a PDF resume document first before submitting an application.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const companyId = job.company?._id || job.company;
      const payload = {
        job: job._id,
        company: companyId,
        resume: activeResume._id,
        coverLetter: coverLetter.trim(),
      };

      await applicationService.applyJob(payload);
      toast.success(`Application submitted successfully for ${job.title}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const parsedErr = parseApiError(err);
      setError(parsedErr);
      toast.error(parsedErr);
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for ${job.title}`}
      size="md"
    >
      <form onSubmit={handleSubmitApplication} className="space-y-5 text-xs sm:text-sm">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Resume Section */}
        <div className="space-y-2">
          <label className="font-bold text-slate-200 block">
            Selected Resume Document <span className="text-rose-400">*</span>
          </label>

          {loadingResume ? (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse h-16" />
          ) : activeResume ? (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold text-slate-100 block truncate">
                    {activeResume.fileName || 'Active_Resume.pdf'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    Verified candidate resume document
                  </span>
                </div>
              </div>

              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300 space-y-2 text-center">
              <p>No active resume document found on your account.</p>
              <Button
                size="xs"
                variant="outline"
                onClick={() => window.open('/resume', '_blank')}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload Resume in New Tab
              </Button>
            </div>
          )}
        </div>

        {/* Cover Letter Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-200 block">
              Cover Letter / Message to Recruiter <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {coverLetter.length} / 5000
            </span>
          </div>

          <textarea
            rows={5}
            maxLength={5000}
            placeholder="Introduce yourself and explain why you're a great fit for this position..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors font-sans resize-none"
          />
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            disabled={!activeResume || submitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit Job Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JobApplyModal;
