import { LogOutIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@workspace/ui/components/sidebar"
import { useAuthStore } from "@/features/auth/store"
import { useLogout } from "@/features/auth/use-logout"
import { useMe } from "@/features/auth/use-me"

/**
 * Footer identity + logout: who's signed in, which company, and a direct
 * logout action. No dropdown, matching merchant-portal's NavUser.
 */
export function NavUser() {
  const storeUser = useAuthStore((s) => s.user)
  const { data: user } = useMe()
  const logout = useLogout()

  const displayUser = user ?? storeUser

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-secondary font-semibold text-secondary-foreground">
              {(displayUser?.name ?? "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayUser?.name ?? "…"}</span>
            <span className="truncate text-xs text-muted-foreground">
              {displayUser?.company?.name ?? "Company"}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Logout"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOutIcon />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
