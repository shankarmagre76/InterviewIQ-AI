import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Layout,
  Sliders,
  Bell,
  Table as TableIcon,
  Search,
  Mail,
  Lock,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';

import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Dropdown } from './ui/Dropdown';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from './ui/Table';
import { Alert } from './ui/Alert';
import { Spinner, SkeletonCard } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';


export function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const tabs = [
    { id: 'tokens', label: 'Colors & Typography', icon: <Palette className="w-4 h-4" /> },
    { id: 'buttons', label: 'Buttons & Badges', icon: <Sliders className="w-4 h-4" /> },
    { id: 'inputs', label: 'Form Controls', icon: <FileText className="w-4 h-4" /> },
    { id: 'cards', label: 'Cards & Glassmorphism', icon: <Layout className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts, Modals & Dropdowns', icon: <Bell className="w-4 h-4" /> },
    { id: 'tables', label: 'Tables, Loading & Empty', icon: <TableIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 p-4 sm:p-8 lg:p-12 relative overflow-x-hidden">
      {/* Glow Backdrop */}
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
              InterviewIQ <span className="text-indigo-400">Design System</span>
            </h1>
            <p className="text-xs text-slate-400">Phase F1.2 — Global Design System Verification Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" style="soft" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Tailwind v4 Active
          </Badge>
          <Badge variant="primary" style="outline" size="md">
            Accessible & Dark Mode
          </Badge>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/60">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-md shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }
              `.trim()}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Showcase Panel */}
      <main className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* TAB 1: COLORS & TYPOGRAPHY */}
        {activeTab === 'tokens' && (
          <div className="space-y-8">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Color Palette Tokens</CardTitle>
                <CardDescription>Curated high-contrast palette tailored for an AI Career SaaS application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Primary Accent (Electric Indigo)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <ColorSwatch name="indigo-500" hex="#6366f1" bg="bg-indigo-500" />
                    <ColorSwatch name="indigo-600" hex="#4f46e5" bg="bg-indigo-600" />
                    <ColorSwatch name="indigo-400" hex="#818cf8" bg="bg-indigo-400" />
                    <ColorSwatch name="indigo-700" hex="#4338ca" bg="bg-indigo-700" />
                    <ColorSwatch name="indigo-900" hex="#312e81" bg="bg-indigo-900" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Secondary Accent (Cyan / Teal)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ColorSwatch name="cyan-400" hex="#22d3ee" bg="bg-cyan-400" />
                    <ColorSwatch name="cyan-500" hex="#06b6d4" bg="bg-cyan-500" />
                    <ColorSwatch name="teal-500" hex="#14b8a6" bg="bg-teal-500" />
                    <ColorSwatch name="cyan-900" hex="#164e63" bg="bg-cyan-900" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Semantic Status Colors</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ColorSwatch name="Success" hex="#10b981" bg="bg-emerald-500" />
                    <ColorSwatch name="Warning" hex="#f59e0b" bg="bg-amber-500" />
                    <ColorSwatch name="Danger" hex="#f43f5e" bg="bg-rose-500" />
                    <ColorSwatch name="Info" hex="#38bdf8" bg="bg-sky-500" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Surface & Depth Colors</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ColorSwatch name="Background" hex="#080c14" bg="bg-[#080c14]" border />
                    <ColorSwatch name="Surface Slate" hex="#0f172a" bg="bg-slate-900" border />
                    <ColorSwatch name="Elevated Slate" hex="#1e293b" bg="bg-slate-800" border />
                    <ColorSwatch name="Border Subtle" hex="rgba(255..0.08)" bg="bg-slate-700/50" border />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
                <CardDescription>Plus Jakarta Sans for headings and Inter for body text.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 border-b border-slate-800 pb-6">
                  <div>
                    <span className="text-xs text-indigo-400 font-mono">Display H1 — 36px/48px font-extrabold</span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
                      AI-Powered Tech Career Acceleration
                    </h1>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 font-mono">Heading H2 — 24px/32px font-bold</span>
                    <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                      Automated Resume Scoring & Skill Gap Analytics
                    </h2>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 font-mono">Heading H3 — 20px/28px font-semibold</span>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-100 mt-1">
                      Real-Time Voice Mock Interview Session
                    </h3>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 font-mono">Heading H4 — 18px/24px font-semibold</span>
                    <h4 className="text-lg font-semibold text-slate-200 mt-1">
                      System Architecture & Behavioral Questions
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs text-indigo-400 font-mono block mb-1">Body Large (18px)</span>
                    <p className="text-slate-300 text-lg leading-relaxed">
                      Evaluate your technical answers with Gemini AI feedback and instant confidence metrics.
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 font-mono block mb-1">Body Base (16px)</span>
                    <p className="text-slate-300 text-base leading-relaxed">
                      Upload your ATS resume in PDF format to receive keyword density reports and recommendations.
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 font-mono block mb-1">Body Small (14px)</span>
                    <p className="text-slate-400 text-sm leading-normal">
                      Last synchronized 5 minutes ago • 14 roadmap milestones remaining.
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 font-mono block mb-1">Caption / Label (12px Uppercase)</span>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Target Role: Senior Full Stack Engineer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: BUTTONS & BADGES */}
        {activeTab === 'buttons' && (
          <div className="space-y-8">
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Button Variants & States</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBtnLoading(!btnLoading)}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    {btnLoading ? 'Disable Spinner' : 'Simulate Loading'}
                  </Button>
                </div>
                <CardDescription>Primary actions, secondary actions, danger triggers, ghost controls, and loading states.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Variants</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" isLoading={btnLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Primary Action
                    </Button>
                    <Button variant="secondary" isLoading={btnLoading} leftIcon={<Sparkles className="w-4 h-4" />}>
                      Secondary Action
                    </Button>
                    <Button variant="outline" isLoading={btnLoading}>
                      Outline Button
                    </Button>
                    <Button variant="ghost" isLoading={btnLoading}>
                      Ghost Button
                    </Button>
                    <Button variant="danger" isLoading={btnLoading} leftIcon={<Trash2 className="w-4 h-4" />}>
                      Delete Session
                    </Button>
                    <Button variant="success" isLoading={btnLoading} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                      Complete Phase
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm" variant="primary">
                      Small (sm)
                    </Button>
                    <Button size="md" variant="primary">
                      Medium (md)
                    </Button>
                    <Button size="lg" variant="primary">
                      Large (lg)
                    </Button>
                    <Button size="icon" variant="outline" aria-label="Settings">
                      <Sliders className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Disabled State</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" disabled>
                      Disabled Primary
                    </Button>
                    <Button variant="outline" disabled>
                      Disabled Outline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Badges & Status Tags</CardTitle>
                <CardDescription>Pill indicators for score tags, status metrics, and phase milestones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Soft Variant</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" style="soft">Indigo Primary</Badge>
                    <Badge variant="secondary" style="soft">Cyan Secondary</Badge>
                    <Badge variant="success" style="soft" icon={<CheckCircle2 className="w-3 h-3" />}>Verified 94%</Badge>
                    <Badge variant="warning" style="soft" icon={<AlertTriangle className="w-3 h-3" />}>Needs Review</Badge>
                    <Badge variant="danger" style="soft">Critical Gap</Badge>
                    <Badge variant="info" style="soft">Gemini 1.5 Pro</Badge>
                    <Badge variant="neutral" style="soft">Draft</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Solid & Outline Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" style="solid">Solid Primary</Badge>
                    <Badge variant="success" style="solid">Passed ATS</Badge>
                    <Badge variant="danger" style="solid">High Priority</Badge>
                    <Badge variant="primary" style="outline">Outline Indigo</Badge>
                    <Badge variant="secondary" style="outline">Outline Cyan</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: FORM CONTROLS */}
        {activeTab === 'inputs' && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Form Controls & Inputs</CardTitle>
              <CardDescription>Text inputs, icon inputs, textareas, custom selects, and field validation states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Target Job Title"
                  placeholder="e.g. Senior Frontend Engineer"
                  helperText="Used to tailor AI interview questions."
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="candidate@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Search Candidates"
                  placeholder="Search by skill or keyword..."
                  leftIcon={<Search className="w-4 h-4" />}
                  rightIcon={<Filter className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />}
                />
                <Input
                  label="Password"
                  type="password"
                  value="supersecretpassword"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error="Password must contain at least 1 special character."
                />
                <Select
                  label="Experience Level"
                  helperText="Sets AI question difficulty baseline."
                  options={[
                    { value: 'entry', label: 'Entry Level (0-2 YOE)' },
                    { value: 'mid', label: 'Mid Level (3-5 YOE)' },
                    { value: 'senior', label: 'Senior Level (5-8 YOE)' },
                    { value: 'staff', label: 'Staff / Principal (8+ YOE)' },
                  ]}
                />
                <Select label="Interview Mode">
                  <option value="voice">AI Voice Mock Interview</option>
                  <option value="text">Interactive Coding & Text</option>
                  <option value="behavioral">STAR Method Behavioral</option>
                </Select>
              </div>

              <Textarea
                label="Self Intro / Professional Summary"
                rows={4}
                placeholder="Paste your resume summary or candidate pitch here..."
                helperText="Maximum 500 characters."
              />
            </CardContent>
          </Card>
        )}

        {/* TAB 4: CARDS & GLASSMORPHISM */}
        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Slate Card</CardTitle>
                <CardDescription>Standard opaque card container for clean data representation.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Solid background with standard subtle borders. Ideal for dashboard widgets and persistent data panels.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-slate-400">Footer status</span>
                <Button size="sm" variant="ghost">View Details</Button>
              </CardFooter>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-indigo-300">Glassmorphism Card</CardTitle>
                <CardDescription>Blended backdrop blur overlay with vibrant gradient shadows.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Backdrop filter blur with semi-transparent background to convey high-tech depth and modern AI aesthetic.
                </p>
              </CardContent>
              <CardFooter>
                <Badge variant="primary" style="soft">Glass Variant</Badge>
                <Button size="sm" variant="primary">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Hover Card</CardTitle>
                <CardDescription>Smooth elevation on hover with indigo glow border.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hover over this card to feel the smooth transition effect. Great for clickable feature tiles.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                  Hover to preview <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* TAB 5: ALERTS, MODALS & DROPDOWNS */}
        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>System Banner Alerts</CardTitle>
                <CardDescription>Dismissible inline callouts for status feedback.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAlert && (
                  <Alert
                    variant="info"
                    title="Gemini 1.5 Pro Initialized"
                    onClose={() => setShowAlert(false)}
                  >
                    Your AI interview session parameters have been synchronized with the latest resume upload.
                  </Alert>
                )}
                <Alert variant="success" title="ATS Score Processing Complete">
                  Resume matches 88% of required technical keywords for Senior Fullstack Engineer.
                </Alert>
                <Alert variant="warning" title="Audio Permission Pending">
                  Please enable microphone access in your browser to start the voice mock interview.
                </Alert>
                <Alert variant="danger" title="API Connection Interrupted">
                  Failed to fetch roadmap step. Please check your backend connection.
                </Alert>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Modal & Dropdown Interactions</CardTitle>
                <CardDescription>Trigger interactive popups and action context menus.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-6">
                <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                  Open Test Modal
                </Button>

                <Dropdown
                  trigger={
                    <Button variant="outline" rightIcon={<MoreVertical className="w-4 h-4" />}>
                      Action Menu
                    </Button>
                  }
                  items={[
                    { label: 'Edit Profile', icon: <Edit className="w-4 h-4" />, onClick: () => alert('Edit clicked') },
                    { label: 'Share Report', icon: <Share2 className="w-4 h-4" />, onClick: () => alert('Share clicked') },
                    { label: 'Download PDF', icon: <Download className="w-4 h-4" />, badge: <Badge size="sm" variant="success">New</Badge> },
                    { divider: true },
                    { label: 'Delete Account', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => alert('Delete clicked') },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 6: TABLES, LOADING & EMPTY STATES */}
        {activeTab === 'tables' && (
          <div className="space-y-8">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Data Table Component</CardTitle>
                <CardDescription>Responsive data grid with status indicators and action items.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate / Role</TableHead>
                      <TableHead>Target YOE</TableHead>
                      <TableHead>ATS Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                            JD
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">Jane Doe</p>
                            <p className="text-xs text-slate-400">Senior React Engineer</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>5 Years</TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-400">92 / 100</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" style="soft" size="sm">Interview Ready</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">View Report</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs border border-cyan-500/30">
                            AS
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">Alex Smith</p>
                            <p className="text-xs text-slate-400">Backend Node.js Dev</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>3 Years</TableCell>
                      <TableCell>
                        <span className="font-bold text-amber-400">74 / 100</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="warning" style="soft" size="sm">Gaps Detected</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">View Report</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Skeleton & Spinner States</CardTitle>
                  <CardDescription>Placeholder loaders for async fetching.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <span className="text-xs text-slate-400">Loading AI assessment...</span>
                  </div>
                  <SkeletonCard />
                </CardContent>
              </Card>

              <EmptyState
                title="No Mock Interviews Yet"
                description="Start your first AI mock interview session to get real-time feedback and ATS scoring."
                primaryAction={{ label: 'Start Mock Interview', icon: <Sparkles className="w-4 h-4" />, onClick: () => alert('Start Interview') }}
                secondaryAction={{ label: 'Upload Resume', icon: <FileText className="w-4 h-4" />, onClick: () => alert('Upload Resume') }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modal Demonstration */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule AI Voice Mock Session"
        description="Configure your interview domain and difficulty target."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)} leftIcon={<Sparkles className="w-4 h-4" />}>
              Launch Session
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Interview Subject" placeholder="System Design & Scalability" />
          <Select label="Difficulty Scale">
            <option>Mid-Level Engineer</option>
            <option>Senior Architect</option>
            <option>FAANG Technical Bar</option>
          </Select>
          <Textarea label="Special Instructions for Gemini" rows={3} placeholder="Focus on microservices, rate limiting, and database sharding..." />
        </div>
      </Modal>
    </div>
  );
}

function ColorSwatch({ name, hex, bg, border = false }) {
  return (
    <div className={`p-3 rounded-xl ${bg} ${border ? 'border border-slate-700/80' : ''} shadow-md flex flex-col justify-between h-20`}>
      <span className="text-xs font-semibold text-white drop-shadow">{name}</span>
      <span className="text-[11px] font-mono text-white/80 drop-shadow">{hex}</span>
    </div>
  );
}
