import type { LeadStatus, LeadSource, FuelType } from "../types";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  converted: "Converted",
  not_interested: "Not Interested",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  converted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  not_interested: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  walk_in: "Walk-in",
  referral: "Referral",
  website: "Website",
  phone: "Phone",
  exhibition: "Exhibition",
  social_media: "Social Media",
  indiamart: "IndiaMART",
  other: "Other",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  diesel: "Diesel",
  gas: "Gas",
  petrol: "Petrol",
  any: "Any",
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];
export const LEAD_SOURCES = Object.keys(LEAD_SOURCE_LABELS) as LeadSource[];
export const FUEL_TYPES = Object.keys(FUEL_LABELS) as FuelType[];
