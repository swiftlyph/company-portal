import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee, removeEmployee, updateEmployee } from "./api";
import { employeesQueryKey } from "./use-employees";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "./types";

/**
 * Every write invalidates every employee list: a create, edit or removal
 * can change any page's contents and the total, and the lists are cheap to
 * refetch. Callers decide how to surface errors (a form maps 422s to
 * fields, a confirm dialog shows one line), so nothing is handled here.
 */

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeRequest) => createEmployee(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey.all });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateEmployeeRequest }) =>
      updateEmployee(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey.all });
    },
  });
}

export function useRemoveEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => removeEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey.all });
    },
  });
}
