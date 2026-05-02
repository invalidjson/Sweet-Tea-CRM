"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FilterState {
  noWebsiteOnly: boolean
  hasPhoneOnly: boolean
  hasEmailOnly: boolean
  savedOnly: boolean
  unsavedOnly: boolean
  sortBy: "score" | "name" | "city"
  sortDir: "asc" | "desc"
}

interface SearchFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  totalResults: number
  filteredCount: number
}

function FilterToggle({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 text-[12px] font-mono uppercase tracking-wider rounded-sm border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}

export function SearchFilters({ filters, onChange, totalResults, filteredCount }: SearchFiltersProps) {
  function toggle(key: keyof FilterState) {
    onChange({ ...filters, [key]: !filters[key] })
  }

  function setSort(sortBy: FilterState["sortBy"]) {
    if (filters.sortBy === sortBy) {
      onChange({ ...filters, sortDir: filters.sortDir === "asc" ? "desc" : "asc" })
    } else {
      onChange({ ...filters, sortBy, sortDir: "desc" })
    }
  }

  const sortIndicator = (key: FilterState["sortBy"]) =>
    filters.sortBy === key ? (filters.sortDir === "asc" ? " ↑" : " ↓") : ""

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Counts */}
      <span className="text-[12px] font-mono text-muted-foreground mr-1">
        {filteredCount} / {totalResults} results
      </span>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Filters */}
      <FilterToggle
        active={filters.noWebsiteOnly}
        label="No Website"
        onClick={() => toggle("noWebsiteOnly")}
      />
      <FilterToggle
        active={filters.hasPhoneOnly}
        label="Has Phone"
        onClick={() => toggle("hasPhoneOnly")}
      />
      <FilterToggle
        active={filters.hasEmailOnly}
        label="Has Email"
        onClick={() => toggle("hasEmailOnly")}
      />
      <FilterToggle
        active={filters.unsavedOnly}
        label="Unsaved"
        onClick={() => toggle("unsavedOnly")}
      />
      <FilterToggle
        active={filters.savedOnly}
        label="Saved"
        onClick={() => toggle("savedOnly")}
      />

      <div className="h-4 w-px bg-border mx-1" />

      {/* Sort */}
      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Sort:</span>
      <FilterToggle
        active={filters.sortBy === "score"}
        label={`Score${sortIndicator("score")}`}
        onClick={() => setSort("score")}
      />
      <FilterToggle
        active={filters.sortBy === "name"}
        label={`Name${sortIndicator("name")}`}
        onClick={() => setSort("name")}
      />
      <FilterToggle
        active={filters.sortBy === "city"}
        label={`City${sortIndicator("city")}`}
        onClick={() => setSort("city")}
      />

      {/* Clear */}
      {(filters.noWebsiteOnly || filters.hasPhoneOnly || filters.hasEmailOnly || filters.savedOnly || filters.unsavedOnly) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[12px] font-mono text-muted-foreground hover:text-foreground rounded-sm"
          onClick={() =>
            onChange({ ...filters, noWebsiteOnly: false, hasPhoneOnly: false, hasEmailOnly: false, savedOnly: false, unsavedOnly: false })
          }
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
