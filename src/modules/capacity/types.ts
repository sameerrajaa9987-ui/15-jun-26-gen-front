export type ApplianceCategory =
  | "lighting"
  | "fan"
  | "ac"
  | "motor"
  | "pump"
  | "refrigeration"
  | "heating"
  | "other";

export type ApplianceInput = {
  category: ApplianceCategory;
  name?: string;
  quantity: number;
  watts: number;
  startingFactor?: number;
};

export type CapacityRequest = {
  appliances: ApplianceInput[];
  powerFactor?: number;
  safetyMarginPct?: number;
};

export type CapacityResultItem = {
  category: ApplianceCategory;
  name: string;
  quantity: number;
  watts: number;
  runningWatts: number;
  startingFactor: number;
  surgeWatts: number;
};

export type CapacityResult = {
  inputs: { powerFactor: number; safetyMarginPct: number };
  items: CapacityResultItem[];
  runningWatts: number;
  peakWatts: number;
  surgeContributor: string | null;
  runningKva: number;
  peakKva: number;
  recommendedKva: number;
  recommendedStandardKva: number;
  recommendation: string;
};
