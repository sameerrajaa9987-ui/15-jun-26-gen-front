import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createResourceHooks } from "@/modules/common/createResourceHooks";
import {
  listQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  setQuotationStatus,
} from "../api/quotationApi";
import type {
  QuotationListQuery,
  QuotationCreatePayload,
  QuotationListResult,
  DocStatus,
} from "../types";

const crud = createResourceHooks<QuotationListQuery, QuotationCreatePayload, QuotationListResult>(
  "quotations",
  {
    list: listQuotations,
    create: createQuotation,
    update: updateQuotation,
    remove: deleteQuotation,
  },
);

export const useQuotations = crud.useList;
export const useCreateQuotation = crud.useCreate;
export const useUpdateQuotation = crud.useUpdate;
export const useDeleteQuotation = crud.useDelete;

export function useSetQuotationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DocStatus }) =>
      setQuotationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations", "list"] }),
  });
}
