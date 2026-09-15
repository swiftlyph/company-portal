import { Link, Outlet, useMatches } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

interface RouteHandle {
  title?: string
  /** Set on a detail-style route to show a two-level trail. */
  parentTitle?: string
  parentPath?: string
}

/**
 * Authenticated app shell, the merchant-portal layout adapted to the Base UI
 * sidebar: collapsible-to-icon left nav rail (AppSidebar) + scrollable
 * content area for the nested /app/* routes. Each route under here supplies
 * just its own page content via <Outlet />, and its `handle.title` feeds
 * the breadcrumb.
 */
export function DashboardLayout() {
  const matches = useMatches()
  const handle = matches
    .slice()
    .reverse()
    .find((m) => (m.handle as RouteHandle | undefined)?.title)?.handle as RouteHandle | undefined

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {handle?.parentTitle && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      {handle.parentPath ? (
                        <BreadcrumbLink render={<Link to={handle.parentPath} />}>
                          {handle.parentTitle}
                        </BreadcrumbLink>
                      ) : (
                        handle.parentTitle
                      )}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{handle?.title ?? "GASA Company"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
