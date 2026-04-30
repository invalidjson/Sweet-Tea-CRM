"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "./ThemeToggle"

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/": { title: "Dashboard", sub: "Overview of your pipeline" },
  "/search": { title: "Lead Search", sub: "Find new local business leads" },
  "/leads": { title: "Lead Management", sub: "Track and manage saved leads" },
}

export function Header() {
  const pathname = usePathname()
  const page = PAGE_TITLES[pathname] ?? { title: "Sweet Tea CRM", sub: "" }

  return (
    <header className="h-12 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-foreground">
          {page.title}
        </h1>
        {page.sub && (
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">
            — {page.sub}
          </span>
        )}
      </div>
      <ThemeToggle />
    </header>
  )
}
