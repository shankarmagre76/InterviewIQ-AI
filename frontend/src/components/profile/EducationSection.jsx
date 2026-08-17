import React, { useState } from 'react';
import { GraduationCap, Plus, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Alert } from '../ui/Alert';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard } from '../ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { EducationCard } from './EducationCard';
import { EducationForm } from './EducationForm';

export const EducationSection = ({
  educationList = [],
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
  loading = false,
  error = null,
  className = '',
}) => {
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenAddModal = () => {
    setEditingEducation(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingEducation(item);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEducation(null);
    setFormError('');
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingEducation) {
        if (onUpdateEducation) {
          await onUpdateEducation(editingEducation._id, formData);
        }
        toast.success('Education record updated successfully!');
      } else {
        if (onAddEducation) {
          await onAddEducation(formData);
        }
        toast.success('New education record added successfully!');
      }
      handleCloseModal();
    } catch (err) {
      const msg = err?.message || 'Failed to save education record.';
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
      if (onDeleteEducation) {
        await onDeleteEducation(deletingId);
      }
      toast.success('Education record deleted successfully!');
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete education record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <span>Education & Academic Credentials</span>
              <Badge variant="neutral" size="xs" className="ml-1">
                {educationList.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Degree, specialization, university background, and graduation years.
            </CardDescription>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            Add Education
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="danger" title="Error Loading Education Records">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
        ) : educationList.length > 0 ? (
          <div className="space-y-3">
            {educationList.map((item) => (
              <EducationCard
                key={item._id || item.id}
                education={item}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<GraduationCap className="w-10 h-10 text-cyan-400" />}
            title="No Education Added Yet"
            description="Highlight your academic degree, university background, and GPA to improve your candidate score."
            primaryAction={{
              label: 'Add First Education',
              onClick: handleOpenAddModal,
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        )}
      </CardContent>

      {/* Add / Edit Education Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEducation ? 'Edit Education Record' : 'Add Education Record'}
        description="Fill out your academic degree, university name, specialization, and graduation year."
        size="lg"
      >
        {formError && (
          <Alert variant="danger" title="Form Error" className="mb-4" onClose={() => setFormError('')}>
            {formError}
          </Alert>
        )}

        <EducationForm
          initialValues={editingEducation}
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
        title="Delete Education Record"
        description="Are you sure you want to remove this education record from your profile? This action cannot be undone."
        confirmText="Delete Record"
        variant="danger"
        isLoading={isDeleting}
      />
    </Card>
  );
};

export default EducationSection;
