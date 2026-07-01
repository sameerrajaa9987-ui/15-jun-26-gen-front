import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { FormDialog } from "@/modules/common/FormDialog";
import { quotationSchema, type QuotationFormValues } from "../validations/quotation.validation";
import { useCreateQuotation, useUpdateQuotation } from "../hooks/useQuotations";
import { DEFAULT_TERMS } from "../constants/quotation.constants";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { formatCurrency } from "@/lib/utils";
import type { Quotation } from "../types";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition";

const blankItem = {
  description: "",
  model: "",
  kva: undefined,
  hsnCode: "8502",
  quantity: 1,
  unitPrice: 0,
  discountPct: 0,
  taxRate: 18,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  value: Quotation | null;
  defaultDocType: "quotation" | "proforma";
  onSuccess: () => void;
}

export function QuotationDialog({
  open,
  onOpenChange,
  mode,
  value,
  defaultDocType,
  onSuccess,
}: Props) {
  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      docType: defaultDocType,
      isInterState: false,
      items: [{ ...blankItem }],
      termsText: DEFAULT_TERMS.join("\n"),
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const { errors } = form.formState;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && value) {
        form.reset({
          docType: value.docType,
          date: value.date ? value.date.substring(0, 10) : "",
          validUntil: value.validUntil ? value.validUntil.substring(0, 10) : "",
          customerName: value.customerName,
          customerMobile: value.customerMobile ?? "",
          customerEmail: value.customerEmail ?? "",
          customerAddress: value.customerAddress ?? "",
          customerGstin: value.customerGstin ?? "",
          customerState: value.customerState ?? "",
          isInterState: value.isInterState,
          items: value.items.map((it) => ({
            description: it.description,
            model: it.model ?? "",
            kva: it.kva,
            hsnCode: it.hsnCode ?? "8502",
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discountPct: it.discountPct ?? 0,
            taxRate: it.taxRate ?? 18,
          })),
          termsText: (value.terms ?? []).join("\n"),
          notes: value.notes ?? "",
        });
      } else {
        form.reset({
          docType: defaultDocType,
          date: "",
          validUntil: "",
          customerName: "",
          customerMobile: "",
          customerEmail: "",
          customerAddress: "",
          customerGstin: "",
          customerState: "",
          isInterState: false,
          items: [{ ...blankItem }],
          termsText: DEFAULT_TERMS.join("\n"),
          notes: "",
        });
      }
    }
  }, [open, mode, value, defaultDocType, form]);

  // Live totals preview (backend recomputes authoritatively).
  const watchedItems = form.watch("items");
  const isInterState = form.watch("isInterState");
  const totals = useMemo(() => {
    let taxable = 0;
    let tax = 0;
    (watchedItems || []).forEach((it) => {
      const gross = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
      const disc = (gross * (Number(it.discountPct) || 0)) / 100;
      const t = gross - disc;
      taxable += t;
      tax += (t * (Number(it.taxRate) || 0)) / 100;
    });
    const grand = Math.round(taxable + tax);
    return { taxable, tax, grand };
  }, [watchedItems]);

  async function onSubmit(data: QuotationFormValues) {
    try {
      const terms = (data.termsText || "")
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        docType: data.docType,
        date: data.date || undefined,
        validUntil: data.validUntil || undefined,
        customerName: data.customerName,
        customerMobile: data.customerMobile || undefined,
        customerEmail: data.customerEmail || undefined,
        customerAddress: data.customerAddress || undefined,
        customerGstin: data.customerGstin || undefined,
        customerState: data.customerState || undefined,
        isInterState: data.isInterState,
        items: data.items.map((it) => ({
          description: it.description,
          model: it.model || undefined,
          kva: it.kva || undefined,
          hsnCode: it.hsnCode || undefined,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          discountPct: Number(it.discountPct) || 0,
          taxRate: Number(it.taxRate),
        })),
        terms,
        notes: data.notes || undefined,
      };
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (value) {
        await updateMutation.mutateAsync({ id: value.id, payload });
      }
      toast.success(mode === "create" ? "Document created" : "Document updated");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const docType = form.watch("docType");

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "New Document" : `Edit ${value?.docNumberFormatted ?? "Document"}`}
      onSubmit={form.handleSubmit(onSubmit)}
      isPending={isPending}
      size="xl"
      submitLabel={mode === "create" ? "Create" : "Save Changes"}
    >
      <div className="space-y-5">
        {/* Doc type + dates */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
            <select className={inputCls} {...form.register("docType")} disabled={mode === "edit"}>
              <option value="quotation">Quotation</option>
              <option value="proforma">Proforma Invoice</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
            <input type="date" className={inputCls} {...form.register("date")} />
          </div>
          {docType === "quotation" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Valid Until
              </label>
              <input type="date" className={inputCls} {...form.register("validUntil")} />
            </div>
          )}
          <label className="flex items-end gap-2 text-sm text-foreground pb-1.5">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...form.register("isInterState")}
            />
            Inter-state (IGST)
          </label>
        </div>

        {/* Customer */}
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2">CUSTOMER</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <input
                className={inputCls}
                placeholder="Customer name *"
                {...form.register("customerName")}
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-destructive">{errors.customerName.message}</p>
              )}
            </div>
            <input className={inputCls} placeholder="Mobile" {...form.register("customerMobile")} />
            <input className={inputCls} placeholder="Email" {...form.register("customerEmail")} />
            <input className={inputCls} placeholder="GSTIN" {...form.register("customerGstin")} />
            <input className={inputCls} placeholder="State" {...form.register("customerState")} />
            <input
              className={inputCls}
              placeholder="Address"
              {...form.register("customerAddress")}
            />
          </div>
        </div>

        {/* Line items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-muted-foreground">LINE ITEMS</div>
            <button
              type="button"
              onClick={() => append({ ...blankItem })}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors"
            >
              <Plus className="h-3 w-3" /> Add item
            </button>
          </div>
          {/* Column headers — placeholders vanish once a box has a value, so
              these labels keep every column identifiable. */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-2 mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Model</div>
            <div className="col-span-1">KVA</div>
            <div className="col-span-1">HSN</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-1">Rate (₹)</div>
            <div className="col-span-1">Disc %</div>
            <div className="col-span-1">GST %</div>
          </div>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="rounded-lg border border-border p-2">
                <div className="grid grid-cols-12 gap-2">
                  <input
                    className={`${inputCls} col-span-12 sm:col-span-4`}
                    placeholder="Description *"
                    {...form.register(`items.${i}.description`)}
                  />
                  <input
                    className={`${inputCls} col-span-6 sm:col-span-2`}
                    placeholder="Model"
                    {...form.register(`items.${i}.model`)}
                  />
                  <input
                    type="number"
                    className={`${inputCls} col-span-3 sm:col-span-1`}
                    placeholder="KVA"
                    {...form.register(`items.${i}.kva`)}
                  />
                  <input
                    className={`${inputCls} col-span-3 sm:col-span-1`}
                    placeholder="HSN"
                    {...form.register(`items.${i}.hsnCode`)}
                  />
                  <input
                    type="number"
                    className={`${inputCls} col-span-2 sm:col-span-1`}
                    placeholder="Qty"
                    {...form.register(`items.${i}.quantity`)}
                  />
                  <input
                    type="number"
                    className={`${inputCls} col-span-4 sm:col-span-1`}
                    placeholder="Rate"
                    {...form.register(`items.${i}.unitPrice`)}
                  />
                  <input
                    type="number"
                    className={`${inputCls} col-span-3 sm:col-span-1`}
                    placeholder="Disc%"
                    {...form.register(`items.${i}.discountPct`)}
                  />
                  <div className="col-span-3 sm:col-span-1 flex items-center gap-1">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="GST%"
                      {...form.register(`items.${i}.taxRate`)}
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="rounded-md p-1 text-destructive hover:bg-destructive/10"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {errors.items?.[i]?.description && (
                  <p className="mt-1 text-xs text-destructive">Description is required</p>
                )}
              </div>
            ))}
          </div>
          {errors.items?.message && (
            <p className="mt-1 text-xs text-destructive">{errors.items.message}</p>
          )}
        </div>

        {/* Totals preview */}
        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          <span className="text-muted-foreground">
            Taxable: <strong className="text-foreground">{formatCurrency(totals.taxable)}</strong>
          </span>
          <span className="text-muted-foreground">
            {isInterState ? "IGST" : "GST"}:{" "}
            <strong className="text-foreground">{formatCurrency(totals.tax)}</strong>
          </span>
          <span className="text-base">
            Grand Total: <strong className="text-primary">{formatCurrency(totals.grand)}</strong>
          </span>
        </div>

        {/* Terms + notes */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Terms &amp; Conditions (one per line)
            </label>
            <textarea className={inputCls} rows={4} {...form.register("termsText")} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea className={inputCls} rows={4} {...form.register("notes")} />
          </div>
        </div>
      </div>
    </FormDialog>
  );
}
