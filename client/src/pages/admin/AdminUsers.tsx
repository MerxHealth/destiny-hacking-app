import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Crown,
  Eye,
  ArrowUpDown,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function UserDetailDialog({
  userId,
  open,
  onClose,
}: {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: user, isLoading } = trpc.admin.getUserById.useQuery(
    { userId: userId! },
    { enabled: !!userId && open }
  );
  const { data: sub } = trpc.admin.getUserSubscription.useQuery(
    { userId: userId! },
    { enabled: !!userId && open }
  );

  const utils = trpc.useUtils();
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.getUsers.invalidate();
      utils.admin.getUserById.invalidate({ userId: userId! });
      toast.success("Role updated successfully");
    },
  });

  const grantSub = trpc.admin.grantSubscription.useMutation({
    onSuccess: () => {
      utils.admin.getUserSubscription.invalidate({ userId: userId! });
      utils.admin.getUserById.invalidate({ userId: userId! });
      utils.admin.getSubscriptions.invalidate();
      toast.success("Subscription granted");
    },
  });

  const revokeSub = trpc.admin.revokeSubscription.useMutation({
    onSuccess: () => {
      utils.admin.getUserSubscription.invalidate({ userId: userId! });
      utils.admin.getUserById.invalidate({ userId: userId! });
      utils.admin.getSubscriptions.invalidate();
      toast.success("Subscription revoked");
    },
  });

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View and manage user information</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{user.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className={`font-medium ${user.role === "admin" ? "text-emerald-500" : ""}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Login Method</span>
                <span className="font-medium">{user.loginMethod || "oauth"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active</span>
                <span className="font-medium">
                  {new Date(user.lastSignedIn).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{user.stats.calibrations}</p>
                <p className="text-xs text-muted-foreground">Calibrations</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{user.stats.dailyCycles}</p>
                <p className="text-xs text-muted-foreground">Cycles</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{user.stats.insights}</p>
                <p className="text-xs text-muted-foreground">Insights</p>
              </div>
            </div>

            {/* Subscription */}
            <div className="border border-border rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium">Subscription</p>
              {sub ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium capitalize">{sub.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium capitalize ${sub.status === "active" ? "text-emerald-500" : "text-orange-500"}`}>
                      {sub.status}
                    </span>
                  </div>
                  {sub.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => revokeSub.mutate({ subscriptionId: sub.id, userId: user.id })}
                    disabled={revokeSub.isPending}
                  >
                    Revoke Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">No active subscription</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => grantSub.mutate({ userId: user.id, plan: "monthly" })}
                      disabled={grantSub.isPending}
                    >
                      Monthly
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => grantSub.mutate({ userId: user.id, plan: "yearly" })}
                      disabled={grantSub.isPending}
                    >
                      Yearly
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => grantSub.mutate({ userId: user.id, plan: "lifetime" })}
                      disabled={grantSub.isPending}
                    >
                      Lifetime
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() =>
                  updateRole.mutate({
                    userId: user.id,
                    role: user.role === "admin" ? "user" : "admin",
                  })
                }
                disabled={updateRole.isPending}
              >
                {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">User not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "lastSignedIn" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data, isLoading } = trpc.admin.getUsers.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter !== "all" ? (roleFilter as "user" | "admin") : undefined,
    sortBy,
    sortOrder,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} total users
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              className="pl-9 bg-card border-border"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] bg-card border-border">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                  <th
                    className="text-left p-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden sm:table-cell"
                    onClick={() => {
                      if (sortBy === "createdAt") {
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                      } else {
                        setSortBy("createdAt");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Joined <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-left p-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden lg:table-cell"
                    onClick={() => {
                      if (sortBy === "lastSignedIn") {
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                      } else {
                        setSortBy("lastSignedIn");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Last Active <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse">
                      <td className="p-3"><div className="h-4 bg-muted rounded w-32" /></td>
                      <td className="p-3 hidden md:table-cell"><div className="h-4 bg-muted rounded w-40" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-16" /></td>
                      <td className="p-3 hidden sm:table-cell"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="p-3 hidden lg:table-cell"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="p-3"><div className="h-4 bg-muted rounded w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  data?.users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {user.role === "admin" ? (
                              <Crown className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground md:hidden truncate">
                              {user.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                        {user.email || "—"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.role === "admin" && <Shield className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden sm:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">
                        {new Date(user.lastSignedIn).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserDetailDialog
        userId={selectedUserId}
        open={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </AdminLayout>
  );
}
