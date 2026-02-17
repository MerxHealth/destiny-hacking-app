import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Shield,
  CreditCard,
  MessageSquare,
  UserCog,
} from "lucide-react";

const actionIcons: Record<string, React.ElementType> = {
  update_role: UserCog,
  grant_subscription: CreditCard,
  revoke_subscription: CreditCard,
  update_feedback: MessageSquare,
};

const actionLabels: Record<string, string> = {
  update_role: "Updated user role",
  grant_subscription: "Granted subscription",
  revoke_subscription: "Revoked subscription",
  update_feedback: "Updated feedback status",
};

const actionColors: Record<string, string> = {
  update_role: "text-blue-500",
  grant_subscription: "text-emerald-500",
  revoke_subscription: "text-red-500",
  update_feedback: "text-orange-500",
};

export default function AdminActivityLog() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.admin.getActivityLog.useQuery({
    page,
    limit: 30,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track all admin actions on the platform
          </p>
        </div>

        <Card className="bg-card border-border">
          <div className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-48" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                </div>
              ))
            ) : data?.logs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No activity recorded yet
              </div>
            ) : (
              data?.logs.map((entry) => {
                const Icon = actionIcons[entry.log.action] || Shield;
                const label = actionLabels[entry.log.action] || entry.log.action;
                const color = actionColors[entry.log.action] || "text-muted-foreground";
                const details = entry.log.details as Record<string, unknown> | null;

                return (
                  <div key={entry.log.id} className="p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-muted/50 shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          <span className={color}>{label}</span>
                          {entry.log.targetUserId && (
                            <span className="text-muted-foreground">
                              {" "}— User #{entry.log.targetUserId}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {entry.adminName || `Admin #${entry.log.adminId}`}
                        </p>
                        {details && (
                          <div className="mt-1 text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 inline-block">
                            {Object.entries(details)
                              .filter(([_, v]) => v !== null && v !== undefined)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {new Date(entry.log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
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
