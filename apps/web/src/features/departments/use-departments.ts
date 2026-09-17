import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesQueryKey } from "@/features/employees/use-employees";
import { createDepartment, deleteDepartment, fetchDepartments, renameDepartment } from "./api";
import type { SaveDepartmentRequest } from "./types";

export const departmentsQueryKey = ["departments"] as const;

/**
 * The company's departments, unpaginated (tens, not thousands). Shared by
 * the departments page, the employee form's select and the roster's
 * filter, so they are fetched once and stay in step.
 */
export function useDepartments() {
  return useQuery({
    queryKey: departmentsQueryKey,
    queryFn: ({ signal }) => fetchDepartments({ signal }),
    staleTime: 60_000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveDepartmentRequest) => createDepartment(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentsQueryKey });
    },
  });
}

/** Employees carry their department's name, so a rename refreshes them too. */
export function useRenameDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: SaveDepartmentRequest }) =>
      renameDepartment(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentsQueryKey });
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey.all });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentsQueryKey });
    },
  });
}
