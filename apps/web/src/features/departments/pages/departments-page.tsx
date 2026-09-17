import { useState } from "react"
import { Link } from "react-router-dom"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { DeleteDepartmentDialog } from "../components/delete-department-dialog"
import { DepartmentFormDialog } from "../components/department-form-dialog"
import type { Department } from "../types"
import { useDepartments } from "../use-departments"

/**
 * `/app/employees/departments`. A short, unpaginated list: the head count
 * links to the roster filtered to that department, which is also where
 * someone goes to move people out before deleting one.
 */
export function DepartmentsPage() {
  const { data, isPending, isError, error, refetch } = useDepartments()
  const departments = data?.data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)

  function openAdd() {
    setRenameTarget(null)
    setFormOpen(true)
  }

  function openRename(department: Department) {
    setRenameTarget(department)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground">
            How your employees are grouped, and what allowance will be assigned by.
          </p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon data-icon="inline-start" />
          Add department
        </Button>
      </div>

      {isPending && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && !data && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Couldn't load departments."}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isPending && data && departments.length === 0 && (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium">No departments yet</p>
          <p className="text-sm text-muted-foreground">
            Add one here, or import a roster: departments named in the file are created for you.
          </p>
        </div>
      )}

      {!isPending && departments.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>
                  {department.employees_count > 0 ? (
                    <Link
                      to={`/app/employees?department_id=${department.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {department.employees_count}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Rename ${department.name}`}
                      onClick={() => openRename(department)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${department.name}`}
                      onClick={() => setDeleteTarget(department)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <DepartmentFormDialog open={formOpen} onOpenChange={setFormOpen} department={renameTarget} />

      {deleteTarget && (
        <DeleteDepartmentDialog
          open
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          department={deleteTarget}
        />
      )}
    </div>
  )
}
