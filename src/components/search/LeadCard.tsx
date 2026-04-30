"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Globe, Check, BookmarkPlus } from "lucide-react"
import type { SearchResult } from "@/types"

interface LeadCardProps {
  result: SearchResult
  onSave: (result: SearchResult) => void
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-primary" : score >= 50 ? "bg-primary/70" : "bg-muted-foreground/40"

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-muted rounded-none overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-[10px] font-mono tabular-nums font-bold w-5 text-right ${score >= 80 ? "text-primary" : "text-muted-foreground"}`}>
        {score}
      </span>
    </div>
  )
}

export function LeadCard({ result, onSave }: LeadCardProps) {
  return (
    <Card className="rounded-sm shadow-none hover:border-primary/50 transition-colors group">
      <CardContent className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wide text-foreground leading-tight truncate">
              {result.businessName}
            </h3>
            {!result.hasWebsite && (
              <Badge
                variant="outline"
                className="mt-1 text-[8px] font-mono uppercase tracking-wider h-3.5 px-1 rounded-sm border-primary/50 text-primary"
              >
                no website
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant={result.isSaved ? "secondary" : "default"}
            className="h-6 px-2 text-[9px] font-mono uppercase tracking-wider rounded-sm shrink-0"
            onClick={() => onSave(result)}
            disabled={result.isSaved}
          >
            {result.isSaved ? (
              <><Check size={9} className="mr-1" />Saved</>
            ) : (
              <><BookmarkPlus size={9} className="mr-1" />Save</>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{result.address}, {result.city}, {result.state}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Phone size={10} className="shrink-0" />
            <span>{result.phone ?? <span className="opacity-40">—</span>}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Mail size={10} className="shrink-0" />
            <span className="truncate">{result.email ?? <span className="opacity-40">—</span>}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Globe size={10} className="shrink-0" />
            {result.website ? (
              <a
                href={result.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {result.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="text-muted-foreground/50 italic text-[9px]">no website found</span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="pt-1 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Closeability
            </span>
          </div>
          <ScoreBar score={result.closeabilityScore ?? 0} />
        </div>
      </CardContent>
    </Card>
  )
}
