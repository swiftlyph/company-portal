import { Link, useMatch } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

interface NavMainItem {
  title: string
  url: string
  icon?: React.ReactNode
}

/**
 * Flat top-level nav, one level deep: Dashboard, Employees, Merchants,
 * Starter HRIS, Audit Trail. Base UI's sidebar button takes a `render`
 * element instead of Radix's `asChild`, which is the one difference from
 * merchant-portal's version.
 */
export function NavMain({ items }: { items: NavMainItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Company</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainMenuItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavMainMenuItem({ item }: { item: NavMainItem }) {
  // `/*` so an item whose page grows sub-routes later (e.g. an employee
  // detail page) still shows active; useMatch alone is an exact match.
  const exactMatch = useMatch(item.url)
  const subMatch = useMatch(`${item.url}/*`)
  const isActive = Boolean(exactMatch) || Boolean(subMatch)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<Link to={item.url} />} tooltip={item.title} isActive={isActive}>
        {item.icon}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
