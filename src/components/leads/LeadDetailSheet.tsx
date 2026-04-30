"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { QuickActions } from "./QuickActions"
import { Phone, Mail, Globe, MapPin, Calendar } from "lucide-react"
import type { Lead, ContactType } from "@/types"

const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  CALL: "Call",
  EMAIL: "Email",
  SMS: "SMS",
  MEETING: "Meeting",
  OTHER: "Other",
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface LeadDetailSheetProps {
  lead: Lead | null
  open: boolean
  onClose: () => void
}

export function LeadDetailSheet({ lead, open, onClose }: LeadDetailSheetProps) {
  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 pb-3 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="text-[12px] font-mono font-bold uppercase tracking-wide text-left leading-tight">
              {lead.businessName}
            </SheetTitle>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <MapPin size={10} />
            {lead.address}, {lead.city}, {lead.state}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            {/* Contact info */}
            <section>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Contact
              </p>
              <div className="space-y-1.5">
                {[
                  { icon: Phone, value: lead.phone, href: lead.phone ? `tel:${lead.phone}` : undefined },
                  { icon: Mail, value: lead.email, href: lead.email ? `mailto:${lead.email}` : undefined },
                  { icon: Globe, value: lead.website ? lead.website.replace(/^https?:\/\//, "") : undefined, href: lead.website },
                ].map(({ icon: Icon, value, href }) => (
                  <div key={Icon.name} className="flex items-center gap-2">
                    <Icon size={11} className="text-muted-foreground shrink-0" />
                    {value ? (
                      href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-[10px] font-mono hover:text-primary transition-colors">
                          {value}
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono">{value}</span>
                      )
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground/50">—</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Dates */}
            <section>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Timeline
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Saved", value: formatDate(lead.createdAt) },
                  { label: "Last Contact", value: formatDate(lead.lastContactedAt) },
                  { label: "Follow-up", value: formatDate(lead.nextFollowUpAt) },
                  { label: "Score", value: `${lead.closeabilityScore ?? 0} / 100` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-[11px] font-mono font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Quick actions */}
            <section>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Actions
              </p>
              <QuickActions lead={lead} />
            </section>

            <Separator />

            {/* Notes */}
            <section>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Notes ({lead.notes?.length ?? 0})
              </p>
              {lead.notes && lead.notes.length > 0 ? (
                <div className="space-y-2">
                  {lead.notes.map((note) => (
                    <div key={note.id} className="p-2.5 bg-muted rounded-sm">
                      <p className="text-[10px] font-mono leading-relaxed">{note.content}</p>
                      <p className="text-[9px] font-mono text-muted-foreground mt-1.5">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-muted-foreground">No notes yet.</p>
              )}
            </section>

            <Separator />

            {/* Contact history */}
            <section>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Contact History ({lead.contactEvents?.length ?? 0})
              </p>
              {lead.contactEvents && lead.contactEvents.length > 0 ? (
                <div className="space-y-2">
                  {[...lead.contactEvents]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((event) => (
                      <div key={event.id} className="border border-border rounded-sm p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-primary font-bold">
                            {CONTACT_TYPE_LABELS[event.type]}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {formatDate(event.createdAt)}
                          </span>
                        </div>
                        {event.notes && (
                          <p className="text-[10px] font-mono leading-relaxed">{event.notes}</p>
                        )}
                        {event.outcome && (
                          <p className="text-[9px] font-mono text-muted-foreground mt-1">
                            → {event.outcome}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-muted-foreground">No contact events yet.</p>
              )}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
