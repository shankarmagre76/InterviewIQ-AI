import React, { useState } from 'react';
import { Award, Plus, Edit3, Trash2, Calendar, ExternalLink, ShieldCheck, Building2, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Alert } from '../ui/Alert';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard } from '../ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { CertificationForm } from './CertificationForm';

export const CertificationsSection = ({
  certificationsList = [],
  onAddCertification,
  onUpdateCertification,
  onDeleteCertification,
  loading = false,
  error = null,
  className = '',
}) => {
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenAddModal = () => {
    setEditingCert(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingCert(item);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
    setFormError('');
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingCert) {
        if (onUpdateCertification) {
          await onUpdateCertification(editingCert._id, formData);
        }
        toast.success('Certification updated successfully!');
      } else {
        if (onAddCertification) {
          await onAddCertification(formData);
        }
        toast.success('New certification added successfully!');
      }
      handleCloseModal();
    } catch (err) {
      const msg = err?.message || 'Failed to save certification.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      if (onDeleteCertification) {
        await onDeleteCertification(deletingId);
      }
      toast.success('Certification removed from profile.');
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to remove certification.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const dateObj = new Date(dateVal);
      return dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Certifications & Verified Credentials</span>
              <Badge variant="neutral" size="xs" className="ml-1">
                {certificationsList.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Professional licenses, cloud certifications, and technical credentials.
            </CardDescription>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            Add Certification
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="danger" title="Error Loading Certifications">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
        ) : certificationsList.length > 0 ? (
          <div className="space-y-3">
            {certificationsList.map((item) => {
              const certTitle = item.title || item.name || 'Untitled Certification';
              const issueFormatted = formatDate(item.issueDate);
              const expiryFormatted = item.doesNotExpire
                ? 'No Expiration'
                : formatDate(item.expiryDate);
              const dateDisplay = issueFormatted
                ? `Issued ${issueFormatted}${expiryFormatted ? ` • ${expiryFormatted}` : ''}`
                : null;

              return (
                <div
                  key={item._id || item.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4 overflow-hidden flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
                      <Award className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5 overflow-hidden flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-100 tracking-tight">
                          {certTitle}
                        </h4>

                        {item.doesNotExpire && (
                          <Badge variant="success" style="soft" size="xs" className="px-2">
                            Permanent
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-medium text-slate-300">
                        {item.issuingOrganization && (
                          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{item.issuingOrganization}</span>
                          </div>
                        )}

                        {dateDisplay && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{dateDisplay}</span>
                          </div>
                        )}
                      </div>

                      {item.credentialId && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-mono pt-0.5">
                          <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>ID: {item.credentialId}</span>
                        </div>
                      )}

                      {item.credentialUrl && (
                        <div className="pt-1">
                          <a
                            href={item.credentialUrl.startsWith('http') ? item.credentialUrl : `https://${item.credentialUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                            <span>Verify Credential</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenEditModal(item)}
                      title="Edit certification entry"
                      className="text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                      iconOnly={<Edit3 className="w-4 h-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setDeletingId(item._id)}
                      title="Delete certification entry"
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      iconOnly={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Award className="w-10 h-10 text-purple-400" />}
            title="No Certifications Added Yet"
            description="Add your AWS, Meta, Google, or professional certificates to boost your candidate verification score."
            primaryAction={{
              label: 'Add First Certification',
              onClick: handleOpenAddModal,
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        )}
      </CardContent>

      {/* Add / Edit Certification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCert ? 'Edit Certification' : 'Add Certification'}
        description="Fill out certification title, issuing organization, dates, credential ID, and verification link."
        size="lg"
      >
        {formError && (
          <Alert variant="danger" title="Form Error" className="mb-4" onClose={() => setFormError('')}>
            {formError}
          </Alert>
        )}

        <CertificationForm
          initialValues={editingCert}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Certification"
        description="Are you sure you want to remove this certification from your profile? This action cannot be undone."
        confirmText="Remove Certification"
        variant="danger"
        isLoading={isDeleting}
      />
    </Card>
  );
};

export default CertificationsSection;
