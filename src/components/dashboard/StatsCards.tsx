import { Card, CardContent } from "@/components/ui/card"
import type { DashboardStats } from "@/types"

interface StatTileProps {
  label: string
  value: number | string
  sub?: string
  highlight?: boolean
}

function StatTile({ label, value, sub, highlight }: StatTileProps) {
  return (
    <Card className="rounded-sm shadow-none">
      <CardContent className="p-4">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
          {label}
        </p>
        <p className={`text-3xl font-mono font-bold tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
        {sub && (
          <p className="text-[10px] font-mono text-muted-foreground mt-1">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatTile label="Total Saved" value={stats.totalSaved} />
      <StatTile label="New This Week" value={stats.newThisWeek} sub="leads added" />
      <StatTile
        label="No Website"
        value={stats.withoutWebsites}
        sub="prime targets"
        highlight
      />
      <StatTile
        label="Follow-ups Due"
        value={stats.followUpsDue}
        sub="today + tomorrow"
        highlight={stats.followUpsDue > 0}
      />
      <StatTile label="Active Pipeline" value={stats.activePipeline} sub="in progress" />
      <StatTile label="Won This Month" value={stats.wonThisMonth} sub="closed deals" />
    </div>
  )
}
