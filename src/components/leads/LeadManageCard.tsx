"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { QuickActions } from "./QuickActions"
import { MapPin, Phone, Mail, Globe, Calendar, ChevronRight } from "lucide-react"
import type { Lead } from "@/types"

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function isOverdue(dateStr?: string) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

interface LeadManageCardProps {
  lead: Lead
  onOpen: () => void
}

export function LeadManageCard({ lead, onOpen }: LeadManageCardProps) {
  const followUpDate = formatDate(lead.nextFollowUpAt)
  const overdue = isOverdue(lead.nextFollowUpAt)
  const lastContact = formatDate(lead.lastContactedAt)
  const latestNote = lead.notes?.[lead.notes.length - 1]
  const latestEvent = lead.contactEvents?.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]

  return (
    <Card className="rounded-sm shadow-none hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              onClick={onOpen}
              className="flex items-center gap-1 group text-left"
            >
              <h3 className="text-[12px] font-mono font-bold uppercase tracking-wide text-foreground leading-tight group-hover:text-primary transition-colors">
                {lead.businessName}
              </h3>
              <ChevronRight size={11} className="text-muted-foreground group-hover:text-primary transition-colors mt-px" />
            </button>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mt-0.5">
              <MapPin size={9} />
              {lead.city}, {lead.state}
              {!lead.hasWebsite && (
                <span className="text-primary ml-1 font-medium">· no website</span>
              )}
            </div>
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Phone size={9} className="shrink-0" />
            <span className="truncate">{lead.phone ?? <span className="opacity-40">—</span>}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Mail size={9} className="shrink-0" />
            <span className="truncate">{lead.email ?? <span className="opacity-40">—</span>}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground col-span-2">
            <Globe size={9} className="shrink-0" />
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="opacity-40 text-[9px] italic">no website</span>
            )}
          </div>
        </div>

        {/* Score + dates */}
        <div className="flex items-center gap-4 py-2 border-y border-border">
          {/* Score */}
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1 bg-muted rounded-none overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${lead.closeabilityScore ?? 0}%` }}
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-primary font-bold">
              {lead.closeabilityScore ?? 0}
            </span>
          </div>

          <div className="h-3 w-px bg-border" />

          {/* Last contact */}
          <div className="text-[9px] font-mono text-muted-foreground">
            {lastContact ? (
              <span>Last: <span className="text-foreground">{lastContact}</span></span>
            ) : (
              <span>Never contacted</span>
            )}
          </div>

          {/* Follow-up */}
          {followUpDate && (
            <>
              <div className="h-3 w-px bg-border" />
              <div className={`flex items-center gap-1 text-[9px] font-mono ${overdue ? "text-primary font-bold" : "text-muted-foreground"}`}>
                <Calendar size={9} />
                <span>{overdue ? "Due: " : "Next: "}<span className="text-foreground">{followUpDate}</span></span>
              </div>
            </>
          )}
        </div>

        {/* Latest note preview */}
        {latestNote && (
          <div className="text-[10px] font-mono text-muted-foreground leading-relaxed bg-muted rounded-sm px-2.5 py-2">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mr-1.5">Note</span>
            <span className="line-clamp-2">{latestNote.content}</span>
          </div>
        )}

        {/* Latest contact event */}
        {latestEvent && !latestNote && (
          <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            <span className="text-[9px] uppercase tracking-wider text-primary mr-1.5">
              {latestEvent.type}
            </span>
            {latestEvent.outcome}
          </div>
        )}

        {/* Quick actions */}
        <QuickActions lead={lead} onEdit={onOpen} onAddNote={onOpen} onLogContact={onOpen} />
      </CardContent>
    </Card>
  )
}
