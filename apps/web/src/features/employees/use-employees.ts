import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "./api";
import type { EmployeesFilters } from "./types";

export const employeesQueryKey = {
  all: ["employees"] as const,
  list: (filters: EmployeesFilters) => ["employees", "list", filters] as const,
};

/**
 * The roster for /app/employees, filtered and server-paginated. The
 * previous page stays on screen while the next one loads
 * (placeholderData), so paging and searching never flash a skeleton.
 */
export function useEmployees(filters: EmployeesFilters) {
  return useQuery({
    queryKey: employeesQueryKey.list(filters),
    queryFn: ({ signal }) => fetchEmployees(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}
