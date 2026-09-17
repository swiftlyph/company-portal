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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useDepartments } from "@/features/departments/use-departments"
import type { ApiFieldErrors } from "@/lib/api/types"
import { describeEmployeeError, fieldErrorsFrom } from "../errors"
import { EMPLOYEE_STATUS_LABEL, EMPLOYMENT_TYPE_LABEL } from "../format"
import type { CreateEmployeeRequest, Employee, EmployeeStatus, EmploymentType } from "../types"
import { EMPLOYEE_STATUS_VALUES, EMPLOYMENT_TYPE_VALUES } from "../types"
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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

/** The Select works in strings; this one stands for "no department". */
const NO_DEPARTMENT = "none"

interface FormValues {
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  email: string
  employee_no: string
  mobile: string
  birthdate: string
  department: string
  job_title: string
  employment_type: EmploymentType
  hired_at: string
  status: EmployeeStatus
  separated_at: string
}

type TextFieldKey = Exclude<keyof FormValues, "status" | "employment_type" | "department">

function valuesFrom(employee: Employee | null): FormValues {
  return {
    first_name: employee?.first_name ?? "",
    middle_name: employee?.middle_name ?? "",
    last_name: employee?.last_name ?? "",
    suffix: employee?.suffix ?? "",
    email: employee?.email ?? "",
    employee_no: employee?.employee_no ?? "",
    mobile: employee?.mobile ?? "",
    birthdate: employee?.birthdate ?? "",
    department: employee?.department_id ? String(employee.department_id) : NO_DEPARTMENT,
    job_title: employee?.job_title ?? "",
    employment_type: employee?.employment_type ?? "regular",
    hired_at: employee?.hired_at ?? "",
    status: employee?.status ?? "active",
    separated_at: employee?.separated_at ?? "",
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

const EMPLOYMENT_TYPE_ITEMS = EMPLOYMENT_TYPE_VALUES.map((value) => ({
  value,
  label: EMPLOYMENT_TYPE_LABEL[value],
}))

function EmployeeForm({ employee, onDone }: { employee: Employee | null; onDone: () => void }) {
  const isEdit = employee !== null
  const create = useCreateEmployee()
  const update = useUpdateEmployee()
  const departments = useDepartments()
  const isPending = create.isPending || update.isPending

  const [values, setValues] = useState<FormValues>(() => valuesFrom(employee))
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({})
  const [formAlert, setFormAlert] = useState<string | null>(null)
  const inFlightRef = useRef(false)

  // The employee's own department is kept in the list even if the list
  // hasn't loaded (or no longer has it), so the select never shows a bare id.
  const departmentItems = [
    { value: NO_DEPARTMENT, label: "No department" },
    ...(departments.data?.data ?? []).map((d) => ({ value: String(d.id), label: d.name })),
  ]
  if (employee?.department && !departmentItems.some((item) => item.value === String(employee.department?.id))) {
    departmentItems.push({ value: String(employee.department.id), label: employee.department.name })
  }

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
      middle_name: nullable(values.middle_name),
      last_name: values.last_name.trim(),
      suffix: nullable(values.suffix),
      email: values.email.trim(),
      employee_no: nullable(values.employee_no),
      mobile: nullable(values.mobile),
      birthdate: nullable(values.birthdate),
      department_id: values.department === NO_DEPARTMENT ? null : Number(values.department),
      job_title: nullable(values.job_title),
      employment_type: values.employment_type,
      hired_at: nullable(values.hired_at),
    }

    inFlightRef.current = true
    try {
      if (isEdit) {
        const saved = await update.mutateAsync({
          id: employee.id,
          request: {
            ...request,
            status: values.status,
            // Only meaningful when separated; the API clears it otherwise,
            // and stamps today when it is left empty.
            separated_at: values.status === "separated" ? nullable(values.separated_at) : null,
          },
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
    key: TextFieldKey,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
    hint?: string,
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
        {hint && !errors && <FieldDescription>{hint}</FieldDescription>}
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
          {textField("middle_name", "Middle name", { autoComplete: "additional-name", placeholder: "Optional" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          {textField("last_name", "Last name", { autoComplete: "family-name" })}
          {textField("suffix", "Suffix", { placeholder: "Jr., III" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("email", "Email", { type: "email", autoComplete: "off", placeholder: "name@company.com" })}
          {textField(
            "mobile",
            "Mobile",
            { type: "tel", autoComplete: "off", placeholder: "0917 123 4567" },
            "Saved in international format (+63…).",
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("employee_no", "Employee number", { placeholder: "Optional" })}
          {textField("birthdate", "Birthdate", { type: "date" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={fieldErrors.department_id ? true : undefined}>
            <FieldLabel htmlFor="employee-department">Department</FieldLabel>
            <Select
              value={values.department}
              onValueChange={(value) => set("department", String(value ?? NO_DEPARTMENT))}
              items={departmentItems}
              disabled={isPending}
            >
              <SelectTrigger id="employee-department" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors.department_id?.map((message) => ({ message }))} />
          </Field>

          <Field data-invalid={fieldErrors.employment_type ? true : undefined}>
            <FieldLabel htmlFor="employee-employment-type">Employment type</FieldLabel>
            <Select
              value={values.employment_type}
              onValueChange={(value) => set("employment_type", (value ?? "regular") as EmploymentType)}
              items={EMPLOYMENT_TYPE_ITEMS}
              disabled={isPending}
            >
              <SelectTrigger id="employee-employment-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors.employment_type?.map((message) => ({ message }))} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("job_title", "Job title", { placeholder: "Optional" })}
          {textField("hired_at", "Date hired", { type: "date" })}
        </div>

        {isEdit && (
          <div className="grid gap-4 sm:grid-cols-2">
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

            {values.status === "separated" &&
              textField("separated_at", "Separation date", { type: "date" }, "Left empty, today is used.")}
          </div>
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
