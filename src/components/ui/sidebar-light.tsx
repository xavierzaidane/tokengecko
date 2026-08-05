"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

interface SidebarLightProps {
  items: NavItem[]
  className?: string
  onItemClick?: () => void
}

// Safe pathname hook that works both in server/client Next.js context
function useSafePathname(): string {
  const nextPathname = usePathname()
  const [pathname, setPathname] = React.useState<string>(nextPathname || "")

  React.useEffect(() => {
    if (nextPathname) {
      setPathname(nextPathname)
    } else if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  }, [nextPathname])

  return pathname
}

interface NavItemRendererProps {
  item: NavItem
  pathname: string
  depth: number
  onItemClick?: () => void
}

function NavItemRenderer({ item, pathname, depth, onItemClick }: NavItemRendererProps) {
  const hasChildren = item.items && item.items.length > 0
  const isActive = pathname === item.href || (pathname === '/docs' && item.href === '/docs/overview')

  // Parent item with children (section header)
  if (hasChildren) {
    return (
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-2 text-sm tracking-wider font-normal font-medium text-zinc-500",
            depth === 0 && "px-3 py-2",
            depth > 0 && "px-3 py-1.5"
          )}
        >
          {item.icon && <item.icon className={cn(depth === 0 ? "h-4 w-4" : "h-3.5 w-3.5")} />}
          {item.title}
        </div>
        <div className={cn("ml-2 space-y-1 border-l border-zinc-800/60 pl-2")}>
          {item.items!.map((subItem, index) => (
            <NavItemRenderer
              key={subItem.href !== "#" ? subItem.href : `${subItem.title}-${index}`}
              item={subItem}
              pathname={pathname}
              depth={depth + 1}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
    )
  }

  // Leaf item (link) using Next.js Link
  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={cn(
        "flex items-center gap-2 text-xs font-normal rounded-md transition-colors",
        depth === 0 && "px-3 py-2",
        depth > 0 && "px-3 py-1.5",
        isActive
          ? "bg-zinc-800/90 "
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
      )}
    >
      {item.icon && <item.icon className={cn(depth === 0 ? "h-4 w-4" : "h-3.5 w-3.5")} />}
      {item.title}
    </Link>
  )
}

function SidebarLight({ items, className, onItemClick }: SidebarLightProps) {
  const pathname = useSafePathname()

  return (
    <aside className={cn("w-full", className)}>
      <nav className="space-y-4">
        {items.map((item, index) => (
          <NavItemRenderer
            key={item.href !== "#" ? item.href : `${item.title}-${index}`}
            item={item}
            pathname={pathname}
            depth={0}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    </aside>
  )
}

export { SidebarLight }
export type { SidebarLightProps }

export default SidebarLight
