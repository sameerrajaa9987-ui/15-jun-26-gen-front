import { useState } from "react";
import { Pencil, MessageSquare, CheckCircle2, History } from "lucide-react";
import { ResourceListPage } from "@/modules/common/ResourceListPage";
import { LeadDialog } from "../components/LeadDialog";
import { FollowUpDialog } from "../components/FollowUpDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { LeadTimelineDialog } from "@/modules/activity/components/LeadTimelineDialog";
import { useLeads, useDeleteLead } from "../hooks/useLeads";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_SOURCES,
} from "../constants/lead.constants";
import { useAppSelector } from "@/app/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Lead, LeadListQuery, LeadStatus, LeadSource } from "../types";

const filterSelectCls =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition";

export function LeadListPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const canDelete = role === "admin";
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [source, setSource] = useState<LeadSource | "">("");

  // Follow-up dialog state (kept here since ResourceListPage owns its own dialog).
  const [followLead, setFollowLead] = useState<Lead | null>(null);
  const [followOpen, setFollowOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [timelineLead, setTimelineLead] = useState<Lead | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  return (
    <>
      <ResourceListPage<Lead, LeadListQuery>
        title="Leads"
        subtitle="Generator enquiries and the lead-to-sale pipeline"
        newButtonText="New Lead"
        searchPlaceholder="Search by customer, mobile, city, requirement..."
        minTableWidth="min-w-[1100px]"
        emptyText="No leads found. Create your first lead."
        deleteConfirmText="Delete this lead? This removes it from the pipeline (history is retained)."
        columns={[
          {
            header: "Customer",
            getValue: (l) => (
              <div>
                <div className="font-medium text-foreground">{l.customerName}</div>
                <div className="text-xs text-muted-foreground">{l.mobile || "-"}</div>
              </div>
            ),
          },
          { header: "City", getValue: (l) => l.city || "-" },
          {
            header: "Requirement",
            getValue: (l) => (
              <span className="block max-w-[220px] truncate" title={l.requirement}>
                {l.requirement || "-"}
              </span>
            ),
          },
          {
            header: "KVA",
            getValue: (l) => (l.requiredKva ? `${l.requiredKva}` : "-"),
            className: "font-mono",
          },
          {
            header: "Est. Value",
            getValue: (l) => (l.estimatedValue ? formatCurrency(l.estimatedValue) : "-"),
          },
          { header: "Source", getValue: (l) => LEAD_SOURCE_LABELS[l.source] },
          {
            header: "Status",
            getValue: (l) => (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_STATUS_COLORS[l.status]}`}
              >
                {LEAD_STATUS_LABELS[l.status]}
              </span>
            ),
          },
          { header: "Assigned", getValue: (l) => l.assignedTo?.name || "-" },
          {
            header: "Next Follow-up",
            getValue: (l) =>
              l.nextFollowUpDate ? (
                <span className="text-primary">{formatDate(l.nextFollowUpDate)}</span>
              ) : (
                "-"
              ),
          },
        ]}
        useList={useLeads}
        useDelete={canDelete ? useDeleteLead : undefined}
        buildQuery={({ search, page, limit }) => ({
          search: search || undefined,
          status: status || undefined,
          source: source || undefined,
          page,
          limit,
        })}
        renderFilters={({ search, setSearch }) => (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Customer, mobile, city, requirement..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select
                className={filterSelectCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus | "")}
              >
                <option value="">All</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Source</label>
              <select
                className={filterSelectCls}
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource | "")}
              >
                <option value="">All</option>
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_SOURCE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        renderActions={(lead, onEdit) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(lead)}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button
              onClick={() => {
                setFollowLead(lead);
                setFollowOpen(true);
              }}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              title="Follow-ups"
            >
              <MessageSquare className="h-3 w-3" />
              {lead.followUps.length > 0 ? lead.followUps.length : ""}
            </button>
            <button
              onClick={() => {
                setTimelineLead(lead);
                setTimelineOpen(true);
              }}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              title="Activity timeline"
            >
              <History className="h-3 w-3" />
            </button>
            {lead.status !== "converted" && lead.status !== "not_interested" && (
              <button
                onClick={() => {
                  setConvertLead(lead);
                  setConvertOpen(true);
                }}
                className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                title="Convert to sale"
              >
                <CheckCircle2 className="h-3 w-3" /> Convert
              </button>
            )}
          </div>
        )}
        renderDialog={({ open, onOpenChange, mode, value, onSuccess }) => (
          <LeadDialog
            open={open}
            onOpenChange={onOpenChange}
            mode={mode}
            value={value}
            onSuccess={onSuccess}
          />
        )}
      />

      <FollowUpDialog
        open={followOpen}
        onOpenChange={setFollowOpen}
        lead={followLead}
        onSuccess={() => undefined}
      />

      <ConvertLeadDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        lead={convertLead}
        onSuccess={() => undefined}
      />

      <LeadTimelineDialog
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        leadId={timelineLead?.id ?? null}
        leadName={timelineLead?.customerName}
      />
    </>
  );
}
