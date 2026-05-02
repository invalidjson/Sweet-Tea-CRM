"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { QuickActions } from "./QuickActions"
import { Phone, Mail, Globe, MapPin, StickyNote, ClipboardList } from "lucide-react"
import type { Lead, ContactType, Note, ContactEvent } from "@/types"

const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  CALL: "Call",
  EMAIL: "Email",
  SMS: "SMS",
  MEETING: "Meeting",
  OTHER: "Other",
}

const CONTACT_TYPES: ContactType[] = ["CALL", "EMAIL", "SMS", "MEETING", "OTHER"]

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
  onLeadUpdate?: (lead: Lead) => void
}

export function LeadDetailSheet({ lead, open, onClose, onLeadUpdate }: LeadDetailSheetProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [contactEvents, setContactEvents] = useState<ContactEvent[]>([])
  const [lastContactedAt, setLastContactedAt] = useState<string | undefined>()

  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [noteSubmitting, setNoteSubmitting] = useState(false)

  const [showContactForm, setShowContactForm] = useState(false)
  const [contactType, setContactType] = useState<ContactType>("CALL")
  const [contactNotes, setContactNotes] = useState("")
  const [contactOutcome, setContactOutcome] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [contactSubmitting, setContactSubmitting] = useState(false)

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes ?? [])
      setContactEvents(lead.contactEvents ?? [])
      setLastContactedAt(lead.lastContactedAt)
      setShowNoteForm(false)
      setShowContactForm(false)
      setNoteContent("")
      setContactNotes("")
      setContactOutcome("")
      setFollowUpDate("")
    }
  }, [lead])

  if (!lead) return null

  async function handleAddNote() {
    if (!noteContent.trim() || !lead) return
    setNoteSubmitting(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      })
      if (res.ok) {
        const { note } = await res.json()
        const updated = [...notes, note]
        setNotes(updated)
        setNoteContent("")
        setShowNoteForm(false)
        onLeadUpdate?.({ ...lead, notes: updated, contactEvents })
      }
    } finally {
      setNoteSubmitting(false)
    }
  }

  async function handleLogContact() {
    if (!lead) return
    setContactSubmitting(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}/contact-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contactType,
          notes: contactNotes,
          outcome: contactOutcome,
          nextFollowUpAt: followUpDate || undefined,
        }),
      })
      if (res.ok) {
        const { event } = await res.json()
        const now = new Date().toISOString()
        const updatedEvents = [event, ...contactEvents]
        setContactEvents(updatedEvents)
        setLastContactedAt(now)
        setContactNotes("")
        setContactOutcome("")
        setFollowUpDate("")
        setContactType("CALL")
        setShowContactForm(false)
        onLeadUpdate?.({
          ...lead,
          notes,
          contactEvents: updatedEvents,
          lastContactedAt: now,
          status: "CONTACTED",
          ...(followUpDate ? { nextFollowUpAt: new Date(followUpDate).toISOString() } : {}),
        })
      }
    } finally {
      setContactSubmitting(false)
    }
  }

  const sortedEvents = [...contactEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 pb-3 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="text-[14px] font-mono font-bold uppercase tracking-wide text-left leading-tight">
              {lead.businessName}
            </SheetTitle>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-mono text-muted-foreground">
            <MapPin size={10} />
            {lead.address}, {lead.city}, {lead.state}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            {/* Contact info */}
            <section>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
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
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-[12px] font-mono hover:text-primary transition-colors">
                          {value}
                        </a>
                      ) : (
                        <span className="text-[12px] font-mono">{value}</span>
                      )
                    ) : (
                      <span className="text-[12px] font-mono text-muted-foreground/50">—</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Dates */}
            <section>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Timeline
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Saved", value: formatDate(lead.createdAt) },
                  { label: "Last Contact", value: formatDate(lastContactedAt) },
                  { label: "Follow-up", value: formatDate(lead.nextFollowUpAt) },
                  { label: "Score", value: `${lead.closeabilityScore ?? 0} / 100` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-[13px] font-mono font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Quick actions */}
            <section>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Actions
              </p>
              <QuickActions lead={lead} />
            </section>

            <Separator />

            {/* Log contact */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Contact History ({contactEvents.length})
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px] font-mono uppercase tracking-wider rounded-sm"
                  onClick={() => { setShowContactForm((v) => !v); setShowNoteForm(false) }}
                >
                  <ClipboardList size={9} className="mr-1" />
                  Log
                </Button>
              </div>

              {showContactForm && (
                <div className="border border-border rounded-sm p-3 space-y-2.5 mb-3 bg-muted/30">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Type</p>
                    <div className="flex flex-wrap gap-1">
                      {CONTACT_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => setContactType(t)}
                          className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm border transition-colors ${
                            contactType === t
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                    <textarea
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="What happened..."
                      rows={3}
                      className="w-full text-[12px] font-mono bg-background border border-input rounded-sm px-2.5 py-1.5 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Outcome</p>
                    <Input
                      value={contactOutcome}
                      onChange={(e) => setContactOutcome(e.target.value)}
                      placeholder="e.g. left voicemail, sent proposal..."
                      className="h-7 text-[12px] font-mono rounded-sm"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Follow-up Date (optional)</p>
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="h-7 text-[12px] font-mono rounded-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-7 px-3 text-[11px] font-mono uppercase tracking-wider rounded-sm"
                      onClick={handleLogContact}
                      disabled={contactSubmitting}
                    >
                      {contactSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-3 text-[11px] font-mono uppercase tracking-wider rounded-sm"
                      onClick={() => setShowContactForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {sortedEvents.length > 0 ? (
                <div className="space-y-2">
                  {sortedEvents.map((event) => (
                    <div key={event.id} className="border border-border rounded-sm p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
                          {CONTACT_TYPE_LABELS[event.type]}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                      {event.notes && (
                        <p className="text-[12px] font-mono leading-relaxed">{event.notes}</p>
                      )}
                      {event.outcome && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">
                          → {event.outcome}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] font-mono text-muted-foreground">No contact events yet.</p>
              )}
            </section>

            <Separator />

            {/* Notes */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Notes ({notes.length})
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px] font-mono uppercase tracking-wider rounded-sm"
                  onClick={() => { setShowNoteForm((v) => !v); setShowContactForm(false) }}
                >
                  <StickyNote size={9} className="mr-1" />
                  Add
                </Button>
              </div>

              {showNoteForm && (
                <div className="border border-border rounded-sm p-3 space-y-2.5 mb-3 bg-muted/30">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write a note..."
                    rows={4}
                    className="w-full text-[12px] font-mono bg-background border border-input rounded-sm px-2.5 py-1.5 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 px-3 text-[11px] font-mono uppercase tracking-wider rounded-sm"
                      onClick={handleAddNote}
                      disabled={noteSubmitting || !noteContent.trim()}
                    >
                      {noteSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-3 text-[11px] font-mono uppercase tracking-wider rounded-sm"
                      onClick={() => { setShowNoteForm(false); setNoteContent("") }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {notes.length > 0 ? (
                <div className="space-y-2">
                  {[...notes]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((note) => (
                      <div key={note.id} className="p-2.5 bg-muted rounded-sm">
                        <p className="text-[12px] font-mono leading-relaxed">{note.content}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1.5">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[12px] font-mono text-muted-foreground">No notes yet.</p>
              )}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
