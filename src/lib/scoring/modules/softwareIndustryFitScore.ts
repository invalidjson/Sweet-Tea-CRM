import type { LeadScoringInput, ScoreModuleResult } from "../types"

// Businesses with operational complexity that justifies custom internal software,
// but too small to have a dedicated dev team.

const HIGH_FIT: string[] = [
  // Trades & field service — scheduling, dispatch, job costing, inventory
  "hvac", "heating", "air condition", "cooling", "plumb", "plumber",
  "electric", "electrician", "roofing", "roof",
  "contractor", "construction", "general contractor", "remodel",
  "landscap", "lawn care", "tree service", "irrigation",
  "pest control", "exterminator",
  "pool service", "pool repair",
  "flooring", "concrete", "masonry", "paving", "fencing",
  "paint", "painter", "insulation", "garage door",
  // Professional services — client intake, billing, workflow
  "attorney", "lawyer", "law firm", "legal",
  "accountant", "bookkeep", "cpa", "tax prep",
  "financial advisor", "wealth management", "insurance agent",
  "real estate", "realtor", "property management",
  // Healthcare / clinical — patient management, scheduling, compliance
  "dentist", "dental", "orthodont",
  "chiropract", "physical therapy", "physiother",
  "optometr", "optician", "eye care",
  "veterinarian", "vet", "animal hospital",
  // Logistics / distribution / wholesale
  "distribut", "wholesale", "logistics", "freight", "trucking",
  "warehouse", "supply", "fulfillment",
  // Manufacturing / fabrication
  "manufactur", "fabricat", "metal work", "weld", "machine shop",
  "print shop", "printing",
  // Field teams or multi-location ops
  "moving", "movers", "storage",
  "towing", "roadside",
  "staffing", "recruiting",
  // Hospitality / food ops with back-of-house complexity
  "catering", "food service",
  "event planner", "wedding",
  "daycare", "childcare",
]

const MEDIUM_FIT: string[] = [
  "retail", "shop", "boutique", "store",
  "auto dealer", "car dealer", "dealership",
  "gym", "fitness", "yoga", "crossfit",
  "salon", "barber", "beauty", "nail", "hair",
  "restaurant", "diner", "cafe",
  "repair shop", "appliance repair", "electronics repair",
  "auto repair", "mechanic", "body shop",
]

// Wrong buyer: either builds their own software or has no operational complexity
const LOW_FIT: string[] = [
  "software company", "saas", "tech company", "it company", "it services",
  "marketing agency", "advertising agency", "digital agency", "web design",
  "hospital", "health system", "medical center",
  "school", "university", "college",
  "government", "city of", "county", "municipal",
  "church", "nonprofit", "foundation",
  "bank", "credit union",
  "national chain", "nationwide", "corporate office", "headquarters",
  "freelance", "consultant", "solo",
]

function matches(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n))
}

export function softwareIndustryFitScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []

  const biz = input.business
  if (biz?.isFranchise) {
    warnings.push("Franchise — software decisions made at corporate level")
    return { score: 10, reasons, warnings }
  }
  if (biz?.isChain) {
    warnings.push("Chain — likely uses standardized enterprise software")
    return { score: 15, reasons, warnings }
  }

  const searchStr = [
    input.category ?? "",
    ...(input.categories ?? []),
    input.businessName ?? "",
  ]
    .join(" ")
    .toLowerCase()

  if (!searchStr.trim()) {
    warnings.push("No category data — industry fit unknown")
    return { score: 50, reasons, warnings }
  }

  if (matches(searchStr, LOW_FIT)) {
    warnings.push("Industry builds or buys enterprise software — not a fit for custom dev work")
    return { score: 5, reasons, warnings }
  }

  if (matches(searchStr, HIGH_FIT)) {
    reasons.push("Industry has operational complexity that drives demand for custom internal tools")
    return { score: 90, reasons, warnings }
  }

  if (matches(searchStr, MEDIUM_FIT)) {
    reasons.push("Industry may benefit from custom software — situational")
    return { score: 55, reasons, warnings }
  }

  warnings.push("Industry not recognized — defaulting to neutral")
  return { score: 50, reasons, warnings }
}
