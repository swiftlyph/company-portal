import { useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { DownloadIcon, FolderTreeIcon, PlusIcon, SearchIcon, UploadIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDepartments } from "@/features/departments/use-departments"
import { saveBlob, todayIso } from "@/lib/download"
import { exportEmployees } from "../api"
import { EmployeeFormDialog } from "../components/employee-form-dialog"
import { EmployeesTable } from "../components/employees-table"
import { RemoveEmployeeDialog } from "../components/remove-employee-dialog"
import { describeEmployeeError } from "../errors"
import { EMPLOYEE_STATUS_LABEL, EMPLOYMENT_TYPE_LABEL } from "../format"
import type { Employee, EmployeeStatus, EmploymentType } from "../types"
import { EMPLOYEE_STATUS_VALUES, EMPLOYMENT_TYPE_VALUES } from "../types"
import { useEmployees } from "../use-employees"

const ALL = "all"

const STATUS_FILTER_ITEMS = [
  { value: ALL, label: "All statuses" },
  ...EMPLOYEE_STATUS_VALUES.map((value) => ({ value, label: EMPLOYEE_STATUS_LABEL[value] })),
]

const TYPE_FILTER_ITEMS = [
  { value: ALL, label: "All types" },
  ...EMPLOYMENT_TYPE_VALUES.map((value) => ({ value, label: EMPLOYMENT_TYPE_LABEL[value] })),
]

function isEmployeeStatus(value: string): value is EmployeeStatus {
  return (EMPLOYEE_STATUS_VALUES as string[]).includes(value)
}

function isEmploymentType(value: string): value is EmploymentType {
  return (EMPLOYMENT_TYPE_VALUES as string[]).includes(value)
}

/**
 * `/app/employees`. Every filter and the page live in the URL
 * (?status=&employment_type=&department_id=&search=&page=) and drive the
 * server query, so a refresh or a shared link restores exactly that view;
 * nothing server-side lives in useState. The search box only commits on
 * submit (Enter or the button) so typing doesn't fire a request per
 * keystroke. Export downloads exactly what these filters match.
 */
export function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const departments = useDepartments()

  const statusParam = searchParams.get("status") ?? ALL
  const typeParam = searchParams.get("employment_type") ?? ALL
  const departmentParam = searchParams.get("department_id") ?? ALL
  const searchParam = searchParams.get("search") ?? ""
  const pageParam = Number(searchParams.get("page") ?? "1")
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const departmentId = Number(departmentParam)

  const filters = {
    status: isEmployeeStatus(statusParam) ? statusParam : undefined,
    employment_type: isEmploymentType(typeParam) ? typeParam : undefined,
    department_id: Number.isInteger(departmentId) && departmentId > 0 ? departmentId : undefined,
    search: searchParam || undefined,
    page,
  }

  const { data, isPending, isError, error, refetch, isFetching } = useEmployees(filters)
  const employees = data?.data ?? []

  const [searchDraft, setSearchDraft] = useState(searchParam)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Employee | null>(null)
  const [exporting, setExporting] = useState(false)

  const departmentItems = [
    { value: ALL, label: "All departments" },
    ...(departments.data?.data ?? []).map((d) => ({ value: String(d.id), label: d.name })),
  ]

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    setSearchParams(params)
  }

  /** Changing any filter goes back to page 1: page 4 of the old result means nothing in the new one. */
  function setFilter(key: string, value: string) {
    updateParams({ [key]: value === ALL ? null : value, page: null })
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateParams({ search: searchDraft.trim() || null, page: null })
  }

  function clearFilters() {
    setSearchDraft("")
    updateParams({ status: null, employment_type: null, department_id: null, search: null, page: null })
  }

  function goToPage(nextPage: number) {
    updateParams({ page: nextPage > 1 ? String(nextPage) : null })
  }

  function openAdd() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(employee: Employee) {
    setEditTarget(employee)
    setFormOpen(true)
  }

  async function handleExport() {
    setExporting(true)
    try {
      saveBlob(await exportEmployees(filters), `employees-${todayIso()}.csv`)
    } catch (exportError) {
      toast.error(describeEmployeeError(exportError, "Couldn't export the roster."))
    } finally {
      setExporting(false)
    }
  }

  const hasFilters =
    statusParam !== ALL || typeParam !== ALL || departmentParam !== ALL || searchParam !== ""

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Everyone on your roster. Only active employees will be able to receive allowance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" render={<Link to="/app/employees/departments" />}>
            <FolderTreeIcon data-icon="inline-start" />
            Departments
          </Button>
          <Button variant="outline" render={<Link to="/app/employees/import" />}>
            <UploadIcon data-icon="inline-start" />
            Import
          </Button>
          <Button variant="outline" onClick={() => void handleExport()} disabled={exporting}>
            <DownloadIcon data-icon="inline-start" />
            {exporting ? "Exporting…" : "Export"}
          </Button>
          <Button onClick={openAdd}>
            <PlusIcon data-icon="inline-start" />
            Add employee
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <form className="flex items-end gap-2" onSubmit={handleSearchSubmit} role="search">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="employees-search" className="text-xs text-muted-foreground">
              Search
            </label>
            <Input
              id="employees-search"
              type="search"
              className="w-56"
              placeholder="Name, email or employee no."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <SearchIcon />
          </Button>
        </form>

        <FilterSelect
          id="employees-status-filter"
          label="Status"
          value={statusParam}
          items={STATUS_FILTER_ITEMS}
          onChange={(value) => setFilter("status", value)}
        />
        <FilterSelect
          id="employees-department-filter"
          label="Department"
          value={departmentParam}
          items={departmentItems}
          onChange={(value) => setFilter("department_id", value)}
        />
        <FilterSelect
          id="employees-type-filter"
          label="Type"
          value={typeParam}
          items={TYPE_FILTER_ITEMS}
          onChange={(value) => setFilter("employment_type", value)}
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {isPending && <EmployeesTableSkeleton />}

      {isError && !data && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Couldn't load employees."}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isPending && data && employees.length === 0 && (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium">
            {hasFilters ? "No employees match these filters" : "No employees yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "Try a different search or filter."
              : "Add your first employee, or import your whole roster from a CSV file."}
          </p>
        </div>
      )}

      {!isPending && data && employees.length > 0 && (
        <>
          <EmployeesTable
            employees={employees}
            isFetching={isFetching}
            onEdit={openEdit}
            onRemove={setRemoveTarget}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {data.meta.total === 1 ? "1 employee" : `${data.meta.total} employees`}
            </p>

            {data.meta.last_page > 1 && (
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={page <= 1}
                      className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) goToPage(page - 1)
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-2 text-sm text-muted-foreground">
                      Page {data.meta.current_page} of {data.meta.last_page}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={page >= data.meta.last_page}
                      className={page >= data.meta.last_page ? "pointer-events-none opacity-50" : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < data.meta.last_page) goToPage(page + 1)
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      )}

      <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} employee={editTarget} />

      {removeTarget && (
        <RemoveEmployeeDialog
          open
          onOpenChange={(open) => !open && setRemoveTarget(null)}
          employee={removeTarget}
        />
      )}
    </div>
  )
}

function FilterSelect({
  id,
  label,
  value,
  items,
  onChange,
}: {
  id: string
  label: string
  value: string
  items: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={(next) => onChange(String(next ?? ALL))} items={items}>
        <SelectTrigger id={id} className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function EmployeesTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
