import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatusCount } from "@/types"

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  SAVED: "Saved",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow-up",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not Interested",
  WON: "Won",
  LOST: "Lost",
}

export function LeadsByStatus({ counts }: { counts: StatusCount[] }) {
  const total = counts.reduce((sum, c) => sum + c.count, 0)

  return (
    <Card className="rounded-sm shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-medium">
          Leads by Status
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {counts.map(({ status, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-mono text-foreground">
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-[12px] font-mono tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
              <div className="h-1 bg-muted rounded-none overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
        {counts.length === 0 && (
          <p className="text-[12px] font-mono text-muted-foreground">No leads yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
