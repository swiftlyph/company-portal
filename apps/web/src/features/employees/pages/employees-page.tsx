import { useState, type FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { PlusIcon, SearchIcon } from "lucide-react"
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
import { EmployeeFormDialog } from "../components/employee-form-dialog"
import { EmployeesTable } from "../components/employees-table"
import { RemoveEmployeeDialog } from "../components/remove-employee-dialog"
import type { Employee, EmployeeStatus } from "../types"
import { useEmployees } from "../use-employees"

const STATUS_FILTER_ITEMS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

function isEmployeeStatus(value: string): value is EmployeeStatus {
  return value === "active" || value === "inactive"
}

/**
 * `/app/employees`. Status, search and page live in the URL
 * (?status=&search=&page=) and drive the server query, so a refresh or a
 * shared link restores exactly that view; nothing server-side lives in
 * useState. The search box only commits on submit (Enter or the button)
 * so typing doesn't fire a request per keystroke.
 */
export function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const statusParam = searchParams.get("status") ?? "all"
  const searchParam = searchParams.get("search") ?? ""
  const pageParam = Number(searchParams.get("page") ?? "1")
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const filters = {
    status: isEmployeeStatus(statusParam) ? statusParam : undefined,
    search: searchParam || undefined,
    page,
  }

  const { data, isPending, isError, error, refetch, isFetching } = useEmployees(filters)
  const employees = data?.data ?? []

  const [searchDraft, setSearchDraft] = useState(searchParam)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Employee | null>(null)

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

  function handleStatusChange(value: string) {
    updateParams({ status: value === "all" ? null : value, page: null })
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateParams({ search: searchDraft.trim() || null, page: null })
  }

  function clearFilters() {
    setSearchDraft("")
    updateParams({ status: null, search: null, page: null })
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

  const hasFilters = statusParam !== "all" || searchParam !== ""

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Everyone on your roster. Only active employees can receive allowance.
          </p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon data-icon="inline-start" />
          Add employee
        </Button>
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="employees-status-filter" className="text-xs text-muted-foreground">
            Status
          </label>
          <Select
            value={statusParam}
            onValueChange={(value) => handleStatusChange(String(value ?? "all"))}
            items={STATUS_FILTER_ITEMS}
          >
            <SelectTrigger id="employees-status-filter" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            {hasFilters ? "Try a different search or status." : "Add your first employee to get started."}
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

function EmployeesTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
