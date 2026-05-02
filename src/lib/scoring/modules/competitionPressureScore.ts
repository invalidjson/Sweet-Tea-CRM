import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Competition Pressure Score — how much competitive urgency does this business face?
 *
 * A business losing customers to competitors with better websites is already
 * feeling the pain. High competition + competitors with better digital presence
 * = a motivated buyer who may already be thinking about improving.
 */
export function competitionPressureScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []

  // Default neutral: every local market has some competition
  let score = 40

  const comp = input.competition
  if (!comp) {
    warnings.push("No competition data available — assuming moderate competitive pressure")
    return { score: 40, reasons, warnings }
  }

  // Many competitors = crowded market = business must differentiate online to survive
  const count = comp.nearbyCompetitorCount ?? 0
  if (count >= 10) {
    score += 30
    reasons.push(`${count} nearby competitors — highly competitive market, must stand out online`)
  } else if (count >= 5) {
    score += 20
    reasons.push(`${count} nearby competitors — competitive market`)
  } else if (count >= 2) {
    score += 10
    reasons.push(`${count} nearby competitors — some competitive pressure`)
  }

  // Competitors with better websites = direct pain point — customers are choosing them instead
  const betterSites = comp.competitorsWithBetterWebsites ?? 0
  if (betterSites >= 3) {
    score += 30
    reasons.push(`${betterSites} competitors have better websites — actively losing customers right now`)
  } else if (betterSites >= 1) {
    score += 15
    reasons.push(`${betterSites} competitor(s) have better websites — losing some business`)
  }

  // Competitors with more reviews = losing the social proof battle
  const moreReviews = comp.competitorsWithMoreReviews ?? 0
  if (moreReviews >= 3) {
    score += 20
    reasons.push(`${moreReviews} competitors have more reviews — behind on social proof`)
  } else if (moreReviews >= 1) {
    score += 10
    reasons.push(`${moreReviews} competitor(s) outpacing on reviews`)
  }

  return {
    score: Math.min(100, score),
    reasons,
    warnings,
  }
}
