import { useState } from "react";
import { Pencil, Plus, RefreshCw, Power } from "lucide-react";
import { useUsers, useUpdateUser } from "../hooks/useUsers";
import { UserDialog } from "../components/UserDialog";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDate } from "@/lib/utils";
import { PageLoader } from "@/shared/components/PageLoader";
import type { AuthUser } from "@/modules/auth/authSlice";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  sales: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  inventory: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function UsersPage() {
  const { data: users, isLoading, refetch } = useUsers();
  const updateMutation = useUpdateUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<AuthUser | null>(null);

  async function toggleActive(u: AuthUser) {
    try {
      await updateMutation.mutateAsync({ id: u.id, payload: { isActive: !u.isActive } });
      toast.success(u.isActive ? "User deactivated" : "User activated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="erp-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Users &amp; Roles</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts and role-based access · {users?.length ?? 0} users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              setMode("create");
              setEditing(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            New User
          </button>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="overflow-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Actions", "Name", "Email", "Role", "Phone", "Status", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setMode("edit");
                          setEditing(u);
                          setDialogOpen(true);
                        }}
                        className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => toggleActive(u)}
                        className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                      >
                        <Power className="h-3 w-3" /> {u.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium">{u.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[u.role] ?? ""}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{u.phone || "-"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={mode}
        value={editing}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
