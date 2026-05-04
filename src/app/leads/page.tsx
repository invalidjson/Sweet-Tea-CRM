"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LeadManageCard } from "@/components/leads/LeadManageCard"
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet"
import { LeadFilters } from "@/components/leads/LeadFilters"
import { Pagination } from "@/components/search/Pagination"
import type { Lead, LeadStatus, LeadType } from "@/types"
import { Suspense } from "react"

const PAGE_SIZE = 50

function LeadsContent() {
  const searchParams = useSearchParams()
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [page, setPage] = useState(1)

  const leadTypeFilter = searchParams.get("leadType") as LeadType | null
  const statusFilter = searchParams.get("status") as LeadStatus | null
  const noWebsiteFilter = searchParams.get("noWebsite") === "1"
  const sortBy = searchParams.get("sortBy") ?? "score"
  const sortDir = searchParams.get("sortDir") ?? "desc"

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setAllLeads(data.leads ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const leads = useMemo(() => {
    let out = [...allLeads]

    if (leadTypeFilter) out = out.filter((l) => l.leadType === leadTypeFilter)
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
  }, [allLeads, leadTypeFilter, statusFilter, noWebsiteFilter, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE))
  const paginated = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-24">
        <p className="text-[13px] font-mono text-muted-foreground">Loading leads...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-lg">
      {/* Filters + pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LeadFilters total={leads.length} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Lead list — single column */}
      {paginated.length > 0 ? (
        <div className="flex flex-col gap-4">
          {paginated.map((lead) => (
            <LeadManageCard
              key={lead.id}
              lead={lead}
              onOpen={() => setSelectedLead(lead)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[13px] font-mono text-muted-foreground">
            No leads match these filters.
          </p>
          <p className="text-[12px] font-mono text-muted-foreground/60 mt-1">
            Try adjusting or clearing the filters above.
          </p>
        </div>
      )}

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Detail sheet */}
      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdate={(updated) => {
          setAllLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
          setSelectedLead(updated)
        }}
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
