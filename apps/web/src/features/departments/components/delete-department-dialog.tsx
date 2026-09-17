import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { describeDepartmentError } from "../errors"
import type { Department } from "../types"
import { useDeleteDepartment } from "../use-departments"

/**
 * The API only deletes an EMPTY department (allowance will be assigned by
 * department, so it won't un-group people behind your back). A department
 * with employees is therefore explained up front rather than offered and
 * then refused; the API's own refusal is still shown if the count here was
 * stale.
 */
export function DeleteDepartmentDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: Department
}) {
  const { mutateAsync, isPending } = useDeleteDepartment()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const inUse = department.employees_count > 0
  const people = department.employees_count === 1 ? "1 employee is" : `${department.employees_count} employees are`

  async function confirmDelete() {
    setErrorMessage(null)
    try {
      await mutateAsync(department.id)
      toast.success(`${department.name} was deleted.`)
      onOpenChange(false)
    } catch (error) {
      setErrorMessage(describeDepartmentError(error, "Couldn't delete the department."))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => (!isPending ? onOpenChange(next) : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {inUse ? `${department.name} still has employees` : `Delete ${department.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {inUse
              ? `${people} still assigned to it. Move them to another department first, then delete it.`
              : "No employees are assigned to it. This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel>{inUse ? "Close" : "Cancel"}</AlertDialogCancel>
          {!inUse && (
            <AlertDialogAction variant="destructive" disabled={isPending} onClick={() => void confirmDelete()}>
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
