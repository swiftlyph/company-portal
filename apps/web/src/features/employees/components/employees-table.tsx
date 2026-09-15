import { PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { EmployeeStatusBadge } from "./employee-status-badge"
import { EMPTY_VALUE, formatDate } from "../format"
import type { Employee } from "../types"

interface EmployeesTableProps {
  employees: Employee[]
  /** Dims the table while a new page or filter result is loading behind it. */
  isFetching?: boolean
  onEdit: (employee: Employee) => void
  onRemove: (employee: Employee) => void
}

export function EmployeesTable({ employees, isFetching, onEdit, onRemove }: EmployeesTableProps) {
  return (
    <Table className={isFetching ? "opacity-60 transition-opacity" : undefined}>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead className="hidden md:table-cell">Employee no.</TableHead>
          <TableHead className="hidden lg:table-cell">Department</TableHead>
          <TableHead className="hidden lg:table-cell">Job title</TableHead>
          <TableHead className="hidden md:table-cell">Hired</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{employee.full_name}</span>
                <span className="text-xs text-muted-foreground">{employee.email}</span>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">
              {employee.employee_no ?? EMPTY_VALUE}
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              {employee.department ?? EMPTY_VALUE}
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              {employee.job_title ?? EMPTY_VALUE}
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">
              {formatDate(employee.hired_at)}
            </TableCell>
            <TableCell>
              <EmployeeStatusBadge status={employee.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${employee.full_name}`}
                  onClick={() => onEdit(employee)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${employee.full_name}`}
                  onClick={() => onRemove(employee)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
