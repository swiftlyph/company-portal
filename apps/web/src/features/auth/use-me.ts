import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "./api";

export const meQueryKey = ["auth", "me"] as const;

/**
 * The signed-in user, fetched once per session (staleTime: Infinity, and
 * the global default already disables refetch-on-focus). If the token was
 * revoked server-side this 401s like any other protected call and goes
 * through the normal registerOnUnauthorized path in session.ts.
 */
export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: ({ signal }) => fetchMe({ signal }),
    staleTime: Infinity,
  });
}
