import { useMutation } from "@tanstack/react-query";
import { calculateCapacity } from "../api/capacityApi";

export function useCalculateCapacity() {
  return useMutation({ mutationFn: calculateCapacity });
}
