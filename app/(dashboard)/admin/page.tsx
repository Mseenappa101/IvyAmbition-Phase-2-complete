import {
  BarChart3,
  DollarSign,
  GraduationCap,
  Users,
  UserX,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import {
  fetchAdminMetrics,
  fetchSignupsByMonth,
  fetchApplicationsByType,
} from "@/lib/actions/admin";

const typeLabels: Record<string, string> = {
  undergraduate: "Undergraduate",
  law_school: "Law School",
  transfer: "Transfer",
};

const typeColors: Record<string, string> = {
  undergraduate: "bg-gold-500",
  law_school: "bg-navy-600",
  transfer: "bg-emerald-500",
};

export default async function AdminDashboardPage() {
  const [metricsRes, signupsRes, appTypesRes] = await Promise.all([
    fetchAdminMetrics(),
    fetchSignupsByMonth(),
    fetchApplicationsByType(),
  ]);

  const metrics = metricsRes.data;
  const signups = signupsRes.data;
  const appTypes = appTypesRes.data;

  const stats = [
    {
      label: "Total Students",
      value: metrics?.totalStudents ?? 0,
      icon: GraduationCap,
      bg: "bg-navy-50",
      color: "text-navy-700",
    },
    {
      label: "Active Coaches",
      value: metrics?.totalCoaches ?? 0,
      icon: Users,
      bg: "bg-gold-50",
      color: "text-gold-700",
    },
    {
      label: "Unassigned Students",
      value: metrics?.unassignedStudents ?? 0,
      icon: UserX,
      bg: "bg-amber-50",
      color: "text-amber-700",
    },
    {
      label: "Active Applications",
      value: metrics?.activeApplications ?? 0,
      icon: FileText,
      bg: "bg-emerald-50",
      color: "text-emerald-700",
    },
  ];

  const maxSignups = Math.max(...signups.map((s) => s.count), 1);
  const totalApps = appTypes.reduce((sum, a) => sum + a.count, 0) || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-display text-navy-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 font-sans text-body-lg text-charcoal-400">
          Platform overview and management
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} hoverable>
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="font-sans text-caption uppercase tracking-wider text-charcoal-400">
                  {stat.label}
                </p>
                <p className="mt-2 font-serif text-display text-navy-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signups Over Time */}
        <Card>
          <CardHeader>
            <h2 className="font-serif text-heading text-navy-900">
              Student Signups
            </h2>
            <p className="mt-1 font-sans text-body-sm text-charcoal-400">
              Last 6 months
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signups.map((s) => (
                <div key={s.month} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 font-sans text-caption text-charcoal-500">
                    {s.month}
                  </span>
                  <div className="flex-1">
                    <div className="h-6 w-full overflow-hidden rounded-full bg-ivory-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all"
                        style={{
                          width: `${Math.max((s.count / maxSignups) * 100, 4)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right font-sans text-caption font-semibold text-navy-900">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Applications by Type */}
        <Card>
          <CardHeader>
            <h2 className="font-serif text-heading text-navy-900">
              Applications by Type
            </h2>
            <p className="mt-1 font-sans text-body-sm text-charcoal-400">
              Student distribution
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appTypes.map((a) => (
                <div key={a.type}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-sans text-body-sm font-medium text-charcoal-700">
                      {typeLabels[a.type] ?? a.type}
                    </span>
                    <span className="font-sans text-caption font-semibold text-charcoal-500">
                      {a.count} ({Math.round((a.count / totalApps) * 100)}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-ivory-200">
                    <div
                      className={`h-full rounded-full ${typeColors[a.type] ?? "bg-charcoal-400"}`}
                      style={{
                        width: `${(a.count / totalApps) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {appTypes.length === 0 && (
                <p className="font-sans text-body-sm text-charcoal-400">
                  No student data yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-charcoal-400" />
            <h2 className="font-serif text-heading text-navy-900">Revenue</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl bg-ivory-200/60 px-4 py-6 text-center">
            <BarChart3 className="h-8 w-8 text-charcoal-300" />
            <div className="text-left">
              <p className="font-sans text-body-sm font-medium text-charcoal-600">
                Revenue tracking coming soon
              </p>
              <p className="mt-0.5 font-sans text-caption text-charcoal-400">
                Stripe integration will be available in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
