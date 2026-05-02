"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScoreBadge, ScoreBar } from "@/components/shared/ScoreBadge"
import { MapPin, Phone, Mail, Globe, Check, BookmarkPlus, AlertTriangle, TrendingUp } from "lucide-react"
import type { SearchResult } from "@/types"

interface LeadCardProps {
  result: SearchResult
  onSave: (result: SearchResult) => void
}

export function LeadCard({ result, onSave }: LeadCardProps) {
  const hasScore = result.closeabilityScore !== undefined && result.scoreGrade !== undefined
  const topReasons = result.scoreReasons?.slice(0, 3) ?? []
  const topWarnings = result.scoreWarnings?.slice(0, 2) ?? []

  return (
    <Card className="rounded-sm border-4 shadow-[0_2px_4px_rgba(0,0,0,0.04),_0_8px_20px_rgba(0,0,0,0.08)] hover:border-primary/50 transition-colors group">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-mono font-bold uppercase tracking-wide text-foreground leading-tight">
              {result.businessName}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {!result.hasWebsite && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono uppercase tracking-wider h-4 px-1.5 rounded-sm border-primary/50 text-primary"
                >
                  no website
                </Badge>
              )}
              {result.scoreConfidence === "low" && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono uppercase tracking-wider h-4 px-1.5 rounded-sm border-muted-foreground/40 text-muted-foreground"
                >
                  low confidence
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {hasScore && (
              <ScoreBadge
                score={result.closeabilityScore!}
                grade={result.scoreGrade!}
                size="md"
              />
            )}
            <Button
              size="sm"
              variant={result.isSaved ? "secondary" : "default"}
              className="h-7 px-2.5 text-[11px] font-mono uppercase tracking-wider rounded-sm"
              onClick={() => onSave(result)}
              disabled={result.isSaved}
            >
              {result.isSaved ? (
                <><Check size={10} className="mr-1" />Saved</>
              ) : (
                <><BookmarkPlus size={10} className="mr-1" />Save</>
              )}
            </Button>
          </div>
        </div>

        {/* Contact info — 2-col grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-[13px] font-mono text-muted-foreground col-span-2">
            <MapPin size={11} className="shrink-0 text-muted-foreground/60" />
            <span className="truncate">{result.address}, {result.city}, {result.state}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-mono text-muted-foreground">
            <Phone size={11} className="shrink-0 text-muted-foreground/60" />
            {result.phone ? (
              <a href={`tel:${result.phone}`} className="hover:text-primary transition-colors">{result.phone}</a>
            ) : (
              <span className="opacity-40">—</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-mono text-muted-foreground">
            <Mail size={11} className="shrink-0 text-muted-foreground/60" />
            {result.email ? (
              <a href={`mailto:${result.email}`} className="truncate hover:text-primary transition-colors">{result.email}</a>
            ) : (
              <span className="opacity-40">—</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-mono text-muted-foreground col-span-2">
            <Globe size={11} className="shrink-0 text-muted-foreground/60" />
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
              <span className="text-muted-foreground/50 italic text-[12px]">no website found</span>
            )}
          </div>
        </div>

        {/* Score section */}
        {hasScore && (
          <div className="pt-1 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Closeability
              </span>
              {result.scoreLabel && (
                <span className="text-[11px] font-mono text-muted-foreground">{result.scoreLabel}</span>
              )}
            </div>
            <ScoreBar score={result.closeabilityScore!} grade={result.scoreGrade!} />

            {/* Reasons + warnings */}
            {(topReasons.length > 0 || topWarnings.length > 0) && (
              <div className="space-y-1 pt-0.5">
                {topReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <TrendingUp size={10} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[12px] font-mono text-muted-foreground leading-snug">{r}</span>
                  </div>
                ))}
                {topWarnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertTriangle size={10} className="text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[12px] font-mono text-muted-foreground leading-snug">{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
