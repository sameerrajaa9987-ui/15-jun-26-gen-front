import { useState } from "react";
import { Pencil, FileText, MessageCircle, Download } from "lucide-react";
import { ResourceListPage } from "@/modules/common/ResourceListPage";
import { QuotationDialog } from "../components/QuotationDialog";
import { useQuotations, useDeleteQuotation, useSetQuotationStatus } from "../hooks/useQuotations";
import { quotationPdfPath } from "../api/quotationApi";
import {
  DOC_STATUS_LABELS,
  DOC_STATUS_COLORS,
  DOC_STATUSES,
} from "../constants/quotation.constants";
import { openAuthenticatedPdf, downloadAuthenticatedPdf } from "@/shared/lib/openAuthenticatedPdf";
import { shareViaWhatsApp } from "@/shared/lib/shareDocument";
import { useAppSelector } from "@/app/hooks";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quotation, QuotationListQuery, DocType, DocStatus } from "../types";

const TABS: { key: DocType; label: string }[] = [
  { key: "quotation", label: "Quotations" },
  { key: "proforma", label: "Proforma Invoices" },
];

export function QuotationListPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const canDelete = role === "admin";
  const [docType, setDocType] = useState<DocType>("quotation");
  const statusMutation = useSetQuotationStatus();

  async function viewPdf(q: Quotation) {
    try {
      await openAuthenticatedPdf(quotationPdfPath(q.id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function downloadPdf(q: Quotation) {
    try {
      await downloadAuthenticatedPdf(quotationPdfPath(q.id), `${q.docNumberFormatted}.pdf`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  function shareWhatsApp(q: Quotation) {
    const label = q.docType === "quotation" ? "quotation" : "proforma invoice";
    const msg =
      `Hello ${q.customerName},\n\nPlease find our ${label} ${q.docNumberFormatted} for ` +
      `${formatCurrency(q.grandTotal)}. I will share the PDF here shortly.\n\nThank you.`;
    shareViaWhatsApp(q.customerMobile, msg);
  }

  async function changeStatus(q: Quotation, status: DocStatus) {
    try {
      await statusMutation.mutateAsync({ id: q.id, status });
      toast.success(`Marked ${DOC_STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setDocType(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              docType === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card hover:bg-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ResourceListPage<Quotation, QuotationListQuery>
        key={docType}
        title={docType === "quotation" ? "Quotations" : "Proforma Invoices"}
        subtitle="GST-enabled documents with PDF & share"
        newButtonText={docType === "quotation" ? "New Quotation" : "New Proforma"}
        searchPlaceholder="Search by customer or number..."
        minTableWidth="min-w-[1100px]"
        emptyText="No documents yet. Create your first one."
        deleteConfirmText="Delete this document? This cannot be undone."
        columns={[
          {
            header: "Number",
            getValue: (q) => (
              <span className="font-mono font-semibold text-primary">{q.docNumberFormatted}</span>
            ),
          },
          { header: "Date", getValue: (q) => formatDate(q.date) },
          {
            header: "Customer",
            getValue: (q) => <span className="font-medium">{q.customerName}</span>,
          },
          { header: "Items", getValue: (q) => q.items.length },
          { header: "Taxable", getValue: (q) => formatCurrency(q.taxableValue) },
          {
            header: "GST",
            getValue: (q) =>
              q.isInterState ? `IGST ${formatCurrency(q.igst)}` : formatCurrency(q.cgst + q.sgst),
          },
          {
            header: "Grand Total",
            getValue: (q) => <span className="font-semibold">{formatCurrency(q.grandTotal)}</span>,
          },
          {
            header: "Status",
            getValue: (q) => (
              <select
                value={q.status}
                onChange={(e) => changeStatus(q, e.target.value as DocStatus)}
                className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-ring ${DOC_STATUS_COLORS[q.status]}`}
              >
                {DOC_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DOC_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            ),
          },
        ]}
        useList={useQuotations}
        useDelete={canDelete ? useDeleteQuotation : undefined}
        buildQuery={({ search, page, limit }) => ({
          search: search || undefined,
          docType,
          page,
          limit,
        })}
        renderActions={(q, onEdit) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(q)}
              className="rounded-md border border-border bg-background p-1.5 hover:bg-accent transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => viewPdf(q)}
              className="rounded-md border border-border bg-background p-1.5 hover:bg-accent transition-colors"
              title="View PDF"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => downloadPdf(q)}
              className="rounded-md border border-border bg-background p-1.5 hover:bg-accent transition-colors"
              title="Download PDF"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => shareWhatsApp(q)}
              className="rounded-md border border-green-500/30 bg-green-500/10 p-1.5 text-green-600 hover:bg-green-500/20 transition-colors"
              title="Share on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        renderDialog={({ open, onOpenChange, mode, value, onSuccess }) => (
          <QuotationDialog
            open={open}
            onOpenChange={onOpenChange}
            mode={mode}
            value={value}
            defaultDocType={docType}
            onSuccess={onSuccess}
          />
        )}
      />
    </div>
  );
}
