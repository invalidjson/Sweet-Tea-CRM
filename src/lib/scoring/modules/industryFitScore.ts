import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Industry Fit Score — how well does our offer match what this type of business
 * naturally buys?
 *
 * Service trades and local professional services buy websites constantly.
 * Tech companies and national chains are a waste of time.
 * Our offer ($100–$200/month) fits businesses where one new customer pays for
 * several months of our service.
 */

// These categories are our core customer base — they buy, they see ROI quickly
const HIGH_FIT: string[] = [
  "hvac", "heating", "air condition", "cooling", "furnace",
  "plumb", "plumber", "drain",
  "roof", "roofing", "gutter",
  "electric", "electrician", "wiring",
  "contractor", "construction", "remodel", "handyman", "general contractor",
  "landscap", "lawn", "tree service", "irrigation", "lawn care",
  "dentist", "dental", "orthodont",
  "chiropract",
  "med spa", "medspa", "medical spa", "aesthet", "botox", "filler",
  "salon", "barber", "beauty", "nail", "hair",
  "attorney", "lawyer", "law firm", "legal",
  "accountant", "bookkeep", "cpa", "tax prep",
  "auto repair", "auto shop", "mechanic", "body shop", "auto service",
  "restaurant", "diner", "cafe", "bbq", "pizza", "bistro", "eatery",
  "clean", "cleaning service", "maid", "janitorial", "housekeep",
  "pest control", "exterminator", "termite",
  "moving", "movers", "moving company", "storage",
  "pool service", "pool repair", "pool cleaning",
  "paint", "painter", "painting",
  "fencing", "fence",
  "concrete", "masonry", "paving",
  "weld", "fabricat", "metal work",
  "flooring", "tile", "carpet",
  "insulation",
  "window", "glass", "window cleaning",
  "garage door",
  "locksmith",
  "appliance repair",
  "towing", "roadside",
  "photography", "photographer",
  "event planner", "catering", "wedding",
  "daycare", "childcare", "preschool",
  "veterinarian", "vet", "animal hospital", "pet grooming",
  "optometr", "optician", "eye care",
  "physical therapy", "physiother", "chiro",
  "spa", "massage", "wellness",
]

// Possible clients — situational, worth pursuing but lower confidence
const MEDIUM_FIT: string[] = [
  "retail", "shop", "boutique", "store",
  "gym", "fitness", "yoga", "pilates", "crossfit",
  "insurance agent",
  "financial advisor", "wealth management",
  "travel agent",
  "printing", "print shop",
  "sign shop", "sign company",
  "tutoring", "education center",
  "repair shop", "electronics repair",
  "real estate agent", "realtor",
]

// Hard pass — wrong buyer profile for our offer
const LOW_FIT: string[] = [
  "software company", "saas", "tech company",
  "marketing agency", "advertising agency", "digital agency", "web design", "web agency",
  "hospital", "health system", "medical center",
  "school", "university", "college", "academy",
  "government", "city of", "county", "municipal", "department of",
  "church", "nonprofit", "foundation",
  "bank", "credit union", "financial institution",
  "national chain", "nationwide",
  "corporate office", "headquarters",
]

function matches(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n))
}

export function industryFitScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []

  // Franchise/chain disqualifier: the local owner can't say yes
  const biz = input.business
  if (biz?.isFranchise) {
    warnings.push("Franchise — purchase decisions are typically made at corporate level")
    return { score: 10, reasons, warnings }
  }
  if (biz?.isChain) {
    warnings.push("Chain business — likely has centralized marketing/digital resources")
    return { score: 20, reasons, warnings }
  }
  if ((biz?.numberOfLocations ?? 1) > 5) {
    warnings.push("Multiple locations — likely has in-house digital team")
    return { score: 20, reasons, warnings }
  }

  // Build a searchable string from all category data + business name
  const searchStr = [
    input.category ?? "",
    ...(input.categories ?? []),
    input.businessName ?? "",
  ]
    .join(" ")
    .toLowerCase()

  if (!searchStr.trim()) {
    warnings.push("No category data — industry fit unknown, defaulting to neutral")
    return { score: 50, reasons, warnings }
  }

  if (matches(searchStr, LOW_FIT)) {
    warnings.push("Industry category is a poor fit for our offer")
    return { score: 10, reasons, warnings }
  }

  if (matches(searchStr, HIGH_FIT)) {
    reasons.push("Industry is a strong fit — these businesses regularly buy local digital services")
    return { score: 90, reasons, warnings }
  }

  if (matches(searchStr, MEDIUM_FIT)) {
    reasons.push("Industry is a moderate fit — situational opportunity")
    return { score: 55, reasons, warnings }
  }

  warnings.push("Industry not recognized — defaulting to neutral fit score")
  return { score: 50, reasons, warnings }
}
