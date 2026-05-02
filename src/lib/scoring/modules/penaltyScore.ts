import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Penalty Score — hard disqualifiers that override positive signals.
 *
 * Returns a positive number that gets *subtracted* from the weighted total.
 * Some signals are strong enough to tank an otherwise decent lead:
 * a franchise owner literally cannot say yes, a closed business cannot pay,
 * and a business with zero contact paths is unreachable.
 */

const LOW_FIT_KEYWORDS = [
  "software", "saas", "tech company",
  "marketing agency", "ad agency", "digital agency", "web design", "web agency",
  "hospital", "health system",
  "school", "university", "college",
  "government", "city of", "county", "municipal",
  "nonprofit", "foundation",
  "bank", "credit union",
]

function hasLowFitCategory(input: LeadScoringInput): boolean {
  const str = [
    input.category ?? "",
    ...(input.categories ?? []),
    input.businessName ?? "",
  ]
    .join(" ")
    .toLowerCase()
  return LOW_FIT_KEYWORDS.some((kw) => str.includes(kw))
}

export function penaltyScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []
  let penalty = 0

  const biz = input.business
  const google = input.googlePlace
  const contact = input.contact
  const wa = input.websiteAnalysis

  // Franchise: the local manager cannot approve website purchases
  if (biz?.isFranchise) {
    penalty += 30
    warnings.push("Franchise — local owner cannot approve digital services, skip or escalate")
  }

  // Chain (non-franchise): typically has a corporate marketing team
  if (biz?.isChain && !biz?.isFranchise) {
    penalty += 20
    warnings.push("Chain business — digital decisions likely centralized at corporate")
  }

  // Very large multi-location = enterprise territory, not our market
  if ((biz?.numberOfLocations ?? 1) > 10) {
    penalty += 15
    warnings.push("10+ locations — enterprise-scale business, not our target segment")
  }

  // Permanently closed businesses cannot become customers
  if (google?.isOperational === false) {
    penalty += 50
    warnings.push("Business appears permanently closed — not a viable lead")
  }

  // Modern site on a DIY locked platform: recently rebuilt, unlikely to switch
  const lockedPlatforms = ["squarespace", "wix", "webflow", "framer"]
  const platform = wa?.detectedPlatform?.toLowerCase() ?? ""
  if (lockedPlatforms.some((p) => platform.includes(p)) && wa?.looksModern === true) {
    penalty += 15
    warnings.push("Recently built modern site on locked platform — low probability of switching")
  }

  // No contact paths at all: completely unreachable
  const hasAnyContact =
    !!contact?.phone ||
    !!contact?.email ||
    !!contact?.contactPageUrl ||
    !!google?.hasPhone ||
    !!wa?.hasContactForm
  if (!hasAnyContact) {
    penalty += 15
    warnings.push("No contact methods found — unreachable")
  }

  // Dead lead: no web presence, no reviews, no contact — probably not operating
  const reviewCount = google?.reviewCount ?? 0
  if (reviewCount === 0 && !input.hasWebsite && !hasAnyContact) {
    penalty += 20
    warnings.push("Extremely sparse signals — verify business is still operating before pursuing")
  }

  // Wrong industry: even a perfect score can't fix a category mismatch
  if (hasLowFitCategory(input)) {
    penalty += 25
    warnings.push("Industry is a poor fit — deprioritize in favor of better-fit leads")
  }

  return {
    score: penalty, // caller subtracts this from weighted total
    reasons,
    warnings,
  }
}
