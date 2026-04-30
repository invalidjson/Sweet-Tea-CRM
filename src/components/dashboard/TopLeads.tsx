import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Lead } from "@/types"

export function TopLeads({ leads }: { leads: Lead[] }) {
  const top = [...leads]
    .filter((l) => !["WON", "LOST", "NOT_INTERESTED"].includes(l.status))
    .sort((a, b) => (b.closeabilityScore ?? 0) - (a.closeabilityScore ?? 0))
    .slice(0, 5)

  return (
    <Card className="rounded-sm shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-medium">
          Top Closeability Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-0">
        {top.map((lead, i) => (
          <div
            key={lead.id}
            className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
          >
            <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-4 shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono font-medium text-foreground truncate">
                {lead.businessName}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {lead.city}, {lead.state}
                {!lead.hasWebsite && " · no website"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-16 h-1 bg-muted rounded-none overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${lead.closeabilityScore ?? 0}%` }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-primary font-bold w-6 text-right">
                {lead.closeabilityScore ?? 0}
              </span>
            </div>
            {lead.status === "INTERESTED" && (
              <Badge className="text-[8px] font-mono uppercase tracking-wider h-4 px-1 bg-primary text-primary-foreground rounded-sm">
                hot
              </Badge>
            )}
          </div>
        ))}
        {top.length === 0 && (
          <p className="text-[10px] font-mono text-muted-foreground py-2">No active leads yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
