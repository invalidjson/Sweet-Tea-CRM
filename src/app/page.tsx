import { StatsCards } from "@/components/dashboard/StatsCards"
import { LeadsByStatus } from "@/components/dashboard/LeadsByStatus"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { TopLeads } from "@/components/dashboard/TopLeads"
import {
  MOCK_DASHBOARD_STATS,
  MOCK_STATUS_COUNTS,
  MOCK_RECENT_ACTIVITY,
  MOCK_SAVED_LEADS,
} from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      <StatsCards stats={MOCK_DASHBOARD_STATS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <RecentActivity items={MOCK_RECENT_ACTIVITY} />
          <TopLeads leads={MOCK_SAVED_LEADS} />
        </div>
        <div>
          <LeadsByStatus counts={MOCK_STATUS_COUNTS} />
        </div>
      </div>
    </div>
  )
}
