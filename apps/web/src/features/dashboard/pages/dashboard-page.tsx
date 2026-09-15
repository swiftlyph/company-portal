import { Link } from "react-router-dom"
import { ArrowRightIcon, ClipboardListIcon, StoreIcon, UsersIcon, WalletIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useAuthStore } from "@/features/auth/store"
import { useCompanyProfile } from "@/features/company/use-company-profile"
import { useEmployees } from "@/features/employees/use-employees"

/**
 * `/app/dashboard`. The only live numbers today are roster counts, read
 * off the employees list's pagination meta (one row per request, so each
 * tile is one cheap COUNT). The other tiles point at sections that are
 * not built yet, so the board's shape is visible from day one.
 */
export function DashboardPage() {
  const companyName = useAuthStore((s) => s.user?.company?.name)
  const profile = useCompanyProfile()
  const total = useEmployees({ page: 1, per_page: 1 })
  const active = useEmployees({ page: 1, per_page: 1, status: "active" })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{profile.data?.name ?? companyName ?? "Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">
          {profile.data?.legal_name ?? "Your company at a glance."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Employees"
          description="On the roster"
          value={total.data?.meta.total}
          isPending={total.isPending}
          isError={total.isError}
        />
        <StatCard
          title="Active"
          description="Can receive allowance"
          value={active.data?.meta.total}
          isPending={active.isPending}
          isError={active.isError}
        />
        <Card>
          <CardHeader>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Add, update and remove employees.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to="/app/employees" />} variant="outline" size="sm">
              <UsersIcon data-icon="inline-start" />
              Open employees
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Coming soon</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ComingSoonCard
            to="/app/merchants"
            icon={<StoreIcon className="size-4" />}
            title="Merchants"
            description="Choose where employees can spend."
          />
          <ComingSoonCard
            to="/app/hris"
            icon={<WalletIcon className="size-4" />}
            title="Starter HRIS"
            description="Basic payroll and HR records."
          />
          <ComingSoonCard
            to="/app/audit-trail"
            icon={<ClipboardListIcon className="size-4" />}
            title="Audit Trail"
            description="Who changed what, and when."
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  description,
  value,
  isPending,
  isError,
}: {
  title: string
  description: string
  value: number | undefined
  isPending: boolean
  isError: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">
          {isPending ? (
            <Skeleton className="h-8 w-16" />
          ) : isError ? (
            <span className="text-base font-normal text-muted-foreground">Unavailable</span>
          ) : (
            (value ?? 0)
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function ComingSoonCard({
  to,
  icon,
  title,
  description,
}: {
  to: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-2xl border border-dashed border-border p-4 transition-colors hover:bg-muted"
    >
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </Link>
  )
}
