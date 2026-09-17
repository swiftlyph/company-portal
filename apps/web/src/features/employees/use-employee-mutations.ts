import { useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsQueryKey } from "@/features/departments/use-departments";
import { createEmployee, grantEmployeeAllowance, importEmployees, removeEmployee, updateEmployee } from "./api";
import { employeesQueryKey } from "./use-employees";
import type { CreateEmployeeRequest, GrantAllowanceRequest, ImportMode, UpdateEmployeeRequest } from "./types";

/**
 * Every write invalidates every employee query (lists and details): a
 * create, edit or removal can change any page's contents and the total,
 * and they are cheap to refetch. The departments list goes too, because it
 * carries head counts. Callers decide how to surface errors (a form maps
 * 422s to fields, a confirm dialog shows one line), so nothing is handled
 * here.
 */

function useInvalidateRoster() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: employeesQueryKey.all });
    void queryClient.invalidateQueries({ queryKey: departmentsQueryKey });
  };
}

export function useCreateEmployee() {
  const invalidate = useInvalidateRoster();

  return useMutation({
    mutationFn: (request: CreateEmployeeRequest) => createEmployee(request),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateRoster();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateEmployeeRequest }) =>
      updateEmployee(id, request),
    onSuccess: invalidate,
  });
}

export function useRemoveEmployee() {
  const invalidate = useInvalidateRoster();

  return useMutation({
    mutationFn: (id: number) => removeEmployee(id),
    onSuccess: invalidate,
  });
}

export function useGrantEmployeeAllowance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: GrantAllowanceRequest }) =>
      grantEmployeeAllowance(id, request),
    onSuccess: (_allowance, { id }) => {
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey.allowance(id) });
    },
  });
}

/** A preview writes nothing, so only a commit invalidates. */
export function useImportEmployees() {
  const invalidate = useInvalidateRoster();

  return useMutation({
    mutationFn: ({ file, mode }: { file: File; mode: ImportMode }) => importEmployees(file, mode),
    onSuccess: (report) => {
      if (report.mode === "commit") {
        invalidate();
      }
    },
  });
}
