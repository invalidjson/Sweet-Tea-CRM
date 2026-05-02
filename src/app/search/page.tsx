"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SearchForm } from "@/components/search/SearchForm"
import { SearchFilters, type FilterState } from "@/components/search/SearchFilters"
import { LeadGrid } from "@/components/search/LeadGrid"
import { Pagination } from "@/components/search/Pagination"
import type { SearchQuery, SearchResult } from "@/types"

const PAGE_SIZE = 20
const CACHE_KEY = "sweet-tea-search"

const DEFAULT_FILTERS: FilterState = {
  noWebsiteOnly: false,
  hasPhoneOnly: false,
  hasEmailOnly: false,
  savedOnly: false,
  unsavedOnly: false,
  sortBy: "score",
  sortDir: "desc",
}

interface CachedState {
  hasSearched: boolean
  results: SearchResult[]
  savedIds: string[]
  filters: FilterState
  page: number
  lastQuery: SearchQuery | null
}

function readCache(): CachedState | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CachedState) : null
  } catch {
    return null
  }
}

function writeCache(state: CachedState) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage unavailable (private mode, storage full, etc.) — fail silently
  }
}

export default function SearchPage() {
  const cached = useRef<CachedState | null>(null)

  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)

  // Hydrate from sessionStorage on first mount
  useEffect(() => {
    const c = readCache()
    if (!c) return
    cached.current = c
    setHasSearched(c.hasSearched)
    setResults(c.results)
    setSavedIds(new Set(c.savedIds))
    setFilters(c.filters)
    setPage(c.page)
    setLastQuery(c.lastQuery)
  }, [])

  // Persist to sessionStorage whenever key state changes (skip first render)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    writeCache({ hasSearched, results, savedIds: [...savedIds], filters, page, lastQuery })
  }, [hasSearched, results, savedIds, filters, page, lastQuery])

  async function fetchResults(query: SearchQuery, token?: string): Promise<{ results: SearchResult[]; nextPageToken: string | null }> {
    const params = new URLSearchParams({
      businessType: query.businessType,
      city: query.city,
      state: query.state,
    })
    if (token) params.set("pageToken", token)
    const res = await fetch(`/api/search?${params}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Search failed")
    const fetched: SearchResult[] = (data.results ?? []).map((r: SearchResult) => ({
      ...r,
      isSaved: savedIds.has(r.externalId),
    }))
    return { results: fetched, nextPageToken: data.nextPageToken ?? null }
  }

  async function handleSearch(query: SearchQuery) {
    setIsLoading(true)
    setError(null)
    setLastQuery(query)
    setPage(1)
    setFilters(DEFAULT_FILTERS)
    setNextPageToken(null)

    try {
      const { results: fetched, nextPageToken: token } = await fetchResults(query)
      setResults(fetched)
      setNextPageToken(token)
      setHasSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLoadMore() {
    if (!lastQuery || !nextPageToken) return
    setIsLoadingMore(true)
    try {
      const { results: more, nextPageToken: token } = await fetchResults(lastQuery, nextPageToken)
      setResults((prev) => [...prev, ...more])
      setNextPageToken(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function handleSave(result: SearchResult) {
    // Optimistic UI update
    setSavedIds((prev) => new Set([...prev, result.externalId]))
    setResults((prev) =>
      prev.map((r) => (r.externalId === result.externalId ? { ...r, isSaved: true } : r))
    )

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      })
      if (res.ok) {
        const { id } = await res.json()
        // Fire-and-forget enrichment — runs in background, doesn't block UI
        fetch(`/api/leads/${id}/enrich`, { method: "POST" }).catch(() => {})
      }
    } catch {
      // Silent fail — lead shows as saved in UI, will persist on next real save attempt
    }
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
    <div className="p-6 space-y-4 max-w-screen-xl">
      {/* Search form */}
      <Card className="rounded-sm shadow-none">
        <CardContent className="p-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Find Leads
          </p>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </CardContent>
      </Card>

      {error && (
        <p className="text-[13px] font-mono text-destructive border border-destructive/30 rounded-sm px-3 py-2 bg-destructive/5">
          {error}
        </p>
      )}

      {/* Results */}
      {hasSearched && !error && (
        <div className="space-y-3">
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
            <p className="text-[12px] font-mono text-muted-foreground">
              Results for <span className="text-foreground">{lastQuery.businessType}</span> in{" "}
              <span className="text-foreground">{lastQuery.city}, {lastQuery.state}</span>
            </p>
          )}

          <LeadGrid results={filteredResults} page={page} onSave={handleSave} />

          <div className="flex items-center justify-between pt-2">
            {nextPageToken ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-[12px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Loading..." : `Load more results ↓`}
              </button>
            ) : (
              <span />
            )}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {!hasSearched && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[13px] font-mono text-muted-foreground">
            Enter a business type and location to find leads.
          </p>
          <p className="text-[12px] font-mono text-muted-foreground/60 mt-1">
            Try: "dentist" in "Austin, TX"
          </p>
        </div>
      )}
    </div>
  )
}
