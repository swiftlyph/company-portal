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
 * copy says so plainly rather than promising an undo that doesn't exist,
 * and points at the two statuses that are usually what was meant.
 */
export function RemoveEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onRemoved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
  /** Called after a successful removal, e.g. to leave the detail page. */
  onRemoved?: () => void
}) {
  const { mutateAsync, isPending } = useRemoveEmployee()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function confirmRemove() {
    setErrorMessage(null)
    try {
      await mutateAsync(employee.id)
      toast.success(`${employee.full_name} was removed.`)
      onOpenChange(false)
      onRemoved?.()
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
            They will disappear from the roster entirely. If they left the company, mark them as
            separated instead; if they only need a pause, set them to inactive. Both keep the record.
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
