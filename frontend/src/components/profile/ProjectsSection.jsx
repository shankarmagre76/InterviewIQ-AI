import React, { useState } from 'react';
import { FolderGit2, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Alert } from '../ui/Alert';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard } from '../ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';

export const ProjectsSection = ({
  projectsList = [],
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  loading = false,
  error = null,
  className = '',
}) => {
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingProject(item);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormError('');
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingProject) {
        if (onUpdateProject) {
          await onUpdateProject(editingProject._id, formData);
        }
        toast.success('Project record updated successfully!');
      } else {
        if (onAddProject) {
          await onAddProject(formData);
        }
        toast.success('New project added successfully!');
      }
      handleCloseModal();
    } catch (err) {
      const msg = err?.message || 'Failed to save project record.';
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
      if (onDeleteProject) {
        await onDeleteProject(deletingId);
      }
      toast.success('Project record deleted successfully!');
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete project record.');
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
              <FolderGit2 className="w-5 h-5 text-amber-400" />
              <span>Projects & Open Source Portfolio</span>
              <Badge variant="neutral" size="xs" className="ml-1">
                {projectsList.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Personal projects, capstone software applications, GitHub repositories, and live demos.
            </CardDescription>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            Add Project
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="danger" title="Error Loading Projects">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-32" />
          </div>
        ) : projectsList.length > 0 ? (
          <div className="space-y-3">
            {projectsList.map((item) => (
              <ProjectCard
                key={item._id || item.id}
                project={item}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderGit2 className="w-10 h-10 text-amber-400" />}
            title="No Projects Added Yet"
            description="Showcase your GitHub repositories, full-stack applications, and live demos for AI Resume Analysis and Mock Interviews."
            primaryAction={{
              label: 'Add First Project',
              onClick: handleOpenAddModal,
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        )}
      </CardContent>

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'Edit Project Entry' : 'Add Project Entry'}
        description="Fill out project name, tech stack, GitHub repo, deployment URL, and key features."
        size="lg"
      >
        {formError && (
          <Alert variant="danger" title="Form Error" className="mb-4" onClose={() => setFormError('')}>
            {formError}
          </Alert>
        )}

        <ProjectForm
          initialValues={editingProject}
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
        title="Delete Project Entry"
        description="Are you sure you want to remove this project from your profile? This action cannot be undone."
        confirmText="Delete Project"
        variant="danger"
        isLoading={isDeleting}
      />
    </Card>
  );
};

export default ProjectsSection;
