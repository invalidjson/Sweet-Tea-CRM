"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import type { LeadStatus, LeadType } from "@/types"

const STATUSES: LeadStatus[] = [
  "NEW", "SAVED", "CONTACTED", "FOLLOW_UP",
  "INTERESTED", "NOT_INTERESTED", "WON", "LOST",
]

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  SAVED: "Saved",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow-up",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not Interested",
  WON: "Won",
  LOST: "Lost",
}

function FilterBtn({
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
      className={[
        "h-7 px-2.5 text-[12px] font-mono uppercase tracking-wider rounded-sm border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  )
}

const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  WEB: "Web",
  SOFTWARE: "Software",
}

export function LeadFilters({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentLeadType = searchParams.get("leadType") as LeadType | null
  const currentStatus = searchParams.get("status") as LeadStatus | null
  const noWebsite = searchParams.get("noWebsite") === "1"
  const sortBy = searchParams.get("sortBy") ?? "score"
  const sortDir = searchParams.get("sortDir") ?? "desc"

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  function toggleSort(key: string) {
    if (sortBy === key) {
      setParam("sortDir", sortDir === "asc" ? "desc" : "asc")
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sortBy", key)
      params.set("sortDir", "desc")
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const sortIndicator = (key: string) =>
    sortBy === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] font-mono text-muted-foreground mr-1">
        {total} leads
      </span>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Lead type filters */}
      <FilterBtn
        active={currentLeadType === null}
        label="All Types"
        onClick={() => setParam("leadType", null)}
      />
      {(["WEB", "SOFTWARE"] as LeadType[]).map((t) => (
        <FilterBtn
          key={t}
          active={currentLeadType === t}
          label={LEAD_TYPE_LABELS[t]}
          onClick={() => setParam("leadType", currentLeadType === t ? null : t)}
        />
      ))}

      <div className="h-4 w-px bg-border mx-1" />

      {/* Status filters */}
      <FilterBtn
        active={currentStatus === null}
        label="All"
        onClick={() => setParam("status", null)}
      />
      {STATUSES.map((s) => (
        <FilterBtn
          key={s}
          active={currentStatus === s}
          label={STATUS_LABELS[s]}
          onClick={() => setParam("status", currentStatus === s ? null : s)}
        />
      ))}

      <div className="h-4 w-px bg-border mx-1" />

      {/* No website */}
      <FilterBtn
        active={noWebsite}
        label="No Website"
        onClick={() => setParam("noWebsite", noWebsite ? null : "1")}
      />

      <div className="h-4 w-px bg-border mx-1" />

      {/* Sort */}
      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Sort:</span>
      {(["score", "name", "status", "followUp"] as const).map((key) => (
        <FilterBtn
          key={key}
          active={sortBy === key}
          label={`${key === "followUp" ? "Follow-up" : key.charAt(0).toUpperCase() + key.slice(1)}${sortIndicator(key)}`}
          onClick={() => toggleSort(key)}
        />
      ))}
    </div>
  )
}
