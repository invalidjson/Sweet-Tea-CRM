import { StatsCards } from "@/components/dashboard/StatsCards"
import { LeadsByStatus } from "@/components/dashboard/LeadsByStatus"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { TopLeads } from "@/components/dashboard/TopLeads"
import { prisma } from "@/lib/prisma"
import type { Lead, ContactEvent, Note, DashboardStats, StatusCount } from "@/types"

type PrismaLead = Awaited<ReturnType<typeof prisma.lead.findMany>>[number]

function serializeLead(lead: PrismaLead & { contactEvents: unknown[]; notes: unknown[] }): Lead {
  const d = (v: Date | null | undefined) => v?.toISOString() ?? undefined

  return {
    id: lead.id,
    leadType: lead.leadType as Lead["leadType"],
    businessName: lead.businessName,
    address: lead.address,
    city: lead.city,
    state: lead.state,
    zip: lead.zip ?? undefined,
    phone: lead.phone ?? undefined,
    email: lead.email ?? undefined,
    website: lead.website ?? undefined,
    hasWebsite: lead.hasWebsite,
    googlePlaceId: lead.googlePlaceId ?? undefined,
    primaryCategory: lead.primaryCategory ?? undefined,
    googleRating: lead.googleRating ?? undefined,
    googleReviewCount: lead.googleReviewCount ?? undefined,
    googleHasPhotos: lead.googleHasPhotos ?? undefined,
    googleHasHours: lead.googleHasHours ?? undefined,
    closeabilityScore: lead.closeabilityScore ?? undefined,
    scoreGrade: (lead.scoreGrade as Lead["scoreGrade"]) ?? undefined,
    scoreLabel: lead.scoreLabel ?? undefined,
    scoreConfidence: (lead.scoreConfidence as Lead["scoreConfidence"]) ?? undefined,
    scoreBreakdown: (lead.scoreBreakdown as unknown as Lead["scoreBreakdown"]) ?? undefined,
    scoreReasons: (lead.scoreReasons as string[]) ?? [],
    scoreWarnings: (lead.scoreWarnings as string[]) ?? [],
    status: lead.status as Lead["status"],
    enrichStatus: (lead.enrichStatus as Lead["enrichStatus"]) ?? undefined,
    enrichedAt: d(lead.enrichedAt),
    lastContactedAt: d(lead.lastContactedAt),
    nextFollowUpAt: d(lead.nextFollowUpAt),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    contactEvents: (lead.contactEvents as Array<Record<string, unknown>>).map((ce) => ({
      id: ce.id as string,
      leadId: ce.leadId as string,
      type: ce.type as ContactEvent["type"],
      notes: ce.notes as string | undefined,
      outcome: ce.outcome as string | undefined,
      createdAt: (ce.createdAt as Date).toISOString(),
    })),
    notes: (lead.notes as Array<Record<string, unknown>>).map((n) => ({
      id: n.id as string,
      leadId: n.leadId as string,
      content: n.content as string,
      createdAt: (n.createdAt as Date).toISOString(),
      updatedAt: (n.updatedAt as Date).toISOString(),
    })) as Note[],
  }
}

export default async function DashboardPage() {
  const rawLeads = await prisma.lead.findMany({
    include: { contactEvents: true, notes: true },
    orderBy: { createdAt: "desc" },
  })

  const leads = rawLeads.map((l) => serializeLead(l as Parameters<typeof serializeLead>[0]))
  const now = Date.now()

  const stats: DashboardStats = {
    totalSaved: leads.length,
    newThisWeek: leads.filter((l) => new Date(l.createdAt).getTime() > now - 7 * 86400000).length,
    withoutWebsites: leads.filter((l) => !l.hasWebsite).length,
    followUpsDue: leads.filter(
      (l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt).getTime() <= now + 86400000
    ).length,
    activePipeline: leads.filter((l) =>
      ["INTERESTED", "FOLLOW_UP", "CONTACTED"].includes(l.status)
    ).length,
    wonThisMonth: leads.filter(
      (l) => l.status === "WON" && new Date(l.updatedAt).getTime() > now - 30 * 86400000
    ).length,
  }

  const ALL_STATUSES = [
    "NEW", "SAVED", "CONTACTED", "FOLLOW_UP",
    "INTERESTED", "NOT_INTERESTED", "WON", "LOST",
  ] as const

  const statusCounts: StatusCount[] = ALL_STATUSES
    .map((status) => ({ status, count: leads.filter((l) => l.status === status).length }))
    .filter((s) => s.count > 0)

  const recentActivity = [
    ...leads.flatMap((lead) =>
      (lead.contactEvents ?? []).map((ce) => ({ type: "contact" as const, lead, event: ce }))
    ),
    ...leads
      .filter((l) => new Date(l.createdAt).getTime() > now - 7 * 86400000)
      .map((lead) => ({ type: "saved" as const, lead, event: null })),
  ]
    .sort((a, b) => {
      const dateA = a.event ? a.event.createdAt : a.lead.createdAt
      const dateB = b.event ? b.event.createdAt : b.lead.createdAt
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    .slice(0, 8)

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <RecentActivity items={recentActivity} />
          <TopLeads leads={leads} />
        </div>
        <div>
          <LeadsByStatus counts={statusCounts} />
        </div>
      </div>
    </div>
  )
}
