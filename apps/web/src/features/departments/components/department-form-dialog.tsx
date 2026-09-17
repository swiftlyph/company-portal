import { useRef, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
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
import { ApiError } from "@/lib/api/client"
import { describeDepartmentError } from "../errors"
import type { Department } from "../types"
import { useCreateDepartment, useRenameDepartment } from "../use-departments"

interface DepartmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Rename this department when set; add a new one otherwise. */
  department?: Department | null
}

/** One dialog for both add and rename; a department is just its name. */
export function DepartmentFormDialog({ open, onOpenChange, department }: DepartmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <DepartmentForm
            key={department?.id ?? "new"}
            department={department ?? null}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function DepartmentForm({ department, onDone }: { department: Department | null; onDone: () => void }) {
  const isRename = department !== null
  const create = useCreateDepartment()
  const rename = useRenameDepartment()
  const isPending = create.isPending || rename.isPending

  const [name, setName] = useState(department?.name ?? "")
  const [nameErrors, setNameErrors] = useState<string[] | null>(null)
  const [formAlert, setFormAlert] = useState<string | null>(null)
  const inFlightRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlightRef.current) return

    setFormAlert(null)
    setNameErrors(null)

    const trimmed = name.trim()
    if (!trimmed) {
      setNameErrors(["Name is required."])
      return
    }

    inFlightRef.current = true
    try {
      if (isRename) {
        const saved = await rename.mutateAsync({ id: department.id, request: { name: trimmed } })
        toast.success(`Renamed to ${saved.name}.`)
      } else {
        const saved = await create.mutateAsync({ name: trimmed })
        toast.success(`${saved.name} was added.`)
      }
      onDone()
    } catch (error) {
      // Both validation_failed and department_name_taken name the field.
      if (error instanceof ApiError && error.status === 422 && error.errors?.name) {
        setNameErrors([describeDepartmentError(error, error.errors.name[0] ?? "Invalid name.")])
      } else {
        setFormAlert(describeDepartmentError(error, "Couldn't save the department."))
      }
    } finally {
      inFlightRef.current = false
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-6">
      <DialogHeader>
        <DialogTitle>{isRename ? `Rename ${department.name}` : "Add department"}</DialogTitle>
        <DialogDescription>
          {isRename
            ? "Employees in this department follow the new name automatically."
            : "Departments group your employees, and allowance will be assigned by them."}
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        {formAlert && (
          <Alert variant="destructive">
            <AlertDescription>{formAlert}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={nameErrors ? true : undefined}>
          <FieldLabel htmlFor="department-name">Name</FieldLabel>
          <Input
            id="department-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={nameErrors ? true : undefined}
            disabled={isPending}
            placeholder="e.g. Finance"
            autoFocus
          />
          <FieldError errors={nameErrors?.map((message) => ({ message }))} />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isRename ? "Rename" : "Add department"}
        </Button>
      </DialogFooter>
    </form>
  )
}
