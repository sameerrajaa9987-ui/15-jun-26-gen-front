import { http } from "@/shared/api/http";
import { createResourceApi } from "@/modules/common/createResourceApi";
import type { Quotation, QuotationListQuery, QuotationCreatePayload, DocStatus } from "../types";

const api = createResourceApi<Quotation, QuotationListQuery, QuotationCreatePayload>("/quotations");

export const listQuotations = (query: QuotationListQuery) => api.list(query);
export const createQuotation = (payload: QuotationCreatePayload) => api.create(payload);
export const updateQuotation = (id: string, payload: Partial<QuotationCreatePayload>) =>
  api.update(id, payload);
export const deleteQuotation = (id: string) => api.remove(id);

export async function setQuotationStatus(id: string, status: DocStatus) {
  const res = await http.patch<{ data: Quotation }>(`/quotations/${id}/status`, { status });
  return res.data.data;
}

export const quotationPdfPath = (id: string) => `/quotations/${id}/pdf`;
