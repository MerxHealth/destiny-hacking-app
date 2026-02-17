import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-red-500/10 text-red-500",
  paused: "bg-orange-500/10 text-orange-500",
  trial: "bg-blue-500/10 text-blue-500",
};

const planColors: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  monthly: "bg-blue-500/10 text-blue-500",
  yearly: "bg-purple-500/10 text-purple-500",
  lifetime: "bg-emerald-500/10 text-emerald-500",
};

export default function AdminSubscriptions() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.getSubscriptions.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    plan: planFilter !== "all" ? (planFilter as any) : undefined,
  });

  const revokeSub = trpc.admin.revokeSubscription.useMutation({
    onSuccess: () => {
      utils.admin.getSubscriptions.invalidate();
      utils.admin.getDashboardStats.invalidate();
      toast.success("Subscription revoked");
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage user subscriptions and plans
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] bg-card border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] bg-card border-border">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="lifetime">Lifetime</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Provider</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Start</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">End</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse">
                      <td className="p-3"><div className="h-4 bg-muted rounded w-32" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-20" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-16" /></td>
                      <td className="p-3 hidden md:table-cell"><div className="h-4 bg-muted rounded w-16" /></td>
                      <td className="p-3 hidden lg:table-cell"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="p-3 hidden lg:table-cell"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : data?.subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  data?.subscriptions.map((row) => (
                    <tr
                      key={row.subscription.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{row.userName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{row.userEmail || "—"}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${planColors[row.subscription.plan] || ""}`}>
                          {row.subscription.plan === "lifetime" && <Crown className="w-3 h-3" />}
                          {row.subscription.plan}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[row.subscription.status] || ""}`}>
                          {row.subscription.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden md:table-cell capitalize">
                        {row.subscription.provider}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">
                        {new Date(row.subscription.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">
                        {row.subscription.endDate
                          ? new Date(row.subscription.endDate).toLocaleDateString()
                          : "∞"}
                      </td>
                      <td className="p-3 text-right">
                        {row.subscription.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() =>
                              revokeSub.mutate({
                                subscriptionId: row.subscription.id,
                                userId: row.subscription.userId,
                              })
                            }
                            disabled={revokeSub.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
