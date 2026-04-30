"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { LeadManageCard } from "@/components/leads/LeadManageCard"
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet"
import { LeadFilters } from "@/components/leads/LeadFilters"
import { MOCK_SAVED_LEADS } from "@/lib/mock-data"
import type { Lead, LeadStatus } from "@/types"
import { Suspense } from "react"

function LeadsContent() {
  const searchParams = useSearchParams()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const statusFilter = searchParams.get("status") as LeadStatus | null
  const noWebsiteFilter = searchParams.get("noWebsite") === "1"
  const sortBy = searchParams.get("sortBy") ?? "score"
  const sortDir = searchParams.get("sortDir") ?? "desc"

  const leads = useMemo(() => {
    let out = [...MOCK_SAVED_LEADS]

    if (statusFilter) out = out.filter((l) => l.status === statusFilter)
    if (noWebsiteFilter) out = out.filter((l) => !l.hasWebsite)

    out.sort((a, b) => {
      let cmp = 0
      if (sortBy === "score") cmp = (a.closeabilityScore ?? 0) - (b.closeabilityScore ?? 0)
      if (sortBy === "name") cmp = a.businessName.localeCompare(b.businessName)
      if (sortBy === "status") cmp = a.status.localeCompare(b.status)
      if (sortBy === "followUp") {
        const aDate = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Infinity
        const bDate = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Infinity
        cmp = aDate - bDate
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return out
  }, [statusFilter, noWebsiteFilter, sortBy, sortDir])

  return (
    <div className="p-6 space-y-4 max-w-screen-2xl">
      {/* Filters */}
      <LeadFilters total={leads.length} />

      {/* Lead grid */}
      {leads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <LeadManageCard
              key={lead.id}
              lead={lead}
              onOpen={() => setSelectedLead(lead)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[11px] font-mono text-muted-foreground">
            No leads match these filters.
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
            Try adjusting or clearing the filters above.
          </p>
        </div>
      )}

      {/* Detail sheet */}
      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsContent />
    </Suspense>
  )
}
