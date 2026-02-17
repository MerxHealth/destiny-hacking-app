import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Users,
  UserPlus,
  Activity,
  Target,
  MessageSquare,
  CreditCard,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = "emerald",
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
    red: "bg-red-500/10 text-red-500",
    cyan: "bg-cyan-500/10 text-cyan-500",
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`p-2 md:p-2.5 rounded-lg ${colorClasses[color] || colorClasses.emerald}`}>
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 120;

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-[2px] h-[120px]">
        {data.map((d, i) => {
          const height = (d.count / maxCount) * chartHeight;
          return (
            <div
              key={i}
              className="flex-1 group relative"
              style={{ minWidth: "4px" }}
            >
              <div
                className="w-full bg-emerald-500/80 rounded-t-sm hover:bg-emerald-400 transition-colors cursor-pointer"
                style={{ height: `${Math.max(height, 2)}px` }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 border border-border">
                {d.date}: {d.count}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: signupChart } = trpc.admin.getSignupChart.useQuery({ days: 30 });
  const { data: activeChart } = trpc.admin.getActiveUsersChart.useQuery({ days: 30 });

  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of Destiny Hacking platform metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="New This Week"
            value={stats?.newUsersWeek ?? 0}
            icon={UserPlus}
            color="emerald"
          />
          <StatCard
            title="Active Today"
            value={stats?.activeToday ?? 0}
            icon={Activity}
            color="cyan"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions ?? 0}
            icon={CreditCard}
            color="purple"
          />
          <StatCard
            title="Total Calibrations"
            value={stats?.totalCalibrations ?? 0}
            icon={Target}
            color="orange"
          />
          <StatCard
            title="Daily Cycles"
            value={stats?.totalCycles ?? 0}
            icon={TrendingUp}
            description={`${stats?.cycleCompletionRate ?? 0}% completion rate`}
            color="emerald"
          />
          <StatCard
            title="Pending Feedback"
            value={stats?.pendingFeedback ?? 0}
            icon={MessageSquare}
            description={`${stats?.totalFeedback ?? 0} total`}
            color="red"
          />
          <StatCard
            title="New This Month"
            value={stats?.newUsersMonth ?? 0}
            icon={BarChart3}
            color="blue"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Signups (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniChart data={signupChart ?? []} label="Signups" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniChart data={activeChart ?? []} label="Active" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
