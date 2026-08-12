import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Layout,
  Sliders,
  Bell,
  Table as TableIcon,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Trash2,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Award,
} from 'lucide-react';

import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Avatar,
  Modal,
  Tabs,
  Tooltip,
  Alert,
  ToastProvider,
  useToast,
  Spinner,
  SkeletonCard,
  ErrorState,
  ConfirmDialog,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  StatCard,
  ProgressBar,
  ProgressCircle,
} from './ui';

function ColorSwatch({ name, hex, bg }) {
  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
      <div className={`h-10 rounded-lg shadow-inner ${bg}`} />
      <div>
        <p className="text-xs font-semibold text-slate-200">{name}</p>
        <p className="text-[10px] text-slate-400 font-mono">{hex}</p>
      </div>
    </div>
  );
}

export function DesignSystemShowcaseContent() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // Form State
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('senior');
  const [selectVal, setSelectVal] = useState('react');
  const [currentPage, setCurrentPage] = useState(1);

  const toast = useToast();

  const showcaseTabs = [
    { id: 'tokens', label: 'Colors & Typography', icon: <Palette className="w-4 h-4" /> },
    { id: 'buttons', label: 'Buttons, Badges & Avatars', icon: <Sliders className="w-4 h-4" /> },
    { id: 'inputs', label: 'Form Controls (Checkboxes & Radios)', icon: <FileText className="w-4 h-4" /> },
    { id: 'cards', label: 'Cards & Glassmorphism', icon: <Layout className="w-4 h-4" /> },
    { id: 'feedback', label: 'Alerts, Toasts & Modals', icon: <Bell className="w-4 h-4" /> },
    { id: 'data', label: 'Tables, Stats & Progress', icon: <TableIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 p-4 sm:p-8 lg:p-12 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              InterviewIQ <span className="text-indigo-400">Component Library</span>
            </h1>
            <p className="text-xs text-slate-400">Phase F1.8 — Complete Reusable Component Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" style="soft" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Tailwind v4 & 24 Primitives
          </Badge>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <Tabs tabs={showcaseTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main Panel */}
      <main className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* TAB 1: TOKENS */}
        {activeTab === 'tokens' && (
          <div className="space-y-8">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Brand & Status Color Tokens</CardTitle>
                <CardDescription>Tailwind v4 color palette configured for high-contrast accessibility.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <ColorSwatch name="Electric Indigo" hex="#6366f1" bg="bg-indigo-500" />
                  <ColorSwatch name="Cyan Accent" hex="#06b6d4" bg="bg-cyan-500" />
                  <ColorSwatch name="Success Emerald" hex="#10b981" bg="bg-emerald-500" />
                  <ColorSwatch name="Warning Amber" hex="#f59e0b" bg="bg-amber-500" />
                  <ColorSwatch name="Danger Rose" hex="#f43f5e" bg="bg-rose-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: BUTTONS, BADGES & AVATARS */}
        {activeTab === 'buttons' && (
          <div className="space-y-8">
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Buttons & Interactive Controls</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setBtnLoading(!btnLoading)} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                    {btnLoading ? 'Disable Loading' : 'Enable Loading'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" isLoading={btnLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Primary Action
                  </Button>
                  <Button variant="secondary" isLoading={btnLoading} leftIcon={<Sparkles className="w-4 h-4" />}>
                    Secondary Action
                  </Button>
                  <Button variant="outline" isLoading={btnLoading}>Outline</Button>
                  <Button variant="ghost" isLoading={btnLoading}>Ghost</Button>
                  <Button variant="danger" isLoading={btnLoading} leftIcon={<Trash2 className="w-4 h-4" />}>Delete</Button>
                  <Button variant="success" isLoading={btnLoading} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Passed</Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Avatars & Tooltips</CardTitle>
                <CardDescription>Profile avatars with size & status indicators, plus popover tooltips.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-6">
                <Tooltip content="Candidate Avatar (Small)" placement="top">
                  <Avatar name="Jane Doe" size="sm" status="online" />
                </Tooltip>

                <Tooltip content="Candidate Avatar (Medium)" placement="top">
                  <Avatar name="Alex Smith" size="md" status="away" />
                </Tooltip>

                <Tooltip content="Candidate Avatar (Large)" placement="top">
                  <Avatar name="Sam Wilson" size="lg" status="offline" />
                </Tooltip>

                <Tooltip content="Admin Profile (Extra Large)" placement="top">
                  <Avatar name="Admin User" size="xl" status="online" />
                </Tooltip>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: INPUTS, CHECKBOXES & RADIOS */}
        {activeTab === 'inputs' && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Form Inputs, Checkboxes & Radio Groups</CardTitle>
              <CardDescription>Accessible inputs with validation and selection controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Candidate Email" placeholder="candidate@example.com" leftIcon={<Mail className="w-4 h-4" />} />
                <Input label="Security Token" type="password" value="secret" leftIcon={<Lock className="w-4 h-4" />} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Checkboxes</h4>
                  <Checkbox
                    label="Enable Real-Time Gemini AI Voice Feedback"
                    helperText="Required for audio mock interview practice."
                    checked={checkboxVal}
                    onChange={(e) => setCheckboxVal(e.target.checked)}
                  />
                  <Checkbox label="Opt-in to weekly ATS score digest" checked={false} />
                  <Checkbox label="Disabled option" disabled />
                </div>

                <div className="space-y-4">
                  <RadioGroup
                    label="Select Experience Tier"
                    name="expTier"
                    value={radioVal}
                    onChange={setRadioVal}
                    options={[
                      { value: 'junior', label: 'Junior (0-2 YOE)' },
                      { value: 'mid', label: 'Mid-Level (3-5 YOE)' },
                      { value: 'senior', label: 'Senior (5-8 YOE)' },
                    ]}
                  />

                  <Select label="Primary Tech Stack" value={selectVal} onChange={(e) => setSelectVal(e.target.value)}>
                    <option value="react">React / Next.js</option>
                    <option value="node">Node.js / Express</option>
                    <option value="python">Python / FastAPI</option>
                  </Select>
                </div>
              </div>

              <Textarea label="Custom Candidate Intro" rows={3} placeholder="Tell Gemini about your target role..." />
            </CardContent>
          </Card>
        )}

        {/* TAB 4: CARDS */}
        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Opaque Slate Card</CardTitle>
              </CardHeader>
              <CardContent>Standard dark slate card for dashboard widgets.</CardContent>
            </Card>
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-indigo-300">Glassmorphism Card</CardTitle>
              </CardHeader>
              <CardContent>Backdrop blur panel overlay.</CardContent>
            </Card>
            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Hover Card</CardTitle>
              </CardHeader>
              <CardContent>Hover to trigger indigo elevation glow.</CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="space-y-8">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Toast Notification Triggers</CardTitle>
                <CardDescription>Click to test floating system toast notifications.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <Button variant="success" size="sm" onClick={() => toast.success('ATS Resume Analysis Saved!')}>
                  Trigger Success Toast
                </Button>
                <Button variant="danger" size="sm" onClick={() => toast.error('Failed to submit interview answer!')}>
                  Trigger Error Toast
                </Button>
                <Button variant="secondary" size="sm" onClick={() => toast.warning('Audio input levels low!')}>
                  Trigger Warning Toast
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.info('Gemini 1.5 Pro Session Initialized')}>
                  Trigger Info Toast
                </Button>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>System Banner Alerts & Confirm Dialog</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAlert && (
                  <Alert variant="info" title="System Operational" onClose={() => setShowAlert(false)}>
                    All 24 component primitives have passed accessibility and contrast checks.
                  </Alert>
                )}
                <Button variant="danger" size="sm" onClick={() => setIsConfirmOpen(true)}>
                  Trigger Confirm Dialog
                </Button>
              </CardContent>
            </Card>

            <ErrorState
              title="API Timeout Connection Error"
              message="Could not connect to backend server. Please verify backend process is active on port 5000."
              onRetry={() => alert('Retrying...')}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Test Modal Popup">
              Modal body content.
            </Modal>

            <ConfirmDialog
              isOpen={isConfirmOpen}
              onClose={() => setIsConfirmOpen(false)}
              onConfirm={() => {
                toast.error('Session deleted');
                setIsConfirmOpen(false);
              }}
              title="Delete Practice Session?"
              description="Are you sure you want to delete this interview recording permanently?"
              confirmText="Delete Permanently"
            />
          </div>
        )}

        {/* TAB 6: DATA & STATS */}
        {activeTab === 'data' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                title="ATS Match Score"
                value="94%"
                trend={12}
                trendLabel="vs last resume draft"
                icon={<Award className="w-6 h-6" />}
              />
              <StatCard
                title="Mock Sessions"
                value="14"
                trend={5}
                trendLabel="+3 sessions this week"
                icon={<UserCheck className="w-6 h-6" />}
              />
              <StatCard
                title="Roadmap Completed"
                value="78%"
                trend={8}
                trendLabel="12 milestones remaining"
                icon={<TrendingUp className="w-6 h-6" />}
              />
            </div>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Progress Indicators & Circular Gauges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProgressBar value={78} label="System Design Masterclass Progress" color="indigo" />
                <ProgressBar value={92} label="ATS Target Keyword Density" color="emerald" />

                <div className="flex items-center gap-8 border-t border-slate-800 pt-6">
                  <ProgressCircle value={88} size={90} label="ATS Score" color="#6366f1" />
                  <ProgressCircle value={95} size={90} label="Confidence" color="#10b981" />
                  <ProgressCircle value={64} size={90} label="Pacing" color="#f59e0b" />
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Data Table & Pagination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs">SES-2026-904</TableCell>
                      <TableCell>System Design & Rate Limiting</TableCell>
                      <TableCell><Badge variant="success" style="soft">92%</Badge></TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="ghost">Report</Button></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  totalItems={48}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Loading Skeleton Placeholders</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Spinner size="md" />
                <SkeletonCard className="flex-1" />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export function DesignSystemShowcase() {
  return (
    <ToastProvider>
      <DesignSystemShowcaseContent />
    </ToastProvider>
  );
}

export default DesignSystemShowcase;
