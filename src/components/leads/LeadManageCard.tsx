"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { QuickActions } from "./QuickActions"
import { ScoreBadge } from "@/components/shared/ScoreBadge"
import { MapPin, Phone, Mail, Globe, Calendar, ChevronRight, MessageSquare, PhoneCall, AtSign, Users } from "lucide-react"
import type { Lead, ContactType } from "@/types"

const CONTACT_ICONS: Record<ContactType, React.ComponentType<{ size?: number; className?: string }>> = {
  CALL: PhoneCall,
  EMAIL: AtSign,
  SMS: MessageSquare,
  MEETING: Users,
  OTHER: MessageSquare,
}

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
  const hasScore = lead.closeabilityScore !== undefined && lead.scoreGrade !== undefined

  const sortedEvents = [...(lead.contactEvents ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const recentEvents = sortedEvents.slice(0, 4)

  return (
    <Card className="rounded-sm border-4 shadow-[0_2px_4px_rgba(0,0,0,0.04),_0_8px_20px_rgba(0,0,0,0.08)] hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button onClick={onOpen} className="flex items-center gap-1 group text-left">
              <h3 className="text-[14px] font-mono font-bold uppercase tracking-wide text-foreground leading-tight group-hover:text-primary transition-colors">
                {lead.businessName}
              </h3>
              <ChevronRight size={11} className="text-muted-foreground group-hover:text-primary transition-colors mt-px" />
            </button>
            <div className="flex items-center gap-1.5 text-[12px] font-mono text-muted-foreground mt-0.5">
              <MapPin size={9} />
              {lead.city}, {lead.state}
              {!lead.hasWebsite && (
                <span className="text-primary ml-1 font-medium">· no website</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasScore && (
              <ScoreBadge
                score={lead.closeabilityScore!}
                grade={lead.scoreGrade!}
                confidence={lead.scoreConfidence}
                size="sm"
              />
            )}
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 text-[12px] font-mono text-muted-foreground">
            <Phone size={9} className="shrink-0" />
            <span className="truncate">{lead.phone ?? <span className="opacity-40">—</span>}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-mono text-muted-foreground">
            <Mail size={9} className="shrink-0" />
            <span className="truncate">{lead.email ?? <span className="opacity-40">—</span>}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-mono text-muted-foreground">
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
              <span className="opacity-40 italic">none</span>
            )}
          </div>
        </div>

        {/* Score + dates strip */}
        <div className="flex items-center gap-3 py-2 border-y border-border text-[11px] font-mono flex-wrap">
          {hasScore && (
            <span className="text-muted-foreground">
              Score <span className="text-foreground font-bold">{lead.closeabilityScore}</span>
              {lead.scoreLabel && <span className="text-muted-foreground/60 ml-1">— {lead.scoreLabel}</span>}
            </span>
          )}
          {hasScore && <span className="text-border">|</span>}
          <span className="text-muted-foreground">
            {lastContact
              ? <>Last: <span className="text-foreground">{lastContact}</span></>
              : "Never contacted"}
          </span>
          {followUpDate && (
            <>
              <span className="text-border">|</span>
              <span className={`flex items-center gap-1 ${overdue ? "text-primary font-bold" : "text-muted-foreground"}`}>
                <Calendar size={9} />
                {overdue ? "Due: " : "Next: "}<span className="text-foreground ml-0.5">{followUpDate}</span>
              </span>
            </>
          )}
        </div>

        {/* Contact history — show up to 4 recent events */}
        {recentEvents.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
              Contact History ({lead.contactEvents?.length ?? 0})
            </p>
            <div className="space-y-1.5">
              {recentEvents.map((event) => {
                const Icon = CONTACT_ICONS[event.type]
                return (
                  <div key={event.id} className="flex gap-2.5 border border-border rounded-sm px-3 py-2">
                    <Icon size={10} className="text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
                          {event.type}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                      {event.notes && (
                        <p className="text-[12px] font-mono text-foreground leading-snug">{event.notes}</p>
                      )}
                      {event.outcome && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">→ {event.outcome}</p>
                      )}
                    </div>
                  </div>
                )
              })}
              {(lead.contactEvents?.length ?? 0) > 4 && (
                <button
                  onClick={onOpen}
                  className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors pl-1"
                >
                  + {(lead.contactEvents?.length ?? 0) - 4} more — open to see all
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Notes as fallback when no contact events */
          lead.notes && lead.notes.length > 0 && (
            <div className="text-[12px] font-mono text-muted-foreground leading-relaxed bg-muted rounded-sm px-2.5 py-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mr-1.5">Note</span>
              <span className="line-clamp-3">{lead.notes[lead.notes.length - 1].content}</span>
            </div>
          )
        )}

        {/* Quick actions */}
        <QuickActions lead={lead} onEdit={onOpen} onAddNote={onOpen} onLogContact={onOpen} />
      </CardContent>
    </Card>
  )
}
