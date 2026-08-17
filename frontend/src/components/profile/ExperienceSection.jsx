import React, { useState } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Alert } from '../ui/Alert';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard } from '../ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { ExperienceCard } from './ExperienceCard';
import { ExperienceForm } from './ExperienceForm';

export const ExperienceSection = ({
  experienceList = [],
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  loading = false,
  error = null,
  className = '',
}) => {
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenAddModal = () => {
    setEditingExperience(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingExperience(item);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExperience(null);
    setFormError('');
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingExperience) {
        if (onUpdateExperience) {
          await onUpdateExperience(editingExperience._id, formData);
        }
        toast.success('Experience record updated successfully!');
      } else {
        if (onAddExperience) {
          await onAddExperience(formData);
        }
        toast.success('New work experience added successfully!');
      }
      handleCloseModal();
    } catch (err) {
      const msg = err?.message || 'Failed to save experience record.';
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
      if (onDeleteExperience) {
        await onDeleteExperience(deletingId);
      }
      toast.success('Experience record deleted successfully!');
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete experience record.');
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
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span>Work Experience & History</span>
              <Badge variant="neutral" size="xs" className="ml-1">
                {experienceList.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Professional employment history, job titles, companies, and roles.
            </CardDescription>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            Add Experience
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="danger" title="Error Loading Work Experience">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-32" />
          </div>
        ) : experienceList.length > 0 ? (
          <div className="space-y-3">
            {experienceList.map((item) => (
              <ExperienceCard
                key={item._id || item.id}
                experience={item}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="w-10 h-10 text-emerald-400" />}
            title="No Work Experience Added Yet"
            description="Add your previous software engineering internships, full-time roles, or freelance work to highlight your candidate profile."
            primaryAction={{
              label: 'Add First Experience',
              onClick: handleOpenAddModal,
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        )}
      </CardContent>

      {/* Add / Edit Experience Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingExperience ? 'Edit Work Experience' : 'Add Work Experience'}
        description="Fill out job position, company name, employment type, dates, and responsibilities."
        size="lg"
      >
        {formError && (
          <Alert variant="danger" title="Form Error" className="mb-4" onClose={() => setFormError('')}>
            {formError}
          </Alert>
        )}

        <ExperienceForm
          initialValues={editingExperience}
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
        title="Delete Work Experience"
        description="Are you sure you want to remove this work experience record from your profile? This action cannot be undone."
        confirmText="Delete Experience"
        variant="danger"
        isLoading={isDeleting}
      />
    </Card>
  );
};

export default ExperienceSection;
