import { Badge } from "@workspace/ui/components/badge"
import { EMPLOYEE_STATUS_LABEL } from "../format"
import type { EmployeeStatus } from "../types"

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <Badge variant={status === "active" ? "secondary" : "outline"}>
      {EMPLOYEE_STATUS_LABEL[status]}
    </Badge>
  )
}
