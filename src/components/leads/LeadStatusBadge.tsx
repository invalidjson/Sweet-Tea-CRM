import { Badge } from "@/components/ui/badge"
import type { LeadStatus } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  NEW: {
    label: "New",
    className: "border border-border text-muted-foreground bg-transparent",
  },
  SAVED: {
    label: "Saved",
    className: "bg-secondary text-secondary-foreground",
  },
  CONTACTED: {
    label: "Contacted",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  FOLLOW_UP: {
    label: "Follow-up",
    className: "bg-primary text-primary-foreground",
  },
  INTERESTED: {
    label: "Interested",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  NOT_INTERESTED: {
    label: "Not Interested",
    className: "bg-muted text-muted-foreground",
  },
  WON: {
    label: "Won",
    className: "bg-emerald-500 text-white dark:bg-emerald-600",
  },
  LOST: {
    label: "Lost",
    className: "bg-muted text-muted-foreground/60",
  },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <Badge
      className={cn(
        "text-[9px] font-mono uppercase tracking-wider h-5 px-1.5 rounded-sm font-medium",
        className
      )}
    >
      {label}
    </Badge>
  )
}
