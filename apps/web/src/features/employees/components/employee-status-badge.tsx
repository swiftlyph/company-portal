import { Badge } from "@workspace/ui/components/badge"
import { EMPLOYEE_STATUS_LABEL } from "../format"
import type { EmployeeStatus } from "../types"

const VARIANT: Record<EmployeeStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  inactive: "outline",
  separated: "destructive",
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <Badge variant={VARIANT[status]}>{EMPLOYEE_STATUS_LABEL[status]}</Badge>
}
