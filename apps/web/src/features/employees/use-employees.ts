import { useQuery } from "@tanstack/react-query";
import { fetchEmployee, fetchEmployeeAllowance, fetchEmployees } from "./api";
import type { EmployeesFilters } from "./types";

export const employeesQueryKey = {
  all: ["employees"] as const,
  list: (filters: EmployeesFilters) => ["employees", "list", filters] as const,
  detail: (id: number) => ["employees", "detail", id] as const,
  allowance: (id: number) => ["employees", "allowance", id] as const,
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

/** One employee, for the detail page. A 404 is final, so it isn't retried. */
export function useEmployee(id: number | null) {
  return useQuery({
    queryKey: employeesQueryKey.detail(id ?? 0),
    queryFn: ({ signal }) => fetchEmployee(id ?? 0, { signal }),
    enabled: id !== null,
    retry: false,
  });
}

export function useEmployeeAllowance(id: number | null) {
  return useQuery({
    queryKey: employeesQueryKey.allowance(id ?? 0),
    queryFn: ({ signal }) => fetchEmployeeAllowance(id ?? 0, { signal }),
    enabled: id !== null,
    retry: false,
  });
}
