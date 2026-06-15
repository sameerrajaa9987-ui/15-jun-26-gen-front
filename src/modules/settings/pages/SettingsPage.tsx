import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Building2, Save } from "lucide-react";
import { useBusinessProfile, useUpdateBusinessProfile } from "../hooks/useSettings";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { PageLoader } from "@/shared/components/PageLoader";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition";

type FormValues = {
  businessName: string;
  tagline: string;
  gstin: string;
  officeAddress: string;
  serviceCenterAddress: string;
  mobileNumbers: string;
  email: string;
  website: string;
  jurisdiction: string;
  defaultCgstRate: number;
  defaultSgstRate: number;
  defaultIgstRate: number;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { data, isLoading } = useBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();
  const form = useForm<FormValues>();

  useEffect(() => {
    if (data) {
      form.reset({
        businessName: data.businessName ?? "",
        tagline: data.tagline ?? "",
        gstin: data.gstin ?? "",
        officeAddress: data.officeAddress ?? "",
        serviceCenterAddress: data.serviceCenterAddress ?? "",
        mobileNumbers: (data.mobileNumbers ?? []).join(", "),
        email: data.email ?? "",
        website: data.website ?? "",
        jurisdiction: data.jurisdiction ?? "",
        defaultCgstRate: data.defaultCgstRate ?? 9,
        defaultSgstRate: data.defaultSgstRate ?? 9,
        defaultIgstRate: data.defaultIgstRate ?? 18,
        bankName: data.bankName ?? "",
        bankAccountNumber: data.bankAccountNumber ?? "",
        bankIfsc: data.bankIfsc ?? "",
      });
    }
  }, [data, form]);

  if (isLoading) return <PageLoader />;

  async function onSubmit(values: FormValues) {
    try {
      await updateMutation.mutateAsync({
        ...values,
        defaultCgstRate: Number(values.defaultCgstRate),
        defaultSgstRate: Number(values.defaultSgstRate),
        defaultIgstRate: Number(values.defaultIgstRate),
        mobileNumbers: values.mobileNumbers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Business profile updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="erp-page max-w-4xl">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Company details used on quotations, proforma invoices, and GST breakup
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Company</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Business Name *">
                <input className={inputCls} {...form.register("businessName")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Tagline">
                <input className={inputCls} {...form.register("tagline")} />
              </Field>
            </div>
            <Field label="GSTIN">
              <input className={inputCls} {...form.register("gstin")} />
            </Field>
            <Field label="Jurisdiction">
              <input className={inputCls} {...form.register("jurisdiction")} />
            </Field>
            <Field label="Email">
              <input className={inputCls} {...form.register("email")} />
            </Field>
            <Field label="Website">
              <input className={inputCls} {...form.register("website")} />
            </Field>
            <Field label="Mobile Numbers (comma separated)">
              <input className={inputCls} {...form.register("mobileNumbers")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Office Address">
                <textarea className={inputCls} rows={2} {...form.register("officeAddress")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Service Center Address">
                <textarea
                  className={inputCls}
                  rows={2}
                  {...form.register("serviceCenterAddress")}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Tax Defaults (%)</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="CGST">
              <input
                type="number"
                step="0.01"
                className={inputCls}
                {...form.register("defaultCgstRate")}
              />
            </Field>
            <Field label="SGST">
              <input
                type="number"
                step="0.01"
                className={inputCls}
                {...form.register("defaultSgstRate")}
              />
            </Field>
            <Field label="IGST">
              <input
                type="number"
                step="0.01"
                className={inputCls}
                {...form.register("defaultIgstRate")}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Bank Details (Proforma footer)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Bank Name">
              <input className={inputCls} {...form.register("bankName")} />
            </Field>
            <Field label="Account Number">
              <input className={inputCls} {...form.register("bankAccountNumber")} />
            </Field>
            <Field label="IFSC">
              <input className={inputCls} {...form.register("bankIfsc")} />
            </Field>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
