import { LeadCard } from "./LeadCard"
import type { SearchResult } from "@/types"

const PAGE_SIZE = 20

interface LeadGridProps {
  results: SearchResult[]
  page: number
  onSave: (result: SearchResult) => void
}

export function LeadGrid({ results, page, onSave }: LeadGridProps) {
  const start = (page - 1) * PAGE_SIZE
  const pageResults = results.slice(start, start + PAGE_SIZE)

  if (pageResults.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[11px] font-mono text-muted-foreground">No results match your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {pageResults.map((result) => (
        <LeadCard key={result.externalId} result={result} onSave={onSave} />
      ))}
    </div>
  )
}
