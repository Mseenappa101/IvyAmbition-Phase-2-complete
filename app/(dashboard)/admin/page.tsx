import { BarChart3, DollarSign, GraduationCap, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";

const stats = [
  {
    label: "Total Students",
    value: "156",
    icon: GraduationCap,
    bg: "bg-navy-50",
    color: "text-navy-700",
  },
  {
    label: "Active Coaches",
    value: "14",
    icon: Users,
    bg: "bg-gold-50",
    color: "text-gold-700",
  },
  {
    label: "Acceptance Rate",
    value: "92%",
    icon: BarChart3,
    bg: "bg-emerald-50",
    color: "text-emerald-700",
  },
  {
    label: "Monthly Revenue",
    value: "$48K",
    icon: DollarSign,
    bg: "bg-ivory-200",
    color: "text-charcoal-600",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-display text-navy-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 font-sans text-body-lg text-charcoal-400">
          Platform overview and management.
        </p>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-serif text-heading text-navy-900">
              Platform Health
            </h2>
          </CardHeader>
          <CardContent>
            <p className="font-sans text-body text-charcoal-400">
              System metrics and platform analytics will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-serif text-heading text-navy-900">
              Recent Registrations
            </h2>
          </CardHeader>
          <CardContent>
            <p className="font-sans text-body text-charcoal-400">
              New user registrations and coach applications will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
