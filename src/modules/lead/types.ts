export type LeadStatus = "new" | "in_progress" | "converted" | "not_interested";
export type LeadSource =
  | "walk_in"
  | "referral"
  | "website"
  | "phone"
  | "exhibition"
  | "social_media"
  | "other";
export type FuelType = "diesel" | "gas" | "petrol" | "any";

export type UserRef = { id: string; name?: string } | null;

export type FollowUp = {
  id: string;
  note: string;
  nextFollowUpDate?: string;
  createdByName?: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  customerName: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  requirement?: string;
  requiredKva?: number;
  fuelType?: FuelType;
  estimatedValue?: number;
  source: LeadSource;
  status: LeadStatus;
  lostReason?: string;
  assignedTo: UserRef;
  createdBy: UserRef;
  nextFollowUpDate?: string;
  followUps: FollowUp[];
  convertedAt?: string;
  saleId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadListQuery = {
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  assignedTo?: string;
  page: number;
  limit: number;
};

export type LeadListResult = {
  items: Lead[];
  meta: {
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    limit: number;
  };
};

export type LeadCreatePayload = {
  customerName: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  requirement?: string;
  requiredKva?: number;
  fuelType?: FuelType;
  estimatedValue?: number;
  source?: LeadSource;
  status?: LeadStatus;
  assignedTo?: string;
  lostReason?: string;
  nextFollowUpDate?: string;
};

export type AssignableUser = { id: string; name: string; role: string };
