export type LeadStatus =
  | "NEW"
  | "SAVED"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "WON"
  | "LOST"

export type EnrichStatus = "PENDING" | "DONE" | "FAILED"

export type ContactType = "CALL" | "EMAIL" | "SMS" | "MEETING" | "OTHER"

export type ScoreGrade = "A" | "B" | "C" | "D" | "F"
export type ScoreConfidence = "low" | "medium" | "high"

export interface ScoreBreakdown {
  website: number
  digitalPresence: number
  activity: number
  industryFit: number
  revenueProxy: number
  reachability: number
  competitionPressure: number
  penalties: number
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
  yelpId?: string
  primaryCategory?: string
  googleRating?: number
  googleReviewCount?: number
  googleHasPhotos?: boolean
  googleHasHours?: boolean
  yelpRating?: number
  yelpReviewCount?: number
  apolloOrgId?: string
  linkedinUrl?: string
  employeeCount?: number
  closeabilityScore?: number
  scoreGrade?: ScoreGrade
  scoreLabel?: string
  scoreConfidence?: ScoreConfidence
  scoreBreakdown?: ScoreBreakdown
  scoreReasons?: string[]
  scoreWarnings?: string[]
  status: LeadStatus
  enrichStatus?: EnrichStatus
  enrichedAt?: string
  lastContactedAt?: string
  nextFollowUpAt?: string
  searchRunId?: string
  doNotCall?: boolean
  doNotCallAt?: string
  createdAt: string
  updatedAt: string
  contactEvents?: ContactEvent[]
  notes?: Note[]
}

export type LeadSource = "google" | "apollo" | "merged"

export interface SearchResult {
  externalId: string
  source?: LeadSource
  yelpId?: string
  apolloOrgId?: string
  linkedinUrl?: string
  employeeCount?: number
  businessName: string
  address: string
  city: string
  state: string
  zip?: string
  phone?: string
  email?: string
  website?: string
  hasWebsite: boolean
  primaryCategory?: string
  googleRating?: number
  googleReviewCount?: number
  googleHasPhotos?: boolean
  googleHasHours?: boolean
  yelpRating?: number
  yelpReviewCount?: number
  closeabilityScore?: number
  scoreGrade?: ScoreGrade
  scoreLabel?: string
  scoreConfidence?: ScoreConfidence
  scoreBreakdown?: ScoreBreakdown
  scoreReasons?: string[]
  scoreWarnings?: string[]
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
