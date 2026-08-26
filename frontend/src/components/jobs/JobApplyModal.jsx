import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert } from '../ui/Alert';

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
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState('form'); // 'form' | 'review' | 'success'
  const [activeResume, setActiveResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setCoverLetter('');
      setSubmittedApplication(null);
      setError(null);
      fetchActiveResume();
    }
  }, [isOpen]);


  const fetchActiveResume = async () => {
    setLoadingResume(true);
    setError(null);
    try {
      const response = await resumeService.getResume();
      const resData = response?.data || response;
      setActiveResume(resData);
    } catch {
      setActiveResume(null);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleGoToReview = (e) => {
    e.preventDefault();
    if (!activeResume || !activeResume._id) {
      setError('Please upload a PDF resume document first before submitting an application.');
      return;
    }
    setError(null);
    setStep('review');
  };

  const handleConfirmSubmit = async () => {
    if (!job || !activeResume) return;

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

      const response = await applicationService.applyJob(payload);
      const appResult = response?.data || response;

      setSubmittedApplication(appResult);
      setStep('success');
      toast.success(`Application submitted successfully for ${job.title}!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      const parsedErr = parseApiError(err);
      setError(parsedErr);
      toast.error(parsedErr);
      setStep('form'); // Return to form step on error
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewApplications = () => {
    onClose();
    navigate('/applications');
  };

  if (!job) return null;

  const companyName = job.company?.companyName || job.companyName || 'Company';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'success'
          ? 'Application Submitted!'
          : step === 'review'
          ? 'Review Application'
          : `Apply for ${job.title}`
      }
      size="md"
    >
      {/* -------------------------------------------------------------------------- */}
      {/* STEP 1: Application Form */}
      {/* -------------------------------------------------------------------------- */}
      {step === 'form' && (
        <form onSubmit={handleGoToReview} className="space-y-5 text-xs sm:text-sm">
          {error && (
            <Alert variant="danger" title="Application Error" onClose={() => setError(null)}>
              {error}
            </Alert>
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
                  type="button"
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
              <label htmlFor="job-cover-letter-input" className="font-bold text-slate-200 block">
                Cover Letter / Message to Recruiter <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {coverLetter.length} / 5000
              </span>
            </div>

            <Textarea
              id="job-cover-letter-input"
              rows={5}
              maxLength={5000}
              placeholder="Introduce yourself and explain why you're a great fit for this position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="resize-none font-sans text-xs"
            />
          </div>


          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!activeResume}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Review
            </Button>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* STEP 2: Application Review & Confirm */}
      {/* -------------------------------------------------------------------------- */}
      {step === 'review' && (
        <div className="space-y-5 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  {companyName}
                </span>
                <h4 className="font-bold text-slate-100 text-base">{job.title}</h4>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Attached Resume:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {activeResume?.fileName || 'Active_Resume.pdf'}
                </span>
              </div>

              {coverLetter && (
                <div className="space-y-1 pt-1">
                  <span className="text-slate-400 block">Cover Letter Preview:</span>
                  <p className="italic text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 line-clamp-3">
                    "{coverLetter}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep('form')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={submitting}
              disabled={submitting}
              onClick={handleConfirmSubmit}
              leftIcon={<Send className="w-4 h-4" />}
              className="shadow-lg shadow-indigo-600/20"
            >
              Confirm & Submit Application
            </Button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* STEP 3: Success Confirmation Screen */}
      {/* -------------------------------------------------------------------------- */}
      {step === 'success' && (
        <div className="py-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-slate-100">Application Submitted!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your job application for <strong className="text-indigo-300">{job.title}</strong> at{' '}
              <strong className="text-indigo-300">{companyName}</strong> has been successfully registered.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleViewApplications}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              View My Applications
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default JobApplyModal;
