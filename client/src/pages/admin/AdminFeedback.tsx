import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  Eye,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-orange-500/10 text-orange-500",
  reviewed: "bg-blue-500/10 text-blue-500",
  resolved: "bg-emerald-500/10 text-emerald-500",
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  reviewed: Eye,
  resolved: CheckCircle,
};

const issueTypeLabels: Record<string, string> = {
  audio_quality: "Audio Quality",
  text_error: "Text Error",
  translation_issue: "Translation Issue",
  other: "Other",
};

export default function AdminFeedback() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.getAllFeedback.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const updateStatus = trpc.admin.updateFeedbackStatus.useMutation({
    onSuccess: () => {
      utils.admin.getAllFeedback.invalidate();
      utils.admin.getDashboardStats.invalidate();
      toast.success("Feedback status updated");
      setSelectedFeedback(null);
      setAdminNotes("");
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage chapter feedback from users
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] bg-card border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
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
                  <th className="text-left p-3 font-medium text-muted-foreground">Chapter</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse">
                      <td className="p-3"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-12" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-20" /></td>
                      <td className="p-3 hidden md:table-cell"><div className="h-4 bg-muted rounded w-40" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-16" /></td>
                      <td className="p-3 hidden lg:table-cell"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : data?.feedback.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No feedback found
                    </td>
                  </tr>
                ) : (
                  data?.feedback.map((row) => {
                    const StatusIcon = statusIcons[row.feedback.status] || Clock;
                    return (
                      <tr
                        key={row.feedback.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-3">
                          <p className="font-medium">{row.userName || "Unknown"}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-muted-foreground">
                            Ch. {row.feedback.chapterNumber} ({row.feedback.language.toUpperCase()})
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs">
                            {issueTypeLabels[row.feedback.issueType] || row.feedback.issueType}
                          </span>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <p className="text-muted-foreground text-xs truncate max-w-[250px]">
                            {row.feedback.description}
                          </p>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[row.feedback.status] || ""}`}>
                            <StatusIcon className="w-3 h-3" />
                            {row.feedback.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">
                          {new Date(row.feedback.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(row);
                              setAdminNotes(row.feedback.adminNotes || "");
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
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

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Feedback Detail</DialogTitle>
            <DialogDescription>
              Chapter {selectedFeedback?.feedback.chapterNumber} ({selectedFeedback?.feedback.language.toUpperCase()}) — {issueTypeLabels[selectedFeedback?.feedback.issueType] || ""}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">From: {selectedFeedback.userName || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{selectedFeedback.userEmail}</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm">{selectedFeedback.feedback.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this feedback..."
                  className="bg-background border-border"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {selectedFeedback.feedback.status !== "reviewed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      updateStatus.mutate({
                        feedbackId: selectedFeedback.feedback.id,
                        status: "reviewed",
                        adminNotes,
                      })
                    }
                    disabled={updateStatus.isPending}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Mark Reviewed
                  </Button>
                )}
                {selectedFeedback.feedback.status !== "resolved" && (
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() =>
                      updateStatus.mutate({
                        feedbackId: selectedFeedback.feedback.id,
                        status: "resolved",
                        adminNotes,
                      })
                    }
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
