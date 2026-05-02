// ─── Input types ─────────────────────────────────────────────────────────────
// All fields are optional — not every lead will have complete data.
// The algorithm handles missing data gracefully and adjusts confidence.

export interface WebsiteAnalysis {
  hasHttps?: boolean
  isMobileFriendly?: boolean
  loadTimeMs?: number
  hasContactForm?: boolean
  hasClearCallToAction?: boolean
  hasOnlineBooking?: boolean
  hasBrokenLinks?: boolean
  looksModern?: boolean
  /** e.g. "wordpress", "squarespace", "wix", "webflow", "shopify", "custom" */
  detectedPlatform?: string
}

export interface GooglePlaceData {
  rating?: number
  reviewCount?: number
  hasPhone?: boolean
  hasBusinessHours?: boolean
  hasPhotos?: boolean
  isOperational?: boolean
}

export interface ContactData {
  phone?: string
  email?: string
  contactPageUrl?: string
  smsCapable?: boolean
}

export interface SocialData {
  hasFacebook?: boolean
  hasInstagram?: boolean
  /** ISO date string of most recent post */
  lastPostDate?: string
}

export interface BusinessData {
  isFranchise?: boolean
  isChain?: boolean
  numberOfLocations?: number
  /** Google price level 1–4 ($, $$, $$$, $$$$) */
  priceLevel?: number
}

export interface CompetitionData {
  nearbyCompetitorCount?: number
  competitorsWithBetterWebsites?: number
  competitorsWithMoreReviews?: number
}

export interface LeadScoringInput {
  businessName?: string
  category?: string
  categories?: string[]
  city?: string
  state?: string
  hasWebsite?: boolean
  websiteUrl?: string
  websiteAnalysis?: WebsiteAnalysis
  googlePlace?: GooglePlaceData
  contact?: ContactData
  social?: SocialData
  business?: BusinessData
  competition?: CompetitionData
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface ScoreModuleResult {
  /** Raw 0–100 score for this module */
  score: number
  reasons: string[]
  warnings: string[]
}

export interface CloseabilityBreakdown {
  website: number
  digitalPresence: number
  activity: number
  industryFit: number
  revenueProxy: number
  reachability: number
  competitionPressure: number
  /** Penalty points subtracted from weighted total */
  penalties: number
}

export type Grade = "A" | "B" | "C" | "D" | "F"
export type Confidence = "low" | "medium" | "high"

export interface CloseabilityScoreResult {
  /** Final 0–100 integer score */
  totalScore: number
  grade: Grade
  /** Human-readable label e.g. "Hot lead" */
  label: string
  /** Based on how much data was available */
  confidence: Confidence
  breakdown: CloseabilityBreakdown
  /** Top positive signals driving the score */
  reasons: string[]
  /** Red flags or missing data warnings */
  warnings: string[]
}
