export type UserRef = { id: string; name?: string } | null;

export type Sale = {
  id: string;
  saleDate: string;
  inventoryId?: string | null;
  modelName: string;
  brand?: string;
  kva?: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  customerMobile?: string;
  leadId?: string | null;
  salesExecutive: UserRef;
  salesExecutiveName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SaleListQuery = {
  search?: string;
  salesExecutive?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
};

export type SaleListResult = {
  items: Sale[];
  meta: {
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    limit: number;
  };
};

export type SaleCreatePayload = {
  inventoryId?: string;
  modelName?: string;
  brand?: string;
  kva?: number;
  quantity: number;
  unitPrice: number;
  saleDate?: string;
  customerName: string;
  customerMobile?: string;
  notes?: string;
};
