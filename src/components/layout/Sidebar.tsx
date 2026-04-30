"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Search, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/leads", label: "Leads", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

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

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-[11px] font-mono font-medium tracking-[0.15em] uppercase rounded-sm transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}
          >
            <Icon size={13} strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          v0.1.0 — phase 1
        </p>
      </div>
    </aside>
  )
}
