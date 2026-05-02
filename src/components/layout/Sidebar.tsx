"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Search, Users, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/leads", label: "Leads", icon: Users },
]

const secondaryNav = [
  { href: "/help", label: "Help", icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  const navLink = (href: string, label: string, Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 text-[13px] font-mono font-medium tracking-[0.15em] uppercase rounded-sm transition-colors",
        pathname === href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon size={13} strokeWidth={1.75} />
      {label}
    </Link>
  )

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-12 flex items-center px-4 border-b border-sidebar-border">
        <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-foreground">
          Sweet Tea
        </span>
        <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-primary ml-1">
          CRM
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
      </nav>

      {/* Secondary nav */}
      <div className="p-2 border-t border-sidebar-border space-y-0.5">
        {secondaryNav.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
        <div className="pt-2 px-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
            v0.1.0 — phase 1
          </p>
        </div>
      </div>
    </aside>
  )
}
