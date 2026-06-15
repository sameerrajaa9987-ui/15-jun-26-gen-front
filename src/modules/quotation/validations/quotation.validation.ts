import { z } from "zod";

export const quotationItemSchema = z.object({
  description: z.string().trim().min(1, "Required"),
  model: z.string().trim().optional(),
  kva: z.coerce.number().min(0).optional(),
  hsnCode: z.string().trim().optional(),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  taxRate: z.coerce.number().min(0).max(100),
});

export const quotationSchema = z.object({
  docType: z.enum(["quotation", "proforma"]),
  date: z.string().trim().optional(),
  validUntil: z.string().trim().optional(),
  customerName: z.string().trim().min(1, "Customer name is required"),
  customerMobile: z.string().trim().optional(),
  customerEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  customerAddress: z.string().trim().optional(),
  customerGstin: z.string().trim().optional(),
  customerState: z.string().trim().optional(),
  isInterState: z.boolean(),
  items: z.array(quotationItemSchema).min(1, "Add at least one line item"),
  termsText: z.string().optional(),
  notes: z.string().trim().optional(),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
