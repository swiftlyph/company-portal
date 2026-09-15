import {
  ClipboardListIcon,
  LayoutDashboardIcon,
  StoreIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

/**
 * Adapted from merchant-portal's AppSidebar (itself shadcn's sidebar-07
 * block): collapsible-to-icon rail, flat nav, identity + logout in the
 * footer. One entry per board card; the ones without a real page yet
 * still get an entry so the nav shows the whole product, and the route
 * behind them explains what's coming (see app/router.tsx).
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navMain = [
    { title: "Dashboard", url: "/app/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Employees", url: "/app/employees", icon: <UsersIcon /> },
    { title: "Merchants", url: "/app/merchants", icon: <StoreIcon /> },
    { title: "Starter HRIS", url: "/app/hris", icon: <WalletIcon /> },
    { title: "Audit Trail", url: "/app/audit-trail", icon: <ClipboardListIcon /> },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
              {/* The GASA mark (apps/web/public/gasa-icon.png, from asset/).
                  Decorative: the text next to it carries the name. */}
              <img src="/gasa-icon.png" alt="" className="size-8 shrink-0 rounded-full" />
              <span className="text-base leading-tight font-bold">
                <span className="text-primary">GASA</span> Company
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
