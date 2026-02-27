import {
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileEdit,
  ArrowUpRight,
  Sparkles,
  Target,
} from "lucide-react";

const stats = [
  {
    label: "Schools",
    value: "8",
    change: "+2 this week",
    icon: GraduationCap,
    accent: "bg-gold-500/15 text-gold-400",
  },
  {
    label: "Upcoming Deadlines",
    value: "3",
    change: "Next: Mar 15",
    icon: CalendarCheck,
    accent: "bg-emerald-500/15 text-emerald-500",
  },
  {
    label: "Tasks Completed",
    value: "12",
    change: "85% completion",
    icon: CheckCircle2,
    accent: "bg-gold-500/15 text-gold-400",
  },
  {
    label: "Hours Coached",
    value: "24",
    change: "+4 this month",
    icon: Clock,
    accent: "bg-emerald-500/15 text-emerald-500",
  },
];

const quickActions = [
  { label: "Add a school", icon: GraduationCap },
  { label: "Start an essay", icon: FileEdit },
  { label: "View deadlines", icon: CalendarCheck },
  { label: "Ask AI assistant", icon: Sparkles },
];

const deadlines = [
  { school: "Harvard University", deadline: "Mar 15, 2026", type: "Regular Decision", daysLeft: 16 },
  { school: "Stanford University", deadline: "Mar 20, 2026", type: "Regular Decision", daysLeft: 21 },
  { school: "Yale University", deadline: "Apr 1, 2026", type: "Regular Decision", daysLeft: 33 },
];

export default function StudentDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-display text-ivory-200">
          Welcome back
        </h1>
        <p className="mt-1 font-sans text-body-lg text-ivory-600">
          Here&apos;s an overview of your admissions journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-600 hover:shadow-elevated"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-caption uppercase tracking-wider text-ivory-700">
                  {stat.label}
                </p>
                <p className="mt-2 font-serif text-display text-ivory-200">
                  {stat.value}
                </p>
                <p className="mt-1 flex items-center gap-1 font-sans text-caption text-ivory-700">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {stat.change}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-700/50 px-6 py-4">
            <h2 className="font-serif text-heading text-ivory-200">
              Upcoming Deadlines
            </h2>
            <button className="flex items-center gap-1 font-sans text-caption font-medium text-gold-400 transition-colors hover:text-gold-300">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-navy-700/30">
            {deadlines.map((item) => (
              <div
                key={item.school}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-navy-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10">
                    <Target className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-sans text-body-sm font-medium text-ivory-200">
                      {item.school}
                    </p>
                    <p className="mt-0.5 font-sans text-caption text-ivory-700">
                      {item.type} &middot; {item.deadline}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-gold-500/15 px-3 py-1 font-sans text-caption font-medium text-gold-400">
                  {item.daysLeft}d left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80">
          <div className="border-b border-navy-700/50 px-6 py-4">
            <h2 className="font-serif text-heading text-ivory-200">
              Quick Actions
            </h2>
          </div>
          <div className="space-y-2 p-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex w-full items-center gap-3 rounded-xl border border-navy-700/30 bg-navy-800/50 px-4 py-3 text-left font-sans text-body-sm font-medium text-ivory-400 transition-all hover:border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-400"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-heading text-ivory-200">
              Application Progress
            </h2>
            <p className="mt-1 font-sans text-body-sm text-ivory-700">
              You&apos;re making great progress on your applications.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15">
            <span className="font-serif text-heading-lg text-gold-400">
              65%
            </span>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-navy-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: "65%" }}
          />
        </div>
        <div className="mt-3 flex justify-between font-sans text-caption text-ivory-700">
          <span>5 of 8 essays drafted</span>
          <span>3 schools remaining</span>
        </div>
      </div>
    </div>
  );
}
