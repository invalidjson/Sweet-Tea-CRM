"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"
import type { SearchQuery, LeadType } from "@/types"

interface SearchFormProps {
  onSearch: (query: SearchQuery) => void
  isLoading: boolean
}

const LEAD_TYPE_OPTIONS: { value: LeadType; label: string; description: string }[] = [
  { value: "WEB", label: "Web Leads", description: "Small businesses needing a website or web presence" },
  { value: "SOFTWARE", label: "Software Leads", description: "SMBs needing custom internal tools, no in-house dev" },
]

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [businessType, setBusinessType] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("PA")
  const [leadType, setLeadType] = useState<LeadType>("WEB")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!businessType.trim() || !city.trim()) return
    onSearch({ businessType: businessType.trim(), city: city.trim(), state: state.trim(), leadType })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Lead type toggle */}
      <div className="flex gap-2">
        {LEAD_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLeadType(opt.value)}
            className={[
              "flex-1 text-left px-3 py-2 rounded-sm border transition-colors",
              leadType === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground",
            ].join(" ")}
          >
            <div className="text-[12px] font-mono uppercase tracking-wider font-medium">{opt.label}</div>
            <div className={[
              "text-[11px] font-mono mt-0.5",
              leadType === opt.value ? "text-primary-foreground/70" : "text-muted-foreground/60",
            ].join(" ")}>
              {opt.description}
            </div>
          </button>
        ))}
      </div>

      {/* Search fields */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px] space-y-1">
          <Label className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Business Type
          </Label>
          <Input
            placeholder={leadType === "SOFTWARE" ? "e.g. contractor, logistics, dental" : "e.g. landscaping, HVAC, plumber"}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="h-8 text-[13px] font-mono rounded-sm"
            required
          />
        </div>
        <div className="w-48 space-y-1">
          <Label className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            City
          </Label>
          <Input
            placeholder="Austin"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-8 text-[13px] font-mono rounded-sm"
            required
          />
        </div>
        <div className="w-24 space-y-1">
          <Label className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            State
          </Label>
          <Input
            placeholder="TX"
            value={state}
            onChange={(e) => setState(e.target.value)}
            maxLength={2}
            className="h-8 text-[13px] font-mono rounded-sm uppercase"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !businessType.trim() || !city.trim()}
          className="h-8 text-[13px] font-mono uppercase tracking-wider rounded-sm"
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin mr-1.5" />
          ) : (
            <Search size={12} className="mr-1.5" />
          )}
          Search
        </Button>
      </div>
    </form>
  )
}
