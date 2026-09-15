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
import { describeEmployeeError } from "../errors"
import type { Employee } from "../types"
import { useRemoveEmployee } from "../use-employee-mutations"

/**
 * Confirms a removal. The backend soft-deletes, so the record is
 * recoverable by the API team, but from the portal's side it is gone: the
 * copy says so plainly rather than promising an undo that doesn't exist.
 */
export function RemoveEmployeeDialog({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}) {
  const { mutateAsync, isPending } = useRemoveEmployee()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function confirmRemove() {
    setErrorMessage(null)
    try {
      await mutateAsync(employee.id)
      toast.success(`${employee.full_name} was removed.`)
      onOpenChange(false)
    } catch (error) {
      setErrorMessage(describeEmployeeError(error, "Couldn't remove the employee."))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => (!isPending ? onOpenChange(next) : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {employee.full_name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will disappear from the roster and stop being eligible for allowance. If they
            only need a pause, set their status to inactive instead.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => void confirmRemove()}
          >
            {isPending ? "Removing…" : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
