"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"
import type { SearchQuery } from "@/types"

interface SearchFormProps {
  onSearch: (query: SearchQuery) => void
  isLoading: boolean
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [businessType, setBusinessType] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("PA")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!businessType.trim() || !city.trim()) return
    onSearch({ businessType: businessType.trim(), city: city.trim(), state: state.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[180px] space-y-1">
        <Label className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Business Type
        </Label>
        <Input
          placeholder="e.g. landscaping, HVAC, plumber"
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
    </form>
  )
}
