import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  History,
  RefreshCw,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Alert } from '../ui/Alert';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard } from '../ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { resumeService } from '../../services/resumeService';
import { parseApiError } from '../../utils/helpers';
import { ResumeCard } from './ResumeCard';
import { ResumeUpload } from './ResumeUpload';
import { ResumePreviewModal } from './ResumePreviewModal';

export const ResumeManagementSection = ({ className = '' }) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeResume, setActiveResume] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [activeRes, historyRes] = await Promise.allSettled([
        resumeService.getResume(),
        resumeService.getResumeHistory(),
      ]);

      if (activeRes.status === 'fulfilled' && activeRes.value?.data) {
        setActiveResume(activeRes.value.data);
      } else {
        setActiveResume(null);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value?.data) {
        setHistory(Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
      }
    } catch (err) {
      setErrorMsg(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUploadSuccess = (_newResume) => {
    setUploadModalOpen(false);
    setReplaceModalOpen(false);
    setSuccessMsg('Resume document uploaded and set as active!');
    toast.success('Resume uploaded successfully!');
    fetchResumes();
  };

  const handleDeleteClick = (id = null) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setErrorMsg('');
    try {
      if (deletingId) {
        await resumeService.deleteResumeById(deletingId);
      } else {
        await resumeService.deleteResume();
      }

      setSuccessMsg('Resume document deleted successfully.');
      toast.success('Resume deleted.');
      fetchResumes();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed);
      toast.error(parsed);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handlePreviewClick = (resumeItem) => {
    setPreviewResume(resumeItem);
    setPreviewModalOpen(true);
  };

  const handleAnalyzeClick = (resumeId = null) => {
    navigate('/resume/analysis', { state: { resumeId } });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {/* Notifications */}
      {errorMsg && (
        <Alert variant="danger" title="Error" onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" title="Success" onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Top Header Card */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Resume Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload, replace, and manage your software candidate resume documents.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => (activeResume ? setReplaceModalOpen(true) : setUploadModalOpen(true))}
          leftIcon={activeResume ? <RefreshCw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        >
          {activeResume ? 'Replace Resume' : 'Upload Resume'}
        </Button>
      </div>

      {/* Active Resume Section */}
      {activeResume ? (
        <div className="space-y-4">
          <ResumeCard
            resume={activeResume}
            onView={() => handlePreviewClick(activeResume)}
            onReplace={() => setReplaceModalOpen(true)}
            onDelete={() => handleDeleteClick()}
            onAnalyze={() => handleAnalyzeClick(activeResume._id)}
          />
        </div>
      ) : (
        <Card variant="glass" className="border-slate-800">
          <CardContent className="p-6">
            <EmptyState
              icon={FileText}
              title="No Resume Document Uploaded"
              description="Upload your latest PDF software engineering resume to get an instant AI ATS score breakdown."
              actionLabel="Upload PDF Resume"
              onAction={() => setUploadModalOpen(true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Historic Resumes Section (If candidate has past uploads) */}
      {history.length > 1 && (
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>Resume Upload History ({history.length - 1})</span>
            </CardTitle>
            <CardDescription>
              Previously uploaded resume versions stored for candidate records.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {history
              .filter((item) => item._id !== activeResume?._id)
              .map((pastResume) => (
                <ResumeCard
                  key={pastResume._id}
                  resume={pastResume}
                  onView={() => handlePreviewClick(pastResume)}
                  onDelete={() => handleDeleteClick(pastResume._id)}
                  onAnalyze={() => handleAnalyzeClick(pastResume._id)}
                />
              ))}
          </CardContent>
        </Card>
      )}

      {/* Resume PDF Interactive Preview Modal */}
      <ResumePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        resume={previewResume}
      />

      {/* Upload New Resume Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload PDF Resume"
        size="md"
      >
        <ResumeUpload onUploadSuccess={handleUploadSuccess} maxSizeMB={5} />
      </Modal>

      {/* Replace Active Resume Modal */}
      <Modal
        isOpen={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        title="Replace Active PDF Resume"
        size="md"
      >
        <div className="space-y-4">
          <Alert variant="info" title="Replacement Notice">
            Uploading a new PDF document will set it as your active candidate resume for ATS scoring.
          </Alert>
          <ResumeUpload onUploadSuccess={handleUploadSuccess} maxSizeMB={5} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Resume Document?"
        message="Are you sure you want to permanently delete this resume document? This action cannot be undone."
        confirmText="Delete Document"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );

};

export default ResumeManagementSection;
