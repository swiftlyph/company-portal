import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { todayIso } from "@/lib/download"
import { describeEmployeeError, fieldErrorsFrom } from "../errors"
import type { Employee } from "../types"
import { useUpdateEmployee } from "../use-employee-mutations"

/**
 * Marks an employee as separated, with the date they left. Its own dialog
 * rather than a field buried in the edit form, because it is the one
 * status change with consequences: once allowances exist, this is what
 * stops them and expires what is left.
 */
export function SeparateEmployeeDialog({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <SeparateForm key={employee.id} employee={employee} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function SeparateForm({ employee, onDone }: { employee: Employee; onDone: () => void }) {
  const { mutateAsync, isPending } = useUpdateEmployee()
  const [date, setDate] = useState(todayIso())
  const [dateErrors, setDateErrors] = useState<string[] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setDateErrors(null)

    try {
      await mutateAsync({
        id: employee.id,
        request: { status: "separated", separated_at: date || null },
      })
      toast.success(`${employee.full_name} was marked as separated.`)
      onDone()
    } catch (error) {
      const errors = fieldErrorsFrom(error)
      if (errors?.separated_at) {
        setDateErrors(errors.separated_at)
      } else {
        setErrorMessage(describeEmployeeError(error, "Couldn't update the employee."))
      }
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-6">
      <DialogHeader>
        <DialogTitle>Mark {employee.full_name} as separated?</DialogTitle>
        <DialogDescription>
          Use this when they have left the company. The record stays on the roster as separated, and
          you can reinstate them if this was a mistake.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <Field data-invalid={dateErrors ? true : undefined}>
          <FieldLabel htmlFor="separation-date">Separation date</FieldLabel>
          <Input
            id="separation-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={dateErrors ? true : undefined}
            disabled={isPending}
          />
          <FieldError errors={dateErrors?.map((message) => ({ message }))} />
        </Field>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "Saving…" : "Mark as separated"}
        </Button>
      </DialogFooter>
    </form>
  )
}
