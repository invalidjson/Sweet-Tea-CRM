import type { LeadScoringInput } from "./types"
import { calculateCloseabilityScore } from "./calculateCloseabilityScore"

// Five representative leads for testing and UI development
const RAW_LEADS: { name: string; input: LeadScoringInput }[] = [
  {
    name: "Peak Plumbing Co.",
    input: {
      businessName: "Peak Plumbing Co.",
      category: "plumber",
      hasWebsite: false,
      googlePlace: { rating: 4.6, reviewCount: 87, hasPhone: true, hasBusinessHours: true, hasPhotos: true, isOperational: true },
      contact: { phone: "512-555-0101" },
    },
  },
  {
    name: "FreshCuts Barber (Franchise)",
    input: {
      businessName: "FreshCuts Barber",
      category: "barber",
      hasWebsite: true,
      websiteUrl: "https://freshcuts.com",
      websiteAnalysis: { hasHttps: true, isMobileFriendly: true, loadTimeMs: 900, hasContactForm: true, hasClearCallToAction: true, hasOnlineBooking: true, looksModern: true, detectedPlatform: "squarespace" },
      googlePlace: { rating: 4.4, reviewCount: 210, hasPhone: true, hasBusinessHours: true, hasPhotos: true, isOperational: true },
      contact: { phone: "512-555-0202", email: "hello@freshcuts.com" },
      business: { isFranchise: true, numberOfLocations: 35 },
    },
  },
  {
    name: "Metro Glass & Mirror",
    input: {
      businessName: "Metro Glass & Mirror",
      category: "glass",
      hasWebsite: true,
      websiteUrl: "http://metroglass.net",
      websiteAnalysis: { hasHttps: false, isMobileFriendly: false, loadTimeMs: 5800, hasContactForm: false, hasClearCallToAction: false, hasBrokenLinks: true, looksModern: false },
      googlePlace: { rating: 4.1, reviewCount: 22, hasPhone: true, hasBusinessHours: false, hasPhotos: false, isOperational: true },
      contact: {},
      social: { hasFacebook: false, hasInstagram: false },
    },
  },
  {
    name: "Lone Star HVAC & Cooling",
    input: {
      businessName: "Lone Star HVAC & Cooling",
      category: "hvac",
      hasWebsite: true,
      websiteUrl: "http://lonestarHVAC.com",
      websiteAnalysis: { hasHttps: false, isMobileFriendly: false, loadTimeMs: 4200, hasContactForm: false, hasClearCallToAction: false, looksModern: false },
      googlePlace: { rating: 4.7, reviewCount: 143, hasPhone: true, hasBusinessHours: true, hasPhotos: true, isOperational: true },
      contact: { phone: "512-555-0303", email: "info@lonestarHVAC.com" },
      social: { hasFacebook: true, hasInstagram: false, lastPostDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      competition: { nearbyCompetitorCount: 8, competitorsWithBetterWebsites: 5, competitorsWithMoreReviews: 2 },
    },
  },
  {
    name: "Sunrise Yoga Studio",
    input: {
      businessName: "Sunrise Yoga Studio",
      category: "yoga",
    },
  },
]

export const MOCK_SCORED_LEADS = RAW_LEADS.map(({ name, input }) => ({
  name,
  input,
  result: calculateCloseabilityScore(input),
}))
