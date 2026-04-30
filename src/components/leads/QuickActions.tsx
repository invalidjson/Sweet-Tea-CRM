"use client"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Phone, Mail, MessageSquare, Globe, FileEdit, StickyNote, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Lead } from "@/types"

const actionLinkClass = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "h-7 px-2 text-[9px] font-mono uppercase tracking-wider rounded-sm inline-flex items-center"
)

interface QuickActionsProps {
  lead: Lead
  onEdit?: () => void
  onAddNote?: () => void
  onLogContact?: () => void
}

export function QuickActions({ lead, onEdit, onAddNote, onLogContact }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {lead.phone && (
        <a href={`tel:${lead.phone}`} className={actionLinkClass}>
          <Phone size={10} className="mr-1" />
          Call
        </a>
      )}
      {lead.email && (
        <a href={`mailto:${lead.email}`} className={actionLinkClass}>
          <Mail size={10} className="mr-1" />
          Email
        </a>
      )}
      {lead.phone && (
        <a href={`sms:${lead.phone}`} className={actionLinkClass}>
          <MessageSquare size={10} className="mr-1" />
          SMS
        </a>
      )}
      {lead.website && (
        <a href={lead.website} target="_blank" rel="noopener noreferrer" className={actionLinkClass}>
          <Globe size={10} className="mr-1" />
          Site
        </a>
      )}
      {onLogContact && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[9px] font-mono uppercase tracking-wider rounded-sm"
          onClick={onLogContact}
        >
          <ClipboardList size={10} className="mr-1" />
          Log
        </Button>
      )}
      {onAddNote && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[9px] font-mono uppercase tracking-wider rounded-sm"
          onClick={onAddNote}
        >
          <StickyNote size={10} className="mr-1" />
          Note
        </Button>
      )}
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[9px] font-mono uppercase tracking-wider rounded-sm"
          onClick={onEdit}
        >
          <FileEdit size={10} className="mr-1" />
          Edit
        </Button>
      )}
    </div>
  )
}
