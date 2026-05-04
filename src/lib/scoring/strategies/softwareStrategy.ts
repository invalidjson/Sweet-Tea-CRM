import type { LeadScoringInput, CloseabilityScoreResult } from "../types"
import { softwareIndustryFitScore } from "../modules/softwareIndustryFitScore"
import { employeeSizeScore } from "../modules/employeeSizeScore"
import { reachabilityScore } from "../modules/reachabilityScore"
import { revenueProxyScore } from "../modules/revenueProxyScore"
import { activityScore } from "../modules/activityScore"
import { penaltyScore } from "../modules/penaltyScore"
import { grade, confidence } from "../scoreHelpers"

// Software leads care about: industry complexity, company size, reachability, ability to pay.
// Website quality and digital presence are irrelevant — different product.
const WEIGHTS = {
  industryFit: 0.35,
  employeeSize: 0.25,
  reachability: 0.20,
  revenueProxy: 0.15,
  activity: 0.05,
}

export function calculateSoftwareScore(input: LeadScoringInput): CloseabilityScoreResult {
  const industryFit = softwareIndustryFitScore(input)
  const employeeSize = employeeSizeScore(input)
  const reachability = reachabilityScore(input)
  const revenueProxy = revenueProxyScore(input)
  const activity = activityScore(input)
  const penalty = penaltyScore(input)

  const weighted =
    industryFit.score * WEIGHTS.industryFit +
    employeeSize.score * WEIGHTS.employeeSize +
    reachability.score * WEIGHTS.reachability +
    revenueProxy.score * WEIGHTS.revenueProxy +
    activity.score * WEIGHTS.activity

  const raw = weighted - penalty.score
  const totalScore = Math.round(Math.max(0, Math.min(100, raw)))
  const { grade: g, label } = grade(totalScore)

  return {
    totalScore,
    grade: g,
    label,
    confidence: confidence(input),
    breakdown: {
      website: 0,
      digitalPresence: 0,
      activity: activity.score,
      industryFit: industryFit.score,
      revenueProxy: revenueProxy.score,
      reachability: reachability.score,
      competitionPressure: 0,
      penalties: penalty.score,
      employeeSize: employeeSize.score,
    },
    reasons: [
      ...industryFit.reasons,
      ...employeeSize.reasons,
      ...reachability.reasons,
      ...revenueProxy.reasons,
      ...activity.reasons,
    ],
    warnings: [
      ...industryFit.warnings,
      ...employeeSize.warnings,
      ...reachability.warnings,
      ...revenueProxy.warnings,
      ...activity.warnings,
      ...penalty.warnings,
    ],
  }
}
