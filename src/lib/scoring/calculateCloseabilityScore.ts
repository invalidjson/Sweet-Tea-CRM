import type { LeadScoringInput, CloseabilityScoreResult } from "./types"
import { websiteScore } from "./modules/websiteScore"
import { digitalPresenceScore } from "./modules/digitalPresenceScore"
import { activityScore } from "./modules/activityScore"
import { industryFitScore } from "./modules/industryFitScore"
import { revenueProxyScore } from "./modules/revenueProxyScore"
import { reachabilityScore } from "./modules/reachabilityScore"
import { competitionPressureScore } from "./modules/competitionPressureScore"
import { penaltyScore } from "./modules/penaltyScore"

const WEIGHTS = {
  website: 0.30,
  digitalPresence: 0.20,
  activity: 0.15,
  industryFit: 0.10,
  revenueProxy: 0.10,
  reachability: 0.10,
  competitionPressure: 0.05,
}

function grade(score: number): { grade: "A" | "B" | "C" | "D" | "F"; label: string } {
  if (score >= 80) return { grade: "A", label: "Hot lead" }
  if (score >= 65) return { grade: "B", label: "Strong lead" }
  if (score >= 45) return { grade: "C", label: "Possible lead" }
  if (score >= 25) return { grade: "D", label: "Weak lead" }
  return { grade: "F", label: "Poor fit" }
}

function confidence(input: LeadScoringInput): "low" | "medium" | "high" {
  const hasWebsiteData = input.hasWebsite !== undefined || !!input.websiteAnalysis
  const hasGoogleData = !!input.googlePlace
  const hasContactData = !!input.contact

  if (hasWebsiteData && hasGoogleData && hasContactData) return "high"
  if (hasGoogleData && (hasWebsiteData || hasContactData)) return "medium"
  return "low"
}

export function calculateCloseabilityScore(input: LeadScoringInput): CloseabilityScoreResult {
  const website = websiteScore(input)
  const digitalPresence = digitalPresenceScore(input)
  const activity = activityScore(input)
  const industryFit = industryFitScore(input)
  const revenueProxy = revenueProxyScore(input)
  const reachability = reachabilityScore(input)
  const competitionPressure = competitionPressureScore(input)
  const penalty = penaltyScore(input)

  const weighted =
    website.score * WEIGHTS.website +
    digitalPresence.score * WEIGHTS.digitalPresence +
    activity.score * WEIGHTS.activity +
    industryFit.score * WEIGHTS.industryFit +
    revenueProxy.score * WEIGHTS.revenueProxy +
    reachability.score * WEIGHTS.reachability +
    competitionPressure.score * WEIGHTS.competitionPressure

  const raw = weighted - penalty.score
  const totalScore = Math.round(Math.max(0, Math.min(100, raw)))

  const { grade: g, label } = grade(totalScore)

  const reasons = [
    ...website.reasons,
    ...digitalPresence.reasons,
    ...activity.reasons,
    ...industryFit.reasons,
    ...revenueProxy.reasons,
    ...reachability.reasons,
    ...competitionPressure.reasons,
  ]

  const warnings = [
    ...website.warnings,
    ...digitalPresence.warnings,
    ...activity.warnings,
    ...industryFit.warnings,
    ...revenueProxy.warnings,
    ...reachability.warnings,
    ...competitionPressure.warnings,
    ...penalty.warnings,
  ]

  return {
    totalScore,
    grade: g,
    label,
    confidence: confidence(input),
    breakdown: {
      website: website.score,
      digitalPresence: digitalPresence.score,
      activity: activity.score,
      industryFit: industryFit.score,
      revenueProxy: revenueProxy.score,
      reachability: reachability.score,
      competitionPressure: competitionPressure.score,
      penalties: penalty.score,
    },
    reasons,
    warnings,
  }
}
