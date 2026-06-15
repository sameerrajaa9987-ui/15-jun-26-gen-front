import { http } from "@/shared/api/http";
import type { CapacityRequest, CapacityResult } from "../types";

export async function calculateCapacity(payload: CapacityRequest) {
  const res = await http.post<{ data: CapacityResult }>("/capacity/calculate", payload);
  return res.data.data;
}
