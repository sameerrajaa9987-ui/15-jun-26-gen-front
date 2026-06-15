import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBusinessProfile, updateBusinessProfile } from "../api/settingsApi";

export function useBusinessProfile() {
  return useQuery({ queryKey: ["business-profile"], queryFn: getBusinessProfile });
}

export function useUpdateBusinessProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-profile"] }),
  });
}
