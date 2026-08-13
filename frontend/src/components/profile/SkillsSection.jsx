import React, { useState, useMemo } from 'react';
import { Code2, Plus, Search, Filter, Sparkles, AlertCircle, Edit2, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Alert } from '../ui/Alert';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard } from '../ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { SkillBadge } from './SkillBadge';

const POPULAR_RECOMMENDATIONS = [
  'React.js',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'Tailwind CSS',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Next.js',
  'AWS',
  'Git',
  'GraphQL',
  'REST API',
];

export const SkillsSection = ({
  skillsList = [],
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  loading = false,
  error = null,
  readOnly = false,
  className = '',
}) => {
  const toast = useToast();

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('All');

  const [editingSkill, setEditingSkill] = useState(null);
  const [editLevel, setEditLevel] = useState('Beginner');
  const [editName, setEditName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Duplicate Check (Case-insensitive)
  const isDuplicate = useMemo(() => {
    if (!newSkillName.trim()) return false;
    const normalized = newSkillName.trim().toLowerCase();
    return skillsList.some((s) => s.name?.trim().toLowerCase() === normalized);
  }, [newSkillName, skillsList]);

  // Filtered skills based on searchQuery and level filter
  const filteredSkills = useMemo(() => {
    return skillsList.filter((s) => {
      const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesLevel = selectedLevelFilter === 'All' || s.level === selectedLevelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [skillsList, searchQuery, selectedLevelFilter]);

  const levelCounts = useMemo(() => {
    const counts = { All: skillsList.length, Advanced: 0, Intermediate: 0, Beginner: 0 };
    skillsList.forEach((s) => {
      if (counts[s.level] !== undefined) {
        counts[s.level] += 1;
      }
    });
    return counts;
  }, [skillsList]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');

    const trimmed = newSkillName.trim();
    if (!trimmed) {
      setAddError('Skill name is required.');
      return;
    }
    if (trimmed.length > 50) {
      setAddError('Skill name cannot exceed 50 characters.');
      return;
    }
    if (isDuplicate) {
      setAddError(`Skill "${trimmed}" is already added to your profile.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onAddSkill) {
        await onAddSkill({ name: trimmed, level: newSkillLevel });
      }
      toast.success(`Added skill "${trimmed}" (${newSkillLevel})`);
      setNewSkillName('');
      setNewSkillLevel('Beginner');
    } catch (err) {
      const msg = err?.message || 'Failed to add skill.';
      setAddError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (skillName) => {
    if (skillsList.some((s) => s.name?.trim().toLowerCase() === skillName.toLowerCase())) {
      toast.info(`"${skillName}" is already in your skills list.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onAddSkill) {
        await onAddSkill({ name: skillName, level: 'Intermediate' });
      }
      toast.success(`Added "${skillName}" (Intermediate)`);
    } catch (err) {
      toast.error(err?.message || `Failed to add ${skillName}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (skill) => {
    setEditingSkill(skill);
    setEditName(skill.name || '');
    setEditLevel(skill.level || 'Beginner');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSkill) return;
    setIsSubmitting(true);
    try {
      if (onUpdateSkill) {
        await onUpdateSkill(editingSkill._id, { name: editName.trim(), level: editLevel });
      }
      toast.success(`Updated skill "${editName.trim()}"`);
      setIsEditModalOpen(false);
      setEditingSkill(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to update skill level.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      if (onDeleteSkill) {
        await onDeleteSkill(deletingId);
      }
      toast.success('Skill removed from profile.');
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to remove skill.');
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
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span>Skills & Technical Competencies</span>
              <Badge variant="neutral" size="xs" className="ml-1">
                {skillsList.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Technical stack, frameworks, and programming proficiencies.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Add Bar (Edit mode only) */}
        {!readOnly && (
          <form onSubmit={handleAddSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Add New Skill</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <Input
                  placeholder="e.g. React.js, Python, PostgreSQL"
                  value={newSkillName}
                  onChange={(e) => {
                    setNewSkillName(e.target.value);
                    if (addError) setAddError('');
                  }}
                  error={isDuplicate ? 'Skill already added to profile' : addError}
                />
              </div>

              <div className="sm:col-span-3">
                <Select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  options={[
                    { value: 'Beginner', label: 'Beginner' },
                    { value: 'Intermediate', label: 'Intermediate' },
                    { value: 'Advanced', label: 'Advanced' },
                  ]}
                />
              </div>

              <div className="sm:col-span-3">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting || isDuplicate || !newSkillName.trim()}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Skill
                </Button>
              </div>
            </div>

            {/* Popular Tech Suggestions Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Quick Recommendations:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {POPULAR_RECOMMENDATIONS.map((tech) => {
                  const isAdded = skillsList.some((s) => s.name?.toLowerCase() === tech.toLowerCase());
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => !isAdded && handleQuickAdd(tech)}
                      disabled={isAdded || isSubmitting}
                      className={`
                        px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1
                        ${
                          isAdded
                            ? 'bg-slate-950/40 text-slate-500 border-slate-800/60 cursor-not-allowed'
                            : 'bg-slate-900 text-slate-300 border-slate-700/60 hover:border-indigo-500/50 hover:text-white'
                        }
                      `.trim()}
                    >
                      <span>{tech}</span>
                      {isAdded ? (
                        <span className="text-[10px] text-slate-600">✓</span>
                      ) : (
                        <Plus className="w-3 h-3 text-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        )}

        {/* Global Error Alert */}
        {error && (
          <Alert variant="danger" title="Error Loading Skills">
            {error}
          </Alert>
        )}

        {/* Live Search & Filter Bar */}
        {skillsList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Level Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'Advanced', 'Intermediate', 'Beginner'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap
                    ${
                      selectedLevelFilter === lvl
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }
                  `.trim()}
                >
                  <span>{lvl}</span>
                  <span className="ml-1.5 text-[10px] font-mono text-slate-500">
                    ({levelCounts[lvl] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skills Chips Grid Display */}
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-8 w-28 rounded-xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : filteredSkills.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {filteredSkills.map((skill) => (
              <SkillBadge
                key={skill._id || skill.name}
                skill={skill}
                readOnly={readOnly}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        ) : skillsList.length > 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No skills match your filter "{searchQuery || selectedLevelFilter}".
          </p>
        ) : (
          <EmptyState
            icon={<Code2 className="w-10 h-10 text-indigo-400" />}
            title="No Skills Added Yet"
            description="Add technical programming languages, frameworks, or libraries to highlight your candidate profile."
            primaryAction={
              !readOnly
                ? {
                    label: 'Add React.js',
                    onClick: () => handleQuickAdd('React.js'),
                    icon: <Plus className="w-4 h-4" />,
                  }
                : undefined
            }
          />
        )}
      </CardContent>

      {/* Edit Skill Level Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Skill Level"
        description="Update skill name and technical proficiency level."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit} isLoading={isSubmitting}>
              Save Skill
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Skill Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <Select
            label="Proficiency Level"
            value={editLevel}
            onChange={(e) => setEditLevel(e.target.value)}
            options={[
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
            ]}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Skill"
        description="Are you sure you want to remove this skill from your profile?"
        confirmText="Remove Skill"
        variant="danger"
        isLoading={isDeleting}
      />
    </Card>
  );
};

export default SkillsSection;
