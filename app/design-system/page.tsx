"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Download,
  FileText,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Star,
  Trash2,
  Upload,
  Users,
  Zap,
} from "lucide-react";

import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  MultiSelect,
  Modal,
  Badge,
  Avatar,
  Table,
  Tabs,
  ProgressBar,
  brandToast,
  Tooltip,
  EmptyState,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SidebarNav,
} from "@/components/ui";

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-6 border-b border-ivory-400 pb-3 font-serif text-heading-xl text-navy-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-sans text-body-sm font-semibold uppercase tracking-wider text-charcoal-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

const selectOptions = [
  { value: "harvard", label: "Harvard University" },
  { value: "yale", label: "Yale University" },
  { value: "princeton", label: "Princeton University" },
  { value: "stanford", label: "Stanford University" },
  { value: "mit", label: "MIT" },
  { value: "columbia", label: "Columbia University" },
  { value: "upenn", label: "University of Pennsylvania" },
  { value: "brown", label: "Brown University" },
];

const tableData = [
  { id: "1", name: "Sarah Chen", school: "Harvard", status: "Accepted", gpa: "4.0", date: "2024-01-15" },
  { id: "2", name: "James Wilson", school: "Yale", status: "Pending", gpa: "3.95", date: "2024-02-01" },
  { id: "3", name: "Emily Park", school: "Stanford", status: "Accepted", gpa: "3.98", date: "2024-01-22" },
  { id: "4", name: "Michael Brown", school: "MIT", status: "Waitlisted", gpa: "3.92", date: "2024-02-10" },
  { id: "5", name: "Olivia Garcia", school: "Princeton", status: "Accepted", gpa: "3.97", date: "2024-01-28" },
  { id: "6", name: "Daniel Kim", school: "Columbia", status: "Rejected", gpa: "3.88", date: "2024-02-05" },
  { id: "7", name: "Sophia Martinez", school: "Brown", status: "Pending", gpa: "3.91", date: "2024-02-12" },
];

const tableColumns = [
  { key: "name", header: "Student", sortable: true },
  { key: "school", header: "Target School", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (row: (typeof tableData)[0]) => {
      const variant =
        row.status === "Accepted"
          ? "success" as const
          : row.status === "Rejected"
            ? "error" as const
            : row.status === "Waitlisted"
              ? "warning" as const
              : "neutral" as const;
      return (
        <Badge variant={variant} dot>
          {row.status}
        </Badge>
      );
    },
  },
  { key: "gpa", header: "GPA", sortable: true, width: "100px" },
  { key: "date", header: "Applied", sortable: true },
];

const sidebarSections = [
  {
    title: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/design-system", icon: <LayoutDashboard className="h-5 w-5" /> },
      { id: "applications", label: "Applications", href: "/design-system/applications", icon: <FileText className="h-5 w-5" />, badge: 3 },
      { id: "sessions", label: "Sessions", href: "/design-system/sessions", icon: <Calendar className="h-5 w-5" /> },
      { id: "messages", label: "Messages", href: "/design-system/messages", icon: <MessageSquare className="h-5 w-5" />, badge: 12 },
    ],
  },
  {
    title: "Resources",
    items: [
      { id: "resources", label: "Resources", href: "/design-system/resources", icon: <BookOpen className="h-5 w-5" /> },
      { id: "settings", label: "Settings", href: "/design-system/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
];

const navAnchors = [
  "buttons",
  "cards",
  "inputs",
  "selects",
  "modals",
  "badges",
  "avatars",
  "table",
  "tabs",
  "progress",
  "toasts",
  "tooltips",
  "empty",
  "skeletons",
  "sidebar",
];

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [searchSelectValue, setSearchSelectValue] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ivory-400 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-serif text-heading-lg text-navy-900">
              IvyAmbition Design System
            </h1>
            <p className="font-sans text-body-sm text-charcoal-400">
              Component library &middot; Every variant &middot; Visual verification
            </p>
          </div>
          <nav className="hidden flex-wrap gap-2 md:flex">
            {navAnchors.map((a) => (
              <a
                key={a}
                href={`#${a}`}
                className="rounded-lg px-2.5 py-1 font-sans text-caption font-medium text-charcoal-500 transition-colors hover:bg-ivory-200 hover:text-navy-900"
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        {/* ── BUTTONS ──────────────────────────────────────────────────── */}
        <Section id="buttons" title="Button">
          <SubSection title="Variants">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" icon={<Star className="h-4 w-4" />}>
                Primary (Gold)
              </Button>
              <Button variant="secondary" icon={<Send className="h-4 w-4" />}>
                Secondary
              </Button>
              <Button variant="ghost" icon={<Settings className="h-4 w-4" />}>
                Ghost
              </Button>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>
                Danger
              </Button>
            </div>
          </SubSection>

          <SubSection title="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </SubSection>

          <SubSection title="States">
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button variant="secondary" loading>
                Loading
              </Button>
              <Button variant="danger" disabled>
                Disabled
              </Button>
            </div>
          </SubSection>

          <SubSection title="With Icons">
            <div className="flex flex-wrap items-center gap-3">
              <Button icon={<Plus className="h-4 w-4" />}>Add New</Button>
              <Button
                variant="secondary"
                icon={<Download className="h-4 w-4" />}
                iconPosition="right"
              >
                Download
              </Button>
              <Button variant="ghost" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                Continue
              </Button>
            </div>
          </SubSection>

          <SubSection title="Full Width">
            <div className="max-w-md">
              <Button fullWidth icon={<Rocket className="h-4 w-4" />}>
                Full Width Button
              </Button>
            </div>
          </SubSection>

          <SubSection title="On Dark Background">
            <div className="rounded-2xl bg-pattern-navy p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" icon={<Zap className="h-4 w-4" />}>
                  Gold on Dark
                </Button>
                <Button variant="secondary">Outlined on Dark</Button>
                <Button variant="ghost" className="text-ivory-300 hover:text-white hover:bg-white/10">
                  Ghost on Dark
                </Button>
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ── CARDS ────────────────────────────────────────────────────── */}
        <Section id="cards" title="Card">
          <SubSection title="Light Variant (Default)">
            <div className="grid gap-6 md:grid-cols-2">
              <Card hoverable>
                <CardHeader title="Application Progress" description="Track your submission status" />
                <CardContent>
                  <p className="font-sans text-body text-charcoal-600">
                    Your Harvard application is 85% complete. Upload your recommendation letter to proceed.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2">
                    <Button size="sm">Upload</Button>
                    <Button size="sm" variant="ghost">
                      Later
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card hoverable padding="md">
                <div className="flex items-start gap-4">
                  <Avatar name="Dr. Elizabeth Warren" size="lg" />
                  <div>
                    <h4 className="font-serif text-heading text-navy-900">
                      Dr. Elizabeth Warren
                    </h4>
                    <p className="mt-0.5 font-sans text-body-sm text-charcoal-400">
                      Former Harvard Admissions Officer
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="premium" dot>Expert Coach</Badge>
                      <Badge variant="success" dot>Available</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </SubSection>

          <SubSection title="Dark Variant">
            <div className="grid gap-6 md:grid-cols-2">
              <Card variant="dark" hoverable>
                <CardHeader title="Premium Insight" variant="dark" />
                <CardContent>
                  <p className="font-sans text-body text-ivory-400">
                    Students with our premium coaching achieve a 3x higher acceptance rate at their target schools.
                  </p>
                </CardContent>
                <CardFooter variant="dark">
                  <Button size="sm">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>

              <Card variant="dark" padding="lg">
                <p className="font-sans text-overline text-gold-400">
                  This Season
                </p>
                <p className="mt-2 font-serif text-display-lg text-white">
                  92%
                </p>
                <p className="mt-1 font-sans text-body text-ivory-500">
                  Acceptance rate across all students
                </p>
              </Card>
            </div>
          </SubSection>
        </Section>

        {/* ── INPUTS ───────────────────────────────────────────────────── */}
        <Section id="inputs" title="Input & Textarea">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <SubSection title="Text Input">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  helperText="As it appears on your official documents"
                  id="name"
                />
              </SubSection>

              <SubSection title="Email Input">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  id="email"
                />
              </SubSection>

              <SubSection title="Password Input">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  id="password"
                />
              </SubSection>

              <SubSection title="With Search Icon">
                <Input
                  placeholder="Search students..."
                  icon={<Search className="h-4 w-4" />}
                  id="search"
                />
              </SubSection>
            </div>

            <div className="space-y-5">
              <SubSection title="Error State">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error="Please enter a valid email address"
                  defaultValue="notanemail"
                  id="email-error"
                />
              </SubSection>

              <SubSection title="Disabled State">
                <Input
                  label="Student ID"
                  placeholder="Auto-generated"
                  disabled
                  defaultValue="IVY-2024-0847"
                  id="disabled"
                />
              </SubSection>

              <SubSection title="Textarea">
                <Textarea
                  label="Personal Statement"
                  placeholder="Write your personal statement here..."
                  rows={4}
                  helperText="Be authentic and specific"
                  maxCharacters={650}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  id="textarea"
                />
              </SubSection>

              <SubSection title="Textarea with Error">
                <Textarea
                  label="Essay"
                  placeholder="Write your essay..."
                  rows={3}
                  error="Essay must be at least 250 words"
                  defaultValue="Too short."
                  maxCharacters={500}
                  id="textarea-error"
                />
              </SubSection>
            </div>
          </div>
        </Section>

        {/* ── SELECTS ──────────────────────────────────────────────────── */}
        <Section id="selects" title="Select & MultiSelect">
          <div className="grid gap-8 md:grid-cols-3">
            <SubSection title="Single Select">
              <Select
                label="Target School"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                placeholder="Choose a school..."
                helperText="Select your top choice school"
                id="select"
              />
            </SubSection>

            <SubSection title="Searchable Select">
              <Select
                label="Find School"
                options={selectOptions}
                value={searchSelectValue}
                onChange={setSearchSelectValue}
                placeholder="Search schools..."
                searchable
                id="select-search"
              />
            </SubSection>

            <SubSection title="Multi Select">
              <MultiSelect
                label="All Target Schools"
                options={selectOptions}
                value={multiSelectValue}
                onChange={setMultiSelectValue}
                placeholder="Select schools..."
                searchable
                helperText="Select all schools you are applying to"
                id="multi-select"
              />
            </SubSection>
          </div>

          <SubSection title="Error & Disabled States">
            <div className="grid gap-8 md:grid-cols-2 max-w-2xl">
              <Select
                label="With Error"
                options={selectOptions}
                placeholder="Choose..."
                error="This field is required"
                id="select-error"
              />
              <Select
                label="Disabled"
                options={selectOptions}
                placeholder="Cannot change"
                disabled
                id="select-disabled"
              />
            </div>
          </SubSection>
        </Section>

        {/* ── MODALS ───────────────────────────────────────────────────── */}
        <Section id="modals" title="Modal">
          <SubSection title="Interactive Demo">
            <Button onClick={() => setModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
              Open Modal
            </Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Schedule Coaching Session"
              description="Book a 1-on-1 session with your assigned coach."
              footer={
                <>
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>
                    Confirm Booking
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input label="Session Topic" placeholder="e.g., Essay Review" id="modal-topic" />
                <Select
                  label="Coach"
                  options={[
                    { value: "dr-warren", label: "Dr. Elizabeth Warren" },
                    { value: "prof-chang", label: "Prof. David Chang" },
                    { value: "ms-patel", label: "Ms. Priya Patel" },
                  ]}
                  placeholder="Select coach..."
                  id="modal-coach"
                />
                <Input label="Preferred Date" type="date" id="modal-date" />
                <Textarea
                  label="Notes"
                  placeholder="Any specific topics you want to cover..."
                  rows={3}
                  id="modal-notes"
                />
              </div>
            </Modal>
          </SubSection>
        </Section>

        {/* ── BADGES ───────────────────────────────────────────────────── */}
        <Section id="badges" title="Badge">
          <SubSection title="All Variants — Size MD">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="premium">Premium</Badge>
            </div>
          </SubSection>

          <SubSection title="With Dot Indicators">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" dot>Active</Badge>
              <Badge variant="warning" dot>Pending Review</Badge>
              <Badge variant="error" dot>Overdue</Badge>
              <Badge variant="info" dot>In Progress</Badge>
              <Badge variant="premium" dot>Ivy League</Badge>
              <Badge variant="neutral" dot>Draft</Badge>
            </div>
          </SubSection>

          <SubSection title="Size SM">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" size="sm">Accepted</Badge>
              <Badge variant="error" size="sm">Rejected</Badge>
              <Badge variant="premium" size="sm" dot>Coach</Badge>
              <Badge variant="info" size="sm" dot>New</Badge>
            </div>
          </SubSection>

          <SubSection title="On Dark Background">
            <div className="rounded-2xl bg-navy-900 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="premium" dot>Elite Plan</Badge>
                <Badge variant="success" dot>Online</Badge>
                <Badge variant="warning">3 Tasks Due</Badge>
                <Badge variant="info" size="sm">Updated</Badge>
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ── AVATARS ──────────────────────────────────────────────────── */}
        <Section id="avatars" title="Avatar">
          <SubSection title="Sizes (with initials fallback)">
            <div className="flex items-end gap-4">
              <Avatar name="Sarah Chen" size="sm" />
              <Avatar name="James Wilson" size="md" />
              <Avatar name="Emily Park" size="lg" />
              <Avatar name="Michael Brown" size="xl" />
            </div>
          </SubSection>

          <SubSection title="Online Status Indicator">
            <div className="flex items-end gap-4">
              <Avatar name="Coach A" size="sm" online />
              <Avatar name="Coach B" size="md" online />
              <Avatar name="Coach C" size="lg" online={false} />
              <Avatar name="Coach D" size="xl" online />
            </div>
          </SubSection>

          <SubSection title="Stacked Avatars">
            <div className="flex -space-x-2">
              {["Alice M", "Bob K", "Carol P", "Dan R", "Eve S"].map((name) => (
                <Avatar
                  key={name}
                  name={name}
                  size="md"
                  className="ring-2 ring-white"
                />
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory-200 font-sans text-caption font-semibold text-charcoal-500 ring-2 ring-white">
                +8
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ── TABLE ────────────────────────────────────────────────────── */}
        <Section id="table" title="Table">
          <SubSection title="With Sorting & Pagination">
            <Table
              columns={tableColumns}
              data={tableData}
              pageSize={5}
              getRowKey={(row) => row.id}
              onRowClick={(row) => brandToast.info(`Clicked: ${row.name}`)}
            />
          </SubSection>

          <SubSection title="Empty State">
            <Table
              columns={tableColumns}
              data={[]}
              emptyTitle="No applications yet"
              emptyDescription="Start by adding your first college application to track its progress."
            />
          </SubSection>
        </Section>

        {/* ── TABS ─────────────────────────────────────────────────────── */}
        <Section id="tabs" title="Tabs">
          <SubSection title="With Animated Gold Underline">
            <Tabs
              tabs={[
                { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
                { id: "essays", label: "Essays", icon: <FileText className="h-4 w-4" /> },
                { id: "schedule", label: "Schedule", icon: <Calendar className="h-4 w-4" /> },
                { id: "feedback", label: "Feedback", icon: <MessageSquare className="h-4 w-4" /> },
                { id: "disabled", label: "Archived", disabled: true },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            >
              <Card padding="md">
                <p className="font-sans text-body text-charcoal-600">
                  Active tab: <span className="font-semibold text-navy-900">{activeTab}</span>.
                  Click the tabs above to see the animated gold underline move between items.
                </p>
              </Card>
            </Tabs>
          </SubSection>
        </Section>

        {/* ── PROGRESS BAR ─────────────────────────────────────────────── */}
        <Section id="progress" title="Progress Bar">
          <div className="grid gap-8 md:grid-cols-2">
            <SubSection title="Sizes with Labels">
              <div className="space-y-6">
                <ProgressBar value={85} label="Application Progress" size="sm" />
                <ProgressBar value={62} label="Essay Completion" size="md" />
                <ProgressBar value={40} label="Documents Uploaded" size="lg" />
              </div>
            </SubSection>

            <SubSection title="Various Percentages">
              <div className="space-y-6">
                <ProgressBar value={100} label="Letters of Rec" />
                <ProgressBar value={75} label="Personal Statement" />
                <ProgressBar value={30} label="Supplemental Essays" />
                <ProgressBar value={10} label="Financial Aid" />
                <ProgressBar value={0} label="Interview Prep" />
              </div>
            </SubSection>
          </div>

          <SubSection title="On Dark Background">
            <Card variant="dark" padding="lg">
              <ProgressBar
                value={72}
                label="Overall Readiness"
                size="lg"
                className="[&_span]:text-ivory-300 [&>div:first-child>span:last-child]:text-gold-400"
              />
            </Card>
          </SubSection>
        </Section>

        {/* ── TOASTS ───────────────────────────────────────────────────── */}
        <Section id="toasts" title="Toast / Notifications">
          <SubSection title="Trigger Each Variant">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => brandToast.success("Application Submitted", "Your Harvard application has been sent successfully.")}
              >
                Success Toast
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => brandToast.error("Upload Failed", "The file exceeds the 10MB size limit.")}
              >
                Error Toast
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => brandToast.warning("Deadline Approaching", "Your Yale application is due in 3 days.")}
              >
                Warning Toast
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => brandToast.info("New Message", "Dr. Warren sent you feedback on your essay.")}
              >
                Info Toast
              </Button>
            </div>
          </SubSection>
        </Section>

        {/* ── TOOLTIPS ─────────────────────────────────────────────────── */}
        <Section id="tooltips" title="Tooltip">
          <SubSection title="Positions">
            <div className="flex flex-wrap items-center gap-6 py-8">
              <Tooltip content="Appears on top" position="top">
                <Button variant="ghost" size="sm">
                  Top
                </Button>
              </Tooltip>
              <Tooltip content="Appears on bottom" position="bottom">
                <Button variant="ghost" size="sm">
                  Bottom
                </Button>
              </Tooltip>
              <Tooltip content="Appears on left" position="left">
                <Button variant="ghost" size="sm">
                  Left
                </Button>
              </Tooltip>
              <Tooltip content="Appears on right" position="right">
                <Button variant="ghost" size="sm">
                  Right
                </Button>
              </Tooltip>
            </div>
          </SubSection>

          <SubSection title="On Icon Buttons">
            <div className="flex gap-3">
              <Tooltip content="Notifications">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-ivory-200 hover:text-navy-900">
                  <Bell className="h-5 w-5" />
                </button>
              </Tooltip>
              <Tooltip content="Upload file">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-ivory-200 hover:text-navy-900">
                  <Upload className="h-5 w-5" />
                </button>
              </Tooltip>
              <Tooltip content="Favorites">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-ivory-200 hover:text-navy-900">
                  <Heart className="h-5 w-5" />
                </button>
              </Tooltip>
            </div>
          </SubSection>
        </Section>

        {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
        <Section id="empty" title="Empty State">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <EmptyState
                title="No sessions scheduled"
                description="Book your first coaching session to get started on your admissions journey."
                actionLabel="Schedule Session"
                onAction={() => brandToast.info("Navigating to scheduler...")}
              />
            </Card>

            <Card>
              <EmptyState
                icon={<GraduationCap className="h-9 w-9 text-gold-500" />}
                title="No applications tracked"
                description="Add your target schools to start tracking your application progress."
                actionLabel="Add School"
                onAction={() => brandToast.info("Opening school search...")}
              />
            </Card>
          </div>
        </Section>

        {/* ── SKELETONS ────────────────────────────────────────────────── */}
        <Section id="skeletons" title="Loading Skeleton">
          <SubSection title="Text Block">
            <div className="max-w-md">
              <SkeletonText lines={4} />
            </div>
          </SubSection>

          <SubSection title="Cards">
            <div className="grid gap-6 md:grid-cols-3">
              <SkeletonCard hasImage />
              <SkeletonCard />
              <SkeletonCard hasImage />
            </div>
          </SubSection>

          <SubSection title="Table">
            <SkeletonTable rows={4} columns={5} />
          </SubSection>

          <SubSection title="Individual Elements">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12" rounded="full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ── SIDEBAR NAV ──────────────────────────────────────────────── */}
        <Section id="sidebar" title="Sidebar Navigation">
          <SubSection title="Expanded & Collapsed Side by Side">
            <div className="flex gap-6 overflow-hidden rounded-2xl border border-ivory-400 bg-ivory-200">
              <div className="relative h-[480px] shrink-0">
                <SidebarNav
                  sections={sidebarSections}
                  user={{
                    name: "Sarah Chen",
                    email: "sarah@ivyambition.com",
                    role: "Student",
                  }}
                  onSignOut={() => brandToast.info("Signing out...")}
                />
              </div>
              <div className="relative h-[480px] shrink-0">
                <SidebarNav
                  sections={sidebarSections}
                  user={{
                    name: "Sarah Chen",
                    email: "sarah@ivyambition.com",
                    role: "Student",
                  }}
                  onSignOut={() => brandToast.info("Signing out...")}
                  defaultCollapsed
                />
              </div>
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="text-center">
                  <p className="font-serif text-heading text-navy-900">
                    Main Content Area
                  </p>
                  <p className="mt-2 font-sans text-body-sm text-charcoal-400">
                    The sidebar supports collapse/expand, section dividers, badges, active state with gold indicator, and a user profile footer.
                  </p>
                </div>
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ── COLOR PALETTE ────────────────────────────────────────────── */}
        <Section id="colors" title="Color Palette">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Navy", shades: ["bg-navy-50", "bg-navy-100", "bg-navy-200", "bg-navy-300", "bg-navy-400", "bg-navy-500", "bg-navy-600", "bg-navy-700", "bg-navy-800", "bg-navy-900", "bg-navy-950"] },
              { name: "Gold", shades: ["bg-gold-50", "bg-gold-100", "bg-gold-200", "bg-gold-300", "bg-gold-400", "bg-gold-500", "bg-gold-600", "bg-gold-700", "bg-gold-800", "bg-gold-900", "bg-gold-950"] },
              { name: "Charcoal", shades: ["bg-charcoal-50", "bg-charcoal-100", "bg-charcoal-200", "bg-charcoal-300", "bg-charcoal-400", "bg-charcoal-500", "bg-charcoal-600", "bg-charcoal-700", "bg-charcoal-800", "bg-charcoal-900", "bg-charcoal-950"] },
              { name: "Cream", shades: ["bg-cream-50", "bg-cream-100", "bg-cream-200", "bg-cream-300", "bg-cream-400", "bg-cream-500", "bg-cream-600", "bg-cream-700", "bg-cream-800", "bg-cream-900", "bg-cream-950"] },
              { name: "Ivory", shades: ["bg-ivory-50", "bg-ivory-100", "bg-ivory-200", "bg-ivory-300", "bg-ivory-400", "bg-ivory-500", "bg-ivory-600", "bg-ivory-700", "bg-ivory-800", "bg-ivory-900", "bg-ivory-950"] },
              { name: "Burgundy", shades: ["bg-burgundy-500", "bg-burgundy-600", "bg-burgundy-700"] },
            ].map((palette) => (
              <div key={palette.name}>
                <p className="mb-2 font-sans text-body-sm font-semibold text-charcoal-700">
                  {palette.name}
                </p>
                <div className="flex overflow-hidden rounded-xl">
                  {palette.shades.map((shade) => (
                    <div key={shade} className={`h-10 flex-1 ${shade}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TYPOGRAPHY ───────────────────────────────────────────────── */}
        <Section id="typography" title="Typography Scale">
          <div className="space-y-4">
            <p className="font-serif text-display-xl text-navy-900">Display XL — Playfair Display</p>
            <p className="font-serif text-display-lg text-navy-900">Display LG — Premium Headings</p>
            <p className="font-serif text-display text-navy-900">Display — Section Titles</p>
            <p className="font-serif text-heading-xl text-navy-900">Heading XL — Page Headers</p>
            <p className="font-serif text-heading-lg text-navy-900">Heading LG — Card Titles</p>
            <p className="font-serif text-heading text-navy-900">Heading — Subsection</p>
            <p className="font-serif text-heading-sm text-navy-900">Heading SM — Small Headers</p>
            <div className="border-t border-ivory-400 pt-4">
              <p className="font-sans text-body-lg text-charcoal-700">Body LG — Introductory paragraphs (Inter)</p>
              <p className="font-sans text-body text-charcoal-700">Body — Default paragraph text (Inter)</p>
              <p className="font-sans text-body-sm text-charcoal-500">Body SM — Secondary text, labels (Inter)</p>
              <p className="font-sans text-caption text-charcoal-400">Caption — Helper text, timestamps</p>
              <p className="font-sans text-overline uppercase tracking-widest text-charcoal-400">Overline — Category labels</p>
            </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ivory-400 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="font-serif text-heading-sm text-navy-900">
            IvyAmbition Design System
          </p>
          <p className="mt-1 font-sans text-body-sm text-charcoal-400">
            All {navAnchors.length} components rendered in all variants. Visually verify above before moving on.
          </p>
        </div>
      </footer>
    </div>
  );
}
