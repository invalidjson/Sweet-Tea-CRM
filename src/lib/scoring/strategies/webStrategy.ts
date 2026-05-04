import type { LeadScoringInput, CloseabilityScoreResult } from "../types"
import { websiteScore } from "../modules/websiteScore"
import { digitalPresenceScore } from "../modules/digitalPresenceScore"
import { activityScore } from "../modules/activityScore"
import { industryFitScore } from "../modules/industryFitScore"
import { revenueProxyScore } from "../modules/revenueProxyScore"
import { reachabilityScore } from "../modules/reachabilityScore"
import { competitionPressureScore } from "../modules/competitionPressureScore"
import { penaltyScore } from "../modules/penaltyScore"
import { grade, confidence } from "../scoreHelpers"

const WEIGHTS = {
  website: 0.30,
  digitalPresence: 0.20,
  activity: 0.15,
  industryFit: 0.10,
  revenueProxy: 0.10,
  reachability: 0.10,
  competitionPressure: 0.05,
}

export function calculateWebScore(input: LeadScoringInput): CloseabilityScoreResult {
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
    reasons: [
      ...website.reasons,
      ...digitalPresence.reasons,
      ...activity.reasons,
      ...industryFit.reasons,
      ...revenueProxy.reasons,
      ...reachability.reasons,
      ...competitionPressure.reasons,
    ],
    warnings: [
      ...website.warnings,
      ...digitalPresence.warnings,
      ...activity.warnings,
      ...industryFit.warnings,
      ...revenueProxy.warnings,
      ...reachability.warnings,
      ...competitionPressure.warnings,
      ...penalty.warnings,
    ],
  }
}
