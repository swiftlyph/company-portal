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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { ApiFieldErrors } from "@/lib/api/types"
import { describeEmployeeError, fieldErrorsFrom } from "../errors"
import { EMPLOYEE_STATUS_LABEL } from "../format"
import type { CreateEmployeeRequest, Employee, EmployeeStatus } from "../types"
import { EMPLOYEE_STATUS_VALUES } from "../types"
import { useCreateEmployee, useUpdateEmployee } from "../use-employee-mutations"

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit an existing employee when set; add a new one otherwise. */
  employee?: Employee | null
}

/**
 * One dialog for both add and edit. The form itself remounts per employee
 * (see the `key` below) so its state starts from the right record every
 * time it opens, with no effect juggling.
 */
export function EmployeeFormDialog({ open, onOpenChange, employee }: EmployeeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <EmployeeForm
            key={employee?.id ?? "new"}
            employee={employee ?? null}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface FormValues {
  first_name: string
  last_name: string
  email: string
  employee_no: string
  department: string
  job_title: string
  mobile: string
  hired_at: string
  status: EmployeeStatus
}

function valuesFrom(employee: Employee | null): FormValues {
  return {
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    email: employee?.email ?? "",
    employee_no: employee?.employee_no ?? "",
    department: employee?.department ?? "",
    job_title: employee?.job_title ?? "",
    mobile: employee?.mobile ?? "",
    hired_at: employee?.hired_at ?? "",
    status: employee?.status ?? "active",
  }
}

/** Empty optional inputs go on the wire as null, which the backend reads as "clear it". */
function nullable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

const STATUS_ITEMS = EMPLOYEE_STATUS_VALUES.map((value) => ({
  value,
  label: EMPLOYEE_STATUS_LABEL[value],
}))

function EmployeeForm({ employee, onDone }: { employee: Employee | null; onDone: () => void }) {
  const isEdit = employee !== null
  const create = useCreateEmployee()
  const update = useUpdateEmployee()
  const isPending = create.isPending || update.isPending

  const [values, setValues] = useState<FormValues>(() => valuesFrom(employee))
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({})
  const [formAlert, setFormAlert] = useState<string | null>(null)
  const inFlightRef = useRef(false)

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlightRef.current) return

    setFormAlert(null)
    const clientErrors: ApiFieldErrors = {}
    if (!values.first_name.trim()) clientErrors.first_name = ["First name is required."]
    if (!values.last_name.trim()) clientErrors.last_name = ["Last name is required."]
    if (!values.email.trim()) clientErrors.email = ["Email is required."]
    setFieldErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    const request: CreateEmployeeRequest = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      employee_no: nullable(values.employee_no),
      department: nullable(values.department),
      job_title: nullable(values.job_title),
      mobile: nullable(values.mobile),
      hired_at: nullable(values.hired_at),
    }

    inFlightRef.current = true
    try {
      if (isEdit) {
        const saved = await update.mutateAsync({
          id: employee.id,
          request: { ...request, status: values.status },
        })
        toast.success(`${saved.full_name} was updated.`)
      } else {
        const saved = await create.mutateAsync(request)
        toast.success(`${saved.full_name} was added.`)
      }
      onDone()
    } catch (error) {
      const errors = fieldErrorsFrom(error)
      if (errors) {
        setFieldErrors(errors)
      } else {
        setFormAlert(
          describeEmployeeError(error, isEdit ? "Couldn't save the employee." : "Couldn't add the employee."),
        )
      }
    } finally {
      inFlightRef.current = false
    }
  }

  function textField(
    key: Exclude<keyof FormValues, "status">,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) {
    const id = `employee-${key}`
    const errors = fieldErrors[key]
    return (
      <Field data-invalid={errors ? true : undefined}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Input
          id={id}
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={errors ? true : undefined}
          disabled={isPending}
          {...props}
        />
        <FieldError errors={errors?.map((message) => ({ message }))} />
      </Field>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-6">
      <DialogHeader>
        <DialogTitle>{isEdit ? `Edit ${employee.full_name}` : "Add employee"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Changes apply immediately."
            : "An HR record only for now; portal accounts and invites come in a later phase."}
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        {formAlert && (
          <Alert variant="destructive">
            <AlertDescription>{formAlert}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("first_name", "First name", { autoComplete: "given-name" })}
          {textField("last_name", "Last name", { autoComplete: "family-name" })}
        </div>

        {textField("email", "Email", { type: "email", autoComplete: "off", placeholder: "name@company.com" })}

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("employee_no", "Employee number", { placeholder: "Optional" })}
          {textField("hired_at", "Date hired", { type: "date" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("department", "Department", { placeholder: "Optional" })}
          {textField("job_title", "Job title", { placeholder: "Optional" })}
        </div>

        {textField("mobile", "Mobile", { type: "tel", autoComplete: "off", placeholder: "Optional" })}

        {isEdit && (
          <Field data-invalid={fieldErrors.status ? true : undefined}>
            <FieldLabel htmlFor="employee-status">Status</FieldLabel>
            <Select
              value={values.status}
              onValueChange={(value) => set("status", (value ?? "active") as EmployeeStatus)}
              items={STATUS_ITEMS}
              disabled={isPending}
            >
              <SelectTrigger id="employee-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors.status?.map((message) => ({ message }))} />
          </Field>
        )}
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Add employee"}
        </Button>
      </DialogFooter>
    </form>
  )
}
