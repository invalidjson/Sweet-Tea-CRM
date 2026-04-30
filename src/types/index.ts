export type LeadStatus =
  | "NEW"
  | "SAVED"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "WON"
  | "LOST"

export type ContactType = "CALL" | "EMAIL" | "SMS" | "MEETING" | "OTHER"

export interface ScoreBreakdown {
  noWebsite: number
  hasPhone: number
  hasEmail: number
  bothContacts: number
  noContacts: number
}

export interface ContactEvent {
  id: string
  leadId: string
  type: ContactType
  notes?: string
  outcome?: string
  createdAt: string
}

export interface Note {
  id: string
  leadId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  businessName: string
  address: string
  city: string
  state: string
  zip?: string
  phone?: string
  email?: string
  website?: string
  hasWebsite: boolean
  googlePlaceId?: string
  closeabilityScore?: number
  scoreBreakdown?: ScoreBreakdown
  status: LeadStatus
  lastContactedAt?: string
  nextFollowUpAt?: string
  searchRunId?: string
  createdAt: string
  updatedAt: string
  contactEvents?: ContactEvent[]
  notes?: Note[]
}

export interface SearchResult {
  externalId: string
  businessName: string
  address: string
  city: string
  state: string
  phone?: string
  email?: string
  website?: string
  hasWebsite: boolean
  closeabilityScore?: number
  scoreBreakdown?: ScoreBreakdown
  isSaved?: boolean
}

export interface SearchQuery {
  businessType: string
  city: string
  state: string
}

export interface LeadFilters {
  status?: LeadStatus
  hasWebsite?: boolean
  hasPhone?: boolean
  hasEmail?: boolean
  sortBy?: "score" | "name" | "status" | "followUp" | "lastContact"
  sortDir?: "asc" | "desc"
  page?: number
}

export interface DashboardStats {
  totalSaved: number
  newThisWeek: number
  withoutWebsites: number
  followUpsDue: number
  activePipeline: number
  wonThisMonth: number
}

export interface StatusCount {
  status: LeadStatus
  count: number
}
