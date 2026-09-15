import { useQuery } from "@tanstack/react-query";
import { fetchCompanyProfile } from "./api";

export const companyProfileQueryKey = ["company", "profile"] as const;

/** The caller's own company; read-only this phase. */
export function useCompanyProfile() {
  return useQuery({
    queryKey: companyProfileQueryKey,
    queryFn: ({ signal }) => fetchCompanyProfile({ signal }),
  });
}
