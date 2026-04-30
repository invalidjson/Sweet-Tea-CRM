"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SearchForm } from "@/components/search/SearchForm"
import { SearchFilters, type FilterState } from "@/components/search/SearchFilters"
import { LeadGrid } from "@/components/search/LeadGrid"
import { Pagination } from "@/components/search/Pagination"
import { MOCK_SEARCH_RESULTS } from "@/lib/mock-data"
import type { SearchQuery, SearchResult } from "@/types"

const PAGE_SIZE = 20

const DEFAULT_FILTERS: FilterState = {
  noWebsiteOnly: false,
  hasPhoneOnly: false,
  hasEmailOnly: false,
  savedOnly: false,
  unsavedOnly: false,
  sortBy: "score",
  sortDir: "desc",
}

export default function SearchPage() {
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null)

  async function handleSearch(query: SearchQuery) {
    setIsLoading(true)
    setLastQuery(query)
    setPage(1)
    setFilters(DEFAULT_FILTERS)

    // Phase 1: return mock data after a short delay to simulate network
    await new Promise((r) => setTimeout(r, 600))
    setResults(MOCK_SEARCH_RESULTS.map((r) => ({ ...r, isSaved: savedIds.has(r.externalId) })))
    setHasSearched(true)
    setIsLoading(false)
  }

  function handleSave(result: SearchResult) {
    setSavedIds((prev) => new Set([...prev, result.externalId]))
    setResults((prev) =>
      prev.map((r) => (r.externalId === result.externalId ? { ...r, isSaved: true } : r))
    )
  }

  const filteredResults = useMemo(() => {
    let out = results.map((r) => ({ ...r, isSaved: savedIds.has(r.externalId) }))

    if (filters.noWebsiteOnly) out = out.filter((r) => !r.hasWebsite)
    if (filters.hasPhoneOnly) out = out.filter((r) => !!r.phone)
    if (filters.hasEmailOnly) out = out.filter((r) => !!r.email)
    if (filters.savedOnly) out = out.filter((r) => r.isSaved)
    if (filters.unsavedOnly) out = out.filter((r) => !r.isSaved)

    out.sort((a, b) => {
      let cmp = 0
      if (filters.sortBy === "score") cmp = (a.closeabilityScore ?? 0) - (b.closeabilityScore ?? 0)
      if (filters.sortBy === "name") cmp = a.businessName.localeCompare(b.businessName)
      if (filters.sortBy === "city") cmp = a.city.localeCompare(b.city)
      return filters.sortDir === "asc" ? cmp : -cmp
    })

    return out
  }, [results, filters, savedIds])

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE))

  return (
    <div className="p-6 space-y-4 max-w-screen-2xl">
      {/* Search form */}
      <Card className="rounded-sm shadow-none">
        <CardContent className="p-4">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Find Leads
          </p>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-3">
          {/* Filter bar + pagination (top) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchFilters
              filters={filters}
              onChange={(f) => { setFilters(f); setPage(1) }}
              totalResults={results.length}
              filteredCount={filteredResults.length}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>

          {lastQuery && (
            <p className="text-[10px] font-mono text-muted-foreground">
              Results for <span className="text-foreground">{lastQuery.businessType}</span> in{" "}
              <span className="text-foreground">{lastQuery.city}, {lastQuery.state}</span>
            </p>
          )}

          <LeadGrid results={filteredResults} page={page} onSave={handleSave} />

          {/* Pagination (bottom) */}
          <div className="flex justify-end pt-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[11px] font-mono text-muted-foreground">
            Enter a business type and city to find leads.
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
            Try: "landscaping" in "Austin, TX"
          </p>
        </div>
      )}
    </div>
  )
}
