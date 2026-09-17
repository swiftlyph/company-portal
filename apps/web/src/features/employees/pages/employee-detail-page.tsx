import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ApiError } from "@/lib/api/client"
import { EmployeeFormDialog } from "../components/employee-form-dialog"
import { EmployeeStatusBadge } from "../components/employee-status-badge"
import { RemoveEmployeeDialog } from "../components/remove-employee-dialog"
import { SeparateEmployeeDialog } from "../components/separate-employee-dialog"
import { GrantAllowanceDialog } from "../components/grant-allowance-dialog"
import { describeEmployeeError } from "../errors"
import { EMPLOYMENT_TYPE_LABEL, EMPTY_VALUE, formatAllowance, formatDate, formatDateTime, formatMobile } from "../format"
import type { AllowanceTransaction, Employee, EmployeeStatus } from "../types"
import { useUpdateEmployee } from "../use-employee-mutations"
import { useEmployee, useEmployeeAllowance } from "../use-employees"

/**
 * `/app/employees/:id`. Everything about one employee, plus the status
 * actions. Separating gets its own dialog (it takes a date and will carry
 * consequences once allowances exist); pausing and reinstating are one
 * click, since both are trivially reversible.
 *
 * The allowance panel reads the employee's entitlement account. Grants are
 * explicit ledger writes in their own dialog, so the employee profile still
 * does not carry a mutable balance field.
 */
export function EmployeeDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const id = Number(params.id)
  const validId = Number.isInteger(id) && id > 0

  const { data: employee, isPending, isError, error, refetch } = useEmployee(validId ? id : null)
  const {
    data: allowance,
    isPending: allowancePending,
    isError: allowanceError,
    refetch: refetchAllowance,
  } = useEmployeeAllowance(validId ? id : null)
  const updateStatus = useUpdateEmployee()

  const [editOpen, setEditOpen] = useState(false)
  const [separateOpen, setSeparateOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [grantOpen, setGrantOpen] = useState(false)

  const notFound = !validId || (error instanceof ApiError && error.status === 404)

  if (notFound) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-xl font-bold">Employee not found</h1>
        <p className="text-sm text-muted-foreground">
          They may have been removed from the roster, or the link is wrong.
        </p>
        <Button variant="outline" render={<Link to="/app/employees" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to employees
        </Button>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Couldn't load this employee."}
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  function changeStatus(target: Employee, status: EmployeeStatus, done: string) {
    updateStatus.mutate(
      { id: target.id, request: { status } },
      {
        onSuccess: () => toast.success(done),
        onError: (statusError) => toast.error(describeEmployeeError(statusError, "Couldn't update the status.")),
      },
    )
  }

  const busy = updateStatus.isPending

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{employee.full_name}</h1>
            <EmployeeStatusBadge status={employee.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {[employee.job_title, employee.department?.name].filter(Boolean).join(" · ") || "No job title or department yet"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {employee.status === "active" && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => changeStatus(employee, "inactive", `${employee.full_name} is now inactive.`)}
            >
              Set inactive
            </Button>
          )}
          {employee.status === "inactive" && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => changeStatus(employee, "active", `${employee.full_name} is active again.`)}
            >
              Reactivate
            </Button>
          )}
          {employee.status === "separated" ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => changeStatus(employee, "active", `${employee.full_name} was reinstated.`)}
            >
              Reinstate
            </Button>
          ) : (
            <Button variant="outline" disabled={busy} onClick={() => setSeparateOpen(true)}>
              Mark as separated
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <PencilIcon data-icon="inline-start" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setRemoveOpen(true)}>
            <Trash2Icon data-icon="inline-start" />
            Remove
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
            <CardDescription>Who they are, and how to reach them.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="First name" value={employee.first_name} />
              <Detail label="Middle name" value={employee.middle_name} />
              <Detail label="Last name" value={employee.last_name} />
              <Detail label="Suffix" value={employee.suffix} />
              <Detail label="Email" value={employee.email} />
              <Detail label="Mobile" value={formatMobile(employee.mobile)} />
              <Detail label="Birthdate" value={formatDate(employee.birthdate)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment</CardTitle>
            <CardDescription>What allowance will be assigned by.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Employee number" value={employee.employee_no} />
              <Detail label="Department" value={employee.department?.name ?? null} />
              <Detail label="Job title" value={employee.job_title} />
              <Detail label="Employment type" value={EMPLOYMENT_TYPE_LABEL[employee.employment_type]} />
              <Detail label="Date hired" value={formatDate(employee.hired_at)} />
              {employee.status === "separated" && (
                <Detail label="Separated on" value={formatDate(employee.separated_at)} />
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portal account</CardTitle>
            <CardDescription>The employee's own login, for their ID and allowance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {employee.has_account
                ? "This employee has a portal account."
                : "No account yet. Inviting employees arrives together with the employee app."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <CardTitle>Allowance</CardTitle>
                <CardDescription>Current entitlement and recent ledger activity.</CardDescription>
              </div>
              {employee.status === "active" && (
                <Button size="sm" onClick={() => setGrantOpen(true)}>
                  <PlusIcon data-icon="inline-start" />
                  Grant
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {allowancePending ? (
              <Skeleton className="h-24 w-full" />
            ) : allowanceError ? (
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-muted-foreground">Couldn't load this employee's allowance.</p>
                <Button variant="outline" size="sm" onClick={() => void refetchAllowance()}>
                  Retry
                </Button>
              </div>
            ) : allowance ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Available allowance</p>
                  <p className="text-2xl font-semibold">{formatAllowance(allowance.balance_cents)}</p>
                </div>
                {allowance.transactions.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Recent activity</p>
                    <ul className="flex flex-col divide-y rounded-lg border">
                      {allowance.transactions.map((transaction) => (
                        <AllowanceTransactionRow key={transaction.id} transaction={transaction} />
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No grants yet. Grant an allowance to start this employee's ledger.
                  </p>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <EmployeeFormDialog open={editOpen} onOpenChange={setEditOpen} employee={employee} />
      <SeparateEmployeeDialog open={separateOpen} onOpenChange={setSeparateOpen} employee={employee} />
      <GrantAllowanceDialog employee={employee} open={grantOpen} onOpenChange={setGrantOpen} />
      <RemoveEmployeeDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        employee={employee}
        onRemoved={() => void navigate("/app/employees", { replace: true })}
      />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{value && value !== "" ? value : EMPTY_VALUE}</dd>
    </div>
  )
}

function AllowanceTransactionRow({ transaction }: { transaction: AllowanceTransaction }) {
  const positive = transaction.amount_cents >= 0

  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm">{transaction.reason || transaction.type}</p>
        <p className="text-xs text-muted-foreground">{formatDateTime(transaction.created_at)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={positive ? "text-sm font-medium text-green-700" : "text-sm font-medium text-destructive"}>
          {positive ? "+" : "-"}{formatAllowance(Math.abs(transaction.amount_cents))}
        </p>
        <p className="text-xs text-muted-foreground">Balance {formatAllowance(transaction.balance_after_cents)}</p>
      </div>
    </li>
  )
}
