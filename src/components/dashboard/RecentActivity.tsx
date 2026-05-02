import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Lead, ContactEvent } from "@/types"
import { Phone, Mail, MessageSquare, Users, Calendar } from "lucide-react"

const CONTACT_ICONS = {
  CALL: Phone,
  EMAIL: Mail,
  SMS: MessageSquare,
  MEETING: Calendar,
  OTHER: Users,
}

interface ActivityItem {
  type: "contact" | "saved"
  lead: Lead
  event: ContactEvent | null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return "just now"
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="rounded-sm shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-medium">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-0">
        {items.map((item, i) => {
          const date = item.event ? item.event.createdAt : item.lead.createdAt
          const Icon = item.event ? CONTACT_ICONS[item.event.type] : Users

          return (
            <div
              key={i}
              className="flex items-start gap-3 py-2.5 border-b border-border last:border-0"
            >
              <div className="mt-0.5 w-6 h-6 rounded-sm bg-muted flex items-center justify-center shrink-0">
                <Icon size={11} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-mono font-medium text-foreground truncate">
                  {item.lead.businessName}
                </p>
                <p className="text-[12px] font-mono text-muted-foreground">
                  {item.type === "saved"
                    ? "Lead saved"
                    : `${item.event!.type.charAt(0) + item.event!.type.slice(1).toLowerCase()} logged`}
                  {item.event?.outcome && ` — ${item.event.outcome}`}
                </p>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground shrink-0 mt-0.5">
                {timeAgo(date)}
              </span>
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="text-[12px] font-mono text-muted-foreground py-2">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  )
}
