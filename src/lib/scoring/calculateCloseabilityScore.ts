import type { LeadScoringInput, CloseabilityScoreResult } from "./types"
import { calculateWebScore } from "./strategies/webStrategy"
import { calculateSoftwareScore } from "./strategies/softwareStrategy"

export function calculateCloseabilityScore(input: LeadScoringInput): CloseabilityScoreResult {
  if (input.leadType === "SOFTWARE") {
    return calculateSoftwareScore(input)
  }
  return calculateWebScore(input)
}
