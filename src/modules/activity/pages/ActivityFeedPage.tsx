import { useState } from "react";
import { Activity as ActivityIcon, RefreshCw, Send } from "lucide-react";
import { useActivities, useCreateNote } from "../hooks/useActivities";
import { ACTIVITY_META, ACTIVITY_TYPES, ENTITY_TYPES } from "../constants/activity.constants";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatDateTime } from "@/lib/utils";
import { PageLoader } from "@/shared/components/PageLoader";
import type { ActivityType, EntityType } from "../types";

const selectCls =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition";

export function ActivityFeedPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ActivityType | "">("");
  const [entityType, setEntityType] = useState<EntityType | "">("");
  const [page, setPage] = useState(1);
  const [note, setNote] = useState("");

  const { data, isLoading, refetch } = useActivities({
    search: search || undefined,
    type: type || undefined,
    entityType: entityType || undefined,
    page,
    limit: 50,
  });
  const createNote = useCreateNote();
  const items = data?.items ?? [];

  async function addNote() {
    if (!note.trim()) {
      toast.error("Enter a note");
      return;
    }
    try {
      await createNote.mutateAsync({ remarks: note.trim() });
      toast.success("Note added");
      setNote("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="erp-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
            <p className="text-sm text-muted-foreground">
              Audit trail of leads, quotations, sales & inventory · {data?.meta.total ?? 0} entries
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Manual note composer */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[260px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Add a manual note (e.g. customer visit)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Visited customer site, discussed AMC..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
        <button
          onClick={addNote}
          disabled={createNote.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm transition-colors"
        >
          <Send className="h-4 w-4" /> Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Action, customer, user, remarks..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
          <select
            className={selectCls}
            value={type}
            onChange={(e) => {
              setType(e.target.value as ActivityType | "");
              setPage(1);
            }}
          >
            <option value="">All</option>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACTIVITY_META[t].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Entity</label>
          <select
            className={selectCls}
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value as EntityType | "");
              setPage(1);
            }}
          >
            <option value="">All</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
          No activity yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
          {items.map((a) => {
            const meta = ACTIVITY_META[a.type];
            const Icon = meta?.icon ?? ActivityIcon;
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ${meta?.color ?? ""}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-medium text-foreground">{a.action}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(a.createdAt)}
                    </span>
                  </div>
                  {a.remarks && <p className="text-sm text-muted-foreground">{a.remarks}</p>}
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {meta?.label ?? a.type}
                    </span>
                    {a.entityLabel && <span>· {a.entityLabel}</span>}
                    <span>· by {a.userName || a.user?.name || "system"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            disabled={!data.meta.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-accent"
          >
            Prev
          </button>
          <span className="text-muted-foreground">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            disabled={!data.meta.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-accent"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
